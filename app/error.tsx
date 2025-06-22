'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러를 콘솔에 로그
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">문제가 발생했습니다!</h2>
        <p className="text-muted-foreground">
          예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <Button
          onClick={() => reset()}
          variant="default"
        >
          다시 시도
        </Button>
      </div>
    </div>
  )
} 