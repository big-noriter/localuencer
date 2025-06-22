import { NextRequest, NextResponse } from 'next/server'

// Instagram Basic Display API 설정
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
  like_count?: number
  comments_count?: number
  thumbnail_url?: string
}

interface InstagramResponse {
  data: InstagramMedia[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

// Mock 데이터 (개발 환경용)
const mockInstagramData = {
  images: [
    {
      id: '1',
      media_type: 'IMAGE' as const,
      media_url: '/mina-casual.png',
      permalink: 'https://instagram.com/p/example1',
      caption: '경주 한옥에서 여유로운 오후...☀️ 햇살이 너무 따뜻해요! #경주여행 #한옥감성 #미나의일상',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // 1일 전
      like_count: 123000,
      comments_count: 1200,
    },
    {
      id: '2',
      media_type: 'IMAGE' as const,
      media_url: '/mina-active.png',
      permalink: 'https://instagram.com/p/example2',
      caption: '황리단길에서 찾은 맛집! 🍝 여러분도 꼭 가보세요! #황리단길맛집 #경주맛집 #먹스타그램',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3일 전
      like_count: 150000,
      comments_count: 2500,
    },
    {
      id: '3',
      media_type: 'IMAGE' as const,
      media_url: '/mina-closeups.png',
      permalink: 'https://instagram.com/p/example3',
      caption: '오늘은 서울대생 미나! 👩‍🎓 과잠 어떤가요? 헤헷 #서울대학교 #과잠 #캠퍼스룩',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), // 7일 전
      like_count: 250000,
      comments_count: 5100,
    },
    {
      id: '4',
      media_type: 'IMAGE' as const,
      media_url: '/placeholder.svg?height=400&width=400',
      permalink: 'https://instagram.com/p/example4',
      caption: '경주 핑크뮬리 보러 왔어요! 🌸 너무 예뻐서 기절할 뻔... #핑크뮬리 #경주 #가을여행',
      timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), // 10일 전
      like_count: 189000,
      comments_count: 3200,
    },
    {
      id: '5',
      media_type: 'IMAGE' as const,
      media_url: '/placeholder.svg?height=400&width=400',
      permalink: 'https://instagram.com/p/example5',
      caption: '불국사에서 만난 고양이 친구들 🐱 너무 귀여워서 계속 따라다녔어요 ㅎㅎ #불국사 #고양이 #경주여행',
      timestamp: new Date(Date.now() - 86400000 * 14).toISOString(), // 14일 전
      like_count: 95000,
      comments_count: 1800,
    },
  ],
  reels: [
    {
      id: '6',
      media_type: 'VIDEO' as const,
      media_url: '/placeholder.svg?height=500&width=300',
      thumbnail_url: '/placeholder.svg?height=500&width=300',
      permalink: 'https://instagram.com/reel/example1',
      caption: '요즘 유행하는 챌린지 저도 해봤어요! 💃 #댄스챌린지 #릴스타그램',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2일 전
      like_count: 210000,
      comments_count: 4500,
    },
    {
      id: '7',
      media_type: 'VIDEO' as const,
      media_url: '/placeholder.svg?height=500&width=300',
      thumbnail_url: '/placeholder.svg?height=500&width=300',
      permalink: 'https://instagram.com/reel/example2',
      caption: '경주 핑크뮬리 속에서...🌸 #핑크뮬리 #경주 #가을여행',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5일 전
      like_count: 190000,
      comments_count: 3800,
    },
    {
      id: '8',
      media_type: 'VIDEO' as const,
      media_url: '/placeholder.svg?height=500&width=300',
      thumbnail_url: '/placeholder.svg?height=500&width=300',
      permalink: 'https://instagram.com/reel/example3',
      caption: '경주 야경 타임랩스 ✨ 동궁과 월지가 이렇게 아름다울 줄이야! #동궁과월지 #경주야경 #타임랩스',
      timestamp: new Date(Date.now() - 86400000 * 8).toISOString(), // 8일 전
      like_count: 167000,
      comments_count: 2900,
    },
  ],
  cardNews: [
    {
      id: '9',
      media_type: 'CAROUSEL_ALBUM' as const,
      media_url: '/placeholder.svg?height=400&width=400',
      permalink: 'https://instagram.com/p/carousel1',
      caption: '미나가 알려주는 경주 여행 꿀팁 5가지! 💡 스와이프해서 확인해보세요~',
      timestamp: new Date(Date.now() - 86400000 * 6).toISOString(), // 6일 전
      like_count: 145000,
      comments_count: 2100,
    },
    {
      id: '10',
      media_type: 'CAROUSEL_ALBUM' as const,
      media_url: '/placeholder.svg?height=400&width=400',
      permalink: 'https://instagram.com/p/carousel2',
      caption: '미나의 가을 패션 스타일링 제안 🍂 올 가을 트렌드를 미리 만나보세요!',
      timestamp: new Date(Date.now() - 86400000 * 12).toISOString(), // 12일 전
      like_count: 112000,
      comments_count: 1650,
    },
  ],
}

// 실제 Instagram API 호출 함수
async function fetchInstagramMedia(): Promise<InstagramMedia[]> {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    console.log('Instagram API 토큰이 없어 목업 데이터를 사용합니다.')
    return [...mockInstagramData.images, ...mockInstagramData.reels, ...mockInstagramData.cardNews]
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count,thumbnail_url&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
      {
        next: { revalidate: 300 }, // 5분마다 캐시 갱신
      }
    )

    if (!response.ok) {
      throw new Error(`Instagram API 오류: ${response.status}`)
    }

    const data: InstagramResponse = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Instagram API 호출 실패:', error)
    // API 실패 시 목업 데이터 반환
    return [...mockInstagramData.images, ...mockInstagramData.reels, ...mockInstagramData.cardNews]
  }
}

// 미디어 타입별 분류 함수
function categorizeMedia(media: InstagramMedia[]) {
  const images = media.filter(item => item.media_type === 'IMAGE')
  const reels = media.filter(item => item.media_type === 'VIDEO')
  const cardNews = media.filter(item => item.media_type === 'CAROUSEL_ALBUM')

  return { images, reels, cardNews }
}

// GET 요청 핸들러
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'images', 'reels', 'cardNews', 또는 'all'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Instagram 미디어 데이터 가져오기
    const allMedia = await fetchInstagramMedia()
    
    // 최신순으로 정렬
    const sortedMedia = allMedia.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // 타입별 분류
    const categorizedMedia = categorizeMedia(sortedMedia)

    let result
    switch (type) {
      case 'images':
        result = categorizedMedia.images.slice(0, limit)
        break
      case 'reels':
        result = categorizedMedia.reels.slice(0, limit)
        break
      case 'cardNews':
        result = categorizedMedia.cardNews.slice(0, limit)
        break
      default:
        result = categorizedMedia
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        total: allMedia.length,
        images: categorizedMedia.images.length,
        reels: categorizedMedia.reels.length,
        cardNews: categorizedMedia.cardNews.length,
        lastUpdated: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Instagram API 엔드포인트 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Instagram 데이터를 가져오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// POST 요청 핸들러 (미래 확장용 - 댓글, 좋아요 등)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, mediaId } = body

    // 현재는 목업 응답만 제공
    return NextResponse.json({
      success: true,
      message: `${action} 요청이 처리되었습니다.`,
      mediaId
    })

  } catch (error) {
    console.error('Instagram POST 요청 오류:', error)
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 