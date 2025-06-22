import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import HeroImageSlider from "@/components/hero-image-slider" // 슬라이더 컴포넌트 임포트
import { ArrowRight, Heart, MessageSquare, PlayCircle, ShoppingBag, Sparkles, Star, Map, ImageIcon } from "lucide-react"
import { useTranslations } from 'next-intl'
import { SchemaOrg } from "@/components/schema-org"
import { generateWebsiteSchema, generatePersonSchema, generateOrganizationSchema } from "@/lib/schema"

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

export default function HomePage({ params }: { params: { locale: string } }) {
  const t = useTranslations('home')
  
  // 홈페이지용 구조화 데이터 생성
  const homePageSchema = [
    generateWebsiteSchema(),
    generatePersonSchema(),
    generateOrganizationSchema(),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "로컬루언서 미나 | AI 인플루언서와 함께하는 경주 여행",
      "description": "AI 인플루언서 미나와 함께 경주의 숨겨진 매력을 발견하세요. 브이로그, 쇼핑, AI 가이드, 사진엽서 등 다양한 서비스를 제공합니다.",
      "url": `https://localuencer-mina.com/${params.locale}`,
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://localuencer-mina.com/mina-hero.png",
        "width": 1200,
        "height": 630
      },
      "about": {
        "@type": "Thing",
        "name": "경주 여행",
        "description": "경주의 역사, 문화, 관광 명소에 대한 정보"
      },
      "specialty": "경주 여행 가이드",
      "mainEntity": {
        "@type": "Person",
        "name": "미나",
        "description": "경주를 사랑하는 AI 인플루언서"
      }
    }
  ];
  
  return (
    <>
      <SchemaOrg schema={homePageSchema} />
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
                  {t('title')} <br className="hidden md:block" />
                  <span className="text-gradient-professional">미나</span>! ପ(๑•ᴗ•๑)ଓ ♡
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
                  {t('subtitle')} 🗺️✨
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" asChild>
                    <Link href="/vlogs">{t('watchVideos')}</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-secondary text-secondary hover:bg-secondary/10 shadow-lg"
                    asChild
                  >
                    <Link href="/qa">{t('askMina')}</Link>
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
              <HeroImageSlider images={heroImages} />
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
              <img 
                src="/Image_fx.jpg" 
                alt="미나와 함께하는 경주 여행" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">경주 여행 AI 아트</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <img 
                src="/Image_fx (1).jpg" 
                alt="경주 불국사와 미나" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">불국사 탐방</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <img 
                src="/Image_fx (2).jpg" 
                alt="경주 석굴암과 미나" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">석굴암 여행</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <img 
                src="/Image_fx (3).jpg" 
                alt="경주 첨성대와 미나" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">첨성대 관측</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer md:col-span-2">
              <img 
                src="/gyeongju-tourist-map-900.jpg" 
                alt="경주 관광지도" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">경주 관광지도</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <img 
                src="/20180417_233802.jpg" 
                alt="경주 야경" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">경주 야경</span>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <img 
                src="/IMG_2568-1024x682.jpg" 
                alt="경주 대릉원" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">대릉원</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/vlogs">더 많은 경주 여행 콘텐츠 보기 →</Link>
            </Button>
          </div>
        </section>

        {/* 다양한 모습들 Section */}
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">미나의 팔색조 매력 탐구! ✨</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">
            오늘은 어떤 미나를 만나볼까용? 두근두근! (๑˃̵ᴗ˂̵)و
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockVlogsTeaser.map((vlog) => (
              <Card
                key={vlog.id}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  <div className="aspect-[4/3] relative">
                    {" "}
                    {/* Adjusted aspect ratio for better image display */}
                    <img src={vlog.img || "/placeholder.svg"} alt={vlog.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                      {vlog.tag}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">{vlog.title}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 인기 영상 Section */}
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">미나의 인기 폭발 영상! 🚀</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">이거 안 보면 후회할지도 몰라용! 히힛 😉</p>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-lg">
                <div className="aspect-video relative group">
                  <img
                    src={mockPopularVideo.thumbnail || "/placeholder.svg"}
                    alt={mockPopularVideo.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 bg-black/60 text-white px-3 py-1 text-sm">
                    {mockPopularVideo.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircle className="w-16 h-16 text-white/80 hover:text-white transition-colors cursor-pointer" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{mockPopularVideo.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{mockPopularVideo.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>❤️ {mockPopularVideo.likes}</span>
                    <span>💬 {mockPopularVideo.comments}</span>
                    <span>2시간 전</span>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
                  >
                    지금 바로 시청하기! 🎬
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              {mockVideoList.map((video) => (
                <Card
                  key={video.title}
                  className="flex items-center p-3 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={video.img || "/placeholder.svg"}
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {video.views} 조회수 • {video.duration}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feature) => (
              <Card
                key={feature.title}
                className={`shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${feature.color} group`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div
                    className={`p-3 rounded-full mb-4 ${feature.textColor} bg-background transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.textColor}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${feature.textColor}`}>{feature.title}</h3>
                  <p className={`text-sm mb-4 ${feature.textColor}/80`}>{feature.description}</p>
                  <Link
                    href={feature.link}
                    className={`text-sm font-medium ${feature.textColor} hover:underline group-hover:font-bold`}
                  >
                    자세히 보러가기{" "}
                    <ArrowRight className="inline w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 최신 콘텐츠 Section */}
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-foreground">미나의 따끈따끈한 새 소식! 🔥</h2>
          <p className="text-lg text-muted-foreground text-center mb-10">
            놓치면 후회할지도 몰라용~ 얼른 확인해보세용! (づ｡◕‿‿◕｡)づ
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRecentContent.map((content) => (
              <Card
                key={content.id}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 group"
              >
                <CardHeader className="p-0">
                  <div className="aspect-[4/3] relative">
                    {" "}
                    {/* Adjusted aspect ratio */}
                    <img
                      src={content.img || "/placeholder.svg"}
                      alt={content.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {content.category === "NEW" && (
                      <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded-md animate-bounce">
                        NEW!
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{content.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Heart className="w-4 h-4 mr-1 text-red-500" /> {content.likes}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
