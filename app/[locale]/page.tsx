import Link from "next/link"
import Image from "next/image"
import { Suspense, lazy } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowRight, Heart, MessageSquare, PlayCircle, ShoppingBag, Sparkles, Star, Map, ImageIcon } from "lucide-react"

import SchemaOrg, { combineSchemas } from "@/components/schema-org"
import { createWebPageSchema, createBreadcrumbSchema } from "@/lib/schema"

// 지연 로딩으로 HeroImageSlider 컴포넌트 임포트
const HeroImageSlider = lazy(() => import("@/components/hero-image-slider"))

// Mock data - replace with actual data from Supabase later
const mockStats = { followers: "1.2M", rating: "4.9", views: "2.8M" }

const mockVlogsTeaser = [
  { id: "1", title: "경주 일상 브이로그", tag: "경주일상", img: "/mina-casual.png" },
  { id: "2", title: "경주 활동 탐방", tag: "경주탐험", img: "/mina-active.png" },
  { id: "3", title: "경주 카페 투어", tag: "경주카페", img: "/placeholder.svg?height=300&width=400" },
  { id: "4", title: "경주 문화 탐방", tag: "경주문화", img: "/placeholder.svg?height=300&width=400" },
]
const mockPopularVideo = {
  title: "미나의 경주 추천 여행 코스 🌸",
  description: "경주의 아름다운 명소들을 미나와 함께 둘러보세요! 숨겨진 포토 스팟과 맛집까지 모두 공개합니다.",
  likes: "1.2K",
  comments: "89",
  duration: "15:32",
  thumbnail: "/mina-active.png",
}
const mockVideoList = [
  { title: "불국사 브이로그", views: "856K", duration: "8:45", img: "/placeholder.svg?height=100&width=160" },
  { title: "동궁과 월지 야경", views: "1.2M", duration: "12:20", img: "/placeholder.svg?height=100&width=160" },
  { title: "경주 Q&A 시간 💬", views: "945K", duration: "6:38", img: "/placeholder.svg?height=100&width=160" },
]
const featureCards = [
  {
    title: "브이로그",
    description: "미나가 경주 곳곳을 누비며 담아온 생생한 일상과 여행기를 만나보세요.",
    link: "/vlogs",
    icon: PlayCircle,
    color: "bg-theme-pink/10",
    textColor: "text-theme-pink",
  },
  {
    title: "가상여행",
    description: "미나와 함께 시공간을 초월한 경주 여행을 떠나보세요.",
    link: "/virtual-travel",
    icon: Map,
    color: "bg-theme-purple/10",
    textColor: "text-theme-purple",
  },
  {
    title: "AI 가이드",
    description: "경주 여행 계획부터 현지 정보까지, 미나가 맞춤 가이드가 되어드려요.",
    link: "/ai-guide",
    icon: Sparkles,
    color: "bg-theme-blue/10",
    textColor: "text-theme-blue",
  },
  {
    title: "사진엽서",
    description: "미나와 함께 경주에서의 특별한 추억을 AI 사진엽서로 만들어보세요.",
    link: "/photo-postcard",
    icon: ImageIcon,
    color: "bg-theme-green/10",
    textColor: "text-theme-green",
  },
  {
    title: "Q&A",
    description: "경주에 대해 궁금한 것을 미나에게 자유롭게 물어보세요!",
    link: "/qa",
    icon: MessageSquare,
    color: "bg-theme-yellow/10",
    textColor: "text-theme-yellow",
  },
  {
    title: "쇼핑",
    description: "미나가 추천하는 경주 기념품과 특별 상품들을 만나보세요.",
    link: "/shop",
    icon: ShoppingBag,
    color: "bg-theme-orange/10",
    textColor: "text-theme-orange",
  },
]
const mockRecentContent = [
  { id: "1", title: "경주 봄나들이 패션 🌸", category: "NEW", likes: "1.2K", img: "/mina-casual.png" },
  {
    id: "2",
    title: "여행 메이크업 튜토리얼",
    category: "Beauty",
    likes: "856",
    img: "/placeholder.svg?height=300&width=400",
  },
  { id: "3", title: "경주 여행 Q&A", category: "Q&A", likes: "2.1K", img: "/placeholder.svg?height=300&width=400" },
]

