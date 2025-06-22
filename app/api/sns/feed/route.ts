import { NextRequest, NextResponse } from 'next/server'

// 각 SNS 플랫폼별 데이터 타입 정의
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
  engagement: number // 참여도 점수 (정렬용)
}

// 통합 피드 응답 타입
interface SocialFeedResponse {
  success: boolean
  data: SocialMediaPost[]
  meta: {
    total: number
    platforms: {
      instagram: number
      youtube: number
      twitter: number
      blog: number
      news: number
    }
    lastUpdated: string
    hasMore: boolean
    nextCursor?: string
  }
}

// 각 플랫폼별 API 호출 함수들
async function fetchInstagramPosts(limit: number = 10): Promise<SocialMediaPost[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXTAUTH_URL || ''
    
    const response = await fetch(`${baseUrl}/api/sns/instagram?limit=${limit}`)
    if (!response.ok) throw new Error('Instagram API 호출 실패')
    
    const data = await response.json()
    
    if (!data.success) return []
    
    // Instagram 데이터를 통합 형태로 변환
    const posts: SocialMediaPost[] = []
    
    if (data.data.images) {
      posts.push(...data.data.images.map((item: any) => ({
        id: `ig_${item.id}`,
        platform: 'instagram' as const,
        type: 'image' as const,
        content: item.caption || '',
        mediaUrl: item.media_url,
        thumbnailUrl: item.media_url,
        publishedAt: item.timestamp,
        metrics: {
          likes: item.like_count?.toString(),
          comments: item.comments_count?.toString(),
        },
        author: {
          name: '로컬루언서 미나',
          username: 'localuencer_mina',
          avatar: '/mina-casual.png',
          verified: true,
        },
        url: item.permalink || '#',
        hashtags: extractHashtags(item.caption || ''),
        engagement: calculateEngagement(item.like_count, item.comments_count),
      })))
    }
    
    if (data.data.reels) {
      posts.push(...data.data.reels.map((item: any) => ({
        id: `ig_reel_${item.id}`,
        platform: 'instagram' as const,
        type: 'video' as const,
        content: item.caption || '',
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url || item.media_url,
        publishedAt: item.timestamp,
        metrics: {
          likes: item.like_count?.toString(),
          comments: item.comments_count?.toString(),
        },
        author: {
          name: '로컬루언서 미나',
          username: 'localuencer_mina',
          avatar: '/mina-casual.png',
          verified: true,
        },
        url: item.permalink || '#',
        hashtags: extractHashtags(item.caption || ''),
        engagement: calculateEngagement(item.like_count, item.comments_count),
      })))
    }
    
    return posts
  } catch (error) {
    console.error('Instagram 데이터 가져오기 실패:', error)
    return []
  }
}

async function fetchYouTubePosts(limit: number = 5): Promise<SocialMediaPost[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXTAUTH_URL || ''
    
    const response = await fetch(`${baseUrl}/api/sns/youtube?limit=${limit}`)
    if (!response.ok) throw new Error('YouTube API 호출 실패')
    
    const data = await response.json()
    
    if (!data.success) return []
    
    return data.data.map((item: any) => ({
      id: `yt_${item.id}`,
      platform: 'youtube' as const,
      type: 'video' as const,
      title: item.title,
      content: item.description,
      mediaUrl: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl,
      publishedAt: item.publishedAt,
      metrics: {
        views: item.views,
        likes: item.likes,
        comments: item.comments,
      },
      author: {
        name: '로컬루언서 미나',
        username: 'localuencer_mina',
        avatar: '/mina-casual.png',
        verified: true,
      },
      url: item.videoUrl,
      hashtags: extractHashtags(item.description),
      engagement: calculateEngagement(
        parseInt(item.likes?.replace(/[KM]/g, '') || '0'), 
        parseInt(item.comments?.replace(/[KM]/g, '') || '0'),
        parseInt(item.views?.replace(/[KM]/g, '') || '0')
      ),
    }))
  } catch (error) {
    console.error('YouTube 데이터 가져오기 실패:', error)
    return []
  }
}

async function fetchTwitterPosts(limit: number = 10): Promise<SocialMediaPost[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXTAUTH_URL || ''
    
    const response = await fetch(`${baseUrl}/api/sns/twitter?limit=${limit}`)
    if (!response.ok) throw new Error('Twitter API 호출 실패')
    
    const data = await response.json()
    
    if (!data.success) return []
    
    return data.data.map((item: any) => ({
      id: `tw_${item.id}`,
      platform: 'twitter' as const,
      type: 'text' as const,
      content: item.content,
      publishedAt: item.createdAt,
      metrics: {
        likes: item.metrics.likes,
        comments: item.metrics.replies,
        shares: item.metrics.retweets,
      },
      author: {
        name: item.author.name,
        username: item.author.username,
        avatar: item.author.profile_image_url,
        verified: item.author.verified,
      },
      url: item.tweetUrl,
      hashtags: extractHashtags(item.content),
      engagement: calculateEngagement(
        parseInt(item.metrics.likes?.replace(/[KM]/g, '') || '0'),
        parseInt(item.metrics.replies?.replace(/[KM]/g, '') || '0'),
        parseInt(item.metrics.retweets?.replace(/[KM]/g, '') || '0')
      ),
    }))
  } catch (error) {
    console.error('Twitter 데이터 가져오기 실패:', error)
    return []
  }
}

