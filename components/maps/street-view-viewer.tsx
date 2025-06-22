"use client"

import { useEffect, useState } from 'react'
import { MapPin, Loader2, Globe, Camera, Navigation } from 'lucide-react'

interface StreetViewViewerProps {
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

export default function StreetViewViewer({ 
  spots = [], 
  selectedSpot, 
  height = "400px",
  onSpotClick 
}: StreetViewViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 선택된 장소로 이동
  useEffect(() => {
    if (selectedSpot && spots.length > 0) {
      const spotIndex = spots.findIndex(spot => spot.name === selectedSpot.name)
      if (spotIndex !== -1) {
        setSelectedIndex(spotIndex)
      }
    }
  }, [selectedSpot, spots])

  const generateStreetViewUrl = (lat: number, lng: number) => {
    // API 키가 없는 경우 일반 Google Maps 링크 사용
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sko!2skr!4v1609459200000!5m2!1sko!2skr`
  }

  const currentSpot = selectedSpot || (spots.length > 0 ? spots[0] : null)

  if (isLoading) {
    return (
      <div 
        className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden relative border flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-blue-700">Street View 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-full rounded-lg overflow-hidden relative border"
      style={{ height }}
    >
      {currentSpot ? (
        <>
          {/* Google Street View iframe */}
          <iframe
            src={generateStreetViewUrl(currentSpot.lat, currentSpot.lng)}
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
          
          {/* 정보 오버레이 */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
            <h3 className="font-bold text-sm mb-2 text-gray-800 flex items-center gap-1">
              <Camera className="w-4 h-4" />
              Street View
            </h3>
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">
                {currentSpot.name}
              </div>
              <div className="text-xs text-gray-600">
                {currentSpot.lat.toFixed(4)}, {currentSpot.lng.toFixed(4)}
              </div>
            </div>
          </div>

          {/* 장소 선택 버튼들 */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10 max-w-xs">
            <h4 className="text-xs font-semibold mb-2 text-gray-700">관광지 선택</h4>
            <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
              {spots.slice(0, 8).map((spot, index) => (
                <button
                  key={index}
                  className={`text-xs p-1 rounded transition-colors ${
                    selectedIndex === index 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedIndex(index)
                    onSpotClick?.(index)
                  }}
                >
                  {index + 1}. {spot.name.length > 8 ? spot.name.substring(0, 8) + '...' : spot.name}
                </button>
              ))}
            </div>
            {spots.length > 8 && (
              <div className="text-xs text-gray-500 mt-1 text-center">
                +{spots.length - 8}개 더...
              </div>
            )}
          </div>

          {/* 컨트롤 안내 */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10">
            <div className="text-xs text-gray-600">
              🖱️ 드래그: 회전 | 휠: 줌
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="bg-slate-200 rounded-full p-4 mb-4 mx-auto w-fit">
              <Globe className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Street View</h3>
            <p className="text-slate-600 text-sm">관광지를 선택해주세요</p>
          </div>
        </div>
      )}
    </div>
  )
} 