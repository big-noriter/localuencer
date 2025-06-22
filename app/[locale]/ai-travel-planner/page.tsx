"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Calendar,
  Users,
  Wallet,
  Eye,
  Utensils,
  Flower2,
  Hand,
  Volume2,
  Palette,
  DollarSign,
  Clock,
  MapPin,
  Loader2,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

/**
 * 여행 추천 요청 인터페이스
 */
interface TravelRequest {
  theme: 'visual' | 'taste' | 'smell' | 'touch' | 'sound' | 'mixed'
  duration: number
  interests: string[]
  budget: 'low' | 'medium' | 'high'
  travelStyle: 'relaxed' | 'active' | 'cultural' | 'adventure'
  additionalRequests?: string
}

export default function AiTravelPlannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [travelRequest, setTravelRequest] = useState<TravelRequest>({
    theme: 'visual',
    duration: 1,
    interests: [],
    budget: 'medium',
    travelStyle: 'cultural',
    additionalRequests: ''
  })

  // 관심사 목록
  const availableInterests = [
    "역사 유적", "불교 문화", "자연 경관", "전통 건축", "박물관", 
    "맛집 탐방", "카페", "쇼핑", "체험 활동", "사진 촬영",
    "산책", "드라이브", "야경", "일출/일몰", "축제"
  ]

  // 여행 일정 생성
  const generateItinerary = async () => {
    if (travelRequest.interests.length === 0) {
      toast.error("관심사를 최소 1개 이상 선택해주세요.")
      return
    }

    setLoading(true)
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 실제로는 여기서 AI API를 호출하여 맞춤 일정을 생성
      // const response = await fetch('/api/ai-travel-recommendation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(travelRequest)
      // })
      
      toast.success("맞춤 여행 일정이 생성되었습니다!")
      
      // 추천 일정 페이지로 이동
      router.push('/recommended-itinerary')
      
    } catch (error) {
      toast.error("일정 생성 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 관심사 토글
  const toggleInterest = (interest: string) => {
    setTravelRequest(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  // 오감별 테마 정보
  const themeInfo = {
    visual: {
      title: "시각적 여행",
      description: "아름다운 건축물, 자연 경관, 야경 등 눈으로 즐기는 여행",
      icon: <Eye className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-800 border-blue-200"
    },
    taste: {
      title: "미각 여행",
      description: "경주 전통 음식, 맛집, 특산품 등 맛으로 즐기는 여행",
      icon: <Utensils className="w-5 h-5" />,
      color: "bg-orange-100 text-orange-800 border-orange-200"
    },
    smell: {
      title: "후각 여행",
      description: "꽃향기, 전통 향, 자연의 냄새 등 향으로 즐기는 여행",
      icon: <Flower2 className="w-5 h-5" />,
      color: "bg-green-100 text-green-800 border-green-200"
    },
    touch: {
      title: "촉각 여행",
      description: "전통 공예 체험, 온천, 자연 체험 등 손으로 느끼는 여행",
      icon: <Hand className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-800 border-purple-200"
    },
    sound: {
      title: "청각 여행",
      description: "전통 음악, 자연의 소리, 종소리 등 귀로 즐기는 여행",
      icon: <Volume2 className="w-5 h-5" />,
      color: "bg-pink-100 text-pink-800 border-pink-200"
    },
    mixed: {
      title: "오감 통합 여행",
      description: "모든 감각을 활용한 종합적인 경주 여행 경험",
      icon: <Palette className="w-5 h-5" />,
      color: "bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 border-purple-200"
    }
  }

  const currentTheme = themeInfo[travelRequest.theme]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">AI 여행 계획</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          미나와 함께 당신만의 특별한 경주 여행을 계획해보세요. 
          오감을 자극하는 맞춤형 여행 일정을 만들어드립니다.
        </p>
      </div>

      {/* 메인 폼 */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              여행 계획 설정
            </CardTitle>
            <CardDescription>
              아래 정보를 입력하시면 AI가 최적의 여행 일정을 추천해드립니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 1. 여행 테마 선택 */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">1. 여행 테마 선택</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(themeInfo).map(([key, theme]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      travelRequest.theme === key ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setTravelRequest(prev => ({ ...prev, theme: key as any }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${theme.color}`}>
                          {theme.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{theme.title}</h3>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 2. 여행 기본 정보 설정 */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">2. 여행 기본 정보 설정</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">여행 일수</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="7"
                    value={travelRequest.duration}
                    onChange={(e) => setTravelRequest(prev => ({ 
                      ...prev, 
                      duration: parseInt(e.target.value) || 1 
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">예산 범위</Label>
                  <Select
                    value={travelRequest.budget}
                    onValueChange={(value) => setTravelRequest(prev => ({ ...prev, budget: value as any }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">경제적 (1일 3-4만원)</SelectItem>
                      <SelectItem value="medium">적당함 (1일 5-7만원)</SelectItem>
                      <SelectItem value="high">여유롭게 (1일 8만원 이상)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="travelStyle">여행 스타일</Label>
                <Select
                  value={travelRequest.travelStyle}
                  onValueChange={(value) => setTravelRequest(prev => ({ ...prev, travelStyle: value as any }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">여유로운</SelectItem>
                    <SelectItem value="active">활동적인</SelectItem>
                    <SelectItem value="cultural">문화적인</SelectItem>
                    <SelectItem value="adventure">모험적인</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3. 관심사 선택 */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">3. 관심사 선택</Label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => (
                  <Button
                    key={interest}
                    variant={travelRequest.interests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
              {travelRequest.interests.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">선택된 관심사:</p>
                  <div className="flex flex-wrap gap-1">
                    {travelRequest.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. 여행 일정 생성 */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">4. 여행 일정 생성</Label>
              <Button
                onClick={generateItinerary}
                disabled={loading}
                className="w-full h-12"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    AI가 여행 일정을 생성하고 있어요...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    맞춤형 여행 일정 생성하기
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 