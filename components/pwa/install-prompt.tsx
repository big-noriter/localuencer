'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Download, X, Smartphone, Monitor, Zap, Wifi } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

/**
 * PWA 설치 프롬프트 컴포넌트
 * 사용자에게 앱 설치를 권유하는 다이얼로그
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // PWA가 이미 설치되었는지 확인
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isAppInstalled) {
      setIsInstalled(true)
      return
    }

    // iOS 감지
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // 설치 프롬프트를 표시할지 결정 (예: 사용자가 사이트를 여러 번 방문했을 때)
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1
      localStorage.setItem('visitCount', visitCount.toString())
      
      if (visitCount >= 3 && !localStorage.getItem('installPromptDismissed')) {
        setShowInstallPrompt(true)
      }
    }

    // 앱 설치 완료 감지
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      localStorage.setItem('appInstalled', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  /**
   * PWA 설치 처리
   */
  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다')
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다')
        localStorage.setItem('installPromptDismissed', 'true')
      }
    } catch (error) {
      console.error('PWA 설치 중 오류 발생:', error)
    }

    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  /**
   * 설치 프롬프트 닫기
   */
  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
  }

  /**
   * iOS Safari 설치 가이드 표시
   */
  const showIOSInstallGuide = () => {
    setShowInstallPrompt(true)
  }

  // 이미 설치된 경우 아무것도 표시하지 않음
  if (isInstalled) {
    return null
  }

  return (
    <>
      {/* iOS용 설치 버튼 */}
      {isIOS && !showInstallPrompt && (
        <Button
          onClick={showIOSInstallGuide}
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          앱 설치
        </Button>
      )}

      {/* 설치 프롬프트 다이얼로그 */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"></div>
              미나 앱 설치하기
            </DialogTitle>
            <DialogDescription>
              미나를 휴대폰에 설치하여 더 빠르고 편리하게 이용하세요!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 장점 카드들 */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <Smartphone className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">앱처럼 사용</p>
                  <p className="text-xs text-muted-foreground">홈 화면에서 바로 실행</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-medium">빠른 로딩</p>
                  <p className="text-xs text-muted-foreground">캐시로 더 빨라요</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  <Wifi className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">오프라인 지원</p>
                  <p className="text-xs text-muted-foreground">인터넷 없이도 일부 기능</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  <Monitor className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium">전체 화면</p>
                  <p className="text-xs text-muted-foreground">브라우저 UI 없이</p>
                </CardContent>
              </Card>
            </div>

            {/* iOS 설치 가이드 */}
            {isIOS && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">iOS Safari에서 설치하기:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. 하단의 공유 버튼 (📤) 탭</li>
                  <li>2. "홈 화면에 추가" 선택</li>
                  <li>3. "추가" 버튼 탭</li>
                </ol>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />
              나중에
            </Button>
            {!isIOS && deferredPrompt && (
              <Button onClick={handleInstall} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                지금 설치
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 
