"use client"

import { useState, useRef, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import QAItem from "@/components/mina/qa-item"
import { useAuth } from "@/lib/auth"
import { MessageCircle, Send, Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import SchemaOrg, { combineSchemas } from "@/components/schema-org"
import { createFAQPageSchema, createBreadcrumbSchema } from "@/lib/schema"
import { useParams } from "next/navigation"

import type { QA } from "@/lib/data"

// 서버에서 가져오는 QA 타입 (DB 구조)
interface ServerQA {
  id: string
  question: string
  answer: string | null
  asked_by: string | null
  answered_at: string | null
  like_count: number
  comment_count: number
  status: "pending" | "answered" | "archived"
  created_at: string
  users?: {
    username: string
    avatar_url: string | null
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      질문 보내기
    </Button>
  )
}

export default function QAPage() {
  const [qas, setQas] = useState<QA[]>([])
  const [question, setQuestion] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { locale } = useParams()

  useEffect(() => {
    loadQAs()
  }, [])

  // 서버 QA 데이터를 클라이언트 QA 형식으로 변환
  const convertServerQAToQA = (serverQA: ServerQA): QA => {
    return {
      id: serverQA.id,
      question: serverQA.question,
      answer: serverQA.answer || "답변 준비 중입니다.",
      askedBy: serverQA.users?.username || serverQA.asked_by || "익명",
      answeredAt: serverQA.answered_at || serverQA.created_at
    }
  }

  const loadQAs = async () => {
    try {
      const response = await fetch("/api/qna")
      const result = await response.json()
      if (result.data) {
        const convertedQAs = result.data.map(convertServerQAToQA)
        setQas(convertedQAs)
      }
    } catch (error) {
      console.error("Error loading Q&As:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const currentQuestion = formData.get("question") as string
    if (!currentQuestion.trim()) return

    if (!user) {
      alert("질문을 등록하려면 로그인이 필요합니다.")
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/qna", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: currentQuestion,
            asked_by: user.id,
          }),
        })

        const result = await response.json()
        if (result.data) {
          const convertedQA = convertServerQAToQA(result.data)
          setQas((prevQas) => [convertedQA, ...prevQas])
          formRef.current?.reset()
          setQuestion("")
        }
      } catch (error) {
        console.error("Error submitting question:", error)
        alert("질문 등록 중 오류가 발생했습니다.")
      }
    })
  }

  // FAQ 구조화 데이터 생성
  const generateFAQData = () => {
    if (!qas || qas.length === 0) return null;

    // 기본 URL 설정
    const baseUrl = 'https://localuencer-mina.com';
    const localeUrl = `${baseUrl}/${locale}`;

    // 최대 10개의 FAQ만 사용
    const faqItems = qas.slice(0, 10).map(qa => ({
      question: qa.question,
      answer: qa.answer
    }));

    const faqSchema = createFAQPageSchema(faqItems);

    const breadcrumbSchema = createBreadcrumbSchema([
      { 
        name: locale === 'ko' ? '홈' : 'Home', 
        url: localeUrl 
      },
      { 
        name: 'Q&A', 
        url: `${localeUrl}/qa` 
      },
    ]);

    return combineSchemas(faqSchema, breadcrumbSchema);
  };

  return (
    <>
      {qas.length > 0 && <SchemaOrg schema={generateFAQData()} />}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">미나에게 무엇이든 물어보세요!</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          미나가 여러분의 궁금증을 해결해 드려요. AI 미나와 즐거운 대화를 나눠보세요!
        </p>

        <Card>
          <CardHeader>
            <CardTitle>질문하기</CardTitle>
            <CardDescription>미나에게 궁금한 점을 자유롭게 질문해주세요.</CardDescription>
          </CardHeader>
          {user ? (
            <form action={handleSubmit} ref={formRef}>
              <CardContent>
                <Input
                  name="question"
                  placeholder="예: 미나야, 오늘 기분 어때?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isPending}
                  required
                />
              </CardContent>
              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </form>
          ) : (
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">질문을 등록하려면 로그인이 필요합니다.</p>
                <div className="space-x-2">
                  <Button asChild>
                    <Link href="/auth/login">로그인</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/auth/signup">회원가입</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">최근 Q&A</h2>
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Q&A를 불러오는 중...</p>
            </div>
          )}
          {qas.length === 0 && !loading && <p>아직 등록된 Q&A가 없어요. 첫 질문을 남겨보세요!</p>}
          {qas.map((qa) => (
            <QAItem key={qa.id} qa={qa} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-8">
          AI 답변은 OpenAI API를 통해 제공될 수 있습니다. API 키가 설정되지 않은 경우, 기본 목업 답변이 제공됩니다.
        </p>
      </div>
    </>
  )
}
