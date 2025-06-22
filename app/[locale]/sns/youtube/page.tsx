import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle, ThumbsUp, MessageSquareText } from "lucide-react"
import Image from "next/image"

const mockYoutubeData = [
  {
    id: 1,
    title: "경주 황리단길 VLOG | 예쁜 카페, 소품샵 다녀왔어요! 💖",
    thumbnailUrl: "/placeholder.svg?height=203&width=360",
    views: "1.2M",
    likes: "98K",
    comments: "4.2K",
    duration: "12:34",
    publishedAt: "3일 전",
  },
  {
    id: 2,
    title: "미나의 경주 야경 투어 ✨ | 동궁과 월지, 월정교의 밤",
    thumbnailUrl: "/placeholder.svg?height=203&width=360",
    views: "876K",
    likes: "75K",
    comments: "2.1K",
    duration: "08:12",
    publishedAt: "1주 전",
  },
  {
    id: 3,
    title: "서울대생 미나의 하루?! | 과잠 입고 캠퍼스 투어하기! 🏫",
    thumbnailUrl: "/placeholder.svg?height=203&width=360",
    views: "2.5M",
    likes: "150K",
    comments: "8.9K",
    duration: "15:02",
    publishedAt: "2주 전",
  },
  {
    id: 4,
    title: "경주에서 한복 체험! | 인생샷 100장 건지는 꿀팁 대방출",
    thumbnailUrl: "/placeholder.svg?height=203&width=360",
    views: "950K",
    likes: "82K",
    comments: "3.5K",
    duration: "10:45",
    publishedAt: "3주 전",
  },
]

export default function YoutubePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">미나의 YouTube 최신 영상</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockYoutubeData.map((video) => (
          <Card key={video.id} className="overflow-hidden group">
            <CardHeader className="p-0 relative">
              <div className="aspect-video">
                <Image
                  src={video.thumbnailUrl || "/placeholder.svg"}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-12 h-12 text-white/80" />
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-sm">
                {video.duration}
              </span>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-md font-semibold line-clamp-2">{video.title}</CardTitle>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground px-4 pb-4">
              <span>{video.views} 조회수</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-1" /> {video.likes}
                </span>
                <span className="flex items-center">
                  <MessageSquareText className="w-4 h-4 mr-1" /> {video.comments}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
