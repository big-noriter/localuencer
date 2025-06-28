# Localuencer v2

로컬루언서 미나 - AI 인플루언서 웹사이트 버전 2

## 프로젝트 소개

경주 지역 AI 인플루언서 '미나'를 중심으로 한 종합 관광 플랫폼입니다. 
브이로그, 쇼핑몰, AI 가이드, 사진엽서 생성 등 다양한 기능을 제공합니다.

## 주요 기능

### ✅ 완료된 기능
- **브이로그 시스템**: 미나의 경주 여행 브이로그 콘텐츠
- **쇼핑몰**: 경주 특산품 및 굿즈 판매
- **장바구니/주문 시스템**: 완전한 전자상거래 기능
- **사진엽서 AI 합성**: Fal.ai를 활용한 AI 이미지 생성

### 🚧 개발 예정
- AI 가이드 실시간 채팅 (음성/화상)
- 구글맵/어스 연동 가이드
- 관리자 대시보드
- 사용자 프로필 시스템

## 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase
- **AI Services**: Fal.ai (이미지 합성), OpenAI (콘텐츠 생성)
- **State Management**: React Hooks, Local Storage

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install --legacy-peer-deps
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Fal.ai API 설정 (사진엽서 AI 이미지 합성용)
FAL_API_KEY=your-fal-api-key

# OpenAI API 설정 (AI 가이드 및 콘텐츠 생성용)
OPENAI_API_KEY=your-openai-api-key

# Google Maps API 설정 (지도 및 가상 투어 기능용)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# 기타 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 사진엽서 AI 기능 사용법

1. **Fal.ai API 키 발급**
   - [Fal.ai](https://fal.ai)에서 계정 생성
   - API 키 발급 후 `.env.local`에 `FAL_API_KEY` 설정

2. **이미지 업로드**
   - 최대 5MB, JPG/PNG 형식 지원
   - 얼굴이 선명한 사진 권장

3. **관광지 선택**
   - 불국사, 석굴암, 안압지, 첨성대 중 선택

4. **AI 생성**
   - 사진엽서 또는 4컷 사진 스타일 선택
   - 약 30초~1분 소요

## 프로젝트 구조

```
Localuencer v2/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── admin/             # 관리자 페이지
│   ├── cart/              # 장바구니
│   ├── checkout/          # 주문/결제
│   ├── photo-postcard/    # 사진엽서 AI
│   ├── shop/              # 쇼핑몰
│   └── vlogs/             # 브이로그
├── components/            # 재사용 컴포넌트
├── hooks/                 # 커스텀 훅
├── lib/                   # 유틸리티 및 설정
└── public/                # 정적 파일
```

## 개발 가이드

### 환경 변수 없이 개발하기
API 키가 없어도 개발 환경에서는 목업 데이터로 테스트할 수 있습니다:
- 사진엽서 기능: 목업 이미지 생성
- AI 가이드: 시뮬레이션 응답
- 결제 시스템: 테스트 모드

### 코드 컨벤션
- TypeScript 엄격 모드 사용
- 모든 컴포넌트에 한국어 주석 추가
- shadcn/ui 컴포넌트 우선 사용
- 반응형 디자인 필수

## 문제 해결

### 개발 서버 실행 오류
```bash
# 의존성 재설치
npm install --legacy-peer-deps

# 캐시 삭제
rm -rf .next
rm -rf node_modules
npm install --legacy-peer-deps
```

### 이미지 404 오류
일부 이미지 파일이 누락될 수 있으나 기능에는 영향 없습니다.

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다. 