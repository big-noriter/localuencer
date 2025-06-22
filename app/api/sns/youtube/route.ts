import { NextRequest, NextResponse } from 'next/server'

// YouTube Data API v3 설정
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID

interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
    standard?: { url: string; width: number; height: number }
    maxres?: { url: string; width: number; height: number }
  }
  publishedAt: string
  duration: string
  viewCount: string
  likeCount?: string
  commentCount?: string
  channelTitle: string
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string }
    snippet: {
      title: string
      description: string
      thumbnails: YouTubeVideo['thumbnails']
      publishedAt: string
      channelTitle: string
    }
  }>
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  nextPageToken?: string
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string
    contentDetails: {
      duration: string
    }
    statistics: {
      viewCount: string
      likeCount?: string
      commentCount?: string
    }
  }>
}

// Mock 데이터 (개발 환경용)
const mockYouTubeData: YouTubeVideo[] = [
  {
    id: '1',
    title: '경주 황리단길 VLOG | 예쁜 카페, 소품샵 다녀왔어요! 💖',
    description: '안녕하세요 미나예요! 오늘은 경주 황리단길에서 예쁜 카페와 소품샵들을 구경하며 힐링 시간을 가져봤어요. 여러분도 경주 오시면 꼭 들러보세요!',
    thumbnails: {
      default: { url: '/mina-casual.png', width: 120, height: 90 },
      medium: { url: '/mina-casual.png', width: 320, height: 180 },
      high: { url: '/mina-casual.png', width: 480, height: 360 },
      standard: { url: '/mina-casual.png', width: 640, height: 480 },
    },
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3일 전
    duration: 'PT12M34S', // ISO 8601 duration format
    viewCount: '1200000',
    likeCount: '98000',
    commentCount: '4200',
    channelTitle: '로컬루언서 미나',
  },
  {
    id: '2',
    title: '미나의 경주 야경 투어 ✨ | 동궁과 월지, 월정교의 밤',
    description: '경주의 아름다운 야경 명소들을 소개해드려요! 동궁과 월지의 환상적인 반영과 월정교의 로맨틱한 조명이 정말 인상적이었어요.',
    thumbnails: {
      default: { url: '/mina-active.png', width: 120, height: 90 },
      medium: { url: '/mina-active.png', width: 320, height: 180 },
      high: { url: '/mina-active.png', width: 480, height: 360 },
      standard: { url: '/mina-active.png', width: 640, height: 480 },
    },
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 1주 전
    duration: 'PT8M12S',
    viewCount: '876000',
    likeCount: '75000',
    commentCount: '2100',
    channelTitle: '로컬루언서 미나',
  },
  {
    id: '3',
    title: '서울대생 미나의 하루?! | 과잠 입고 캠퍼스 투어하기! 🏫',
    description: '오늘은 특별히 서울대학교에 다녀왔어요! 과잠도 입어보고 캠퍼스 투어도 하면서 대학생 체험을 해봤답니다. 너무 재밌었어요!',
    thumbnails: {
      default: { url: '/mina-closeups.png', width: 120, height: 90 },
      medium: { url: '/mina-closeups.png', width: 320, height: 180 },
      high: { url: '/mina-closeups.png', width: 480, height: 360 },
      standard: { url: '/mina-closeups.png', width: 640, height: 480 },
    },
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 2주 전
    duration: 'PT15M2S',
    viewCount: '2500000',
    likeCount: '150000',
    commentCount: '8900',
    channelTitle: '로컬루언서 미나',
  },
  {
    id: '4',
    title: '경주에서 한복 체험! | 인생샷 100장 건지는 꿀팁 대방출',
    description: '경주 한복 체험과 함께 예쁜 사진 찍는 꿀팁을 알려드려요! 불국사, 석굴암에서 찍은 인생샷들도 공개합니다.',
    thumbnails: {
      default: { url: '/placeholder.svg?height=90&width=120', width: 120, height: 90 },
      medium: { url: '/placeholder.svg?height=180&width=320', width: 320, height: 180 },
      high: { url: '/placeholder.svg?height=360&width=480', width: 480, height: 360 },
    },
    publishedAt: new Date(Date.now() - 86400000 * 21).toISOString(), // 3주 전
    duration: 'PT10M45S',
    viewCount: '950000',
    likeCount: '82000',
    commentCount: '3500',
    channelTitle: '로컬루언서 미나',
  },
  {
    id: '5',
    title: '경주 맛집 투어 🍜 | 현지인만 아는 숨은 맛집 대공개!',
    description: '경주 현지인들이 진짜 가는 맛집들을 소개해드려요! 관광지 맛집 말고 진짜 맛있는 곳들만 골라왔어요.',
    thumbnails: {
      default: { url: '/placeholder.svg?height=90&width=120', width: 120, height: 90 },
      medium: { url: '/placeholder.svg?height=180&width=320', width: 320, height: 180 },
      high: { url: '/placeholder.svg?height=360&width=480', width: 480, height: 360 },
    },
    publishedAt: new Date(Date.now() - 86400000 * 28).toISOString(), // 4주 전
    duration: 'PT13M18S',
    viewCount: '687000',
    likeCount: '54000',
    commentCount: '2800',
    channelTitle: '로컬루언서 미나',
  },
]

