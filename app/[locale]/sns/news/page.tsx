import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const mockNewsData = [
  {
    id: 1,
    title: "AI 인플루언서 '미나', 경주 관광 홍보대사로 위촉",
    source: "AI 타임즈",
    imageUrl: "/placeholder.svg?height=150&width=200",
    publishedAt: "2025년 6월 20일",
    excerpt:
      "가상 인간 '미나'가 경주시의 새로운 관광 홍보대사로 활동을 시작한다. AI 기술과 지역 관광의 혁신적인 만남에 귀추가 주목된다.",
  },
  {
    id: 2,
    title: "MZ세대의 새로운 아이콘, 버추얼 인플루언서 '미나' 신드롬",
    source: "트렌드 위클리",
    imageUrl: "/placeholder.svg?height=150&width=200",
    publishedAt: "2025년 6월 18일",
    excerpt:
      "독특한 세계관과 팬들과의 적극적인 소통으로 Z세대 사이에서 폭발적인 인기를 얻고 있는 '미나' 현상을 분석한다.",
  },
]

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">미나 관련 뉴스</h2>
      <div className="space-y-4">
        {mockNewsData.map((article) => (
          <Card key={article.id} className="group">
            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 lg:w-1/4 overflow-hidden rounded-lg">
                <Image
                  src={article.imageUrl || "/placeholder.svg"}
                  alt={article.title}
                  width={200}
                  height={150}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex-1">
                <CardDescription>
                  {article.source} &bull; {article.publishedAt}
                </CardDescription>
                <CardTitle className="mt-2 text-lg">{article.title}</CardTitle>
                <p className="mt-3 text-muted-foreground text-sm line-clamp-2">{article.excerpt}</p>
                <Link href="#" className="flex items-center mt-4 text-sm text-primary font-semibold">
                  기사 원문 보기{" "}
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
