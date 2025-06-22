"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import { 
  Sparkles, 
  MapPin, 
  Clock, 
  DollarSign,
  Eye,
  Utensils,
  Flower2,
  Hand,
  Volume2,
  Route,
  ExternalLink,
  Loader2,
  Star,
  Navigation,
  Camera,
  Heart,
  X,
  RefreshCw,
  Calendar,
  Users
} from "lucide-react"
import { toast } from "sonner"
import GoogleMaps from "@/components/maps/google-maps"
import CesiumEarthViewer from '@/components/maps/cesium-earth-viewer'

/**
 * 추천 여행지 인터페이스
 */
interface RecommendedSpot {
  id: number
  name: string
  description: string
  category: string
  sense: string
  coordinates: {
    lat: number
    lng: number
  }
  google_maps: string
  google_earth: string
  visitDuration: string
  bestTime: string
  tips: string[]
}

/**
 * 여행 일정 인터페이스
 */
interface TravelItinerary {
  theme: string
  totalDays: number
  spots: RecommendedSpot[]
  route: {
    lat: number
    lng: number
    name: string
  }[]
  totalDistance: string
  estimatedCost: string
  aiRecommendation: string
}



/**
 * 오감별 아이콘 반환 함수
 */
const getSenseIcon = (sense: string) => {
  switch (sense) {
    case '시각': return <Eye className="w-4 h-4" />
    case '미각': return <Utensils className="w-4 h-4" />
    case '후각': return <Flower2 className="w-4 h-4" />
    case '촉각': return <Hand className="w-4 h-4" />
    case '청각': return <Volume2 className="w-4 h-4" />
    default: return <Sparkles className="w-4 h-4" />
  }
}

/**
 * 오감별 색상 반환 함수
 */
