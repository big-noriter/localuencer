/**
 * PWA 및 오프라인 기능 관리 페이지
 * 관리자가 PWA 설치 현황, 오프라인 캐시, 성능 지표를 모니터링할 수 있는 페이지
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Smartphone, 
  HardDrive, 
  Users, 
  Activity, 
  RefreshCw, 
  Trash2, 
  Download,
  Wifi,
  WifiOff,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react'
import { useOffline } from '@/hooks/use-offline'
import { usePWA } from '@/components/pwa/pwa-provider'
import { toast } from 'sonner'

interface PWAStats {
  totalInstalls: number
  activeUsers: number
  offlineUsers: number
  cacheHitRate: number
  averageLoadTime: number
  storageUsage: number
  pendingActions: number
}

export default function PWAManagementPage() {
  const [stats, setStats] = useState<PWAStats>({
    totalInstalls: 1247,
    activeUsers: 89,
    offlineUsers: 12,
    cacheHitRate: 87.5,
    averageLoadTime: 1.2,
    storageUsage: 2.4,
    pendingActions: 5
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const { 
    isOnline, 
    storageSize, 
    pendingActionsCount, 
    lastSync,
    syncData,
    clearCache 
  } = useOffline()
  
  const { isInstalled, isOfflineReady } = usePWA()

  /**
   * 통계 데이터 새로고침
   */
  const refreshStats = () => {
    setIsLoading(true)
    
    // 실제 환경에서는 API 호출
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        offlineUsers: Math.max(0, prev.offlineUsers + Math.floor(Math.random() * 6) - 3),
        cacheHitRate: Math.min(100, prev.cacheHitRate + Math.random() * 2 - 1),
        averageLoadTime: Math.max(0.5, prev.averageLoadTime + Math.random() * 0.4 - 0.2)
      }))
      setIsLoading(false)
      toast.success('통계가 업데이트되었습니다.')
    }, 1000)
  }

  /**
   * 저장소 크기를 MB 단위로 변환
   */
  const formatStorageSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2)
  }

  /**
   * 마지막 동기화 시간 포맷
   */
  const getLastSyncText = (): string => {
    if (!lastSync) return '동기화된 적 없음'
    return lastSync.toLocaleString('ko-KR')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PWA 관리</h1>
          <p className="text-muted-foreground">
            Progressive Web App 설치 현황 및 오프라인 기능을 관리합니다.
          </p>
        </div>
        <Button onClick={refreshStats} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 상태 알림 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Alert className={isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <AlertDescription>
            <span className="font-medium">
              {isOnline ? '온라인' : '오프라인'} 상태
            </span>
            <br />
            {isOnline 
              ? '모든 기능이 정상적으로 작동합니다.'
              : '일부 기능이 제한될 수 있습니다.'
            }
          </AlertDescription>
        </Alert>

        <Alert className={isOfflineReady ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}>
          <HardDrive className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">
              오프라인 캐시 {isOfflineReady ? '준비 완료' : '초기화 중...'}
            </span>
            <br />
            {isOfflineReady 
              ? '사용자가 오프라인에서도 기본 기능을 사용할 수 있습니다.'
              : '오프라인 데이터를 준비하고 있습니다.'
            }
          </AlertDescription>
        </Alert>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 설치 수</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              지난 달 대비 +12.5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              현재 온라인 사용자
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오프라인 사용자</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offlineUsers}</div>
            <p className="text-xs text-muted-foreground">
              오프라인 모드 활용 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">캐시 적중률</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cacheHitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              평균 로딩 시간: {stats.averageLoadTime}초
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 상세 정보 탭 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="storage">저장소</TabsTrigger>
          <TabsTrigger value="performance">성능</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>PWA 설치 현황</CardTitle>
                <CardDescription>
                  사용자의 PWA 설치 및 사용 패턴
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Android</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>iOS</span>
                    <span>28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Desktop</span>
                    <span>5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>기능 사용률</CardTitle>
                <CardDescription>
                  오프라인 기능별 사용 빈도
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">브이로그 오프라인 보기</span>
                  <Badge variant="secondary">89%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">장바구니 오프라인 관리</span>
                  <Badge variant="secondary">76%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Q&A 오프라인 작성</span>
                  <Badge variant="secondary">43%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">설정 동기화</span>
                  <Badge variant="secondary">91%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 저장소 탭 */}
        <TabsContent value="storage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>로컬 저장소 현황</CardTitle>
                <CardDescription>
                  현재 시스템의 오프라인 데이터 저장 상태
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>사용 중인 저장소</span>
                    <span>{formatStorageSize(storageSize)} MB</span>
                  </div>
                  <Progress value={Math.min((storageSize / (5 * 1024 * 1024)) * 100, 100)} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    최대 5MB까지 사용 가능
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">대기 중인 작업</span>
                    <Badge variant={pendingActionsCount > 0 ? "destructive" : "secondary"}>
                      {pendingActionsCount}개
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">마지막 동기화</span>
                    <span className="text-xs text-muted-foreground">
                      {getLastSyncText()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncData}
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    동기화
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCache}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    캐시 정리
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>데이터 분포</CardTitle>
                <CardDescription>
                  캐시된 데이터 타입별 저장량
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">브이로그 데이터</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">상품 데이터</span>
                    <div className="flex items-center gap-2">
                      <Progress value={30} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">30%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q&A 데이터</span>
                    <div className="flex items-center gap-2">
                      <Progress value={15} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">사용자 데이터</span>
                    <div className="flex items-center gap-2">
                      <Progress value={10} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 성능 탭 */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>성능 지표</CardTitle>
              <CardDescription>
                PWA 및 오프라인 기능의 성능 메트릭
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.cacheHitRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">캐시 적중률</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.averageLoadTime}s
                  </div>
                  <div className="text-sm text-muted-foreground">평균 로딩 시간</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    97.2%
                  </div>
                  <div className="text-sm text-muted-foreground">오프라인 가용성</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 설정 탭 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PWA 설정</CardTitle>
              <CardDescription>
                Progressive Web App 및 오프라인 기능 설정
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">자동 캐시 업데이트</div>
                    <div className="text-sm text-muted-foreground">
                      새로운 콘텐츠를 자동으로 캐시합니다
                    </div>
                  </div>
                  <Badge variant="secondary">활성화</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">오프라인 알림</div>
                    <div className="text-sm text-muted-foreground">
                      오프라인 상태 변경 시 사용자에게 알림
                    </div>
                  </div>
                  <Badge variant="secondary">활성화</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">백그라운드 동기화</div>
                    <div className="text-sm text-muted-foreground">
                      백그라운드에서 데이터 동기화 수행
                    </div>
                  </div>
                  <Badge variant="secondary">활성화</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
