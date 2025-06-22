"use client"

import { useEffect, useState } from 'react'
import { Globe, Earth, Loader2 } from 'lucide-react'

interface CesiumEarthViewerProps {
  spots: Array<{
    name: string
    lat: number
    lng: number
    description: string
    index: number
  }>
  selectedSpot?: {
    name: string
    lat: number
    lng: number
    description: string
  } | null
  height?: string
  onSpotClick?: (index: number) => void
}

export default function CesiumEarthViewer({ 
  spots = [], 
  selectedSpot, 
  height = "400px",
  onSpotClick 
}: CesiumEarthViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Google Earth 임베드 URL 생성
  const generateGoogleEarthUrl = () => {
    if (!selectedSpot) {
      // 기본 경주 지역 (3D 뷰)
      return `https://earth.google.com/web/@35.8347,129.2194,1000a,2000d,35y,0h,45t,0r`
    }
    
    // 선택된 장소로 이동 (3D 뷰)
    return `https://earth.google.com/web/@${selectedSpot.lat},${selectedSpot.lng},1000a,1500d,35y,0h,45t,0r`
  }

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Google Earth 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-full rounded-lg overflow-hidden border relative"
      style={{ height }}
    >
      {/* Google Earth 임베드 */}
      <iframe
        src={generateGoogleEarthUrl()}
        width="100%"
        height="100%"
        style={{ border: 'none', display: 'block' }}
        allowFullScreen
        loading="lazy"
        className="w-full h-full"
        title="Google Earth 3D 뷰어"
      />

      {/* 선택된 장소 정보 오버레이 */}
      {selectedSpot && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-40 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Earth className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-800">Google Earth 3D</h3>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">{selectedSpot.name}</p>
            <p className="text-xs text-gray-600">위도: {selectedSpot.lat.toFixed(6)}</p>
            <p className="text-xs text-gray-600">경도: {selectedSpot.lng.toFixed(6)}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedSpot.description}</p>
          </div>
        </div>
      )}

      {/* 지도 정보 */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-40">
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <Globe className="w-3 h-3" />
          <span>Google Earth</span>
        </div>
      </div>

      {/* 조작 안내 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-40">
        <div className="text-xs text-gray-600">
          <p>🖱️ 드래그: 회전</p>
          <p>🔍 휠: 확대/축소</p>
        </div>
      </div>
    </div>
  )
} 