// YouTube duration을 읽기 쉬운 형태로 변환
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 조회수를 읽기 쉬운 형태로 변환
function formatViewCount(count: string): string {
  const num = parseInt(count)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return count
}

// 실제 YouTube API 호출 함수
async function fetchYouTubeVideos(maxResults: number = 20): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    console.log('YouTube API 키가 없어 목업 데이터를 사용합니다.')
    return mockYouTubeData.slice(0, maxResults)
  }

  try {
    // 1. 채널의 최신 동영상 목록 가져오기
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}`,
      {
        next: { revalidate: 300 }, // 5분마다 캐시 갱신
      }
    )

    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API 오류: ${searchResponse.status}`)
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json()
    
    if (!searchData.items || searchData.items.length === 0) {
      return mockYouTubeData.slice(0, maxResults)
    }

    // 2. 동영상 상세 정보 가져오기 (재생시간, 조회수, 좋아요 수 등)
    const videoIds = searchData.items.map(item => item.id.videoId).join(',')
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
      {
        next: { revalidate: 300 },
      }
    )

    if (!detailsResponse.ok) {
      throw new Error(`YouTube Videos API 오류: ${detailsResponse.status}`)
    }

    const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json()

    // 3. 데이터 결합
    const videos: YouTubeVideo[] = searchData.items.map((item, index) => {
      const details = detailsData.items.find(detail => detail.id === item.id.videoId)
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt,
        duration: details?.contentDetails.duration || 'PT0S',
        viewCount: details?.statistics.viewCount || '0',
        likeCount: details?.statistics.likeCount,
        commentCount: details?.statistics.commentCount,
        channelTitle: item.snippet.channelTitle,
      }
    })

    return videos

  } catch (error) {
    console.error('YouTube API 호출 실패:', error)
    // API 실패 시 목업 데이터 반환
    return mockYouTubeData.slice(0, maxResults)
  }
}

// GET 요청 핸들러
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const format = searchParams.get('format') || 'detailed' // 'detailed' 또는 'simple'

    // YouTube 동영상 데이터 가져오기
    const videos = await fetchYouTubeVideos(limit)

    // 포맷에 따라 응답 데이터 조정
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: format === 'simple' ? video.description.substring(0, 100) + '...' : video.description,
      thumbnailUrl: video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.default?.url,
      publishedAt: video.publishedAt,
      duration: formatDuration(video.duration),
      views: formatViewCount(video.viewCount),
      likes: video.likeCount ? formatViewCount(video.likeCount) : undefined,
      comments: video.commentCount ? formatViewCount(video.commentCount) : undefined,
      channelTitle: video.channelTitle,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
    }))

    return NextResponse.json({
      success: true,
      data: formattedVideos,
      meta: {
        total: formattedVideos.length,
        lastUpdated: new Date().toISOString(),
        channelTitle: '로컬루언서 미나',
      }
    })

  } catch (error) {
    console.error('YouTube API 엔드포인트 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'YouTube 데이터를 가져오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// POST 요청 핸들러 (미래 확장용 - 댓글, 구독 등)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, videoId } = body

    // 현재는 목업 응답만 제공
    return NextResponse.json({
      success: true,
      message: `${action} 요청이 처리되었습니다.`,
      videoId
    })

  } catch (error) {
    console.error('YouTube POST 요청 오류:', error)
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 