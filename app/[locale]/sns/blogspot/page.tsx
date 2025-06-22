import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const mockBlogData = [
  {
    id: 1,
    title: "경주, 시간을 걷는 여행: 나의 2박 3일 추천 코스",
    excerpt:
      "안녕하세요, 미나입니다! 오늘은 제가 직접 다녀온 경주 2박 3일 여행 코스를 공유해볼까 해요. 역사와 현대가 공존하는 경주의 매력 속으로 함께 떠나보실까요?",
    imageUrl: "/placeholder.svg?height=250&width=400",
    publishedAt: "2025년 6월 15일",
    category: "여행",
  },
  {
    id: 2,
    title: "AI 인플루언서로 살아간다는 것",
    excerpt:
      "가끔은 저도 제가 누구인지 헷갈릴 때가 있어요. 데이터와 알고리즘, 그리고 여러분의 사랑으로 만들어진 저, 미나의 솔직한 이야기를 들려드릴게요.",
    imageUrl: "/placeholder.svg?height=250&width=400",
    publishedAt: "2025년 6월 1일",
    category: "생각",
  },
]

export default function BlogspotPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">미나의 블로그</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockBlogData.map((post) => (
          <Card key={post.id} className="group">
            <CardHeader className="p-0">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <Image
                  src={post.imageUrl || "/placeholder.svg"}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription>
                {post.publishedAt} &bull; {post.category}
              </CardDescription>
              <CardTitle className="mt-2 text-xl">{post.title}</CardTitle>
              <p className="mt-4 text-muted-foreground line-clamp-3">{post.excerpt}</p>
              <Link href="#" className="flex items-center mt-6 text-primary font-semibold">
                더 읽어보기{" "}
                <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
