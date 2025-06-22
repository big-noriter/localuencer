"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Globe, 
  MapPin, 
  Camera, 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Navigation,
  Star,
  Clock,
  Users,
  Heart,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Info,
  Route,
  Compass
} from "lucide-react"
import { toast } from "sonner"
import GoogleMaps from "@/components/maps/google-maps"
import SchemaOrg, { combineSchemas } from "@/components/schema-org"
import { createTouristAttractionSchema, createBreadcrumbSchema } from "@/lib/schema"
import { useParams } from "next/navigation"

/**
 * 가상 투어 데이터 인터페이스
 */
interface VirtualTour {
  id: string
  title: string
  description: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  duration: string
  rating: number
  views: number
  thumbnail: string
  category: '역사유적' | '자연경관' | '문화시설' | '체험활동'
  highlights: string[]
  audioGuide: boolean
  vrSupport: boolean
  created: Date
}

/**
 * 경주 가상 투어 데이터
 */
const virtualTours: VirtualTour[] = [
  {
    id: 'bulguksa-vr',
    title: '불국사 360도 가상 투어',
    description: '유네스코 세계문화유산 불국사의 아름다운 석조 건축물을 360도로 체험해보세요.',
    location: '불국사',
    coordinates: { lat: 35.7898, lng: 129.3320 },
    duration: '15분',
    rating: 4.9,
    views: 12543,
    thumbnail: '/placeholder.svg?height=200&width=300&text=불국사+VR',
    category: '역사유적',
    highlights: ['다보탑 360도 뷰', '석가탑 근접 촬영', '극락전 내부', '청운교·백운교'],
    audioGuide: true,
    vrSupport: true,
    created: new Date('2024-01-15')
  },
  {
    id: 'seokguram-vr',
    title: '석굴암 가상 참배',
    description: '동양 조각 예술의 걸작, 석굴암 본존불을 가상으로 참배하는 특별한 경험.',
    location: '석굴암',
    coordinates: { lat: 35.7946, lng: 129.3469 },
    duration: '12분',
    rating: 4.8,
    views: 9876,
    thumbnail: '/placeholder.svg?height=200&width=300&text=석굴암+VR',
    category: '역사유적',
    highlights: ['본존불 근접 뷰', '석굴 구조 분석', '일출 타임랩스', '명상 체험'],
    audioGuide: true,
    vrSupport: true,
    created: new Date('2024-01-20')
  },
  {
    id: 'anapji-vr',
    title: '안압지 야경 가상 투어',
    description: '신라 왕궁의 별궁, 안압지의 환상적인 야경을 가상으로 감상하세요.',
    location: '안압지 (동궁과 월지)',
    coordinates: { lat: 35.8347, lng: 129.2249 },
    duration: '18분',
    rating: 4.7,
    views: 15234,
    thumbnail: '/placeholder.svg?height=200&width=300&text=안압지+VR',
    category: '역사유적',
    highlights: ['야경 조명 쇼', '연못 반영 효과', '복원 건물 투어', '계절별 풍경'],
    audioGuide: true,
    vrSupport: true,
    created: new Date('2024-02-01')
  },
  {
    id: 'cheomseongdae-vr',
    title: '첨성대 천문 관측 체험',
    description: '동양 최고(最古)의 천문대에서 신라인의 천문학을 체험해보세요.',
    location: '첨성대',
    coordinates: { lat: 35.8356, lng: 129.2194 },
    duration: '10분',
    rating: 4.6,
    views: 7654,
    thumbnail: '/placeholder.svg?height=200&width=300&text=첨성대+VR',
    category: '역사유적',
    highlights: ['천문대 구조 분석', '별자리 관측', '신라 천문학', '야간 타임랩스'],
    audioGuide: true,
    vrSupport: false,
    created: new Date('2024-02-10')
  },
  {
    id: 'daereungwon-vr',
    title: '대릉원 고분 탐험',
    description: '신라 왕족의 거대한 고분군을 탐험하며 고대 신라의 문화를 체험하세요.',
    location: '대릉원',
    coordinates: { lat: 35.8342, lng: 129.2167 },
    duration: '20분',
    rating: 4.5,
    views: 11098,
    thumbnail: '/placeholder.svg?height=200&width=300&text=대릉원+VR',
    category: '역사유적',
    highlights: ['천마총 내부', '황남대총 규모', '고분 공원 산책', '유물 3D 모델'],
    audioGuide: true,
    vrSupport: true,
    created: new Date('2024-02-15')
  }
]

/**
 * 가상 투어 플레이어 상태
 */
interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  quality: '360p' | '720p' | '1080p' | '4K'
}

/**
 * 경주 가상 여행 페이지
 * Google Maps/Earth 연동으로 360도 가상 투어 제공
 */
