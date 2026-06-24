import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// 서버에서만 접근 가능한 FastAPI 주소 (브라우저에 노출 안 됨)
const BACKEND_URL = process.env.BACKEND_URL

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter')
  const search = searchParams.get('search')
  const params = new URLSearchParams()
  if (filter) params.set('filter', filter)
  if (search) params.set('search', search)
  const query = params.toString() ? `?${params}` : ''
  const res = await axios.get(`${BACKEND_URL}/todos${query}`)
  return NextResponse.json(res.data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await axios.post(`${BACKEND_URL}/todos`, body)
  return NextResponse.json(res.data, { status: 201 })
}
