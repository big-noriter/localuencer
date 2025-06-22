import type React from "react"
import { Rss } from "lucide-react"

export default function SnsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Rss className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold">미나의 SNS 피드</h1>
      </div>
      <p className="text-lg text-muted-foreground">
        미나의 다양한 SNS 채널 소식을 한눈에 모아보세요! 최신 영상, 사진, 소식들을 가장 먼저 만나볼 수 있어요.
      </p>
      <div className="border-t pt-8">{children}</div>
    </div>
  )
}
