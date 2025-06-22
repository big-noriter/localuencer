'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WifiOff, Wifi, RefreshCw, HardDrive, Clock } from 'lucide-react'
import { useOffline } from '@/hooks/use-offline'

/**
 * 향상된 오프라인 상태 표시 컴포넌트
 * 네트워크 연결 상태, 캐시 정보, 동기화 기능을 제공
 */
export function OfflineIndicator() {
  const [showDetails, setShowDetails] = useState(false)
  const {
    isOnline,
    isLoading,
    pendingActionsCount,
    storageSize,
    lastSync,
    syncData,
    clearCache
  } = useOffline()

  /**
   * 저장소 크기를 읽기 쉬운 형태로 변환
   */
  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 마지막 동기화 시간을 상대적 시간으로 표시
   */
  const getLastSyncText = (): string => {
    if (!lastSync) return '동기화된 적 없음'
    
    const now = new Date()
    const diff = now.getTime() - lastSync.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

  // 온라인 상태에서 상세 정보가 표시되지 않는 경우 숨김
  if (isOnline && !showDetails && pendingActionsCount === 0) {
    return null
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      {!isOnline ? (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="space-y-3">
              <div>
                <span className="font-medium block">오프라인 모드</span>
                <span className="text-sm">
                  인터넷 연결이 끊어졌습니다. 캐시된 데이터로 제한된 기능을 사용할 수 있습니다.
                </span>
              </div>

              {/* 오프라인 상태 정보 */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>캐시된 데이터:</span>
                  <span>{formatStorageSize(storageSize)}</span>
                </div>
                {pendingActionsCount > 0 && (
                  <div className="flex justify-between">
                    <span>대기 중인 작업:</span>
                    <span className="font-medium">{pendingActionsCount}개</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>마지막 동기화:</span>
                  <span>{getLastSyncText()}</span>
                </div>
              </div>

              {/* 오프라인 기능 안내 */}
              <div className="text-xs p-2 bg-orange-100 dark:bg-orange-900 rounded border">
                <div className="font-medium mb-1">사용 가능한 기능:</div>
                <ul className="space-y-1 text-orange-700 dark:text-orange-300">
                  <li>• 캐시된 브이로그 및 상품 보기</li>
                  <li>• 장바구니 관리 (로컬 저장)</li>
                  <li>• Q&A 작성 (온라인 복구 시 전송)</li>
                  <li>• 설정 및 프로필 관리</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* 온라인 복구 알림 */}
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <Wifi className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium block">다시 온라인</span>
                  <span className="text-sm">
                    인터넷 연결이 복구되었습니다.
                    {pendingActionsCount > 0 && ` ${pendingActionsCount}개의 대기 중인 작업을 처리합니다.`}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="ml-2"
                >
                  {showDetails ? '간단히' : '상세히'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* 상세 정보 패널 */}
          {showDetails && (
            <Alert className="mt-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <HardDrive className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="space-y-3">
                  <div className="font-medium">오프라인 저장소 정보</div>
                  
                  {/* 저장소 사용량 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>캐시 크기:</span>
                      <span>{formatStorageSize(storageSize)}</span>
                    </div>
                    <Progress 
                      value={Math.min((storageSize / (5 * 1024 * 1024)) * 100, 100)} 
                      className="h-2"
                    />
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      최대 5MB까지 캐시 가능
                    </div>
                  </div>

                  {/* 동기화 정보 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>마지막 동기화: {getLastSyncText()}</span>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncData}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          동기화 중...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          동기화
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCache}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      캐시 정리
                    </Button>
                  </div>

                  {/* 대기 중인 작업 표시 */}
                  {pendingActionsCount > 0 && (
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded border">
                      <div className="text-xs font-medium">
                        {pendingActionsCount}개의 작업이 온라인 복구를 기다리고 있습니다.
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
} 
