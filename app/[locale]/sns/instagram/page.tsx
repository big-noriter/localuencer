"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageSquare, Video, ImageIcon, Copy, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
  like_count?: number
  comments_count?: number
  thumbnail_url?: string
}

interface InstagramData {
  images: InstagramMedia[]
  reels: InstagramMedia[]
  cardNews: InstagramMedia[]
}

export default function InstagramPage() {
  const [data, setData] = useState<InstagramData>({ images: [], reels: [], cardNews: [] })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchInstagramData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sns/instagram')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Instagram 데이터 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstagramData()
  }, [])

  const formatCount = (count?: number): string => {
    if (!count) return '0'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}일 전`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">미나의 Instagram 피드</h2>
          <p className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchInstagramData}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="images">
            <ImageIcon className="w-4 h-4 mr-2" />
            이미지 ({data.images.length})
          </TabsTrigger>
          <TabsTrigger value="reels">
            <Video className="w-4 h-4 mr-2" />
            릴스 ({data.reels.length})
          </TabsTrigger>
          <TabsTrigger value="card-news">
            <Copy className="w-4 h-4 mr-2" />
            카드뉴스 ({data.cardNews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.images.map((post) => (
                <Card key={post.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <Image
                      src={post.media_url || "/placeholder.svg"}
                      alt={post.caption || "Instagram 이미지"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="text-xs">
                          {getRelativeTime(post.timestamp)}
                        </Badge>
                        <Link href={post.permalink} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                      <div>
                        <p className="text-sm mb-2 line-clamp-3">{post.caption}</p>
                        <div className="flex space-x-4 text-sm">
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" /> 
                            {formatCount(post.like_count)}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" /> 
                            {formatCount(post.comments_count)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reels">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[9/16] bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.reels.map((reel) => (
                <Card key={reel.id} className="overflow-hidden group">
                  <div className="relative aspect-[9/16]">
                    <Image
                      src={reel.thumbnail_url || reel.media_url || "/placeholder.svg"}
                      alt={reel.caption || "Instagram 릴스"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <Video className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center justify-between text-white text-xs">
                        <Badge variant="secondary" className="text-xs">
                          {getRelativeTime(reel.timestamp)}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {formatCount(reel.like_count)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={reel.permalink} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="card-news">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.cardNews.map((news) => (
                <Card key={news.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <Image
                      src={news.media_url || "/placeholder.svg"}
                      alt={news.caption || "Instagram 카드뉴스"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center p-4 text-white text-center">
                      <Copy className="w-8 h-8 mb-2 opacity-80" />
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">{news.caption}</h3>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {getRelativeTime(news.timestamp)}
                      </Badge>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {formatCount(news.like_count)}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {formatCount(news.comments_count)}
                        </span>
                      </div>
                    </div>
                    <Link href={news.permalink} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
