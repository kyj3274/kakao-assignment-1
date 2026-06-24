from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv(".env")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── SQLAlchemy 모델 (DB 테이블 구조) ──────────────────────────────────
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)      # "YYYY-MM-DD"
    startTime = Column(String, nullable=False) # "HH:MM"
    endTime = Column(String, nullable=False)   # "HH:MM"
    done = Column(Boolean, default=False)


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic 스키마 (요청/응답 형태 정의) ────────────────────────────
class TodoCreate(BaseModel):
    title: str
    date: str
    startTime: str
    endTime: str


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    done: Optional[bool] = None


class TodoResponse(BaseModel):
    id: int
    title: str
    date: str
    startTime: str
    endTime: str
    done: bool

    model_config = {"from_attributes": True}


# ── DB 세션 의존성 ────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── API 엔드포인트 ────────────────────────────────────────────────────
@app.get("/todos", response_model=list[TodoResponse])
def get_todos(
    filter: Optional[str] = None,   # "active" | "completed"
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Todo)
    if filter == "active":
        query = query.filter(Todo.done == False)
    elif filter == "completed":
        query = query.filter(Todo.done == True)
    if search:
        query = query.filter(Todo.title.ilike(f"%{search}%"))
    return query.all()


@app.post("/todos", response_model=TodoResponse, status_code=201)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    for field, value in todo.model_dump(exclude_unset=True).items():
        setattr(db_todo, field, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    return {"ok": True}


@app.patch("/todos/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db_todo.done = not db_todo.done
    db.commit()
    db.refresh(db_todo)
    return db_todo
