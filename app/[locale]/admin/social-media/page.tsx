"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  Settings, 
  BarChart3,
  Instagram,
  Youtube,
  Twitter,
  TrendingUp,
  Users,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Plus,
  ExternalLink
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

// 플랫폼별 통계 타입
interface PlatformStats {
  platform: string
  icon: any
  color: string
  followers: string
  posts: number
  engagement: string
  growth: string
  lastUpdate: string
  status: 'connected' | 'error' | 'pending'
}

// 콘텐츠 성과 타입
interface ContentPerformance {
  id: string
  platform: string
  type: string
  title: string
  publishedAt: string
  views: number
  likes: number
  comments: number
  shares: number
  engagement: number
}

export default function SocialMediaAdminPage() {
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  // 플랫폼 통계 (목업 데이터)
  const [platformStats] = useState<PlatformStats[]>([
    {
      platform: 'Instagram',
      icon: Instagram,
      color: 'text-purple-600',
      followers: '1.2M',
      posts: 145,
      engagement: '8.5%',
      growth: '+12.5%',
      lastUpdate: '2분 전',
      status: 'connected'
    },
    {
      platform: 'YouTube',
      icon: Youtube,
      color: 'text-red-600',
      followers: '856K',
      posts: 42,
      engagement: '12.3%',
      growth: '+8.2%',
      lastUpdate: '5분 전',
      status: 'connected'
    },
    {
      platform: 'X (Twitter)',
      icon: Twitter,
      color: 'text-blue-600',
      followers: '2.1M',
      posts: 1247,
      engagement: '6.2%',
      growth: '+15.7%',
      lastUpdate: '1분 전',
      status: 'connected'
    }
  ])

  // 최고 성과 콘텐츠 (목업 데이터)
  const [topContent] = useState<ContentPerformance[]>([
    {
      id: '1',
      platform: 'YouTube',
      type: 'video',
      title: '경주 황리단길 VLOG | 예쁜 카페, 소품샵 다녀왔어요! 💖',
      publishedAt: '3일 전',
      views: 1200000,
      likes: 98000,
      comments: 4200,
      shares: 1500,
      engagement: 8.6
    },
    {
      id: '2',
      platform: 'Instagram',
      type: 'image',
      title: '경주 한옥에서 여유로운 오후...☀️',
      publishedAt: '1일 전',
      views: 0,
      likes: 123000,
      comments: 1200,
      shares: 0,
      engagement: 9.2
    },
    {
      id: '3',
      platform: 'Twitter',
      type: 'text',
      title: '여러분~ 저 오늘 경주에서 핑크뮬리 보고 왔어요!',
      publishedAt: '2시간 전',
      views: 0,
      likes: 15000,
      comments: 302,
      shares: 1200,
      engagement: 7.8
    }
  ])

  // 데이터 새로고침
  const refreshData = async () => {
    setLoading(true)
    try {
      // 실제로는 각 플랫폼 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('데이터 새로고침 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 숫자 포맷팅
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // 상태 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">소셜 미디어 관리</h1>
          <p className="text-muted-foreground">
            미나의 SNS 계정들을 통합 관리하고 성과를 분석하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            새 포스트
          </Button>
        </div>
      </div>

      {/* 전체 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 팔로워</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> 지난 달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월간 조회수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.5M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> 지난 달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 참여도</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9.1%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> 지난 달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">트렌딩 점수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.7%</span> 지난 달 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">플랫폼 현황</TabsTrigger>
          <TabsTrigger value="content">콘텐츠 성과</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {platformStats.map((platform, index) => {
              const Icon = platform.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-6 w-6 ${platform.color}`} />
                        <div>
                          <CardTitle className="text-lg">{platform.platform}</CardTitle>
                          <CardDescription>마지막 업데이트: {platform.lastUpdate}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(platform.status)}`} />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">팔로워</div>
                        <div className="text-xl font-semibold">{platform.followers}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">포스트</div>
                        <div className="text-xl font-semibold">{platform.posts}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">참여도</div>
                        <div className="text-xl font-semibold">{platform.engagement}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">성장률</div>
                        <div className="text-xl font-semibold text-green-600">{platform.growth}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>월간 목표</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        분석
                      </Button>
                      <Link href={`/sns/${platform.platform.toLowerCase().replace(' (twitter)', '').replace('x ', 'x')}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최고 성과 콘텐츠</CardTitle>
              <CardDescription>지난 7일간 가장 높은 참여도를 기록한 콘텐츠</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContent.map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {content.platform}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {content.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{content.publishedAt}</span>
                      </div>
                      <h4 className="font-medium line-clamp-1">{content.title}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        {content.views > 0 && (
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {formatNumber(content.views)}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {formatNumber(content.likes)}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {formatNumber(content.comments)}
                        </span>
                        {content.shares > 0 && (
                          <span className="flex items-center">
                            <Share2 className="w-3 h-3 mr-1" />
                            {formatNumber(content.shares)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{content.engagement.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">참여도</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              SNS 계정 연동 및 설정 기능은 개발 중입니다.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* 하단 정보 */}
      <div className="text-center text-sm text-muted-foreground">
        마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
      </div>
    </div>
  )
} 