// 해시태그 추출 함수
function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#[\w가-힣]+/g) || []
  return hashtags.map(tag => tag.substring(1)) // # 제거
}

// 참여도 점수 계산 함수
function calculateEngagement(likes: number = 0, comments: number = 0, views: number = 0): number {
  // 가중치를 적용한 참여도 점수 계산
  const likeWeight = 1
  const commentWeight = 3 // 댓글이 더 높은 참여도를 나타냄
  const viewWeight = 0.1 // 조회수는 낮은 가중치
  
  return (likes * likeWeight) + (comments * commentWeight) + (views * viewWeight)
}

// 시간대별 가중치 적용 (최신 콘텐츠 우선)
function applyTimeWeight(publishedAt: string, baseScore: number): number {
  const now = new Date()
  const published = new Date(publishedAt)
  const hoursAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60)
  
  // 24시간 이내는 가중치 증가, 그 이후는 점진적 감소
  if (hoursAgo <= 24) {
    return baseScore * 1.5
  } else if (hoursAgo <= 168) { // 1주일
    return baseScore * (1 - (hoursAgo - 24) / 144 * 0.3)
  } else {
    return baseScore * 0.7
  }
}

// Mock 통합 피드 데이터
const mockFeedData: SocialMediaPost[] = [
  {
    id: 'ig_1',
    platform: 'instagram',
    type: 'image',
    content: '경주 한옥에서 여유로운 오후...☀️ 햇살이 너무 따뜻해요! #경주여행 #한옥감성 #미나의일상',
    mediaUrl: '/mina-casual.png',
    thumbnailUrl: '/mina-casual.png',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    metrics: { likes: '123K', comments: '1.2K' },
    author: { name: '로컬루언서 미나', username: 'localuencer_mina', avatar: '/mina-casual.png', verified: true },
    url: 'https://instagram.com/p/example1',
    hashtags: ['경주여행', '한옥감성', '미나의일상'],
    engagement: 124.2,
  },
  {
    id: 'yt_1',
    platform: 'youtube',
    type: 'video',
    title: '경주 황리단길 VLOG | 예쁜 카페, 소품샵 다녀왔어요! 💖',
    content: '안녕하세요 미나예요! 오늘은 경주 황리단길에서 예쁜 카페와 소품샵들을 구경하며 힐링 시간을 가져봤어요.',
    thumbnailUrl: '/mina-casual.png',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    metrics: { views: '1.2M', likes: '98K', comments: '4.2K' },
    author: { name: '로컬루언서 미나', username: 'localuencer_mina', avatar: '/mina-casual.png', verified: true },
    url: 'https://youtube.com/watch?v=example1',
    hashtags: ['경주', '황리단길', 'VLOG'],
    engagement: 250.6,
  },
  {
    id: 'tw_1',
    platform: 'twitter',
    type: 'text',
    content: '여러분~ 저 오늘 경주에서 핑크뮬리 보고 왔어요! 완전 핑크빛 세상...💖 너무 예뻐서 기절할 뻔 했잖아요! #경주 #핑크뮬리 #가을여행',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    metrics: { likes: '15K', comments: '302', shares: '1.2K' },
    author: { name: '로컬루언서 미나', username: 'localuencer_mina', avatar: '/mina-casual.png', verified: true },
    url: 'https://twitter.com/localuencer_mina/status/example1',
    hashtags: ['경주', '핑크뮬리', '가을여행'],
    engagement: 16.2,
  }
]

// GET 요청 핸들러
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const platforms = searchParams.get('platforms')?.split(',') || ['instagram', 'youtube', 'twitter']
    const sortBy = searchParams.get('sortBy') || 'engagement'

    let filteredPosts = mockFeedData.filter(post => platforms.includes(post.platform))

    // 정렬
    switch (sortBy) {
      case 'date':
        filteredPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        break
      case 'engagement':
      default:
        filteredPosts.sort((a, b) => b.engagement - a.engagement)
        break
    }

    const paginatedPosts = filteredPosts.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      meta: {
        total: filteredPosts.length,
        platforms: {
          instagram: filteredPosts.filter(p => p.platform === 'instagram').length,
          youtube: filteredPosts.filter(p => p.platform === 'youtube').length,
          twitter: filteredPosts.filter(p => p.platform === 'twitter').length,
          blog: 0,
          news: 0,
        },
        lastUpdated: new Date().toISOString(),
        hasMore: false,
      }
    })

  } catch (error) {
    console.error('통합 SNS 피드 API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '소셜 미디어 피드를 가져오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// POST 요청 핸들러 (캐시 갱신용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'refresh') {
      // 캐시 갱신 로직 (실제로는 Redis나 다른 캐시 시스템 사용)
      console.log('SNS 피드 캐시 갱신 요청')
      
      return NextResponse.json({
        success: true,
        message: '피드 캐시가 갱신되었습니다.',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { success: false, error: '지원하지 않는 액션입니다.' },
      { status: 400 }
    )

  } catch (error) {
    console.error('SNS 피드 POST 요청 오류:', error)
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 