export default function VirtualTravelPage() {
  const [selectedTour, setSelectedTour] = useState<VirtualTour | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAttraction, setSelectedAttraction] = useState<string>('')
  const [activeTab, setActiveTab] = useState('tours')
  const { locale } = useParams()
  
  // 가상 투어 플레이어 상태
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 100,
    volume: 80,
    isMuted: false,
    isFullscreen: false,
    quality: '1080p'
  })

  /**
   * 카테고리별 투어 필터링
   */
  const filteredTours = selectedCategory === 'all' 
    ? virtualTours 
    : virtualTours.filter(tour => tour.category === selectedCategory)

  /**
   * 투어 재생/정지
   */
  const togglePlay = () => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
    
    if (!playerState.isPlaying) {
      toast.success(`${selectedTour?.title} 재생을 시작합니다.`)
    }
  }

  /**
   * 투어 선택
   */
  const selectTour = (tour: VirtualTour) => {
    setSelectedTour(tour)
    setPlayerState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }))
    toast.info(`${tour.title}을(를) 선택했습니다.`)
  }

  /**
   * 관광지 선택 처리 (지도에서)
   */
  const handleAttractionSelect = (attraction: any) => {
    setSelectedAttraction(attraction.id)
    
    // 해당 관광지의 가상 투어 찾기
    const relatedTour = virtualTours.find(tour => 
      tour.location.includes(attraction.name) || 
      attraction.name.includes(tour.location)
    )
    
    if (relatedTour) {
      selectTour(relatedTour)
      setActiveTab('player')
    }
  }

  /**
   * 시간 포맷팅
   */
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  /**
   * 플레이어 시간 업데이트 (시뮬레이션)
   */
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (playerState.isPlaying && selectedTour) {
      interval = setInterval(() => {
        setPlayerState(prev => ({
          ...prev,
          currentTime: prev.currentTime >= prev.duration ? 0 : prev.currentTime + 1
        }))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [playerState.isPlaying, selectedTour])

  // 구조화된 데이터 생성 (관광지 정보)
  const generateAttractionsSchema = () => {
    // 기본 URL 설정
    const baseUrl = 'https://localuencer-mina.com';
    const localeUrl = `${baseUrl}/${locale}`;

    // 주요 관광지 5곳에 대한 구조화 데이터 생성
    const attractionsSchemas = virtualTours.map(tour => 
      createTouristAttractionSchema({
        name: tour.location,
        description: tour.description,
        url: `${localeUrl}/virtual-travel`,
        image: tour.thumbnail,
        address: {
          streetAddress: tour.location,
          addressLocality: '경주시',
          addressRegion: '경상북도',
          addressCountry: '대한민국'
        },
        geo: {
          latitude: tour.coordinates.lat,
          longitude: tour.coordinates.lng
        },
        touristType: ['역사유적', '문화관광', '가상투어'],
        openingHours: [
          {
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '09:00',
            closes: '18:00'
          }
        ]
      })
    );

    const breadcrumbSchema = createBreadcrumbSchema([
      { 
        name: locale === 'ko' ? '홈' : 'Home', 
        url: localeUrl 
      },
      { 
        name: locale === 'ko' ? '가상여행' : 'Virtual Travel', 
        url: `${localeUrl}/virtual-travel` 
      },
    ]);

    return combineSchemas(...attractionsSchemas, breadcrumbSchema);
  };

  return (
    <>
      <SchemaOrg schema={generateAttractionsSchema()} />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">경주 가상 여행</h1>
            <p className="text-muted-foreground">
              360° 가상 투어로 경주의 아름다운 관광지를 집에서 경험하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>한국어</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>도움말</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tours">가상 투어</TabsTrigger>
            <TabsTrigger value="map">지도 보기</TabsTrigger>
            <TabsTrigger value="player" disabled={!selectedTour}>투어 플레이어</TabsTrigger>
          </TabsList>

        <TabsContent value="tours" className="space-y-6">
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              전체
            </Button>
            <Button
              variant={selectedCategory === '역사유적' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('역사유적')}
            >
              역사유적
            </Button>
            <Button
              variant={selectedCategory === '자연경관' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('자연경관')}
            >
              자연경관
            </Button>
            <Button
              variant={selectedCategory === '문화시설' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('문화시설')}
            >
              문화시설
            </Button>
          </div>

          {/* 가상 투어 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={tour.thumbnail} 
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-gray-100"
                      onClick={() => selectTour(tour)}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      투어 시작
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">{tour.category}</Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {tour.vrSupport && (
                      <Badge variant="default" className="bg-purple-600">VR</Badge>
                    )}
                    {tour.audioGuide && (
                      <Badge variant="default" className="bg-blue-600">음성가이드</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {tour.duration}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{tour.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{tour.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{tour.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tour.duration}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{tour.description}</p>
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-1">주요 하이라이트</h4>
                    <div className="flex flex-wrap gap-1">
                      {tour.highlights.slice(0, 3).map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => selectTour(tour)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      재생
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="player" className="space-y-6">
          {selectedTour ? (
            <>
              {/* 가상 투어 플레이어 */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-black relative">
                  {/* 가상 360도 뷰어 (목업) */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Globe className="w-24 h-24 mx-auto mb-4 animate-spin" />
                      <h3 className="text-2xl font-bold mb-2">{selectedTour.title}</h3>
                      <p className="text-lg opacity-80">360도 가상 투어 체험</p>
                      {playerState.isPlaying ? (
                        <div className="mt-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span>재생 중...</span>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="mt-4 bg-white text-black hover:bg-gray-100"
                          onClick={togglePlay}
                        >
                          <Play className="w-6 h-6 mr-2" />
                          투어 시작
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 플레이어 컨트롤 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex items-center gap-4 text-white">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={togglePlay}
                      >
                        {playerState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span>{formatTime(playerState.currentTime)}</span>
                          <div className="flex-1 bg-white/30 rounded-full h-1">
                            <div 
                              className="bg-white rounded-full h-full transition-all duration-300"
                              style={{ width: `${(playerState.currentTime / playerState.duration) * 100}%` }}
                            />
                          </div>
                          <span>{formatTime(playerState.duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          {playerState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* VR 컨트롤 (VR 지원 투어의 경우) */}
                  {selectedTour.vrSupport && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button size="sm" variant="ghost" className="bg-black/50 text-white hover:bg-black/70">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="bg-black/50 text-white hover:bg-black/70">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="bg-black/50 text-white hover:bg-black/70">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* 투어 정보 */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedTour.title}</CardTitle>
                      <Badge variant="secondary">{selectedTour.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{selectedTour.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedTour.views.toLocaleString()} 조회</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedTour.duration}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{selectedTour.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">🎯 주요 하이라이트</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTour.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        공유
                      </Button>
                      <Button variant="outline">
                        <Heart className="w-4 h-4 mr-2" />
                        찜하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      투어 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">위치</dt>
                      <dd className="mt-1">{selectedTour.location}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">소요시간</dt>
                      <dd className="mt-1">{selectedTour.duration}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">지원 기능</dt>
                      <dd className="mt-1 flex gap-1">
                        {selectedTour.audioGuide && (
                          <Badge variant="outline">음성가이드</Badge>
                        )}
                        {selectedTour.vrSupport && (
                          <Badge variant="outline">VR 지원</Badge>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">제작일</dt>
                      <dd className="mt-1">{selectedTour.created.toLocaleDateString('ko-KR')}</dd>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      <Navigation className="w-4 h-4 mr-2" />
                      실제 위치 보기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">투어를 선택해주세요</h3>
                <p className="text-muted-foreground">가상 투어 탭에서 원하는 투어를 선택하세요.</p>
                <Button className="mt-4" onClick={() => setActiveTab('tours')}>
                  투어 목록 보기
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-6 w-6 text-primary" />
                경주 가상 투어 지도
              </CardTitle>
              <CardDescription>
                지도에서 관광지를 클릭하면 해당 위치의 가상 투어를 즐길 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMaps 
                selectedAttraction={selectedAttraction}
                onAttractionSelect={handleAttractionSelect}
                height="500px"
              />
            </CardContent>
          </Card>

          {/* Google Earth 통합 (구현 예정) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-6 w-6 text-primary" />
                Google Earth 3D 투어 (구현 예정)
              </CardTitle>
              <CardDescription>
                Google Earth를 활용한 3D 위성 투어 기능입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Google Earth 3D 투어</p>
                  <p className="text-sm text-muted-foreground">곧 업데이트될 예정입니다</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" disabled>
                  <Route className="mr-2 h-4 w-4" />
                  3D 경로 투어
                </Button>
                <Button variant="outline" disabled>
                  <Compass className="mr-2 h-4 w-4" />
                  위성 뷰 탐색
                </Button>
                <Button variant="outline" disabled>
                  <Camera className="mr-2 h-4 w-4" />
                  항공 촬영 투어
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">🎮 가상 투어 이용 안내</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>360도 뷰:</strong> 마우스나 터치로 화면을 드래그하여 시점을 변경하세요</li>
          <li>• <strong>VR 모드:</strong> VR 헤드셋을 착용하고 더욱 몰입감 있는 체험이 가능합니다</li>
          <li>• <strong>음성 가이드:</strong> 투어 중 전문 가이드의 상세한 설명을 들을 수 있습니다</li>
          <li>• <strong>지도 연동:</strong> 지도에서 관광지를 클릭하면 해당 가상 투어로 바로 이동합니다</li>
          <li>• <strong>고화질 지원:</strong> 4K 해상도까지 지원하여 선명한 화질로 감상하세요</li>
        </ul>
      </div>
    </div>
  )
}
