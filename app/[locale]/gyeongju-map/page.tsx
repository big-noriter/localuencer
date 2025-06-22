'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Search, 
  Heart, 
  Star, 
  Clock, 
  Camera,
  Navigation,
  Eye,
  Map as MapIcon
} from 'lucide-react'

// 경주 관광지 데이터
const gyeongjuAttractions = [
  {
    id: 1,
    name: "불국사",
    nameEn: "Bulguksa Temple",
    category: "문화유산",
    description: "신라 불교 예술의 걸작, 유네스코 세계문화유산",
    coordinates: { lat: 35.7898, lng: 129.3320 },
    image: "/Image_fx (1).jpg",
    rating: 4.8,
    visitTime: "2-3시간",
    bestTime: "오전 9-11시",
    senses: ["시각", "청각", "후각"],
    tips: "일출 시간에 방문하면 더욱 아름다운 풍경을 감상할 수 있습니다."
  },
  {
    id: 2,
    name: "석굴암",
    nameEn: "Seokguram Grotto",
    category: "문화유산",
    description: "동양 조각 예술의 최고봉, 석가여래불상",
    coordinates: { lat: 35.7947, lng: 129.3475 },
    image: "/Image_fx (2).jpg",
    rating: 4.7,
    visitTime: "1-2시간",
    bestTime: "오후 2-4시",
    senses: ["시각", "촉각"],
    tips: "불국사와 함께 방문하시면 더욱 의미 있는 여행이 됩니다."
  },
  {
    id: 3,
    name: "첨성대",
    nameEn: "Cheomseongdae Observatory",
    category: "과학유산",
    description: "동양에서 가장 오래된 천문대",
    coordinates: { lat: 35.8346, lng: 129.2194 },
    image: "/Image_fx (3).jpg",
    rating: 4.5,
    visitTime: "30분-1시간",
    bestTime: "일몰 시간",
    senses: ["시각", "청각"],
    tips: "야경이 아름다우니 저녁 시간에 방문해보세요."
  },
  {
    id: 4,
    name: "안압지",
    nameEn: "Anapji Pond",
    category: "궁궐유적",
    description: "신라 왕궁의 별궁터, 아름다운 연못",
    coordinates: { lat: 35.8348, lng: 129.2248 },
    image: "/gyeongju-tourist-map-900.jpg",
    rating: 4.6,
    visitTime: "1-2시간",
    bestTime: "일몰 후",
    senses: ["시각", "후각"],
    tips: "야간 조명이 켜지면 환상적인 풍경을 연출합니다."
  },
  {
    id: 5,
    name: "대릉원",
    nameEn: "Daereungwon Tomb Complex",
    category: "고분군",
    description: "신라 왕과 왕족들의 거대한 고분군",
    coordinates: { lat: 35.8292, lng: 129.2167 },
    image: "/IMG_2568-1024x682.jpg",
    rating: 4.4,
    visitTime: "1-2시간",
    bestTime: "오전 10-12시",
    senses: ["시각", "촉각"],
    tips: "천마총 내부를 관람할 수 있습니다."
  }
]

const categories = ["전체", "문화유산", "궁궐유적", "고분군", "과학유산"]
const senseFilters = ["전체", "시각", "청각", "후각", "미각", "촉각"]

export default function GyeongjuMapPage() {
  const [selectedAttraction, setSelectedAttraction] = useState<typeof gyeongjuAttractions[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedSense, setSelectedSense] = useState('전체')
  const [favorites, setFavorites] = useState<number[]>([])
  const [showStreetView, setShowStreetView] = useState(false)

  // 필터링된 관광지 목록
  const filteredAttractions = gyeongjuAttractions.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attraction.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '전체' || attraction.category === selectedCategory
    const matchesSense = selectedSense === '전체' || attraction.senses.includes(selectedSense)
    
    return matchesSearch && matchesCategory && matchesSense
  })

  // 즐겨찾기 토글
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    )
  }

  // 360도 뷰 열기
  const open360View = (attraction: typeof gyeongjuAttractions[0]) => {
    setSelectedAttraction(attraction)
    setShowStreetView(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            경주 지도여행 🗺️
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            모든 관광지를 지도와 360도 뷰로 탐험하세요. 미나가 추천하는 특별한 경주 여행을 시작해보세요!
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="관광지명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedSense}
                onChange={(e) => setSelectedSense(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {senseFilters.map(sense => (
                  <option key={sense} value={sense}>{sense}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            총 {filteredAttractions.length}개의 관광지가 검색되었습니다.
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 관광지 목록 (좌측) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredAttractions.map((attraction) => (
                <Card key={attraction.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{attraction.name}</CardTitle>
                        <CardDescription className="text-sm">{attraction.nameEn}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(attraction.id)}
                        className="p-1"
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            favorites.includes(attraction.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video mb-3 overflow-hidden rounded-md">
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">
                        {attraction.category}
                      </Badge>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {attraction.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{attraction.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{attraction.visitTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {attraction.senses.map(sense => (
                          <Badge key={sense} variant="outline" className="text-xs">
                            {sense}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => open360View(attraction)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          360° 뷰
                        </Button>
                        <Button size="sm" variant="outline">
                          <Navigation className="w-3 h-3 mr-1" />
                          길찾기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 지도 및 상세 정보 (우측) */}
          <div className="space-y-4">
            {/* 지도 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="w-5 h-5" />
                  경주 관광지도
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">구글맵 연동 예정</p>
                    <p className="text-xs">현재는 목업 상태입니다</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 선택된 관광지 상세 정보 */}
            {selectedAttraction && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAttraction.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-video overflow-hidden rounded-md">
                    <img
                      src={selectedAttraction.image}
                      alt={selectedAttraction.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">{selectedAttraction.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">소요시간:</span> {selectedAttraction.visitTime}
                      </div>
                      <div>
                        <span className="font-medium">최적시간:</span> {selectedAttraction.bestTime}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-xs">방문 팁:</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedAttraction.tips}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Camera className="w-3 h-3 mr-1" />
                        사진엽서 만들기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 즐겨찾기 목록 */}
            {favorites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    즐겨찾기 ({favorites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {favorites.map(id => {
                      const attraction = gyeongjuAttractions.find(a => a.id === id)
                      return attraction ? (
                        <div key={id} className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{attraction.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    새 일정 만들기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 360도 뷰 모달 */}
        {showStreetView && selectedAttraction && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">{selectedAttraction.name} - 360° 뷰</h3>
                <Button variant="ghost" onClick={() => setShowStreetView(false)}>
                  ✕
                </Button>
              </div>
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-16 h-16 mx-auto mb-4" />
                  <p>Google Street View 연동 예정</p>
                  <p className="text-sm">현재는 목업 상태입니다</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 