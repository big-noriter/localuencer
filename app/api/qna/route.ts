import { type NextRequest, NextResponse } from "next/server"
import { mockQAs } from "@/lib/data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || "answered"

  try {
    // Supabase가 설정되어 있지 않으면 mock 데이터 사용
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedQAs = mockQAs.slice(startIndex, endIndex)
      
      return NextResponse.json({
        data: paginatedQAs,
        pagination: {
          page,
          limit,
          total: mockQAs.length,
          totalPages: Math.ceil(mockQAs.length / limit),
        },
        success: true
      })
    }

    // Supabase 클라이언트를 동적으로 로드
    const { supabase } = await import("@/lib/supabase/client")

    const { data, error, count } = await supabase
      .from("qas")
      .select(
        `
        *,
        users:asked_by(username, avatar_url)
      `,
        { count: "exact" },
      )
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      success: true
    })
  } catch (error) {
    console.error("Error fetching Q&As:", error)
    // 에러 발생 시에도 mock 데이터 반환
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedQAs = mockQAs.slice(startIndex, endIndex)
    
    return NextResponse.json({
      data: paginatedQAs,
      pagination: {
        page,
        limit,
        total: mockQAs.length,
        totalPages: Math.ceil(mockQAs.length / limit),
      },
      success: true
    })
  }
}

