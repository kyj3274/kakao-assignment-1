import { useEffect, useState } from 'react'

/*
  useLocalStorage = "useState 처럼 쓰는데, 값이 localStorage에도 저장되는" 커스텀 훅.
  ----------------------------------------------------------------
  ★ 커스텀 훅이란? ★
  - 이름이 use~ 로 시작하고, 안에서 다른 훅(useState 등)을 쓰는 함수예요.
  - 반복되는 상태 로직을 함수 하나로 묶어 재사용할 수 있어요.

  사용법은 useState와 똑같아요:
    const [todos, setTodos] = useLocalStorage('key', [])
  값이 바뀔 때마다 자동으로 localStorage에 저장돼서, 새로고침해도 유지돼요.
*/
export function useLocalStorage(key, initialValue) {
  // 1) 처음 값: localStorage에 저장된 게 있으면 그걸로, 없으면 기본값
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  // 2) value가 바뀔 때마다 localStorage에 저장 (useEffect = "변화에 반응")
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
