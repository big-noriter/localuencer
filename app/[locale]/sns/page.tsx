import { SocialFeed } from '@/components/sns/social-feed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Heart,
  Eye
} from 'lucide-react'
import Link from 'next/link'

// SNS 플랫폼 통계 (목업 데이터)
const platformStats = [
  {
    platform: 'Instagram',
    icon: Instagram,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    followers: '1.2M',
    engagement: '8.5%',
    posts: 145,
    href: '/sns/instagram'
  },
  {
    platform: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    followers: '856K',
    engagement: '12.3%',
    posts: 42,
    href: '/sns/youtube'
  },
  {
    platform: 'X (Twitter)',
    icon: Twitter,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    followers: '2.1M',
    engagement: '6.2%',
    posts: 1247,
    href: '/sns/x'
  }
]

// 주요 지표 (목업 데이터)
const keyMetrics = [
  {
    title: '총 팔로워',
    value: '4.2M',
    change: '+12.5%',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: '월간 조회수',
    value: '28.5M',
    change: '+8.2%',
    icon: Eye,
    color: 'text-blue-600'
  },
  {
    title: '평균 참여도',
    value: '9.1%',
    change: '+2.1%',
    icon: Heart,
    color: 'text-pink-600'
  },
  {
    title: '트렌딩 점수',
    value: '94.2',
    change: '+5.7%',
    icon: TrendingUp,
    color: 'text-orange-600'
  }
]

export default function SnsMainPage() {
  return (
    <div className="space-y-8">
      {/* 주요 지표 대시보드 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">SNS 주요 지표</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{metric.change}</span> 지난 달 대비
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 플랫폼별 통계 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">플랫폼별 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformStats.map((platform, index) => {
            const Icon = platform.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                        <Icon className={`h-6 w-6 ${platform.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.platform}</CardTitle>
                        <CardDescription>소셜 미디어 플랫폼</CardDescription>
                      </div>
                    </div>
                    <Link href={platform.href}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{platform.followers}</div>
                      <div className="text-xs text-muted-foreground">팔로워</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{platform.engagement}</div>
                      <div className="text-xs text-muted-foreground">참여도</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{platform.posts}</div>
                      <div className="text-xs text-muted-foreground">포스트</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 통합 소셜 피드 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">통합 소셜 피드</h2>
            <p className="text-sm text-muted-foreground">
              모든 플랫폼의 최신 콘텐츠를 한눈에 확인하세요
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-xs">
              실시간 업데이트
            </Badge>
            <Badge variant="outline" className="text-xs">
              AI 큐레이션
            </Badge>
          </div>
        </div>
        
        <SocialFeed 
          autoRefresh={true}
          maxPosts={20}
        />
      </section>

      {/* 개별 플랫폼 바로가기 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">플랫폼별 상세 보기</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/sns/instagram">
            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Instagram className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Instagram</span>
                <span className="text-xs text-muted-foreground">이미지 & 릴스</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/sns/youtube">
            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Youtube className="h-8 w-8 text-red-600 mb-2" />
                <span className="text-sm font-medium">YouTube</span>
                <span className="text-xs text-muted-foreground">동영상</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/sns/x">
            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Twitter className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">X (Twitter)</span>
                <span className="text-xs text-muted-foreground">트윗</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/sns/blogspot">
            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <ExternalLink className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Blog</span>
                <span className="text-xs text-muted-foreground">블로그 포스트</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/sns/news">
            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <ExternalLink className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">News</span>
                <span className="text-xs text-muted-foreground">뉴스 & 언론</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
} 