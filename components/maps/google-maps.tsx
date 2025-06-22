"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Star, 
  Camera, 
  Info,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * 경주 관광지 정보 인터페이스
 */
interface GyeongjuAttraction {
  id: string
  name: string
  nameEn: string
  description: string
  category: '역사유적' | '자연경관' | '문화시설' | '체험활동'
  rating: number
  visitTime: string
  coordinates: {
    lat: number
    lng: number
  }
  images: string[]
  highlights: string[]
  tips: string[]
  openingHours: string
  admissionFee: string
  accessibility: string
}

/**
 * 경주 주요 관광지 데이터
 */
const gyeongjuAttractions: GyeongjuAttraction[] = [
  {
    id: 'bulguksa',
    name: '불국사',
    nameEn: 'Bulguksa Temple',
    description: '신라 불교 문화의 정수를 보여주는 유네스코 세계문화유산으로, 아름다운 석조 건축물과 다보탑, 석가탑이 유명합니다.',
    category: '역사유적',
    rating: 4.8,
    visitTime: '2-3시간',
    coordinates: { lat: 35.7898, lng: 129.3320 },
    images: ['/placeholder.svg?height=300&width=400&text=불국사'],
    highlights: ['다보탑', '석가탑', '청운교·백운교', '극락전'],
    tips: ['이른 아침 방문 추천', '편한 신발 착용', '사진 촬영 허용 구역 확인'],
    openingHours: '07:00 - 18:00 (계절별 상이)',
    admissionFee: '성인 6,000원',
    accessibility: '휠체어 접근 일부 제한'
  },
  {
    id: 'seokguram',
    name: '석굴암',
    nameEn: 'Seokguram Grotto',
    description: '동양 조각 예술의 걸작으로 불리는 석굴 사원으로, 본존불의 아름다운 미소가 인상적입니다.',
    category: '역사유적',
    rating: 4.7,
    visitTime: '1-2시간',
    coordinates: { lat: 35.7946, lng: 129.3469 },
    images: ['/placeholder.svg?height=300&width=400&text=석굴암'],
    highlights: ['본존불상', '석굴 구조', '일출 전망'],
    tips: ['불국사와 함께 관람', '일출 시간 방문 추천', '예약 필수'],
    openingHours: '06:30 - 18:00',
    admissionFee: '성인 6,000원',
    accessibility: '경사로 있음, 휠체어 접근 가능'
  },
  {
    id: 'anapji',
    name: '안압지 (동궁과 월지)',
    nameEn: 'Anapji Pond',
    description: '신라 왕궁의 별궁으로 사용된 연못으로, 특히 야경이 아름답기로 유명합니다.',
    category: '역사유적',
    rating: 4.6,
    visitTime: '1-2시간',
    coordinates: { lat: 35.8347, lng: 129.2249 },
    images: ['/placeholder.svg?height=300&width=400&text=안압지'],
    highlights: ['야경 조명', '연못 반영', '복원된 건물'],
    tips: ['일몰 후 방문 추천', '삼각대 지참', '겨울철 특히 아름다움'],
    openingHours: '09:00 - 22:00',
    admissionFee: '성인 3,000원',
    accessibility: '평지, 휠체어 접근 용이'
  },
  {
    id: 'cheomseongdae',
    name: '첨성대',
    nameEn: 'Cheomseongdae Observatory',
    description: '동양에서 가장 오래된 천문대로, 신라의 과학 기술 수준을 보여주는 상징적인 건축물입니다.',
    category: '역사유적',
    rating: 4.4,
    visitTime: '30분-1시간',
    coordinates: { lat: 35.8356, lng: 129.2194 },
    images: ['/placeholder.svg?height=300&width=400&text=첨성대'],
    highlights: ['독특한 원통형 구조', '천문 관측 시설', '신라 과학 기술'],
    tips: ['대릉원과 함께 관람', '사진 촬영 명소', '짧은 관람 시간'],
    openingHours: '24시간 (외부 관람)',
    admissionFee: '무료',
    accessibility: '평지, 접근 용이'
  },
  {
    id: 'daereungwon',
    name: '대릉원',
    nameEn: 'Daereungwon Tomb Complex',
    description: '신라 왕족들의 거대한 고분군으로, 천마총과 황남대총이 대표적입니다.',
    category: '역사유적',
    rating: 4.5,
    visitTime: '1-2시간',
    coordinates: { lat: 35.8342, lng: 129.2167 },
    images: ['/placeholder.svg?height=300&width=400&text=대릉원'],
    highlights: ['천마총 내부', '황남대총', '고분 공원'],
    tips: ['천마총 내부 관람 가능', '넓은 공원', '산책하기 좋음'],
    openingHours: '09:00 - 18:00',
    admissionFee: '성인 3,000원',
    accessibility: '평지, 휠체어 접근 가능'
  }
]

