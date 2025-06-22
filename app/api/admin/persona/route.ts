import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// 관리자 권한 확인 미들웨어
async function checkAdminAuth(request: NextRequest) {
  if (!supabaseAdmin) return null

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return null
  }

  // 사용자 역할 확인
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (userError || userData?.role !== "admin") {
    return null
  }

  return user
}

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 })
  }

  const user = await checkAdminAuth(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("persona_settings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json({ data: data || null })
  } catch (error) {
    console.error("Error fetching persona:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 })
  }

  const user = await checkAdminAuth(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, personality, speech_style, interests, prohibited_words, sample_sentences } = body

    // 입력값 검증
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // 기존 활성 페르소나 비활성화
    await supabaseAdmin.from("persona_settings").update({ is_active: false }).eq("is_active", true)

    // 새 페르소나 생성
    const { data, error } = await supabaseAdmin
      .from("persona_settings")
      .insert({
        name,
        personality,
        speech_style,
        interests,
        prohibited_words,
        sample_sentences,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error saving persona:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
