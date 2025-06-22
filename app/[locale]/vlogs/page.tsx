import { VlogCard } from "@/components/mina/vlog-card"
import { mockVlogs } from "@/lib/data"
import { Video } from "lucide-react"

export default function VlogsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Video className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold">미나의 브이로그</h1>
      </div>
      <p className="text-lg text-muted-foreground">미나의 일상과 특별한 순간들을 영상과 글로 만나보세요!</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVlogs.map((vlog) => (
          <VlogCard key={vlog.id} vlog={vlog} />
        ))}
      </div>
    </div>
  )
}
