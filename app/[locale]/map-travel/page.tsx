"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Globe, Navigation, Clock, Star, Camera } from 'lucide-react'
import GoogleMaps from '@/components/maps/google-maps'
import CesiumEarthViewer from '@/components/maps/cesium-earth-viewer'
import { useTranslations } from 'next-intl'

interface TourSpot {
  name: string
  lat: number
  lon: number
  description?: string
  category?: string
  image?: string
}

export default function MapTravelPage() {
  const t = useTranslations('mapTravel')
  const [tourSpots, setTourSpots] = useState<TourSpot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<TourSpot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTourData()
  }, [])

  const loadTourData = async () => {
    try {
      setLoading(true)
      
      // 캐시 방지를 위한 타임스탬프 추가
      const response = await fetch(`/tour.json?t=${Date.now()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      console.log('응답 텍스트 길이:', text.length)
      console.log('응답 시작 부분:', text.substring(0, 100))
      
      // HTML 응답 체크
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('HTML 응답을 받았습니다. JSON이 아닙니다.')
      }
      
      // JSON 파싱 시도
      const data = JSON.parse(text)
      
      if (!Array.isArray(data)) {
        throw new Error('응답이 배열이 아닙니다')
      }
      
      console.log('로드된 관광지 수:', data.length)
      setTourSpots(data)
      if (data.length > 0) {
        setSelectedSpot(data[0])
      }
    } catch (error) {
      console.error('투어 데이터 로드 오류:', error)
      // tour.json 로드 실패 시 기본 데이터 사용 (처음 10개만)
      const defaultData = [
        { name: "불국사", lat: 35.7905495, lon: 129.3310156, description: "신라 시대의 대표적인 불교 사찰", category: "관광지" },
        { name: "석굴암", lat: 35.8010833, lon: 129.3348287, description: "통일신라시대 불교 조각의 걸작", category: "관광지" },
        { name: "안압지(동궁과 월지)", lat: 35.8347, lon: 129.2244, description: "신라 왕궁의 별궁터", category: "관광지" },
        { name: "첨성대", lat: 35.8347, lon: 129.2185, description: "동양에서 가장 오래된 천문대", category: "관광지" },
        { name: "대릉원(천마총)", lat: 35.8342, lon: 129.2185, description: "신라 왕과 왕족들의 무덤", category: "관광지" },
        { name: "황리단길", lat: 35.8325, lon: 129.2263, description: "경주의 트렌디한 거리", category: "핫플레이스" },
        { name: "동궁원", lat: 35.8347, lon: 129.2244, description: "안압지 인근 식물원", category: "관광지" },
        { name: "경주월드리조트", lat: 35.853, lon: 129.219, description: "보문관광단지 내 복합 리조트", category: "핫플레이스" },
        { name: "오릉", lat: 35.8295, lon: 129.2158, description: "신라 초기 왕들의 무덤", category: "관광지" },
        { name: "월정교", lat: 35.833, lon: 129.217, description: "경주 금장천 위의 아름다운 다리", category: "관광지" }
      ]
      setTourSpots(defaultData)
      setSelectedSpot(defaultData[0])
    } finally {
      setLoading(false)
    }
  }

  const handleSpotClick = (spot: TourSpot, index: number) => {
    setSelectedSpot(spot)
  }

  const handleMapMarkerClick = (index: number) => {
    if (tourSpots[index]) {
      setSelectedSpot(tourSpots[index])
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
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
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('title')}</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* 상단: 지도 영역 (50% + 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh]">
        {/* 왼쪽: 구글맵 */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="w-5 h-5 text-primary" />
              {t('googleMaps')}
            </CardTitle>
            <CardDescription>
              {selectedSpot ? `${t('currentSelection')}: ${selectedSpot.name}` : t('selectSpot')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <GoogleMaps
              markers={tourSpots.map((spot, index) => ({
                lat: spot.lat,
                lng: spot.lon,
                title: spot.name,
                description: spot.description || '',
                index: index
              }))}
              route={tourSpots.map(spot => ({ lat: spot.lat, lng: spot.lon }))}
              center={selectedSpot ? { lat: selectedSpot.lat, lng: selectedSpot.lon } : { lat: 35.8347, lng: 129.2194 }}
              zoom={13}
              showRoute={true}
              height="100%"
              onMarkerClick={handleMapMarkerClick}
            />
          </CardContent>
        </Card>

        {/* 오른쪽: 구글어스 3D */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              Google Earth 3D
            </CardTitle>
            <CardDescription>
              {selectedSpot ? `${selectedSpot.name} 3D 지구 보기` : t('selectSpot')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <CesiumEarthViewer
              spots={tourSpots.map((spot, index) => ({
                name: spot.name,
                lat: spot.lat,
                lng: spot.lon,
                description: spot.description || '',
                index: index
              }))}
              selectedSpot={selectedSpot ? {
                name: selectedSpot.name,
                lat: selectedSpot.lat,
                lng: selectedSpot.lon,
                description: selectedSpot.description || ''
              } : null}
              height="100%"
              onSpotClick={handleMapMarkerClick}
            />
          </CardContent>
        </Card>
      </div>

      {/* 하단: 관광지 목록 (한 줄에 10개) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {t('tourSpots')}
          </CardTitle>
          <CardDescription>
            관광지를 클릭하면 지도와 3D 뷰어에서 해당 위치를 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
            {tourSpots.map((spot, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedSpot?.name === spot.name
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleSpotClick(spot, index)}
              >
                <div className="text-center space-y-2">
                  {/* 순서 번호 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${
                    selectedSpot?.name === spot.name
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* 관광지 이름 */}
                  <h3 className={`font-medium text-sm line-clamp-2 ${
                    selectedSpot?.name === spot.name ? 'text-primary' : 'text-foreground'
                  }`}>
                    {spot.name}
                  </h3>
                  
                  {/* 카테고리 배지 */}
                  {spot.category && (
                    <Badge variant="outline" className="text-xs">
                      {spot.category}
                    </Badge>
                  )}
                  
                  {/* 설명 (요약) */}
                  {spot.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {spot.description}
                    </p>
                  )}
                  
                  {/* 좌표 정보 */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{spot.lat.toFixed(4)}</span>
                    </div>
                    <div className="text-center">
                      {spot.lon.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 선택된 관광지 상세 정보 */}
      {selectedSpot && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
                             {t('selectedSpot')}: {selectedSpot.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t('locationInfo')}</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>{t('latitude')}: {selectedSpot.lat.toFixed(6)}</div>
                  <div>{t('longitude')}: {selectedSpot.lon.toFixed(6)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t('category')}</h4>
                <Badge variant="secondary">{selectedSpot.category || '관광지'}</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t('description')}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSpot.description || '경주의 아름다운 관광지입니다.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 