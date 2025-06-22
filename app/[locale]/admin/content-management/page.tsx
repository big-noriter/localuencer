"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Video, 
  MessageSquare, 
  Package, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Heart,
  Calendar,
  User,
  Tag,
  Image,
  FileText,
  MoreHorizontal
} from "lucide-react"
import { toast } from "sonner"

/**
 * 콘텐츠 인터페이스
 */
interface Content {
  id: string
  type: 'vlog' | 'qa' | 'product' | 'post'
  title: string
  description?: string
  status: 'published' | 'draft' | 'scheduled' | 'archived'
  author: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  views: number
  likes: number
  tags: string[]
  thumbnail?: string
  price?: number
  stock?: number
  category?: string
}

/**
 * 관리자 콘텐츠 관리 페이지
 * 모든 콘텐츠 타입을 통합 관리하는 종합 관리 시스템
 */
export default function ContentManagementPage() {
  const [contents, setContents] = useState<Content[]>([
    {
      id: 'vlog-001',
      type: 'vlog',
      title: '경주 불국사 단풍 구경하기',
      description: '가을 불국사의 아름다운 단풍을 구경하며 힐링하는 미나의 브이로그',
      status: 'published',
      author: '미나',
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-11-15'),
      publishedAt: new Date('2024-11-15'),
      views: 12543,
      likes: 892,
      tags: ['경주', '불국사', '단풍', '가을', '힐링'],
      thumbnail: '/placeholder.svg?height=100&width=150&text=불국사+단풍'
    },
    {
      id: 'qa-001',
      type: 'qa',
      title: '경주 여행 코스 추천해주세요',
      description: '1박 2일 경주 여행 계획을 세우고 있는데 추천 코스가 있나요?',
      status: 'published',
      author: '김민수',
      createdAt: new Date('2024-12-18'),
      updatedAt: new Date('2024-12-19'),
      publishedAt: new Date('2024-12-19'),
      views: 234,
      likes: 45,
      tags: ['경주', '여행코스', '1박2일'],
      category: '여행계획'
    },
    {
      id: 'product-001',
      type: 'product',
      title: '경주 황남빵 세트 (6개입)',
      description: '경주의 대표 특산품인 황남빵을 정성스럽게 포장한 선물 세트',
      status: 'published',
      author: '관리자',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-15'),
      publishedAt: new Date('2024-12-01'),
      views: 1567,
      likes: 234,
      tags: ['경주', '황남빵', '선물', '특산품'],
      thumbnail: '/placeholder.svg?height=100&width=150&text=황남빵+세트',
      price: 25000,
      stock: 45,
      category: '전통과자'
    },
    {
      id: 'vlog-002',
      type: 'vlog',
      title: '석굴암 일출 보러 가기',
      description: '새벽 5시에 일어나서 석굴암 일출을 보러 간 미나의 모험',
      status: 'draft',
      author: '미나',
      createdAt: new Date('2024-12-19'),
      updatedAt: new Date('2024-12-19'),
      views: 0,
      likes: 0,
      tags: ['경주', '석굴암', '일출', '새벽'],
      thumbnail: '/placeholder.svg?height=100&width=150&text=석굴암+일출'
    },
    {
      id: 'product-002',
      type: 'product',
      title: '신라 문화재 미니어처 세트',
      description: '불국사 다보탑과 석가탑을 정교하게 재현한 미니어처',
      status: 'scheduled',
      author: '관리자',
      createdAt: new Date('2024-12-19'),
      updatedAt: new Date('2024-12-19'),
      publishedAt: new Date('2024-12-25'),
      views: 0,
      likes: 0,
      tags: ['신라', '문화재', '미니어처', '기념품'],
      thumbnail: '/placeholder.svg?height=100&width=150&text=미니어처+세트',
      price: 35000,
      stock: 20,
      category: '기념품'
    }
  ])

  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)

  /**
   * 콘텐츠 필터링
   */
  const filteredContents = contents.filter(content => {
    const matchesType = selectedType === 'all' || content.type === selectedType
    const matchesStatus = selectedStatus === 'all' || content.status === selectedStatus
    const matchesSearch = searchQuery === '' || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesType && matchesStatus && matchesSearch
  })

  /**
   * 콘텐츠 타입별 아이콘
   */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vlog': return <Video className="w-4 h-4" />
      case 'qa': return <MessageSquare className="w-4 h-4" />
      case 'product': return <Package className="w-4 h-4" />
      case 'post': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  /**
   * 상태별 배지 색상
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge className="bg-green-100 text-green-800">게시됨</Badge>
      case 'draft': return <Badge variant="secondary">초안</Badge>
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-800">예약됨</Badge>
      case 'archived': return <Badge variant="outline">보관됨</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  /**
   * 콘텐츠 상태 변경
   */
  const updateContentStatus = (contentId: string, newStatus: Content['status']) => {
    setContents(prev => prev.map(content => 
      content.id === contentId 
        ? { ...content, status: newStatus, updatedAt: new Date() }
        : content
    ))
    toast.success(`콘텐츠 상태가 "${newStatus}"로 변경되었습니다.`)
  }

  /**
   * 콘텐츠 삭제
   */
  const deleteContent = (contentId: string) => {
    setContents(prev => prev.filter(content => content.id !== contentId))
    toast.success('콘텐츠가 삭제되었습니다.')
  }

  /**
   * 시간 포맷팅
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * 금액 포맷팅
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  /**
   * 통계 계산
   */
  const stats = {
    total: contents.length,
    published: contents.filter(c => c.status === 'published').length,
    draft: contents.filter(c => c.status === 'draft').length,
    scheduled: contents.filter(c => c.status === 'scheduled').length,
    totalViews: contents.reduce((sum, c) => sum + c.views, 0),
    totalLikes: contents.reduce((sum, c) => sum + c.likes, 0)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">콘텐츠 관리</h1>
          <p className="text-muted-foreground">브이로그, Q&A, 상품 등 모든 콘텐츠를 관리하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 콘텐츠
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 콘텐츠</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">게시됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">초안</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">예약됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 좋아요</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>콘텐츠 목록</CardTitle>
          <CardDescription>등록된 모든 콘텐츠를 확인하고 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목, 설명, 태그로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="콘텐츠 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 타입</SelectItem>
                <SelectItem value="vlog">브이로그</SelectItem>
                <SelectItem value="qa">Q&A</SelectItem>
                <SelectItem value="product">상품</SelectItem>
                <SelectItem value="post">게시글</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="published">게시됨</SelectItem>
                <SelectItem value="draft">초안</SelectItem>
                <SelectItem value="scheduled">예약됨</SelectItem>
                <SelectItem value="archived">보관됨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 콘텐츠 테이블 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>콘텐츠</TableHead>
                  <TableHead>타입</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작성자</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead>조회/좋아요</TableHead>
                  <TableHead>가격/재고</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {content.thumbnail && (
                          <img 
                            src={content.thumbnail} 
                            alt={content.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{content.title}</div>
                          {content.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {content.description}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {content.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(content.type)}
                        <span className="capitalize">
                          {content.type === 'vlog' ? '브이로그' : 
                           content.type === 'qa' ? 'Q&A' :
                           content.type === 'product' ? '상품' : '게시글'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(content.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {content.author}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(content.createdAt)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="w-3 h-3" />
                          {content.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Heart className="w-3 h-3" />
                          {content.likes.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {content.type === 'product' && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatCurrency(content.price || 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            재고: {content.stock}개
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingContent(content)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(value) => updateContentStatus(content.id, value as Content['status'])}>
                          <SelectTrigger className="w-[100px] h-8">
                            <SelectValue placeholder="상태 변경" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">게시</SelectItem>
                            <SelectItem value="draft">초안</SelectItem>
                            <SelectItem value="scheduled">예약</SelectItem>
                            <SelectItem value="archived">보관</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteContent(content.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredContents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">검색 조건에 맞는 콘텐츠가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 새 콘텐츠 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 콘텐츠 생성</DialogTitle>
            <DialogDescription>새로운 콘텐츠를 생성합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">콘텐츠 타입</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vlog">브이로그</SelectItem>
                    <SelectItem value="qa">Q&A</SelectItem>
                    <SelectItem value="product">상품</SelectItem>
                    <SelectItem value="post">게시글</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">상태</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">초안</SelectItem>
                    <SelectItem value="published">게시</SelectItem>
                    <SelectItem value="scheduled">예약</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">제목</Label>
              <Input id="title" placeholder="콘텐츠 제목을 입력하세요" />
            </div>
            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea id="description" placeholder="콘텐츠 설명을 입력하세요" />
            </div>
            <div>
              <Label htmlFor="tags">태그</Label>
              <Input id="tags" placeholder="태그를 쉼표로 구분하여 입력하세요" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={() => {
              // 실제로는 폼 데이터를 처리
              toast.success('새 콘텐츠가 생성되었습니다.')
              setIsCreateDialogOpen(false)
            }}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 