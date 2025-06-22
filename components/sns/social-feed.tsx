"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  ExternalLink, 
  RefreshCw,
  Instagram,
  Youtube,
  Twitter,
  Filter,
  TrendingUp,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 소셜 미디어 포스트 타입 정의
interface SocialMediaPost {
  id: string
  platform: 'instagram' | 'youtube' | 'twitter' | 'blog' | 'news'
  type: 'image' | 'video' | 'text' | 'carousel' | 'article'
  title?: string
  content: string
  mediaUrl?: string
  thumbnailUrl?: string
  publishedAt: string
  metrics: {
    likes?: string
    comments?: string
    views?: string
    shares?: string
  }
  author: {
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  url: string
  hashtags: string[]
  engagement: number
}

interface SocialFeedProps {
  initialPosts?: SocialMediaPost[]
  autoRefresh?: boolean
  maxPosts?: number
}

// 플랫폼별 아이콘 및 색상
const platformConfig = {
  instagram: {
    icon: Instagram,
    color: 'text-purple-600',
    name: 'Instagram'
  },
  youtube: {
    icon: Youtube,
    color: 'text-red-600',
    name: 'YouTube'
  },
  twitter: {
    icon: Twitter,
    color: 'text-blue-600',
    name: 'X (Twitter)'
  },
  blog: {
    icon: ExternalLink,
    color: 'text-green-600',
    name: 'Blog'
  },
  news: {
    icon: ExternalLink,
    color: 'text-gray-600',
    name: 'News'
  }
}

// 상대 시간 계산
function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds}초 전`
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}분 전`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}시간 전`
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}일 전`
  } else {
    return date.toLocaleDateString('ko-KR')
  }
}

// 개별 포스트 컴포넌트
function SocialPostCard({ post }: { post: SocialMediaPost }) {
  const config = platformConfig[post.platform]
  const Icon = config.icon

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{post.author.name}</span>
                {post.author.verified && (
                  <Badge variant="secondary" className="h-4 px-1 text-xs">✓</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>@{post.author.username}</span>
                <span>•</span>
                <span>{getRelativeTime(post.publishedAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              <Icon className="w-3 h-3 mr-1" />
              {config.name}
            </Badge>
            <Link href={post.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 제목 (YouTube 등) */}
        {post.title && (
          <h3 className="font-semibold text-base line-clamp-2">{post.title}</h3>
        )}

        {/* 미디어 콘텐츠 */}
        {post.mediaUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={post.thumbnailUrl || post.mediaUrl}
              alt={post.title || post.content}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {post.type === 'video' && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-3">
                  <Youtube className="w-6 h-6 text-red-600" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 텍스트 콘텐츠 */}
        <div className="space-y-2">
          <p className="text-sm leading-relaxed line-clamp-3">{post.content}</p>
          
          {/* 해시태그 */}
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {post.hashtags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.hashtags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 상호작용 메트릭 */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {post.metrics.likes && (
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.metrics.likes}</span>
              </div>
            )}
            {post.metrics.comments && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.metrics.comments}</span>
              </div>
            )}
            {post.metrics.views && (
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{post.metrics.views}</span>
              </div>
            )}
            {post.metrics.shares && (
              <div className="flex items-center space-x-1">
                <Share2 className="w-4 h-4" />
                <span>{post.metrics.shares}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>{post.engagement.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 메인 소셜 피드 컴포넌트
export function SocialFeed({ 
  initialPosts = [], 
  autoRefresh = true, 
  maxPosts = 20
}: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialMediaPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'youtube', 'twitter'])
  const [sortBy, setSortBy] = useState<'engagement' | 'date'>('engagement')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // 피드 데이터 가져오기
  const fetchFeed = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    
    try {
      const params = new URLSearchParams({
        limit: maxPosts.toString(),
        platforms: selectedPlatforms.join(','),
        sortBy
      })

      const response = await fetch(`/api/sns/feed?${params}`)
      const data = await response.json()

      if (data.success) {
        setPosts(data.data)
        setLastUpdated(new Date())
      } else {
        console.error('피드 가져오기 실패:', data.error)
      }
    } catch (error) {
      console.error('피드 가져오기 오류:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // 초기 로드 및 필터/정렬 변경 시 리로드
  useEffect(() => {
    fetchFeed()
  }, [selectedPlatforms, sortBy, maxPosts])

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchFeed(false) // 로딩 표시 없이 백그라운드 업데이트
    }, 300000) // 5분마다

    return () => clearInterval(interval)
  }, [autoRefresh, selectedPlatforms, sortBy])

  // 플랫폼 필터 토글
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 컨트롤 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">실시간 SNS 피드</h2>
          <p className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFeed()}
          disabled={loading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          새로고침
        </Button>
      </div>

      {/* 필터 및 정렬 옵션 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">플랫폼</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(platformConfig).map(([platform, config]) => {
              const Icon = config.icon
              const isSelected = selectedPlatforms.includes(platform)
              
              return (
                <Button
                  key={platform}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePlatform(platform)}
                  className="text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {config.name}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">정렬</label>
          <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as 'engagement' | 'date')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="engagement" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                인기순
              </TabsTrigger>
              <TabsTrigger value="date" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                최신순
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 피드 콘텐츠 */}
      {loading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="aspect-video bg-muted rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <SocialPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">표시할 콘텐츠가 없습니다</p>
            <p className="text-sm">다른 플랫폼을 선택하거나 필터를 조정해보세요.</p>
          </div>
        </div>
      )}
    </div>
  )
} 