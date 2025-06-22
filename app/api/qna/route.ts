import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || "answered"

  try {
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
    })
  } catch (error) {
    console.error("Error fetching Q&As:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "질문 처리를 위한 관리자 설정이 되어있지 않습니다." }, { status: 500 })
    }

    const body = await request.json()
    const { question, asked_by } = body

    // 입력값 검증
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    if (question.length > 1000) {
      return NextResponse.json({ error: "Question is too long" }, { status: 400 })
    }

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

    if (insertError) {
      throw insertError
    }

    // 활성 페르소나 설정 가져오기
    const { data: persona } = await supabaseAdmin.from("persona_settings").select("*").eq("is_active", true).single()

    // AI 답변 생성
    let answer = ""
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (openaiApiKey && persona) {
      try {
        const systemPrompt = `너는 '${persona.name}'라는 이름의 AI 버추얼 인플루언서야.

성격: ${persona.personality}
말투: ${persona.speech_style}
관심사: ${persona.interests?.join(", ")}
금지어: ${persona.prohibited_words?.join(", ")} - 이런 주제는 절대 다루지 마

예시 문장들:
${persona.sample_sentences?.join("\n")}

사용자의 질문에 위 페르소나를 유지하며 한국어로 답변해줘. 답변은 2-3문장 정도로 간결하게 해줘.`

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          system: systemPrompt,
          prompt: question,
        })

        answer = text
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        // AI 생성 실패 시 기본 답변
        answer = "흥미로운 질문이네요! 조금 더 생각해보고 답변드릴게요. 😊"
      }
    } else {
      // API 키나 페르소나가 없을 때 기본 답변
      answer = "좋은 질문이에요! 답변을 준비해서 곧 알려드릴게요. 💕"
    }

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

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ data: updatedQA })
  } catch (error) {
    console.error("Error creating Q&A:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
