import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { QA } from "@/lib/data"

interface QAItemProps {
  qa: QA
}

export default function QAItem({ qa }: QAItemProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40&query=user+avatar+${qa.askedBy.charCodeAt(0)}`}
              alt={qa.askedBy}
            />
            <AvatarFallback>{qa.askedBy.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{qa.question}</CardTitle>
            <CardDescription>
              질문자: {qa.askedBy} &bull; {qa.answeredAt}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="ml-12 pl-1 border-l-2 border-primary/50">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="미나" />
            <AvatarFallback>미나</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-primary">미나의 답변:</p>
            <p className="text-sm whitespace-pre-wrap">{qa.answer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
