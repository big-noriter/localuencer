"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  MessageSquare,
  Eye,
  Heart,
  Star,
  Package,
  CreditCard,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  Search
} from "lucide-react"
import { toast } from "sonner"

/**
 * 대시보드 통계 데이터 인터페이스
 */
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  monthlyRevenue: number
  totalProducts: number
  lowStockProducts: number
  totalViews: number
  totalLikes: number
  aiChatSessions: number
  photoPostcards: number
}

/**
 * 최근 활동 데이터 인터페이스
 */
interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'content' | 'ai'
  title: string
  description: string
  timestamp: Date
  status: 'success' | 'warning' | 'error' | 'info'
  user?: string
  amount?: number
}

/**
 * 관리자 대시보드 메인 페이지
 * 전체 시스템 현황과 주요 지표를 한눈에 볼 수 있는 종합 대시보드
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1247,
    activeUsers: 89,
    newUsersToday: 12,
    totalOrders: 324,
    pendingOrders: 8,
    completedOrders: 316,
    totalRevenue: 12450000,
    monthlyRevenue: 2340000,
    totalProducts: 45,
    lowStockProducts: 3,
    totalViews: 45678,
    totalLikes: 3421,
    aiChatSessions: 156,
    photoPostcards: 89
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'order',
      title: '새 주문 접수',
      description: '경주 황남빵 세트 주문',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success',
      user: '김민수',
      amount: 25000
    },
    {
      id: '2',
      type: 'ai',
      title: 'AI 사진엽서 생성',
      description: '불국사 배경 사진엽서 생성 완료',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'success',
      user: '박지영'
    },
    {
      id: '3',
      type: 'user',
      title: '신규 회원 가입',
      description: '네이버 소셜 로그인으로 가입',
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      status: 'info',
      user: '이서현'
    },
    {
      id: '4',
      type: 'content',
      title: 'AI 가이드 채팅',
      description: '경주 여행 코스 상담 완료',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'success',
      user: '최준호'
    },
    {
      id: '5',
      type: 'order',
      title: '재고 부족 알림',
      description: '경주 법주 재고 5개 미만',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'warning'
    }
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  /**
   * 데이터 새로고침
   */
  const refreshData = async () => {
    setIsLoading(true)
    try {
      // 실제 환경에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 시뮬레이션된 데이터 업데이트
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        newUsersToday: prev.newUsersToday + Math.floor(Math.random() * 3),
        totalViews: prev.totalViews + Math.floor(Math.random() * 100)
      }))
      
      toast.success("데이터가 새로고침되었습니다.")
    } catch (error) {
      toast.error("데이터 새로고침에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 시간 포맷팅
   */
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return date.toLocaleDateString('ko-KR')
  }

  /**
   * 금액 포맷팅
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  /**
   * 활동 아이콘 반환
   */
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4" />
      case 'user': return <Users className="w-4 h-4" />
      case 'content': return <MessageSquare className="w-4 h-4" />
      case 'ai': return <Star className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  /**
   * 상태별 색상 반환
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  useEffect(() => {
    // 실시간 데이터 업데이트 시뮬레이션
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 6) - 3),
        totalViews: prev.totalViews + Math.floor(Math.random() * 5)
      }))
    }, 30000) // 30초마다 업데이트

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground">로컬루언서 미나 시스템 현황을 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </Button>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            설정
          </Button>
        </div>
      </div>

      {/* 주요 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 사용자 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              활성 사용자: <span className="text-green-600 font-medium">{stats.activeUsers}명</span>
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">오늘 +{stats.newUsersToday}명</span>
            </div>
          </CardContent>
        </Card>

        {/* 주문 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주문 현황</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              대기: <span className="text-orange-600 font-medium">{stats.pendingOrders}건</span>
            </p>
            <div className="flex items-center mt-2">
              <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">완료 {stats.completedOrders}건</span>
            </div>
          </CardContent>
        </Card>

        {/* 매출 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              이번 달: <span className="text-blue-600 font-medium">{formatCurrency(stats.monthlyRevenue)}</span>
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">전월 대비 +12.5%</span>
            </div>
          </CardContent>
        </Card>

        {/* 콘텐츠 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">콘텐츠 활동</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              좋아요: <span className="text-red-600 font-medium">{stats.totalLikes.toLocaleString()}</span>
            </p>
            <div className="flex items-center mt-2">
              <Star className="w-3 h-3 text-purple-600 mr-1" />
              <span className="text-xs text-purple-600">AI 채팅 {stats.aiChatSessions}회</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
          <TabsTrigger value="activities">활동</TabsTrigger>
          <TabsTrigger value="alerts">알림</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 최근 주문 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  최근 주문
                </CardTitle>
                <CardDescription>최근 24시간 내 주문 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'ORD-001', customer: '김민수', product: '경주 황남빵 세트', amount: 25000, status: 'completed' },
                    { id: 'ORD-002', customer: '박지영', product: '경주 법주', amount: 35000, status: 'pending' },
                    { id: 'ORD-003', customer: '이서현', product: '신라 문화재 굿즈', amount: 18000, status: 'completed' },
                    { id: 'ORD-004', customer: '최준호', product: '경주 관광 패키지', amount: 120000, status: 'processing' }
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.product}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(order.amount)}</div>
                        <Badge variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}>
                          {order.status === 'completed' ? '완료' : order.status === 'pending' ? '대기' : '처리중'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  모든 주문 보기
                </Button>
              </CardContent>
            </Card>

            {/* AI 기능 사용 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  AI 기능 사용 현황
                </CardTitle>
                <CardDescription>최근 7일간 AI 서비스 이용 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                      <span>AI 가이드 채팅</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.aiChatSessions}회</div>
                      <div className="text-sm text-muted-foreground">+23%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-purple-600" />
                      <span>사진엽서 생성</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.photoPostcards}개</div>
                      <div className="text-sm text-muted-foreground">+18%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-green-600" />
                      <span>가상 투어</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">67회</div>
                      <div className="text-sm text-muted-foreground">+31%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-red-600" />
                      <span>콘텐츠 좋아요</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.totalLikes}</div>
                      <div className="text-sm text-muted-foreground">+15%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>자주 사용하는 관리 기능들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="w-6 h-6 mb-2" />
                  상품 관리
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  회원 관리
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  매출 분석
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="w-6 h-6 mb-2" />
                  콘텐츠 관리
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                상세 분석 (구현 예정)
              </CardTitle>
              <CardDescription>매출, 사용자, 콘텐츠 성과 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">분석 차트</p>
                  <p className="text-sm text-muted-foreground">Chart.js 또는 Recharts로 구현 예정</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                최근 활동
              </CardTitle>
              <CardDescription>실시간 시스템 활동 로그</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.description}</div>
                      {activity.user && (
                        <div className="text-xs text-muted-foreground">사용자: {activity.user}</div>
                      )}
                      {activity.amount && (
                        <div className="text-xs font-medium text-green-600">
                          {formatCurrency(activity.amount)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  재고 부족 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">{stats.lowStockProducts}개 상품의 재고가 부족합니다.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  재고 관리로 이동
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Bell className="w-5 h-5 mr-2" />
                  시스템 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">서버 상태가 양호하며, 모든 AI 서비스가 정상 작동 중입니다.</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  업데이트 완료
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">AI 가이드 구글맵 연동 기능이 성공적으로 배포되었습니다.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
