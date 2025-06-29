/**
 * 이미지 최적화 유틸리티
 * 이미지 압축, 형식 변환, 지연 로딩, 반응형 이미지 처리
 */

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * 이미지 최적화 설정 타입
 */
interface ImageOptimizationConfig {
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  sizes?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

/**
 * 반응형 이미지 크기 설정
 */
interface ResponsiveImageSizes {
  mobile: number
  tablet: number
  desktop: number
  largeDesktop: number
}

/**
 * 이미지 압축 함수
 */
export function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 비율 유지하면서 크기 조정
      const { width, height } = calculateOptimalSize(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      )

      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Canvas context를 가져올 수 없습니다'))
        return
      }

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height)

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('이미지 압축에 실패했습니다'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('이미지 로드에 실패했습니다'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 최적 이미지 크기 계산
 */
export function calculateOptimalSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight

  let width = originalWidth
  let height = originalHeight

  // 최대 너비 초과 시 조정
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }

  // 최대 높이 초과 시 조정
  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  }
}

/**
 * 반응형 이미지 sizes 문자열 생성
 */
export function generateResponsiveSizes(sizes: ResponsiveImageSizes): string {
  return [
    `(max-width: 640px) ${sizes.mobile}px`,
    `(max-width: 1024px) ${sizes.tablet}px`,
    `(max-width: 1280px) ${sizes.desktop}px`,
    `${sizes.largeDesktop}px`
  ].join(', ')
}

/**
 * WebP 지원 여부 확인
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * AVIF 지원 여부 확인
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image()
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2)
    }
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

/**
 * 이미지 지연 로딩 훅
 */
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return {
    imgRef,
    src: isInView ? src : undefined,
    isLoaded,
    isInView,
    onLoad: handleLoad
  }
}

/**
 * 이미지 프리로딩 함수
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * 여러 이미지 프리로딩
 */
export async function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage))
}

/**
 * 블러 데이터 URL 생성
 */
export function generateBlurDataURL(
  width: number = 8,
  height: number = 8,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}

/**
 * 이미지 메타데이터 추출
 */
export function getImageMetadata(file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
  aspectRatio: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
        aspectRatio: img.naturalWidth / img.naturalHeight
      })
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 이미지 형식 변환
 */
export function convertImageFormat(
  file: File,
  targetFormat: 'webp' | 'jpeg' | 'png',
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      if (!ctx) {
        reject(new Error('Canvas context를 가져올 수 없습니다'))
        return
      }

      ctx.drawImage(img, 0, 0)

      const mimeType = `image/${targetFormat}`
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('이미지 변환에 실패했습니다'))
          }
        },
        mimeType,
        quality
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 이미지 리사이징
 */
export function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight?: number,
  maintainAspectRatio: boolean = true
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img
      
      if (maintainAspectRatio) {
        const aspectRatio = width / height
        
        if (targetHeight) {
          // 지정된 크기에 맞추기
          const targetAspectRatio = targetWidth / targetHeight
          
          if (aspectRatio > targetAspectRatio) {
            width = targetWidth
            height = targetWidth / aspectRatio
          } else {
            height = targetHeight
            width = targetHeight * aspectRatio
          }
        } else {
          // 너비만 지정된 경우
          height = targetWidth / aspectRatio
          width = targetWidth
        }
      } else {
        width = targetWidth
        height = targetHeight || targetWidth
      }

      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Canvas context를 가져올 수 없습니다'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('이미지 리사이징에 실패했습니다'))
          }
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 이미지 최적화 파이프라인
 */
export class ImageOptimizer {
  private config: ImageOptimizationConfig

  constructor(config: ImageOptimizationConfig = {}) {
    this.config = {
      quality: 0.8,
      format: 'webp',
      priority: false,
      placeholder: 'blur',
      ...config
    }
  }

  /**
   * 이미지 최적화 실행
   */
  async optimize(file: File): Promise<{
    optimized: Blob
    metadata: any
    savings: number
  }> {
    const originalSize = file.size
    const metadata = await getImageMetadata(file)

    // 1. 리사이징 (필요한 경우)
    let optimized: Blob = file
    if (metadata.width > 1920 || metadata.height > 1080) {
      optimized = await resizeImage(file, 1920, 1080)
    }

    // 2. 형식 변환
    if (this.config.format && this.config.format !== 'jpeg') {
      optimized = await convertImageFormat(
        new File([optimized], file.name),
        this.config.format,
        this.config.quality
      )
    }

    // 3. 압축
    if (this.config.quality && this.config.quality < 1) {
      optimized = await compressImage(
        new File([optimized], file.name),
        this.config.quality
      )
    }

    const optimizedSize = optimized.size
    const savings = ((originalSize - optimizedSize) / originalSize) * 100

    return {
      optimized,
      metadata,
      savings
    }
  }

