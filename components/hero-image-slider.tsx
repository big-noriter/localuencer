"use client"

import { useState, useEffect, useRef, memo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * 히어로 이미지 타입 정의
 * src: 이미지 경로
 * alt: 이미지 설명
 */
interface HeroImage {
  src: string
  alt: string
}

/**
 * 히어로 이미지 슬라이더 속성 정의
 * images: 표시할 이미지 배열
 */
interface HeroImageSliderProps {
  images: HeroImage[]
}

/**
 * 히어로 이미지 슬라이더 컴포넌트
 * 
 * 메인 페이지 상단에 표시되는 이미지 슬라이더입니다.
 * 자동으로 이미지가 넘어가며, 사용자가 직접 이미지를 넘길 수도 있습니다.
 */
const HeroImageSlider = ({ images }: HeroImageSliderProps) => {
  // 현재 표시 중인 이미지 인덱스
  const [currentIndex, setCurrentIndex] = useState(0)
  // 각 이미지의 로딩 상태 (true: 로딩 중, false: 로딩 완료)
  const [isLoading, setIsLoading] = useState<boolean[]>(Array(images.length).fill(true))
  // 자동 슬라이드를 위한 타이머 참조
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // 전체 이미지 개수
  const totalImages = images.length

  /**
   * 이미지 로딩 완료 처리 함수
   * 
   * 이미지가 로드되면 해당 인덱스의 로딩 상태를 false로 변경합니다.
   */
  const handleImageLoad = (index: number) => {
    setIsLoading(prev => {
      const newState = [...prev]
      newState[index] = false
      return newState
    })
  }

  /**
   * 자동 슬라이드 설정
   * 
   * 컴포넌트가 마운트되거나 현재 인덱스가 변경될 때 자동 슬라이드를 시작합니다.
   */
  useEffect(() => {
    startAutoSlide()
    return () => stopAutoSlide() // 컴포넌트 언마운트 시 타이머 정리
  }, [currentIndex])

  /**
   * 자동 슬라이드 시작 함수
   * 
   * 5초마다 다음 이미지로 자동 전환합니다.
   */
  const startAutoSlide = () => {
    stopAutoSlide() // 기존 타이머가 있다면 정리
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages)
    }, 5000) // 5초마다 자동 슬라이드
  }

  /**
   * 자동 슬라이드 정지 함수
   * 
   * 타이머를 정리하여 자동 슬라이드를 중지합니다.
   */
  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  /**
   * 이전 슬라이드로 이동하는 함수
   */
  const goToPrevSlide = () => {
    stopAutoSlide()
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages)
  }

  /**
   * 다음 슬라이드로 이동하는 함수
   */
  const goToNextSlide = () => {
    stopAutoSlide()
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages)
  }

  /**
   * 특정 슬라이드로 이동하는 함수
   */
  const goToSlide = (index: number) => {
    stopAutoSlide()
    setCurrentIndex(index)
  }

  /**
   * 이미지 프리로딩을 위한 최적화
   * 
   * 현재 이미지와 다음 이미지만 미리 로드하여 메모리 사용을 최적화합니다.
   */
  useEffect(() => {
    // 현재 이미지와 다음 이미지만 프리로드
    const nextIndex = (currentIndex + 1) % totalImages
    const imagesToPreload = [currentIndex, nextIndex]
    
    // 브라우저 이미지 객체를 사용하여 프리로드
    imagesToPreload.forEach(index => {
      const imgEl = new Image()
      imgEl.src = images[index].src
    })
  }, [currentIndex, images, totalImages])

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
      {/* 이미지 슬라이더 영역 */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* 이미지 로딩 중일 때 표시할 로딩 스피너 */}
            {isLoading[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            )}
            {/* 이미지 컴포넌트 */}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg"
              priority={index === 0} // 첫 번째 이미지만 우선 로딩
              loading={index === 0 ? "eager" : "lazy"} // 첫 번째 이미지는 즉시 로딩, 나머지는 지연 로딩
              onLoad={() => handleImageLoad(index)}
              quality={80} // 이미지 품질 설정 (최적화)
            />
            {/* 이미지 위에 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      {/* 이전/다음 버튼 (네비게이션) */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="이전 이미지"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="다음 이미지"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 하단 인디케이터 (현재 몇 번째 이미지인지 표시) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {Array.from({ length: totalImages }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-4' // 현재 선택된 이미지는 더 넓게 표시
                : 'bg-white/50 hover:bg-white/80' // 선택되지 않은 이미지는 반투명하게 표시
            }`}
            aria-label={`${index + 1}번 이미지로 이동`}
          />
        ))}
      </div>
    </div>
  )
}

// 메모이제이션을 통한 불필요한 리렌더링 방지
export default memo(HeroImageSlider)
