import { NextRequest, NextResponse } from 'next/server'

/**
 * 사진엽서 AI 이미지 합성 API
 * Fal.ai의 이미지 합성 모델을 활용하여 사용자 사진과 경주 관광지 배경을 합성
 * 
 * @param request - 사용자 이미지와 배경 이미지 정보를 포함한 POST 요청
 * @returns 합성된 이미지 URL 또는 에러 메시지
 */
export async function POST(request: NextRequest) {
  try {
    const { userImage, backgroundSpot, style = 'postcard' } = await request.json()

    if (!userImage) {
      return NextResponse.json(
        { error: '사용자 이미지가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!backgroundSpot) {
      return NextResponse.json(
        { error: '배경 관광지를 선택해주세요.' },
        { status: 400 }
      )
    }

    // Fal.ai API 키 확인
    const FAL_API_KEY = process.env.FAL_API_KEY
    if (!FAL_API_KEY) {
      return NextResponse.json(
        { error: 'AI 서비스 설정이 필요합니다.' },
        { status: 500 }
      )
    }

    // 경주 관광지 배경 이미지 매핑
    const backgroundImages = {
      'gyeongju-bulguksa': 'https://example.com/bulguksa-bg.jpg',
      'gyeongju-seokguram': 'https://example.com/seokguram-bg.jpg',
      'gyeongju-anapji': 'https://example.com/anapji-bg.jpg',
      'gyeongju-cheomseongdae': 'https://example.com/cheomseongdae-bg.jpg',
    }

    const backgroundImageUrl = backgroundImages[backgroundSpot as keyof typeof backgroundImages]
    
    if (!backgroundImageUrl) {
      return NextResponse.json(
        { error: '지원하지 않는 관광지입니다.' },
        { status: 400 }
      )
    }

    // Fal.ai 이미지 합성 요청
    const falResponse = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: style === 'fourcut' 
          ? `Create a 4-cut photo booth style image with a person in traditional Korean hanbok at ${backgroundSpot.replace('-', ' ')}, beautiful lighting, professional photography, cheerful atmosphere`
          : `Create a beautiful postcard-style image with a person at ${backgroundSpot.replace('-', ' ')}, scenic view, professional photography, tourism poster style`,
        image_url: userImage,
        strength: 0.7,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        image_size: style === 'fourcut' ? '400x600' : '600x400',
      }),
    })

    if (!falResponse.ok) {
      const errorData = await falResponse.json()
      console.error('Fal.ai API 오류:', errorData)
      return NextResponse.json(
        { error: 'AI 이미지 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    const result = await falResponse.json()
    
    // 생성된 이미지 URL 반환
    return NextResponse.json({
      success: true,
      imageUrl: result.images[0].url,
      style: style,
      backgroundSpot: backgroundSpot,
    })

  } catch (error) {
    console.error('사진엽서 생성 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * 사진엽서 생성 상태 확인 API
 * 비동기 이미지 생성 작업의 진행 상태를 확인
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: '작업 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // Fal.ai 작업 상태 확인
    const FAL_API_KEY = process.env.FAL_API_KEY
    const statusResponse = await fetch(`https://fal.run/fal-ai/flux/dev/${jobId}`, {
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
      },
    })

    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: '작업 상태 확인에 실패했습니다.' },
        { status: 500 }
      )
    }

    const status = await statusResponse.json()
    
    return NextResponse.json({
      status: status.status,
      progress: status.progress || 0,
      imageUrl: status.images?.[0]?.url || null,
    })

  } catch (error) {
    console.error('상태 확인 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 