"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Copy, RefreshCw, Save, Wand2 } from "lucide-react"

export default function ContentGeneratorPage() {
  const [contentType, setContentType] = useState("vlog")
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const contentTypes = [
    { value: "vlog", label: "브이로그 스크립트" },
    { value: "qa", label: "Q&A 답변" },
    { value: "product", label: "상품 설명" },
    { value: "social", label: "SNS 포스트" },
  ]

  const trendingTopics = [
    "겨울 패션 트렌드",
    "홈카페 만들기",
    "연말 계획 세우기",
    "크리스마스 선물 추천",
    "새해 다짐",
    "건강한 라이프스타일",
  ]

  const generateContent = async () => {
    if (!topic.trim()) {
      alert("주제를 입력해주세요!")
      return
    }

    setIsGenerating(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock generated content based on type and topic
    let mockContent = ""

    switch (contentType) {
      case "vlog":
        mockContent = `안녕하세요 여러분! 미나예요 😊

오늘은 ${topic}에 대해서 이야기해보려고 해요!
요즘 정말 많은 분들이 관심을 가지고 계시더라고요.

저도 처음에는 잘 몰랐는데, 직접 경험해보니까 정말 좋더라구요!
특히 ${keywords ? keywords.split(",")[0]?.trim() : "이 부분"}이 가장 인상 깊었어요.

여러분도 한번 시도해보시고, 어떠셨는지 댓글로 알려주세요!
그럼 오늘도 좋은 하루 보내세요~ 💕`
        break
      case "qa":
        mockContent = `와 정말 좋은 질문이네요! 😄

${topic}에 대해서 말씀드리자면, 저는 개인적으로 이렇게 생각해요.

먼저 가장 중요한 건 ${keywords ? keywords.split(",")[0]?.trim() : "기본기"}라고 생각해요. 
그리고 무엇보다 꾸준히 하는 게 중요한 것 같아요!

제가 경험해본 바로는, 처음에는 어려울 수 있지만 
시간이 지나면서 점점 나아지더라구요 ✨

혹시 더 궁금한 점이 있으시면 언제든 물어보세요!`
        break
      case "product":
        mockContent = `✨ ${topic} ✨

미나가 직접 사용해보고 정말 만족스러워서 여러분께 추천드려요!

🌟 특징:
- ${
          keywords
            ? keywords
                .split(",")
                .map((k) => k.trim())
                .join("\n- ")
            : "고품질 소재 사용\n- 트렌디한 디자인\n- 실용적인 기능"
        }

💕 미나's 한마디:
"이거 진짜 대박이에요! 제가 매일 사용하고 있는데, 
정말 만족스러워서 여러분께도 꼭 추천하고 싶어요!"

지금 특가로 만나보실 수 있으니까 놓치지 마세요! 🛍️`
        break
      case "social":
        mockContent = `${topic} 🌟

${keywords ? keywords.split(",")[0]?.trim() : "오늘"}도 여러분과 함께해서 행복해요!

#미나 #AI인플루언서 #일상 #${
          keywords
            ? keywords
                .split(",")
                .map((k) => k.trim().replace(/\s/g, ""))
                .join(" #")
            : "데일리"
        }

여러분의 하루는 어떠셨나요? 
댓글로 공유해주세요! 💕`
        break
    }

    setGeneratedContent(mockContent)
    setIsGenerating(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    alert("클립보드에 복사되었습니다!")
  }

  const saveContent = () => {
    // In a real app, this would save to your database
    console.log("Saving content:", { contentType, topic, keywords, generatedContent })
    alert("콘텐츠가 저장되었습니다!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Wand2 className="mr-3 h-8 w-8" />
          콘텐츠 생성기
        </h1>
        <p className="text-gray-600">AI를 활용하여 미나의 페르소나에 맞는 콘텐츠를 자동으로 생성하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>콘텐츠 설정</CardTitle>
            <CardDescription>생성할 콘텐츠의 유형과 주제를 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contentType">콘텐츠 유형</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic">주제</Label>
              <Input
                id="topic"
                placeholder="예: 겨울 패션 트렌드"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="keywords">키워드 (쉼표로 구분)</Label>
              <Input
                id="keywords"
                placeholder="예: 패션, 스타일링, 코디"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <Separator />

            <div>
              <Label>트렌딩 주제</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {trendingTopics.map((trendTopic) => (
                  <Badge
                    key={trendTopic}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setTopic(trendTopic)}
                  >
                    {trendTopic}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={generateContent} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  콘텐츠 생성하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>생성된 콘텐츠</CardTitle>
            <CardDescription>AI가 생성한 콘텐츠를 확인하고 편집하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    복사
                  </Button>
                  <Button onClick={generateContent} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    재생성
                  </Button>
                  <Button onClick={saveContent} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                <p>주제를 입력하고 '콘텐츠 생성하기' 버튼을 클릭하세요</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Templates */}
      <Card>
        <CardHeader>
          <CardTitle>콘텐츠 템플릿</CardTitle>
          <CardDescription>자주 사용하는 콘텐츠 형식을 템플릿으로 저장하고 활용하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vlog" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vlog">브이로그</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
              <TabsTrigger value="product">상품</TabsTrigger>
              <TabsTrigger value="social">SNS</TabsTrigger>
            </TabsList>
            <TabsContent value="vlog" className="space-y-2">
              <p className="text-sm text-gray-600">브이로그 스크립트 템플릿:</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                인사 → 주제 소개 → 본문 내용 → 시청자 참여 유도 → 마무리 인사
              </div>
            </TabsContent>
            <TabsContent value="qa" className="space-y-2">
              <p className="text-sm text-gray-600">Q&A 답변 템플릿:</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                질문 확인 → 개인적 견해 표현 → 구체적 설명 → 추가 질문 유도
              </div>
            </TabsContent>
            <TabsContent value="product" className="space-y-2">
              <p className="text-sm text-gray-600">상품 설명 템플릿:</p>
              <div className="bg-gray-50 p-3 rounded text-sm">상품명 → 특징 나열 → 개인 사용 후기 → 구매 유도</div>
            </TabsContent>
            <TabsContent value="social" className="space-y-2">
              <p className="text-sm text-gray-600">SNS 포스트 템플릿:</p>
              <div className="bg-gray-50 p-3 rounded text-sm">주제 + 이모티콘 → 간단한 설명 → 해시태그 → 참여 유도</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
