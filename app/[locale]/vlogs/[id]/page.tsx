import { notFound } from 'next/navigation';
import { CalendarDays, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SchemaOrg, { combineSchemas } from '@/components/schema-org';
import { createVideoObjectSchema, createBreadcrumbSchema } from '@/lib/schema';
import { Metadata } from 'next';

interface VlogDetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: VlogDetailPageProps): Promise<Metadata> {
  try {
    const { locale, id } = await params
    const response = await fetch(`http://localhost:3000/api/vlogs/${id}`);
    
    if (!response.ok) {
      return {
        title: '브이로그를 찾을 수 없습니다',
        description: '요청하신 브이로그를 찾을 수 없습니다.'
      };
    }
    
    const vlog = await response.json();
    
    const title = locale === 'ko' 
      ? `${vlog.title} | 로컬루언서 미나 브이로그` 
      : `${vlog.title} | Localuencer Mina Vlog`;
    
    const description = vlog.summary;
    
    return {
      title,
      description,
      openGraph: {
        title: vlog.title,
        description: vlog.summary,
        type: 'video',
        url: `https://localuencer-mina.com/${locale}/vlogs/${id}`,
        images: [
          {
            url: vlog.thumbnailUrl || '/placeholder.svg',
            width: 1200,
            height: 630,
            alt: vlog.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: vlog.title,
        description: vlog.summary,
        images: [vlog.thumbnailUrl || '/placeholder.svg'],
      },
    };
  } catch (error) {
    return {
      title: 'Vlog',
      description: 'Localuencer Mina\'s vlog.'
    };
  }
}

export default async function VlogDetailPage({ params }: VlogDetailPageProps) {
  const { locale, id } = await params
  
  // API에서 브이로그 데이터 가져오기
  const response = await fetch(`http://localhost:3000/api/vlogs/${id}`);
  
  if (response.status === 404) {
    notFound();
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch vlog');
  }
  
  const vlog = await response.json();

  // 기본 URL 설정
  const baseUrl = 'https://localuencer-mina.com';
  const localeUrl = `${baseUrl}/${locale}`;
  
  // 브이로그 URL 생성
  const vlogUrl = `${localeUrl}/vlogs/${id}`;
  
  // 구조화된 데이터 생성
  const videoSchema = createVideoObjectSchema({
    name: vlog.title,
    description: vlog.summary,
    thumbnailUrl: vlog.thumbnailUrl || `${baseUrl}/placeholder.svg`,
    uploadDate: vlog.date,
    contentUrl: vlogUrl,
    embedUrl: vlogUrl,
    duration: 'PT10M', // 예시 시간 (10분)
    author: {
      name: '미나',
      url: localeUrl
    }
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { 
      name: params.locale === 'ko' ? '홈' : 'Home', 
      url: localeUrl 
    },
    { 
      name: params.locale === 'ko' ? '브이로그' : 'Vlogs', 
      url: `${localeUrl}/vlogs` 
    },
    { 
      name: vlog.title, 
      url: vlogUrl 
    },
  ]);

  const schemas = combineSchemas(videoSchema, breadcrumbSchema);

  return (
    <>
      <SchemaOrg schema={schemas} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/${params.locale}/vlogs`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {params.locale === 'ko' ? '목록으로 돌아가기' : 'Back to list'}
          </Link>
        </Button>
        
        <article className="space-y-8">
          <header className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {vlog.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {params.locale === 'ko' 
                  ? `${vlog.commentsCount}개의 댓글` 
                  : `${vlog.commentsCount} comments`}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{vlog.title}</h1>
          </header>
          
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={vlog.thumbnailUrl || "/placeholder.svg"}
              alt={vlog.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg">{vlog.summary}</p>
            
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-2xl font-semibold mb-4">
                {params.locale === 'ko' 
                  ? `댓글 ${vlog.commentsCount}개` 
                  : `${vlog.commentsCount} Comments`}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">👤</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="font-medium">
                        {params.locale === 'ko' ? '방문자' : 'Visitor'}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {params.locale === 'ko' 
                          ? '로그인하여 댓글을 남겨보세요!' 
                          : 'Login to leave a comment!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">
                  {params.locale === 'ko' ? '댓글 작성' : 'Write a comment'}
                </h3>
                <div className="space-y-4">
                  <textarea
                    className="w-full min-h-[100px] p-3 border rounded-md bg-background text-foreground"
                    placeholder={params.locale === 'ko' ? '댓글을 입력하세요...' : 'Enter your comment...'}
                    disabled
                  />
                  <div className="flex justify-end">
                    <Button disabled>
                      {params.locale === 'ko' ? '로그인 후 이용해주세요' : 'Please login to use'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