  /**
   * 배치 최적화
   */
  async optimizeBatch(files: File[]): Promise<{
    results: Array<{
      original: File
      optimized: Blob
      metadata: any
      savings: number
    }>
    totalSavings: number
  }> {
    const results = await Promise.all(
      files.map(async (file) => {
        const result = await this.optimize(file)
        return {
          original: file,
          ...result
        }
      })
    )

    const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0)
    const totalOptimizedSize = results.reduce((sum, result) => sum + result.optimized.size, 0)
    const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100

    return {
      results,
      totalSavings
    }
  }
}

/**
 * 기본 이미지 최적화 인스턴스
 */
export const defaultImageOptimizer = new ImageOptimizer({
  quality: 0.8,
  format: 'webp'
})

/**
 * 이미지 최적화 유틸리티 함수 모음
 * Next.js의 Image 컴포넌트와 함께 사용하기 위한 유틸리티 함수들입니다.
 */

/**
 * 이미지 크기 계산을 위한 인터페이스
 */
interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * 이미지 URL에 최적화 파라미터 추가
 * @param src 원본 이미지 URL
 * @param width 원하는 너비
 * @param quality 이미지 품질 (1-100)
 * @returns 최적화된 이미지 URL
 */
export function optimizeImageUrl(src: string, width?: number, quality: number = 75): string {
  if (!src) return '';
  
  // 이미 최적화된 URL이거나 외부 URL인 경우 그대로 반환
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) {
    return src;
  }
  
  // 이미지 확장자 확인
  const extension = src.split('.').pop()?.toLowerCase();
  
  // 최적화 파라미터 추가
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  params.append('q', quality.toString());
  
  // webp 변환 지원 (확장자가 jpg, jpeg, png인 경우)
  if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
    params.append('fm', 'webp');
  }
  
  return `${src}?${params.toString()}`;
}

/**
 * 반응형 이미지 크기 계산
 * @param originalDimensions 원본 이미지 크기
 * @param containerWidth 컨테이너 너비
 * @returns 계산된 이미지 크기
 */
export function calculateResponsiveImageSize(
  originalDimensions: ImageDimensions,
  containerWidth: number
): ImageDimensions {
  const { width, height } = originalDimensions;
  const aspectRatio = width / height;
  
  const newWidth = Math.min(width, containerWidth);
  const newHeight = Math.round(newWidth / aspectRatio);
  
  return { width: newWidth, height: newHeight };
}

/**
 * 이미지 사이즈 속성 생성
 * @param breakpoints 브레이크포인트별 너비 (vw 단위)
 * @returns sizes 속성 문자열
 */
export function generateImageSizes(breakpoints: Record<string, number>): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}vw`)
    .join(', ');
}

/**
 * 이미지 로딩 우선순위 결정
 * @param index 이미지 인덱스
 * @param isAboveFold 첫 화면에 표시되는지 여부
 * @returns 우선순위 여부
 */
export function shouldPrioritizeImage(index: number, isAboveFold: boolean = false): boolean {
  // 첫 화면에 표시되는 첫 3개 이미지는 우선순위 부여
  return isAboveFold && index < 3;
}

/**
 * 이미지 플레이스홀더 색상 생성
 * @param color 기본 색상 (HEX)
 * @returns 데이터 URL
 */
export function generatePlaceholder(color: string = '#f0f0f0'): string {
  // SVG 기반 단색 플레이스홀더
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${color}"/>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * 이미지 로딩 상태 관리를 위한 클래스명 생성
 * @param isLoaded 로딩 완료 여부
 * @returns 클래스명 문자열
 */
export function getImageLoadingClassNames(isLoaded: boolean): string {
  return isLoaded 
    ? 'opacity-100 transition-opacity duration-500' 
    : 'opacity-0';
}

/**
 * 기본 이미지 속성 생성
 * @param alt 대체 텍스트
 * @param priority 우선순위 여부
 * @returns 이미지 속성 객체
 */
export function getDefaultImageProps(alt: string, priority: boolean = false) {
  return {
    alt,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    style: { 
      color: 'transparent' 
    },
  };
} 