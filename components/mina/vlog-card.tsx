'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Eye, MessageCircle, Share2, Download, Wifi, WifiOff } from 'lucide-react'
import { useOffline } from '@/hooks/use-offline'
import { toast } from 'sonner'

/**
 * 브이로그 카드 컴포넌트
 * 오프라인 지원 기능이 포함된 향상된 브이로그 카드
 */

interface VlogCardProps {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  views: number
  likes: number
  comments: number
  publishedAt: string
  category: string
  isLiked?: boolean
  tags?: string[]
}

export function VlogCard({
  id,
  title,
  description,
  thumbnail,
  duration,
  views,
  likes,
  comments,
  publishedAt,
  category,
  isLiked = false,
  tags = []
}: VlogCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const { isOnline, saveForOffline, getCachedData } = useOffline()

  /**
   * 컴포넌트 마운트 시 오프라인 상태 확인
   */
  useEffect(() => {
    checkOfflineStatus()
  }, [id])

  /**
   * 오프라인 저장 상태 확인
   */
  const checkOfflineStatus = async () => {
    try {
      const cachedVlogs = await getCachedData('vlogs')
      const isVlogCached = cachedVlogs.some((vlog: any) => vlog.id === id)
      setIsDownloaded(isVlogCached)
    } catch (error) {
      console.error('오프라인 상태 확인 실패:', error)
    }
  }

  /**
   * 좋아요 토글 처리
   */
  const handleLike = async () => {
    if (!isOnline) {
      toast.warning('오프라인 상태에서는 좋아요를 누를 수 없습니다')
      return
    }

    try {
      const newLiked = !liked
      setLiked(newLiked)
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1)

      // API 호출 (실제 구현 시)
      // await fetch(`/api/vlogs/${id}/like`, { method: 'POST' })
      
      toast.success(newLiked ? '좋아요를 눌렀습니다' : '좋아요를 취소했습니다')
    } catch (error) {
      // 에러 시 상태 되돌리기
      setLiked(!liked)
      setLikeCount(prev => liked ? prev + 1 : prev - 1)
      toast.error('좋아요 처리에 실패했습니다')
    }
  }

  /**
   * 오프라인 저장 처리
   */
  const handleOfflineDownload = async () => {
    if (isDownloaded) {
      toast.info('이미 오프라인에 저장되어 있습니다')
      return
    }

    setIsDownloading(true)
    try {
      const vlogData = {
        id,
        title,
        description,
        thumbnail,
        duration,
        views,
        likes: likeCount,
        comments,
        publishedAt,
        category,
        tags,
        cachedAt: new Date().toISOString()
      }

      await saveForOffline('vlog', vlogData)
      setIsDownloaded(true)
      toast.success('오프라인에 저장되었습니다')
    } catch (error) {
      toast.error('오프라인 저장에 실패했습니다')
    } finally {
      setIsDownloading(false)
    }
  }

  /**
   * 공유 처리
   */
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: description,
          url: `/vlogs/${id}`
        })
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(`${window.location.origin}/vlogs/${id}`)
        toast.success('링크가 클립보드에 복사되었습니다')
      }
    } catch (error) {
      toast.error('공유에 실패했습니다')
    }
  }

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
    return `${Math.floor(diffDays / 365)}년 전`
  }

  /**
   * 조회수 포맷팅
   */
  const formatViews = (count: number) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        {/* 썸네일 이미지 */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* 재생 시간 */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
          
          {/* 연결 상태 표시 */}
          <div className="absolute top-2 left-2 flex gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="bg-orange-500/90 text-white">
                <WifiOff className="w-3 h-3 mr-1" />
                오프라인
              </Badge>
            )}
            {isDownloaded && (
              <Badge variant="secondary" className="bg-green-500/90 text-white">
                <Download className="w-3 h-3 mr-1" />
                저장됨
              </Badge>
            )}
          </div>

          {/* 카테고리 뱃지 */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-blue-500/90 text-white">
              {category}
            </Badge>
          </div>

          {/* 호버 시 플레이 버튼 */}
          <Link href={`/vlogs/${id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 rounded-full p-4 shadow-lg">
              <div className="w-0 h-0 border-l-[20px] border-l-black border-y-[12px] border-y-transparent ml-1" />
            </div>
          </Link>
        </div>

        {/* 콘텐츠 영역 */}
        <CardContent className="p-4">
          {/* 제목 */}
          <Link href={`/vlogs/${id}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
              {title}
            </h3>
          </Link>

          {/* 설명 */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>

          {/* 태그들 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 통계 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatViews(views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                {formatViews(likeCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {formatViews(comments)}
              </span>
            </div>
            <span>{formatDate(publishedAt)}</span>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={!isOnline}
                className={`${liked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                좋아요
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-1" />
                공유
              </Button>
            </div>

            {/* 오프라인 저장 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOfflineDownload}
              disabled={isDownloading || isDownloaded}
              className="ml-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  저장 중...
                </>
              ) : isDownloaded ? (
                <>
                  <Download className="w-4 h-4 mr-1 text-green-600" />
                  저장됨
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  오프라인 저장
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