const heroImages = [
  { src: "/mina-hero.png", alt: "AI 로컬루언서 미나 히어로 이미지" },
  { src: "/Image_fx.jpg", alt: "미나와 함께하는 경주 여행 - AI 생성 이미지" },
  { src: "/Image_fx (1).jpg", alt: "경주 불국사와 미나 - AI 생성 이미지" },
  { src: "/Image_fx (2).jpg", alt: "경주 석굴암과 미나 - AI 생성 이미지" },
  { src: "/Image_fx (3).jpg", alt: "경주 첨성대와 미나 - AI 생성 이미지" },
  { src: "/gyeongju-tourist-map-900.jpg", alt: "경주 관광지도" },
  { src: "/20180417_233802.jpg", alt: "경주 야경" },
  { src: "/IMG_2568-1024x682.jpg", alt: "경주 대릉원" },
  { src: "/mina-casual.png", alt: "미나 캐주얼룩 이미지" },
  { src: "/mina-active.png", alt: "미나 활동적인 모습 이미지" },
]

// 로딩 플레이스홀더 컴포넌트
function LoadingPlaceholder() {
  return (
    <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  // locale 유효성 검사
  const validLocales = ['ko', 'en', 'ja', 'zh']
  const safeLocale = validLocales.includes(locale) ? locale : 'ko'
  
  // 서버 컴포넌트에서 안전한 메시지 로딩
  let messages: any = {}
  try {
    const messageModule = await import(`@/messages/${safeLocale}.json`)
    messages = messageModule.default || messageModule
  } catch (error) {
    console.error(`Failed to load messages for locale: ${safeLocale}`, error)
    // 기본값으로 한국어 메시지 사용
    try {
      const defaultModule = await import(`@/messages/ko.json`)
      messages = defaultModule.default || defaultModule
    } catch (fallbackError) {
      console.error('Failed to load fallback messages', fallbackError)
      messages = {}
    }
  }
  
  // 서버 컴포넌트에서 직접 메시지 접근
  const getTranslation = (key: string) => {
    const keys = key.split('.')
    let value = messages
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }
  
  // 홈페이지용 구조화 데이터 생성
  const homePageSchema = () => {
    const baseUrl = 'https://localuencer-mina.com';
    const localeUrl = `${baseUrl}/${safeLocale}`;

    const webPageSchema = createWebPageSchema({
      name: safeLocale === 'ko' 
        ? "로컬루언서 미나 | AI 인플루언서와 함께하는 경주 여행"
        : "Localuencer Mina | Gyeongju Travel with AI Influencer",
      description: safeLocale === 'ko'
        ? "AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요. 브이로그, 쇼핑, AI 가이드, 사진엽서 등 다양한 서비스를 제공합니다."
        : "Discover the hidden charms of Gyeongju with AI influencer Mina. We provide various services including vlogs, shopping, AI guide, and photo postcards.",
      url: localeUrl,
      image: `${baseUrl}/mina-hero.png`,
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split('T')[0],
      inLanguage: safeLocale === 'ko' ? 'ko-KR' : safeLocale === 'en' ? 'en-US' : safeLocale === 'ja' ? 'ja-JP' : 'zh-CN'
    });

    return webPageSchema;
  };
  
  return (
    <>
      <SchemaOrg schema={homePageSchema()} />
      <div className="space-y-16 md:space-y-24 pb-16">
        {/* Hero Section */}
        <section className="relative pt-12 pb-8 md:pt-20 md:pb-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20 dark:opacity-10">
            <div className="absolute top-0 left-0 w-3/5 h-3/5 bg-gradient-to-br from-primary/30 via-secondary/30 to-transparent -translate-x-1/4 -translate-y-1/4 rotate-45 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-3/5 h-3/5 bg-gradient-to-tl from-secondary/30 via-primary/30 to-transparent translate-x-1/4 translate-y-1/4 -rotate-45 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-center md:text-left">
                <span className="inline-block bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                  💖 AI 로컬루언서 미나 등장! 💖
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                  {getTranslation('home.title')} <br className="hidden md:block" />
                  <span className="text-gradient-professional">미나</span>! ପ(๑•ᴗ•๑)ଓ ♡
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
                  {getTranslation('home.subtitle')} 🗺️✨
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" asChild>
                    <Link href="/vlogs">{getTranslation('home.watchVideos')}</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-secondary text-secondary hover:bg-secondary/10 shadow-lg"
                    asChild
                  >
                    <Link href="/qa">{getTranslation('home.askMina')}</Link>
                  </Button>
                </div>
                <div className="flex justify-center md:justify-start space-x-6 pt-4">
                  <div className="text-center">
                    <p className="font-bold text-xl text-foreground">{mockStats.followers}</p>
                    <p className="text-xs text-muted-foreground">미나 팬클럽 회원수 뿅뿅! 💕</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-foreground flex items-center justify-center">
                      {mockStats.rating} <Star className="w-4 h-4 text-yellow-400 ml-1" />
                    </p>
                    <p className="text-xs text-muted-foreground">경주 여행 만족도 최고최고! 👍</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-foreground">{mockStats.views}</p>
                    <p className="text-xs text-muted-foreground">미나 콘텐츠 조회수&gt; 대박! 🎉</p>
                  </div>
                </div>
              </div>
              <Suspense fallback={<LoadingPlaceholder />}>
                <HeroImageSlider images={heroImages} />
              </Suspense>
            </div>
          </div>
        </section>

        {/* 경주 여행 갤러리 Section */}
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">미나와 함께한 경주 여행 갤러리 📸</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">
            AI가 그려낸 미나와 경주의 아름다운 순간들을 만나보세요! ✨
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <Image 
                src="/Image_fx.jpg" 
                alt="미나와 함께하는 경주 여행" 
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                width={400}
                height={400}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">경주 여행 AI 아트</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <Image 
                src="/Image_fx (1).jpg" 
                alt="경주 불국사와 미나" 
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                width={400}
                height={400}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">불국사 탐방</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <Image 
                src="/Image_fx (2).jpg" 
                alt="경주 석굴암과 미나"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                width={400}
                height={400}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">석굴암 방문</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <Image 
                src="/Image_fx (3).jpg" 
                alt="경주 첨성대와 미나"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                width={400}
                height={400}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">첨성대 산책</span>
              </div>
            </div>
          </div>
        </section>

        {/* 특징 카드 섹션 */}
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">미나와 함께하는 경주 여행 서비스</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">
            AI 인플루언서 미나가 제공하는 다양한 서비스를 경험해보세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card, index) => (
              <Link href={card.link} key={index}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-none bg-gradient-to-br from-background to-muted">
                  <CardHeader className="pb-2">
                    <div className={`p-2 rounded-full w-12 h-12 flex items-center justify-center ${card.color} mb-2`}>
                      <card.icon className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                    <h3 className="text-xl font-bold">{card.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{card.description}</p>
                    <div className={`flex items-center mt-4 ${card.textColor} font-medium`}>
                      <span>자세히 보기</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 비디오 섹션 */}
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">미나의 인기 콘텐츠</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">
            경주의 매력을 담은 미나의 인기 콘텐츠를 확인해보세요
          </p>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <div className="rounded-lg overflow-hidden relative aspect-video bg-muted">
                <Image
                  src={mockPopularVideo.thumbnail}
                  alt={mockPopularVideo.title}
                  className="w-full h-full object-cover"
                  width={960}
                  height={540}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{mockPopularVideo.title}</h3>
                  <p className="text-white/80 mb-4 text-sm md:text-base line-clamp-2">{mockPopularVideo.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-white/80 flex items-center">
                      <Heart className="h-4 w-4 mr-1" /> {mockPopularVideo.likes}
                    </span>
                    <span className="text-white/80 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" /> {mockPopularVideo.comments}
                    </span>
                    <span className="text-white/80">{mockPopularVideo.duration}</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-primary/90 p-4 cursor-pointer hover:bg-primary transition-colors">
                    <PlayCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {mockVideoList.map((video, index) => (
                <div key={index} className="flex space-x-4 items-center">
                  <div className="relative flex-shrink-0 w-24 h-16 md:w-40 md:h-24 rounded overflow-hidden">
                    <Image
                      src={video.img}
                      alt={video.title}
                      className="object-cover"
                      width={160}
                      height={90}
                      loading="lazy"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium line-clamp-2">{video.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{video.views} 조회</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/vlogs">더 많은 비디오 보기</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 최근 콘텐츠 섹션 */}
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">미나의 최신 콘텐츠</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">
            경주의 다양한 매력을 담은 미나의 최신 콘텐츠를 확인해보세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockRecentContent.map((content) => (
              <div key={content.id} className="rounded-lg overflow-hidden bg-muted group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={content.img}
                    alt={content.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    width={400}
                    height={300}
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-medium px-2 py-1 rounded">
                    {content.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{content.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">2024.06.15</span>
                    <span className="flex items-center text-sm">
                      <Heart className="h-4 w-4 mr-1 text-rose-500" /> {content.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/sns">모든 콘텐츠 보기</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