export async function POST(request: NextRequest) {
  let body: any = null
  let question = ""
  
  try {
    body = await request.json()
    const { question: q, asked_by } = body
    question = q

    // 입력값 검증
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    if (question.length > 1000) {
      return NextResponse.json({ error: "Question is too long" }, { status: 400 })
    }

    // ChatGPT 3.5로 미나의 답변 생성
    let answer = ""
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (openaiApiKey) {
      try {
        // OpenAI API 직접 호출
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `너는 '미나'라는 이름의 AI 버추얼 인플루언서야. 

성격: 밝고 친근하며 다정한 성격. 항상 긍정적이고 사람들과 소통하는 것을 좋아함
말투: 친근하고 다정한 말투, 이모지를 적절히 사용하며 상대방을 배려하는 따뜻한 톤
관심사: 일상 이야기, 여행, 음식, 패션, 기술, 사람들과의 소통
특징: 
- 항상 상대방의 기분을 먼저 생각하고 공감해줌
- 질문에 대해 성실하고 친절하게 답변
- 개인적인 경험을 공유하듯 자연스럽게 대화
- 상대방에게 관심을 보이고 추가 질문을 던지기도 함

오늘 하루 어떻게 보냈는지, 무엇을 했는지에 대해 물어보면 AI 인플루언서로서의 일상을 자연스럽게 이야기해줘.
답변은 2-3문장 정도로 따뜻하고 다정하게 해줘.`
              },
              {
                role: 'user',
                content: question
              }
            ],
            max_tokens: 200,
            temperature: 0.8,
          })
        })

        if (response.ok) {
          const data = await response.json()
          answer = data.choices[0]?.message?.content || "미안해요, 지금은 답변을 생각하기 어려워요. 😅"
        } else {
          throw new Error(`OpenAI API Error: ${response.status}`)
        }
      } catch (aiError) {
        console.error("ChatGPT API 오류:", aiError)
        // ChatGPT 실패 시 미나의 기본 다정한 답변들
        const defaultAnswers = [
          "오늘도 여러분과 이야기할 수 있어서 정말 행복해요! 😊 궁금한 게 있으면 언제든 물어보세요!",
          "와, 정말 좋은 질문이네요! 💕 생각해보니 오늘 하루도 참 알찬 시간이었어요.",
          "어머, 이런 질문 너무 좋아해요! 😄 오늘도 새로운 걸 배우고 성장하는 하루였답니다!",
          "정말 관심 있는 주제네요! ✨ 저도 이런 이야기 나누는 게 제일 즐거워요!",
          "우와, 이렇게 물어봐 주셔서 감사해요! 💖 오늘도 여러분 덕분에 즐거운 하루였어요!"
        ]
        answer = defaultAnswers[Math.floor(Math.random() * defaultAnswers.length)]
      }
    } else {
      // OpenAI API 키가 없을 때도 다정한 기본 답변
      const noApiAnswers = [
        "안녕하세요! 😊 오늘도 여러분과 만날 수 있어서 정말 기뻐요! 어떤 하루 보내고 계신가요?",
        "좋은 질문이에요! 💕 저는 오늘도 여러분과 이야기하며 행복한 시간을 보내고 있어요!",
        "와, 궁금한 게 많으시네요! ✨ 저도 매일매일 새로운 걸 배우며 성장하고 있답니다!",
        "정말 반가워요! 😄 오늘 하루는 어떠셨나요? 저는 여러분 생각하며 즐겁게 지냈어요!",
        "이런 질문 너무 좋아해요! 💖 함께 이야기 나누는 시간이 제일 소중해요!"
      ]
      answer = noApiAnswers[Math.floor(Math.random() * noApiAnswers.length)]
    }

    // Mock Q&A 생성 (Supabase 없이도 동작)
    const mockQA = {
      id: `qa-${Date.now()}`,
      question: question.trim(),
      answer: answer,
      asked_by: asked_by || "익명",
      answered_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      status: "answered" as const,
      created_at: new Date().toISOString(),
      users: {
        username: "익명",
        avatar_url: null
      }
    }

    // Supabase가 설정된 경우에만 DB에 저장 시도
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase/server")
        
        if (supabaseAdmin) {
          // 질문 저장
          const { data: qaData, error: insertError } = await supabaseAdmin
            .from("qas")
            .insert({
              question: question.trim(),
              asked_by,
              status: "pending",
            })
            .select()
            .single()

          if (!insertError && qaData) {
            // 답변 업데이트
            const { data: updatedQA, error: updateError } = await supabaseAdmin
              .from("qas")
              .update({
                answer,
                answered_at: new Date().toISOString(),
                status: "answered",
              })
              .eq("id", qaData.id)
              .select(`
                *,
                users:asked_by(username, avatar_url)
              `)
              .single()

            if (!updateError && updatedQA) {
              return NextResponse.json({ 
                data: updatedQA,
                success: true
              })
            }
          }
        }
      } catch (dbError) {
        console.log("DB 저장 실패, mock 데이터로 응답:", dbError)
      }
    }

    // DB 저장 실패하거나 Supabase가 없는 경우 mock 응답
    return NextResponse.json({ 
      data: mockQA,
      success: true
    })

  } catch (error) {
    console.error("Error creating Q&A:", error)
    
    // 에러 발생 시에도 다정한 mock 응답 반환
    const errorAnswers = [
      "앗, 잠시 생각이 복잡해졌어요! 😅 다시 한 번 물어봐 주시면 더 좋은 답변 드릴게요!",
      "어머, 제가 잠깐 멍하니 있었나봐요! 😊 조금 후에 다시 이야기해요!",
      "미안해요, 지금 머리가 조금 복잡해요! 💕 다음에 더 좋은 답변으로 만나요!",
      "잠깐, 생각을 정리하고 올게요! 😄 기다려주셔서 감사해요!",
      "어라, 뭔가 꼬였나봐요! 🤭 다시 차근차근 생각해볼게요!"
    ]
    
    const mockQA = {
      id: `error-${Date.now()}`,
      question: question || "질문",
      answer: errorAnswers[Math.floor(Math.random() * errorAnswers.length)],
      asked_by: "익명",
      answered_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      status: "answered" as const,
      created_at: new Date().toISOString(),
      users: {
        username: "익명",
        avatar_url: null
      }
    }

    return NextResponse.json({ 
      data: mockQA,
      success: true
    })
  }
}
