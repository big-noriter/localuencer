import { NextRequest, NextResponse } from 'next/server'

// Twitter API v2 설정
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN
const TWITTER_USER_ID = process.env.TWITTER_USER_ID

interface TwitterTweet {
  id: string
  text: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  author_id: string
  attachments?: {
    media_keys: string[]
  }
  referenced_tweets?: Array<{
    type: 'retweeted' | 'quoted' | 'replied_to'
    id: string
  }>
}

interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url: string
  verified: boolean
}

interface TwitterResponse {
  data: TwitterTweet[]
  includes?: {
    users: TwitterUser[]
    media?: Array<{
      media_key: string
      type: string
      url?: string
      preview_image_url?: string
    }>
  }
  meta: {
    result_count: number
    next_token?: string
  }
}

// Mock 데이터 (개발 환경용)
const mockTwitterData = [
  {
    id: '1',
    text: '여러분~ 저 오늘 경주에서 핑크뮬리 보고 왔어요! 완전 핑크빛 세상...💖 너무 예뻐서 기절할 뻔 했잖아요! #경주 #핑크뮬리 #가을여행',
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2시간 전
    public_metrics: {
      retweet_count: 1200,
      like_count: 15000,
      reply_count: 302,
      quote_count: 85,
    },
    author_id: 'mina_local',
  },
  {
    id: '2',
    text: '갑자기 궁금한 건데, 여러분 최애 경주 음식은 뭐예요? 저는 황남빵에 한 표!😋',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 어제
    public_metrics: {
      retweet_count: 580,
      like_count: 8900,
      reply_count: 1100,
      quote_count: 45,
    },
    author_id: 'mina_local',
  },
  {
    id: '3',
    text: '오늘 저녁 8시에 유튜브 라이브에서 만나요! Q&A 시간 가질 거니까 질문 많이 준비해오기! 약속🤙 #미나라이브',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2일 전
    public_metrics: {
      retweet_count: 2100,
      like_count: 22000,
      reply_count: 890,
      quote_count: 156,
    },
    author_id: 'mina_local',
  },
  {
    id: '4',
    text: '불국사에서 만난 고양이 친구들 🐱 너무 귀여워서 계속 따라다녔어요 ㅎㅎ 고양이들도 경주 관광객을 환영하는 것 같아요!',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3일 전
    public_metrics: {
      retweet_count: 850,
      like_count: 12500,
      reply_count: 456,
      quote_count: 67,
    },
    author_id: 'mina_local',
  },
  {
    id: '5',
    text: '경주 야경 진짜 미쳤다... ✨ 동궁과 월지 반영이 이렇게 아름다울 줄 몰랐어요! 여러분도 꼭 밤에 가보세요~',
    created_at: new Date(Date.now() - 432000000).toISOString(), // 5일 전
    public_metrics: {
      retweet_count: 1650,
      like_count: 18700,
      reply_count: 623,
      quote_count: 98,
    },
    author_id: 'mina_local',
  },
]

const mockUser: TwitterUser = {
  id: 'mina_local',
  name: '로컬루언서 미나',
  username: 'localuencer_mina',
  profile_image_url: '/mina-casual.png',
  verified: true,
}

// 숫자를 읽기 쉬운 형태로 변환
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
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

// 실제 Twitter API 호출 함수
async function fetchTwitterTweets(maxResults: number = 20): Promise<TwitterTweet[]> {
  if (!TWITTER_BEARER_TOKEN || !TWITTER_USER_ID) {
    console.log('Twitter API 토큰이 없어 목업 데이터를 사용합니다.')
    return mockTwitterData.slice(0, maxResults)
  }

  try {
    const response = await fetch(
      `https://api.twitter.com/2/users/${TWITTER_USER_ID}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,author_id,attachments,referenced_tweets&expansions=author_id,attachments.media_keys`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
        next: { revalidate: 300 }, // 5분마다 캐시 갱신
      }
    )

    if (!response.ok) {
      throw new Error(`Twitter API 오류: ${response.status}`)
    }

    const data: TwitterResponse = await response.json()
    return data.data || []

  } catch (error) {
    console.error('Twitter API 호출 실패:', error)
    // API 실패 시 목업 데이터 반환
    return mockTwitterData.slice(0, maxResults)
  }
}

// GET 요청 핸들러
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const includeReplies = searchParams.get('includeReplies') === 'true'
    const includeRetweets = searchParams.get('includeRetweets') === 'true'

    // Twitter 트윗 데이터 가져오기
    let tweets = await fetchTwitterTweets(limit)

    // 필터링 옵션 적용
    if (!includeReplies) {
      tweets = tweets.filter(tweet => !tweet.referenced_tweets?.some(ref => ref.type === 'replied_to'))
    }
    
    if (!includeRetweets) {
      tweets = tweets.filter(tweet => !tweet.referenced_tweets?.some(ref => ref.type === 'retweeted'))
    }

    // 응답 데이터 포맷팅
    const formattedTweets = tweets.map(tweet => ({
      id: tweet.id,
      content: tweet.text,
      createdAt: tweet.created_at,
      timestamp: getRelativeTime(tweet.created_at),
      metrics: {
        retweets: formatNumber(tweet.public_metrics.retweet_count),
        likes: formatNumber(tweet.public_metrics.like_count),
        replies: formatNumber(tweet.public_metrics.reply_count),
        quotes: formatNumber(tweet.public_metrics.quote_count),
      },
      author: mockUser,
      tweetUrl: `https://twitter.com/${mockUser.username}/status/${tweet.id}`,
      isRetweet: tweet.referenced_tweets?.some(ref => ref.type === 'retweeted') || false,
      isReply: tweet.referenced_tweets?.some(ref => ref.type === 'replied_to') || false,
    }))

    return NextResponse.json({
      success: true,
      data: formattedTweets,
      meta: {
        total: formattedTweets.length,
        lastUpdated: new Date().toISOString(),
        user: mockUser,
      }
    })

  } catch (error) {
    console.error('Twitter API 엔드포인트 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Twitter 데이터를 가져오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// POST 요청 핸들러 (미래 확장용 - 트윗, 리트윗 등)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tweetId, content } = body

    // 현재는 목업 응답만 제공
    return NextResponse.json({
      success: true,
      message: `${action} 요청이 처리되었습니다.`,
      tweetId,
      content
    })

  } catch (error) {
    console.error('Twitter POST 요청 오류:', error)
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 