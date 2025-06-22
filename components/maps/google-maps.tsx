"use client"

import { useEffect, useRef, useState } from 'react'
import { MapPin, Route, Loader2 } from 'lucide-react'

/**
 * Google Maps 컴포넌트 Props
 */
interface GoogleMapsProps {
  markers: Array<{
    lat: number
    lng: number
    title: string
    description: string
    index: number
  }>
  route?: Array<{ lat: number; lng: number }>
  center?: { lat: number; lng: number }
  zoom?: number
  showRoute?: boolean
  height?: string
  onMarkerClick?: (index: number) => void
}

/**
 * Google Maps 임베드를 활용한 지도 컴포넌트
 */
export default function GoogleMaps({ 
  markers = [],
  route = [],
  center = { lat: 35.8347, lng: 129.2194 }, // 경주 첨성대 기본 위치
  zoom = 13,
  showRoute = false,
  height = "400px",
  onMarkerClick
}: GoogleMapsProps) {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

  // 구글맵 임베드 URL 생성
  const generateMapUrl = () => {
    if (markers.length === 0) {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${center.lng}!3d${center.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sko!2skr!4v1609459200000!5m2!1sko!2skr`
    }

    // 첫 번째 마커 위치로 지도 중심 설정
    const firstMarker = markers[0]
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${firstMarker.lng}!3d${firstMarker.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sko!2skr!4v1609459200000!5m2!1sko!2skr`
  }

  return (
    <div 
      className="w-full rounded-lg overflow-hidden relative border"
      style={{ height }}
    >
      {/* 구글맵 iframe */}
      <iframe
        src={generateMapUrl()}
        width="100%"
        height="100%"
        style={{ border: 'none', display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      />



      {/* 지도 정보 */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-40">
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>Google Maps</span>
        </div>
      </div>
    </div>
  )
} 