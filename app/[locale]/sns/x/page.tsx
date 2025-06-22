import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Repeat, Heart } from "lucide-react"

const mockXData = [
  {
    id: 1,
    content:
      "여러분~ 저 오늘 경주에서 핑크뮬리 보고 왔어요! 완전 핑크빛 세상...💖 너무 예뻐서 기절할 뻔 했잖아요! #경주 #핑크뮬리 #가을여행",
    retweets: "1.2K",
    likes: "15K",
    replies: "302",
    timestamp: "2시간 전",
  },
  {
    id: 2,
    content: "갑자기 궁금한 건데, 여러분 최애 경주 음식은 뭐예요? 저는 황남빵에 한 표!😋",
    retweets: "580",
    likes: "8.9K",
    replies: "1.1K",
    timestamp: "어제",
  },
  {
    id: 3,
    content: "오늘 저녁 8시에 유튜브 라이브에서 만나요! Q&A 시간 가질 거니까 질문 많이 준비해오기! 약속🤙 #미나라이브",
    retweets: "2.1K",
    likes: "22K",
    replies: "890",
    timestamp: "2일 전",
  },
]

export default function XPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">미나의 X (Twitter) 타임라인</h2>
      <div className="max-w-2xl mx-auto space-y-4">
        {mockXData.map((tweet) => (
          <Card key={tweet.id}>
            <CardHeader className="flex flex-row items-start space-x-4 pb-2">
              <Avatar>
                <AvatarImage src="/mina-casual.png" alt="미나 프로필" />
                <AvatarFallback>미나</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold">로컬루언서 미나</span>
                  <span className="text-sm text-muted-foreground">@localuncer_mina</span>
                  <span className="text-sm text-muted-foreground">&middot; {tweet.timestamp}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{tweet.content}</p>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-around text-muted-foreground pt-2">
              <div className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>{tweet.replies}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-green-500 cursor-pointer">
                <Repeat className="w-4 h-4" />
                <span>{tweet.retweets}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-pink-500 cursor-pointer">
                <Heart className="w-4 h-4" />
                <span>{tweet.likes}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