/**
 * Google Maps 컴포넌트 Props
 */
interface GoogleMapsProps {
  selectedAttraction?: string
  onAttractionSelect?: (attraction: GyeongjuAttraction) => void
  height?: string
}

/**
 * Google Maps API를 활용한 경주 관광지 지도 컴포넌트
 * 관광지 마커, 정보창, 길찾기 등의 기능을 제공
 */
export default function GoogleMaps({ 
  selectedAttraction, 
  onAttractionSelect,
  height = '400px' 
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedAttractionData, setSelectedAttractionData] = useState<GyeongjuAttraction | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  /**
   * Google Maps API 로드 및 초기화
   */
  useEffect(() => {
    const initMap = async () => {
      try {
        // Google Maps API 키 확인
        const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        
        if (!GOOGLE_MAPS_API_KEY) {
          console.warn('Google Maps API 키가 설정되지 않았습니다.')
          // 개발 환경에서는 목업 지도 표시
          if (process.env.NODE_ENV === 'development') {
            setIsLoaded(true)
            return
          }
        }

        // Google Maps API 동적 로드
        if (!window.google) {
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
          script.async = true
          script.defer = true
          
          script.onload = () => {
            initializeMap()
          }
          
          script.onerror = () => {
            console.error('Google Maps API 로드에 실패했습니다.')
            toast.error('지도 로드에 실패했습니다.')
          }
          
          document.head.appendChild(script)
        } else {
          initializeMap()
        }
      } catch (error) {
        console.error('지도 초기화 오류:', error)
        toast.error('지도 초기화에 실패했습니다.')
      }
    }

    initMap()
  }, [])

  /**
   * Google Maps 초기화
   */
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // 경주 중심 좌표
    const gyeongjuCenter = { lat: 35.8242, lng: 129.2139 }

    // 지도 생성
    const map = new google.maps.Map(mapRef.current, {
      center: gyeongjuCenter,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    googleMapRef.current = map
    
    // 정보창 생성
    infoWindowRef.current = new google.maps.InfoWindow()

    // 관광지 마커 추가
    addAttractionMarkers(map)
    
    // 사용자 위치 가져오기
    getUserLocation()
    
    setIsLoaded(true)
    toast.success('경주 관광지 지도가 로드되었습니다!')
  }

  /**
   * 관광지 마커 추가
   */
  const addAttractionMarkers = (map: google.maps.Map) => {
    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    gyeongjuAttractions.forEach((attraction) => {
      const marker = new google.maps.Marker({
        position: attraction.coordinates,
        map: map,
        title: attraction.name,
        icon: {
          url: getCategoryIcon(attraction.category),
          scaledSize: new google.maps.Size(40, 40)
        }
      })

      // 마커 클릭 이벤트
      marker.addListener('click', () => {
        showAttractionInfo(attraction, marker)
        onAttractionSelect?.(attraction)
      })

      markersRef.current.push(marker)
    })
  }

  /**
   * 카테고리별 마커 아이콘 반환
   */
  const getCategoryIcon = (category: string) => {
    const icons = {
      '역사유적': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      '자연경관': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      '문화시설': 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      '체험활동': 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    }
    return icons[category as keyof typeof icons] || icons['역사유적']
  }

  /**
   * 관광지 정보창 표시
   */
  const showAttractionInfo = (attraction: GyeongjuAttraction, marker: google.maps.Marker) => {
    if (!infoWindowRef.current) return

    const content = `
      <div style="max-width: 300px; padding: 10px;">
        <h3 style="margin: 0 0 8px 0; color: #333;">${attraction.name}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${attraction.description}</p>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="color: #f59e0b;">★ ${attraction.rating}</span>
          <span style="color: #666;">⏱ ${attraction.visitTime}</span>
        </div>
        <div style="margin-top: 8px;">
          <button onclick="window.openDirections('${attraction.coordinates.lat}', '${attraction.coordinates.lng}')" 
                  style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
            길찾기
          </button>
        </div>
      </div>
    `

    infoWindowRef.current.setContent(content)
    infoWindowRef.current.open(googleMapRef.current, marker)
    
    setSelectedAttractionData(attraction)
  }

  /**
   * 사용자 현재 위치 가져오기
   */
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          
          // 사용자 위치 마커 추가
          if (googleMapRef.current) {
            new google.maps.Marker({
              position: location,
              map: googleMapRef.current,
              title: '현재 위치',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(30, 30)
              }
            })
          }
        },
        (error) => {
          console.warn('위치 정보를 가져올 수 없습니다:', error)
        }
      )
    }
  }

  /**
   * 길찾기 기능
   */
  const openDirections = (lat: number, lng: number) => {
    const destination = `${lat},${lng}`
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
    window.open(url, '_blank')
  }

  // 전역 함수로 길찾기 기능 노출
  useEffect(() => {
    (window as any).openDirections = openDirections
  }, [])

  /**
   * 특정 관광지로 이동
   */
  const flyToAttraction = (attractionId: string) => {
    const attraction = gyeongjuAttractions.find(a => a.id === attractionId)
    if (attraction && googleMapRef.current) {
      googleMapRef.current.panTo(attraction.coordinates)
      googleMapRef.current.setZoom(15)
      
      // 해당 마커 클릭 시뮬레이션
      const marker = markersRef.current.find(m => m.getTitle() === attraction.name)
      if (marker) {
        google.maps.event.trigger(marker, 'click')
      }
    }
  }

  useEffect(() => {
    if (selectedAttraction) {
      flyToAttraction(selectedAttraction)
    }
  }, [selectedAttraction])

  if (!isLoaded && process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">지도를 로드하고 있습니다...</p>
        </div>
      </div>
    )
  }

  // 개발 환경에서 Google Maps API가 없을 때 목업 지도 표시
  if (process.env.NODE_ENV === 'development' && !window.google) {
    return (
      <div className="space-y-4">
        <div 
          className="bg-muted rounded-lg flex items-center justify-center border-2 border-dashed"
          style={{ height }}
        >
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground font-medium">Google Maps (개발 모드)</p>
            <p className="text-sm text-muted-foreground">실제 환경에서는 Google Maps가 표시됩니다</p>
          </div>
        </div>
        
        {/* 목업 관광지 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gyeongjuAttractions.map((attraction) => (
            <Card key={attraction.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{attraction.name}</CardTitle>
                  <Badge variant="secondary">{attraction.category}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{attraction.rating}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{attraction.visitTime}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{attraction.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Info className="w-4 h-4 mr-1" />
                    정보
                  </Button>
                  <Button size="sm" variant="outline">
                    <Navigation className="w-4 h-4 mr-1" />
                    길찾기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border"
        style={{ height }}
      />
      
      {selectedAttractionData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {selectedAttractionData.name}
              </CardTitle>
              <Badge variant="secondary">{selectedAttractionData.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{selectedAttractionData.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{selectedAttractionData.visitTime}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{selectedAttractionData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium mb-2">주요 볼거리</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedAttractionData.highlights.map((highlight, index) => (
                    <li key={index}>• {highlight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">방문 팁</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedAttractionData.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => openDirections(selectedAttractionData.coordinates.lat, selectedAttractionData.coordinates.lng)}
                className="flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                길찾기
              </Button>
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                사진보기
              </Button>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                더보기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 