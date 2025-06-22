// Supabase 클라이언트 라이브러리와 타입 가져오기
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// 환경 변수에서 Supabase 설정값 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수 검증: Supabase URL
if (!supabaseUrl) {
  throw new Error("Supabase URL이(가) 정의되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL 환경 변수를 확인해주세요.")
}

// 환경 변수 검증: Supabase Anon Key
if (!supabaseAnonKey) {
  throw new Error(
    "Supabase Anon Key이(가) 정의되지 않았습니다. NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수를 확인해주세요.",
  )
}

// Supabase 클라이언트 인스턴스 생성 및 내보내기
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 자동 로그인 유지 설정
    persistSession: true,
    // 토큰 자동 갱신 설정
    autoRefreshToken: true,
  },
})