const getSenseColor = (sense: string) => {
  switch (sense) {
    case '시각': return 'bg-blue-100 text-blue-800 border-blue-200'
    case '미각': return 'bg-orange-100 text-orange-800 border-orange-200'
    case '후각': return 'bg-green-100 text-green-800 border-green-200'
    case '촉각': return 'bg-purple-100 text-purple-800 border-purple-200'
    case '청각': return 'bg-pink-100 text-pink-800 border-pink-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function RecommendedItineraryPage() {
  const [itinerary, setItinerary] = useState<TravelItinerary | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<RecommendedSpot | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  // 샘플 추천 일정 데이터
  const sampleItinerary: TravelItinerary = {
    theme: "시각적 경주 여행",
    totalDays: 2,
    spots: [
      {
        id: 1,
        name: "불국사",
        description: "신라 시대 대표적인 불교 사찰로, 석가탑과 다보탑이 위치한 세계문화유산입니다.",
        category: "관광지",
        sense: "시각",
        coordinates: { lat: 35.7905495, lng: 129.3310156 },
        google_maps: "https://goo.gl/maps/aaaBulguksa",
        google_earth: "https://earth.google.com/web/@35.7905495,129.3310156,28.238999",
        visitDuration: "2-3시간",
        bestTime: "오전 9-11시",
        tips: ["입장료 6,000원", "주차장 이용 가능", "가을 단풍이 아름다움"]
      },
      {
        id: 2,
        name: "석굴암",
        description: "통일신라시대 불교 조각의 걸작으로 인정받는 석굴 사원입니다.",
        category: "관광지",
        sense: "시각",
        coordinates: { lat: 35.8010833, lng: 129.3348287 },
        google_maps: "https://goo.gl/maps/bbbSeokguram",
        google_earth: "https://earth.google.com/web/@35.8010833,129.3348287,274.795264",
        visitDuration: "1-2시간",
        bestTime: "오후 2-4시",
        tips: ["불국사와 연계 관람 추천", "셔틀버스 이용", "일출 명소"]
      },
      {
        id: 3,
        name: "첨성대",
        description: "동양에서 가장 오래된 천문대로 신라의 과학 기술을 보여주는 유적입니다.",
        category: "관광지",
        sense: "시각",
        coordinates: { lat: 35.8347, lng: 129.2194 },
        google_maps: "https://goo.gl/maps/cccCheomseongdae",
        google_earth: "https://earth.google.com/web/@35.8347,129.2194,50.123456",
        visitDuration: "30분-1시간",
        bestTime: "오후 5-6시",
        tips: ["야간 조명이 아름다움", "무료 관람", "포토존으로 인기"]
      }
    ],
    route: [
      { lat: 35.7905495, lng: 129.3310156, name: "불국사" },
      { lat: 35.8010833, lng: 129.3348287, name: "석굴암" },
      { lat: 35.8347, lng: 129.2194, name: "첨성대" }
    ],
    totalDistance: "약 25km",
    estimatedCost: "50,000원 - 80,000원",
    aiRecommendation: "시각적 아름다움을 중심으로 한 경주의 대표 문화재를 둘러보는 코스입니다. 불국사와 석굴암은 연계 관람하시고, 첨성대는 저녁 시간에 방문하여 야경을 감상하시기를 추천합니다."
  }

  // 컴포넌트 마운트 시 샘플 데이터 로드
  useEffect(() => {
    setItinerary(sampleItinerary)
  }, [])

  // 새로운 추천 일정 생성
  const generateNewItinerary = async () => {
    setLoading(true)
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 실제로는 AI API를 호출하여 새로운 일정을 받아옴
      setItinerary({
        ...sampleItinerary,
        theme: "미각 중심 경주 여행",
        spots: sampleItinerary.spots.map(spot => ({
          ...spot,
          sense: Math.random() > 0.5 ? "미각" : "시각"
        }))
      })
      
      toast.success("새로운 추천 일정이 생성되었습니다!")
    } catch (error) {
      toast.error("일정 생성 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 즐겨찾기 토글
  const toggleFavorite = (spotId: number) => {
    setFavorites(prev => 
      prev.includes(spotId) 
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    )
  }



  // 길찾기 열기
  const openDirections = (spot: RecommendedSpot) => {
    window.open(spot.google_maps, '_blank')
  }

  if (!itinerary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">추천 일정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">AI 추천 일정</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          미나가 추천하는 맞춤형 경주 여행 일정을 확인하고 계획을 세워보세요
        </p>
      </div>

      {/* 일정 정보 카드 */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {itinerary.theme}
              </CardTitle>
              <CardDescription className="mt-2">
                {itinerary.totalDays}일 코스 • {itinerary.spots.length}개 관광지 • {itinerary.totalDistance}
              </CardDescription>
            </div>
            <Button onClick={generateNewItinerary} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              새 일정 생성
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">개인/가족 여행 추천</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">예상 비용: {itinerary.estimatedCost}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">총 소요시간: 1일</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">🤖 미나의 추천 포인트</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {itinerary.aiRecommendation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 왼쪽: 추천 일정 리스트 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" />
                추천 여행 코스
              </CardTitle>
              <CardDescription>
                최적화된 방문 순서로 구성된 일정입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itinerary.spots.map((spot, index) => (
                  <Card 
                    key={spot.id} 
                    className={`relative hover:shadow-md transition-shadow border-l-4 cursor-pointer ${
                      selectedSpot?.id === spot.id 
                        ? 'border-l-primary bg-primary/5' 
                        : 'border-l-primary/20'
                    }`}
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <CardContent className="p-6">
                      {/* 헤더 영역 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* 순서 번호 */}
                          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                            {index + 1}
                          </div>
                          
                          {/* 메인 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <h3 
                                className="font-bold text-xl text-foreground mb-2 line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setSelectedSpot(spot)}
                              >
                                {spot.name}
                              </h3>
                              {/* 즐겨찾기 버튼 */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation() // 카드 클릭 이벤트 방지
                                  toggleFavorite(spot.id)
                                }}
                                className="shrink-0 ml-2"
                              >
                                <Heart 
                                  className={`w-5 h-5 ${
                                    favorites.includes(spot.id) 
                                      ? 'fill-red-500 text-red-500' 
                                      : 'text-muted-foreground hover:text-red-400'
                                  }`} 
                                />
                              </Button>
                            </div>
                            
                            {/* 카테고리 및 오감 배지 */}
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className={`${getSenseColor(spot.sense)} font-medium`}>
                                {getSenseIcon(spot.sense)}
                                <span className="ml-1">{spot.sense}</span>
                              </Badge>
                              <Badge variant="secondary" className="font-medium">{spot.category}</Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                <MapPin className="w-3 h-3" />
                                <span>#{index + 1} 코스</span>
                              </div>
                            </div>
                            
                            {/* 설명 */}
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                              {spot.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 상세 정보 그리드 */}
                      <div className="grid grid-cols-2 gap-3 mb-4 bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <div>
                            <span className="font-medium text-foreground">소요시간</span>
                            <p className="text-muted-foreground">{spot.visitDuration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <div>
                            <span className="font-medium text-foreground">최적시간</span>
                            <p className="text-muted-foreground">{spot.bestTime}</p>
                          </div>
                        </div>
                      </div>

                      {/* 방문 팁 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                          💡 <span>방문 팁</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {spot.tips.map((tip, tipIndex) => (
                            <Badge 
                              key={tipIndex} 
                              variant="outline" 
                              className="text-xs bg-background hover:bg-muted/50 transition-colors"
                            >
                              {tip}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 지도와 360도 뷰어 */}
        <div className="space-y-6">
          {/* 상단: 구글맵 - 이동 경로 표시 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                여행 경로 지도
              </CardTitle>
              <CardDescription>
                추천 코스를 지도에서 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(50vh-100px)] w-full">
                <GoogleMaps
                  markers={itinerary.spots.map((spot, index) => ({
                    lat: spot.coordinates.lat,
                    lng: spot.coordinates.lng,
                    title: spot.name,
                    description: spot.description,
                    index: index
                  }))}
                  route={itinerary.route}
                  center={itinerary.spots[0]?.coordinates}
                  zoom={12}
                  showRoute={true}
                  height="100%"
                  onMarkerClick={(index) => {
                    const spot = itinerary.spots[index]
                    if (spot) {
                      setSelectedSpot(spot)
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 하단: 3D 지구 뷰어 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                3D 지구 뷰어
              </CardTitle>
              <CardDescription>
                {selectedSpot ? selectedSpot.name : '장소를 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(50vh-100px)] w-full bg-muted rounded-lg overflow-hidden">
                <CesiumEarthViewer
                  spots={itinerary.spots.map((spot, index) => ({
                    name: spot.name,
                    lat: spot.coordinates.lat,
                    lng: spot.coordinates.lng,
                    description: spot.description,
                    index: index
                  }))}
                  selectedSpot={selectedSpot ? {
                    name: selectedSpot.name,
                    lat: selectedSpot.coordinates.lat,
                    lng: selectedSpot.coordinates.lng,
                    description: selectedSpot.description
                  } : null}
                  height="100%"
                  onSpotClick={(index) => {
                    const spot = itinerary.spots[index]
                    if (spot) {
                      setSelectedSpot(spot)
                    }
                  }}
                />
              </div>
            </CardContent>
            {selectedSpot && (
              <CardContent className="pt-0 pb-4">
                <div className="bg-muted/50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold mb-2">{selectedSpot.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{selectedSpot.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-100 rounded p-2">
                      <Clock className="w-3 h-3 mx-auto mb-1 text-blue-600" />
                      <div className="font-medium text-blue-800">{selectedSpot.visitDuration}</div>
                    </div>
                    <div className="bg-yellow-100 rounded p-2">
                      <Star className="w-3 h-3 mx-auto mb-1 text-yellow-600" />
                      <div className="font-medium text-yellow-800">{selectedSpot.bestTime}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>


    </div>
  )
} 