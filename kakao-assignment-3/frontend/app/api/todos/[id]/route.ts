import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BACKEND_URL = process.env.BACKEND_URL

type Params = Promise<{ id: string }>

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const body = await req.json()
  const res = await axios.put(`${BACKEND_URL}/todos/${id}`, body)
  return NextResponse.json(res.data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  await axios.delete(`${BACKEND_URL}/todos/${id}`)
  return NextResponse.json({ ok: true })
}

export async function PATCH(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const res = await axios.patch(`${BACKEND_URL}/todos/${id}/toggle`)
  return NextResponse.json(res.data)
}
