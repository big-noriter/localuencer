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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { 
  Users, 
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck,
  ShieldX,
  Crown,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  Heart,
  MessageSquare,
  Package
} from "lucide-react"
import { toast } from "sonner"

/**
 * 사용자 인터페이스
 */
interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'admin' | 'moderator' | 'user' | 'vip'
  status: 'active' | 'inactive' | 'suspended' | 'banned'
  provider: 'email' | 'google' | 'naver' | 'kakao'
  createdAt: Date
  lastLoginAt: Date
  location?: string
  totalOrders: number
  totalSpent: number
  totalViews: number
  totalLikes: number
  totalComments: number
  isEmailVerified: boolean
  isPhoneVerified: boolean
  preferences: {
    notifications: boolean
    marketing: boolean
    newsletter: boolean
  }
}

/**
 * 관리자 사용자 관리 페이지
 * 사용자 계정, 권한, 활동을 종합 관리하는 시스템
 */
export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-001',
      name: '김민수',
      email: 'minsu.kim@example.com',
      phone: '010-1234-5678',
      avatar: '/placeholder.svg?height=40&width=40&text=김민수',
      role: 'user',
      status: 'active',
      provider: 'kakao',
      createdAt: new Date('2024-10-15'),
      lastLoginAt: new Date('2024-12-19'),
      location: '서울특별시',
      totalOrders: 5,
      totalSpent: 125000,
      totalViews: 234,
      totalLikes: 45,
      totalComments: 12,
      isEmailVerified: true,
      isPhoneVerified: true,
      preferences: {
        notifications: true,
        marketing: true,
        newsletter: false
      }
    },
    {
      id: 'user-002',
      name: '박지영',
      email: 'jiyoung.park@example.com',
      phone: '010-9876-5432',
      avatar: '/placeholder.svg?height=40&width=40&text=박지영',
      role: 'vip',
      status: 'active',
      provider: 'naver',
      createdAt: new Date('2024-09-22'),
      lastLoginAt: new Date('2024-12-19'),
      location: '부산광역시',
      totalOrders: 15,
      totalSpent: 450000,
      totalViews: 1567,
      totalLikes: 234,
      totalComments: 89,
      isEmailVerified: true,
      isPhoneVerified: true,
      preferences: {
        notifications: true,
        marketing: true,
        newsletter: true
      }
    },
    {
      id: 'user-003',
      name: '이서현',
      email: 'seohyun.lee@example.com',
      avatar: '/placeholder.svg?height=40&width=40&text=이서현',
      role: 'user',
      status: 'active',
      provider: 'google',
      createdAt: new Date('2024-12-18'),
      lastLoginAt: new Date('2024-12-18'),
      location: '경기도',
      totalOrders: 1,
      totalSpent: 25000,
      totalViews: 45,
      totalLikes: 8,
      totalComments: 3,
      isEmailVerified: true,
      isPhoneVerified: false,
      preferences: {
        notifications: true,
        marketing: false,
        newsletter: false
      }
    },
    {
      id: 'user-004',
      name: '최준호',
      email: 'junho.choi@example.com',
      phone: '010-5555-1234',
      avatar: '/placeholder.svg?height=40&width=40&text=최준호',
      role: 'moderator',
      status: 'active',
      provider: 'email',
      createdAt: new Date('2024-08-10'),
      lastLoginAt: new Date('2024-12-19'),
      location: '대구광역시',
      totalOrders: 8,
      totalSpent: 180000,
      totalViews: 456,
      totalLikes: 67,
      totalComments: 34,
      isEmailVerified: true,
      isPhoneVerified: true,
      preferences: {
        notifications: true,
        marketing: true,
        newsletter: true
      }
    },
    {
      id: 'user-005',
      name: '정민지',
      email: 'minji.jung@example.com',
      role: 'user',
      status: 'suspended',
      provider: 'kakao',
      createdAt: new Date('2024-11-05'),
      lastLoginAt: new Date('2024-12-10'),
      location: '인천광역시',
      totalOrders: 2,
      totalSpent: 35000,
      totalViews: 123,
      totalLikes: 15,
      totalComments: 25,
      isEmailVerified: false,
      isPhoneVerified: false,
      preferences: {
        notifications: false,
        marketing: false,
        newsletter: false
      }
    }
  ])

  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  /**
   * 사용자 필터링
   */
  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    const matchesProvider = selectedProvider === 'all' || user.provider === selectedProvider
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)
    
    return matchesRole && matchesStatus && matchesProvider && matchesSearch
  })

  /**
   * 역할별 배지
   */
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-100 text-red-800"><Crown className="w-3 h-3 mr-1" />관리자</Badge>
      case 'moderator': return <Badge className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" />운영자</Badge>
      case 'vip': return <Badge className="bg-purple-100 text-purple-800"><Star className="w-3 h-3 mr-1" />VIP</Badge>
      case 'user': return <Badge variant="secondary">일반</Badge>
      default: return <Badge variant="outline">{role}</Badge>
    }
  }

  /**
   * 상태별 배지
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />활성</Badge>
      case 'inactive': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />비활성</Badge>
      case 'suspended': return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />정지</Badge>
      case 'banned': return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />차단</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  /**
   * 로그인 제공자 아이콘
   */
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'google': return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">G</div>
      case 'naver': return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">N</div>
      case 'kakao': return <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs">K</div>
      default: return <Mail className="w-4 h-4" />
    }
  }

  /**
   * 사용자 상태 변경
   */
  const updateUserStatus = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: newStatus }
        : user
    ))
    toast.success(`사용자 상태가 "${newStatus}"로 변경되었습니다.`)
  }

  /**
   * 사용자 역할 변경
   */
  const updateUserRole = (userId: string, newRole: User['role']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, role: newRole }
        : user
    ))
    toast.success(`사용자 역할이 "${newRole}"로 변경되었습니다.`)
  }

  /**
   * 사용자 삭제
   */
  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
    toast.success('사용자가 삭제되었습니다.')
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
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    banned: users.filter(u => u.status === 'banned').length,
    vip: users.filter(u => u.role === 'vip').length,
    totalSpent: users.reduce((sum, u) => sum + u.totalSpent, 0),
    totalOrders: users.reduce((sum, u) => sum + u.totalOrders, 0)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground">회원 계정과 권한을 관리하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            새 사용자
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              활성: <span className="text-green-600 font-medium">{stats.active}명</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">VIP 회원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.vip}</div>
            <p className="text-xs text-muted-foreground">
              전체의 {((stats.vip / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 주문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              평균 {(stats.totalOrders / stats.total).toFixed(1)}건/인
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              평균 {formatCurrency(stats.totalSpent / stats.total)}/인
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">사용자 목록</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
          <TabsTrigger value="permissions">권한 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 목록</CardTitle>
              <CardDescription>등록된 모든 사용자를 확인하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="이름, 이메일, 전화번호로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="역할" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 역할</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="moderator">운영자</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="user">일반</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                    <SelectItem value="suspended">정지</SelectItem>
                    <SelectItem value="banned">차단</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="로그인 방식" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 방식</SelectItem>
                    <SelectItem value="email">이메일</SelectItem>
                    <SelectItem value="google">구글</SelectItem>
                    <SelectItem value="naver">네이버</SelectItem>
                    <SelectItem value="kakao">카카오</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 사용자 테이블 */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>로그인 방식</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>활동</TableHead>
                      <TableHead>구매</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                              {user.phone && (
                                <div className="text-xs text-muted-foreground">{user.phone}</div>
                              )}
                              {user.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {user.location}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {user.isEmailVerified && (
                                  <Badge variant="outline" className="text-xs">
                                    <Mail className="w-3 h-3 mr-1" />
                                    이메일 인증
                                  </Badge>
                                )}
                                {user.isPhoneVerified && (
                                  <Badge variant="outline" className="text-xs">
                                    <Phone className="w-3 h-3 mr-1" />
                                    전화 인증
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getProviderIcon(user.provider)}
                            <span className="capitalize">{user.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{formatDate(user.createdAt)}</div>
                            <div className="text-xs text-muted-foreground">
                              최근 로그인: {formatDate(user.lastLoginAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Eye className="w-3 h-3" />
                              {user.totalViews}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Heart className="w-3 h-3" />
                              {user.totalLikes}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <MessageSquare className="w-3 h-3" />
                              {user.totalComments}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Package className="w-3 h-3" />
                              {user.totalOrders}건
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(user.totalSpent)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Select onValueChange={(value) => updateUserRole(user.id, value as User['role'])}>
                              <SelectTrigger className="w-[80px] h-8">
                                <SelectValue placeholder="역할" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">관리자</SelectItem>
                                <SelectItem value="moderator">운영자</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="user">일반</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => updateUserStatus(user.id, value as User['status'])}>
                              <SelectTrigger className="w-[80px] h-8">
                                <SelectValue placeholder="상태" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">활성</SelectItem>
                                <SelectItem value="inactive">비활성</SelectItem>
                                <SelectItem value="suspended">정지</SelectItem>
                                <SelectItem value="banned">차단</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteUser(user.id)}
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

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">검색 조건에 맞는 사용자가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>가입 통계</CardTitle>
                <CardDescription>월별 신규 가입자 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">가입 통계 차트</p>
                    <p className="text-sm text-muted-foreground">Chart.js로 구현 예정</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>활동 분석</CardTitle>
                <CardDescription>사용자 활동 패턴 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>일일 활성 사용자</span>
                    <span className="font-medium">{stats.active}명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>평균 세션 시간</span>
                    <span className="font-medium">15분 32초</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>페이지뷰/세션</span>
                    <span className="font-medium">4.2페이지</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>반복 방문율</span>
                    <span className="font-medium">68.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>권한 관리</CardTitle>
              <CardDescription>역할별 권한 설정을 관리하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['admin', 'moderator', 'vip', 'user'].map((role) => (
                  <div key={role} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(role)}
                        <span className="font-medium">
                          {role === 'admin' ? '관리자' : 
                           role === 'moderator' ? '운영자' :
                           role === 'vip' ? 'VIP 회원' : '일반 회원'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        편집
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${role}-content`}>콘텐츠 관리</Label>
                        <Switch id={`${role}-content`} defaultChecked={role === 'admin' || role === 'moderator'} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${role}-user`}>사용자 관리</Label>
                        <Switch id={`${role}-user`} defaultChecked={role === 'admin'} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${role}-order`}>주문 관리</Label>
                        <Switch id={`${role}-order`} defaultChecked={role === 'admin' || role === 'moderator'} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${role}-analytics`}>분석 보기</Label>
                        <Switch id={`${role}-analytics`} defaultChecked={role === 'admin'} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 새 사용자 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 사용자 생성</DialogTitle>
            <DialogDescription>새로운 사용자 계정을 생성합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input id="name" placeholder="사용자 이름" />
              </div>
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="이메일 주소" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">역할</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">일반 사용자</SelectItem>
                    <SelectItem value="vip">VIP 회원</SelectItem>
                    <SelectItem value="moderator">운영자</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
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
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="phone">전화번호 (선택)</Label>
              <Input id="phone" placeholder="010-0000-0000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={() => {
              // 실제로는 폼 데이터를 처리
              toast.success('새 사용자가 생성되었습니다.')
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