'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <p className="text-red-600">오류가 발생했습니다: {error.message}</p>
      <button
        onClick={reset}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        다시 시도
      </button>
    </div>
  )
}
