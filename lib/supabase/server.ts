import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Supabase URL이(가) 정의되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL 환경 변수를 확인해주세요.")
}

// 서버 사이드용 클라이언트 (서비스 키 사용)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

if (!supabaseServiceRoleKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다. 관리자 기능이 제한될 수 있습니다.")
}
