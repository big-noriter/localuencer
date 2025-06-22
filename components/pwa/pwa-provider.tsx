'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { InstallPrompt } from './install-prompt'
import { OfflineIndicator } from './offline-indicator'
import { offlineStorage, offlineHelpers } from '@/lib/offline-storage'

interface PWAContextType {
  isInstalled: boolean
  isOnline: boolean
  canInstall: boolean
  isOfflineReady: boolean
  showInstallPrompt: () => void
  initializeOfflineData: () => Promise<void>
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

interface PWAProviderProps {
  children: React.ReactNode
}

/**
 * 향상된 PWA 기능을 제공하는 컨텍스트 프로바이더
 * - 설치 상태 관리
 * - 온라인/오프라인 상태 관리
 * - 설치 프롬프트 제어
 * - 오프라인 데이터 초기화
 */
export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [canInstall, setCanInstall] = useState(false)
  const [isOfflineReady, setIsOfflineReady] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  /**
   * 오프라인 데이터 초기화
   */
  const initializeOfflineData = async () => {
    try {
      // IndexedDB 초기화
      await offlineStorage.init()
      
      // 온라인 상태에서만 초기 데이터 동기화
      if (navigator.onLine) {
        console.log('오프라인 데이터 초기화 시작...')
        
        // 기본 데이터 캐싱 (에러가 발생해도 계속 진행)
        try {
          const vlogsResponse = await fetch('/api/vlogs')
          if (vlogsResponse.ok) {
            const vlogsData = await vlogsResponse.json()
            if (vlogsData.vlogs) {
              await offlineHelpers.cacheVlogs(vlogsData.vlogs)
            }
          }
        } catch (error) {
          console.warn('브이로그 데이터 캐싱 실패:', error)
        }

        try {
          const productsResponse = await fetch('/api/shop')
          if (productsResponse.ok) {
            const productsData = await productsResponse.json()
            if (productsData.products) {
              await offlineHelpers.cacheProducts(productsData.products)
            }
          }
        } catch (error) {
          console.warn('상품 데이터 캐싱 실패:', error)
        }

        try {
          const qasResponse = await fetch('/api/qna')
          if (qasResponse.ok) {
            const qasData = await qasResponse.json()
            if (qasData.qas) {
              await offlineHelpers.cacheQAs(qasData.qas)
            }
          }
        } catch (error) {
          console.warn('Q&A 데이터 캐싱 실패:', error)
        }
        
        console.log('오프라인 데이터 초기화 완료')
      }
      
      setIsOfflineReady(true)
    } catch (error) {
      console.error('오프라인 데이터 초기화 실패:', error)
      setIsOfflineReady(true) // 실패해도 앱은 계속 동작
    }
  }

  useEffect(() => {
    // PWA 설치 상태 확인
    const checkInstallStatus = () => {
      const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        localStorage.getItem('appInstalled') === 'true'
      
      setIsInstalled(isAppInstalled)
    }

    // 온라인 상태 확인
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // 앱 설치 완료 이벤트
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
      localStorage.setItem('appInstalled', 'true')
    }

    // 온라인/오프라인 이벤트
    const handleOnline = () => {
      setIsOnline(true)
      // 온라인 복구 시 대기 중인 액션 처리
      offlineHelpers.processPendingActions().catch(console.error)
    }
    
    const handleOffline = () => setIsOnline(false)

    // 초기 상태 설정
    checkInstallStatus()
    checkOnlineStatus()

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 오프라인 데이터 초기화
    initializeOfflineData()

    // 주기적으로 만료된 캐시 정리 (1시간마다)
    const cleanupInterval = setInterval(() => {
      offlineStorage.clearExpiredData().catch(console.error)
    }, 60 * 60 * 1000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(cleanupInterval)
    }
  }, [])

  /**
   * 설치 프롬프트 표시
   */
  const showInstallPrompt = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다')
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다')
      }
    } catch (error) {
      console.error('PWA 설치 중 오류 발생:', error)
    }

    setDeferredPrompt(null)
    setCanInstall(false)
  }

  const contextValue: PWAContextType = {
    isInstalled,
    isOnline,
    canInstall,
    isOfflineReady,
    showInstallPrompt,
    initializeOfflineData,
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      <InstallPrompt />
      <OfflineIndicator />
    </PWAContext.Provider>
  )
} 