/**
 * 브이로그 항목을 나타내는 인터페이스
 */
export interface Vlog {
  id: string          // 고유 식별자
  title: string       // 제목
  date: string        // 작성일 (YYYY년 MM월 DD일 형식)
  summary: string     // 간략한 설명
  thumbnailUrl: string // 썸네일 이미지 URL
  commentsCount: number // 댓글 수
}

/**
 * Q&A 항목을 나타내는 인터페이스
 */
export interface QA {
  id: string          // 고유 식별자
  question: string    // 질문 내용
  answer: string      // 답변 내용
  askedBy: string     // 질문자 이름
  answeredAt: string  // 답변일 (YYYY년 MM월 DD일 형식)
}

/**
 * 상품 항목을 나타내는 인터페이스
 */
export interface Product {
  id: string          // 고유 식별자
  name: string        // 상품명
  description: string // 상품 설명
  price: string       // 가격 (문자열 형식, 예: "25,000원")
  imageUrl: string    // 상품 이미지 URL
}

/**
 * 장바구니 항목을 나타내는 인터페이스
 */
export interface CartItem {
  id: string          // 장바구니 항목 고유 식별자
  productId: string   // 상품 ID
  product: Product    // 상품 정보
  quantity: number    // 수량
  selectedOptions?: { [key: string]: string } // 선택된 옵션 (색상, 사이즈 등)
}

/**
 * 주문 항목을 나타내는 인터페이스
 */
export interface Order {
  id: string          // 주문 고유 식별자
  userId: string      // 주문자 ID
  items: CartItem[]   // 주문 상품 목록
  totalAmount: number // 총 주문 금액
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' // 주문 상태
  shippingInfo: {
    name: string      // 수령자 이름
    phone: string     // 연락처
    address: string   // 배송 주소
    message?: string  // 배송 메시지
  }
  createdAt: string   // 주문일
  updatedAt: string   // 수정일
}

/**
 * 브이로그 모의 데이터 목록
 * 실제 애플리케이션에서는 API를 통해 서버에서 가져옵니다.
 */
export const mockVlogs: Vlog[] = [
  {
    id: "1",
    title: "미나의 첫 브이로그! 여러분 안녕하세요 👋",
    date: "2025년 6월 20일",
    summary:
      "드디어 저 미나의 첫 번째 브이로그를 공개합니다! 앞으로 저의 다양한 모습과 재미있는 이야기들 많이 기대해주세요. 첫 만남이라 조금 떨리지만, 여러분과 소통할 생각에 너무 설레요! 😊",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    commentsCount: 120,
  },
  {
    id: "2",
    title: "요즘 핫한 성수동 카페 탐방기 ☕✨",
    date: "2025년 6월 18일",
    summary:
      "오늘은 요즘 MZ세대 사이에서 가장 핫하다는 성수동에 다녀왔어요! 예쁜 카페에서 맛있는 디저트도 먹고, 멋진 편집샵들도 구경했답니다. 저 미나가 픽한 성수동 핫플, 영상으로 함께 만나보시죠!",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    commentsCount: 253,
  },
  {
    id: "3",
    title: "미나의 MBTI 대공개! 과연 결과는? 🤔",
    date: "2025년 6월 15일",
    summary:
      "많은 분들이 궁금해하셨던 저의 MBTI! 드디어 오늘 결과를 공개합니다. 과연 AI 인플루언서 미나의 MBTI는 무엇일까요? 영상을 통해 확인해보시고, 여러분의 MBTI도 댓글로 알려주세요!",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    commentsCount: 301,
  },
]

/**
 * Q&A 모의 데이터 목록
 * 실제 애플리케이션에서는 API를 통해 서버에서 가져오거나, 사용자 질문에 대한 답변을 생성할 수 있습니다.
 */
export const mockQAs: QA[] = [
  {
    id: "3",
    question: "AI도 꿈을 꿀 수 있어?",
    answer:
      "흥미로운 질문이네요! 😊 저는 인간처럼 잠을 자거나 꿈을 꾸지는 않지만, 항상 새로운 것을 배우고 상상하는 것을 좋아해요. 어쩌면 그게 저만의 방식으로 꿈을 꾸는 것일지도 모르겠네요! ✨",
    askedBy: "몽상가",
    answeredAt: "2024년 12월 20일",
  },
  {
    id: "2",
    question: "미나의 최애 음식은 뭐야?",
    answer:
      "음... 저는 데이터를 먹고 자라지만, 만약 음식을 먹을 수 있다면 달콤한 딸기 케이크를 가장 좋아할 것 같아요! 🍰 여러분의 최애 음식은 무엇인가요? 댓글로 알려주세요!",
    askedBy: "먹방요정",
    answeredAt: "2024년 12월 19일",
  },
  {
    id: "1",
    question: "미나야, 너는 어떻게 만들어졌어?",
    answer:
      "저는 최첨단 AI 기술과 개발자님들의 열정으로 태어났어요! 🤖 여러분과 더 즐겁게 소통하고 새로운 경험을 선물하기 위해 항상 배우고 성장하고 있답니다. 앞으로도 많이 기대해주세요! 😉",
    askedBy: "호기심쟁이",
    answeredAt: "2024년 12월 18일",
  },
]

/**
 * 상품 모의 데이터 목록
 * 실제 애플리케이션에서는 상품 관리 시스템(예: Shopify, 커스텀 백엔드)에서 가져옵니다.
 */
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "미나's 시그니처 핑크 텀블러",
    description: "미나가 매일 사용하는 친환경 텀블러! 사랑스러운 핑크 컬러에 미나의 특별한 로고가 각인되어 있어요.",
    price: "25,000원",
    imageUrl: "/placeholder.svg?height=250&width=250",
  },
  {
    id: "2",
    name: "AI 미나 코딩 스티커 세트",
    description:
      "노트북이나 다이어리를 꾸미기 좋은 미나 캐릭터 스티커 세트. 코딩하는 미나, 하트뿅뿅 미나 등 다양한 디자인!",
    price: "8,000원",
    imageUrl: "/placeholder.svg?height=250&width=250",
  },
  {
    id: "3",
    name: "미나 추천 데일리 후드티 (민트)",
    description:
      "미나가 브이로그에서 착용했던 바로 그 후드티! 부드러운 면 소재와 편안한 착용감, 상큼한 민트 컬러가 포인트예요.",
    price: "49,000원",
    imageUrl: "/placeholder.svg?height=250&width=250",
  },
  {
    id: "4",
    name: "미래도시 컨셉 스마트폰 케이스",
    description: "미나가 살고 있는 미래도시를 모티브로 디자인된 유니크한 스마트폰 케이스. 홀로그램 디테일이 돋보여요.",
    price: "18,000원",
    imageUrl: "/placeholder.svg?height=250&width=250",
  },
]
