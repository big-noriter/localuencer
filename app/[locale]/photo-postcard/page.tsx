"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ImageIcon, Camera, Wand2, Download, Sparkles, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

/**
 * 경주 관광지 정보
 * AI 이미지 합성에 사용할 배경 이미지와 설명 정보
 */
const touristSpots = [
  { 
    id: "gyeongju-bulguksa", 
    name: "경주 불국사", 
    image: "/placeholder.svg?height=400&width=600",
    description: "신라 불교 문화의 정수를 보여주는 유네스코 세계문화유산"
  },
  { 
    id: "gyeongju-seokguram", 
    name: "경주 석굴암", 
    image: "/placeholder.svg?height=400&width=600",
    description: "동양 조각 예술의 걸작, 석굴 사원의 대표작"
  },
  { 
    id: "gyeongju-anapji", 
    name: "경주 안압지 (동궁과 월지)", 
    image: "/placeholder.svg?height=400&width=600",
    description: "신라 왕궁의 별궁, 아름다운 야경으로 유명한 연못"
  },
  { 
    id: "gyeongju-cheomseongdae", 
    name: "경주 첨성대", 
    image: "/placeholder.svg?height=400&width=600",
    description: "동양에서 가장 오래된 천문대, 신라 과학 기술의 상징"
  },
]

/**
 * 사진엽서 AI 이미지 합성 페이지
 * 사용자가 업로드한 사진과 경주 관광지 배경을 AI로 합성하여 
 * 사진엽서나 4컷 사진을 생성하는 기능을 제공
 */
export default function PhotoPostcardPage() {
  const [userImage, setUserImage] = useState<string | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<string>(touristSpots[0].id)
  const [generatedPostcard, setGeneratedPostcard] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generationStyle, setGenerationStyle] = useState<'postcard' | 'fourcut'>('postcard')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const webcamRef = useRef<HTMLVideoElement>(null)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [webcamError, setWebcamError] = useState<string | null>(null)

  /**
   * 이미지 파일을 Base64로 변환하는 함수
   * @param file - 업로드된 이미지 파일
   * @returns Base64 인코딩된 이미지 문자열
   */
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 파일 선택 다이얼로그 열기
   */
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  /**
   * 이미지 업로드 처리
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUserImage(reader.result as string)
        // 웹캠이 활성화되어 있다면 비활성화
        if (isWebcamActive) {
          stopWebcam()
        }
      }
      reader.readAsDataURL(file)
    }
  }

  /**
   * 웹캠 활성화
   */
  const startWebcam = async () => {
    try {
      // 먼저 카메라 권한 확인
      const hasAccess = await checkCameraPermission();
      if (!hasAccess) {
        showCameraPermissionInstructions();
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.onloadedmetadata = () => {
          webcamRef.current?.play().catch(e => {
            console.error('웹캠 재생 오류:', e);
            setWebcamError('웹캠 재생에 실패했습니다. 브라우저 설정을 확인해주세요.');
          });
        };
        setIsWebcamActive(true);
        setWebcamError(null);
      }
    } catch (error: any) {
      console.error('웹캠 활성화 오류:', error);
      setIsWebcamActive(false);
      
      if (error.name === 'NotAllowedError') {
        setWebcamError('카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      } else if (error.name === 'NotFoundError') {
        setWebcamError('카메라를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.');
      } else if (error.name === 'NotReadableError') {
        setWebcamError('카메라에 접근할 수 없습니다. 다른 앱에서 사용 중인지 확인해주세요.');
      } else {
        setWebcamError('웹캠 활성화에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      }
    }
  };
  
  /**
   * 웹캠 비활성화
   */
  const stopWebcam = () => {
    if (webcamRef.current?.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      webcamRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };
  
  /**
   * 웹캠 사진 촬영
   */
  const capturePhoto = () => {
    if (webcamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = webcamRef.current.videoWidth;
      canvas.height = webcamRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setUserImage(dataUrl);
      }
    }
  };
  
  /**
   * 카메라 권한 확인
   */
  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      // permissions API 사용
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permission.state === 'granted') {
            return true;
          }
        } catch (e) {
          console.log('카메라 권한 확인 불가:', e);
        }
      }
      
      // getUserMedia로 권한 확인
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (e) {
      console.log('카메라 권한 없음:', e);
      return false;
    }
  };
  
  /**
   * 카메라 권한 설정 안내
   */
  const showCameraPermissionInstructions = () => {
    setWebcamError(
      '카메라 접근 권한이 필요합니다. 브라우저 주소 표시줄에서 권한을 허용하거나, ' +
      'Windows 설정 > 개인 정보 > 카메라에서 권한을 확인해주세요.'
    );
  };

  /**
   * AI 사진엽서 생성 함수
   * Fal.ai API를 통해 실제 이미지 합성 수행
   */
  const handleGeneratePostcard = async (style: 'postcard' | 'fourcut' = 'postcard') => {
    if (!userImage) {
      toast.error("먼저 사진을 업로드해주세요.")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGenerationStyle(style)

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 500)

      // AI 이미지 합성 API 호출
      const response = await fetch('/api/photo-postcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userImage,
          backgroundSpot: selectedSpot,
          style,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI 이미지 생성에 실패했습니다.')
      }

      const result = await response.json()
      
      if (result.success) {
        setGeneratedPostcard(result.imageUrl)
        toast.success(
          style === 'fourcut' 
            ? "미나와 함께하는 4컷 사진이 완성되었습니다!" 
            : "경주 AI 사진엽서가 완성되었습니다!"
        )
      } else {
        throw new Error(result.error || '이미지 생성에 실패했습니다.')
      }

    } catch (error) {
      console.error('AI 이미지 생성 오류:', error)
      toast.error(error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.')
      
      // 개발 환경에서는 목업 이미지 사용
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          const mockImage = style === 'fourcut' 
            ? "/placeholder.svg?height=600&width=400&text=4컷+사진+목업"
            : touristSpots.find(s => s.id === selectedSpot)?.image || "/placeholder.svg?height=400&width=600"
          setGeneratedPostcard(mockImage)
          toast.info("개발 환경에서는 목업 이미지를 표시합니다.")
        }, 1000)
      }
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  /**
   * 생성된 이미지 다운로드 함수
   * Canvas를 사용하여 이미지를 로컬에 저장
   */
  const handleDownloadImage = async () => {
    if (!generatedPostcard) return

    try {
      const response = await fetch(generatedPostcard)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `미나-경주-${generationStyle === 'fourcut' ? '4컷사진' : '사진엽서'}-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("이미지가 다운로드되었습니다!")
    } catch (error) {
      console.error('다운로드 오류:', error)
      toast.error("다운로드에 실패했습니다.")
    }
  }

  // 컴포넌트 언마운트 시 웹캠 정리
  useEffect(() => {
    return () => {
      if (isWebcamActive) {
        stopWebcam();
      }
    };
  }, [isWebcamActive]);

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <ImageIcon className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold">미나와 함께 만드는 경주 AI 사진엽서</h1>
      </div>
      <p className="text-lg text-muted-foreground">
        나만의 특별한 경주 사진엽서를 만들어보세요! 사진을 업로드하고 원하는 경주 관광지를 선택하면, 미나가 AI 마법으로
        멋진 사진엽서를 만들어 드립니다. 미나와 함께 경주에서 찍은 듯한 4컷 스티커 사진도 만들어보세요!
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. 사진 준비하기</CardTitle>
            <CardDescription>엽서에 사용할 사진을 업로드하세요. (최대 5MB, JPG/PNG 형식)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-photo-upload">사진 업로드</Label>
              <Input 
                id="user-photo-upload" 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={handleFileSelect}
                className="w-full mt-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                사진 선택하기
              </Button>
            </div>
            
            {!isWebcamActive ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={startWebcam}
              >
                <Camera className="mr-2 h-4 w-4" /> 웹캠으로 촬영
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="relative border rounded-lg overflow-hidden">
                  <video
                    ref={webcamRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto rounded-md"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={capturePhoto}
                  >
                    <Camera className="mr-2 h-4 w-4" /> 사진 촬영
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={stopWebcam}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
            
            {webcamError && (
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
                {webcamError}
              </div>
            )}
            
            {userImage && (
              <div className="mt-4 border rounded-lg p-2">
                <p className="text-sm font-medium mb-2">업로드된 사진:</p>
                <img
                  src={userImage}
                  alt="사용자 업로드 이미지"
                  className="max-w-full h-auto rounded-md max-h-60 object-contain mx-auto"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. 경주 관광지 선택</CardTitle>
            <CardDescription>사진엽서 배경으로 사용할 경주 관광지를 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedSpot} onValueChange={setSelectedSpot}>
              <SelectTrigger>
                <SelectValue placeholder="관광지를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {touristSpots.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id}>
                    {spot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={touristSpots.find((s) => s.id === selectedSpot)?.image || "/placeholder.svg"}
                  alt={touristSpots.find((s) => s.id === selectedSpot)?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {touristSpots.find((s) => s.id === selectedSpot)?.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>3. AI 마법으로 생성하기</CardTitle>
          <CardDescription>
            원하는 스타일을 선택하고 AI가 멋진 사진을 만들어드릴게요!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>AI가 열심히 작업 중입니다...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {progress < 30 && "이미지를 분석하고 있습니다..."}
                {progress >= 30 && progress < 60 && "배경과 합성하고 있습니다..."}
                {progress >= 60 && progress < 90 && "마지막 터치를 추가하고 있습니다..."}
                {progress >= 90 && "거의 완성되었습니다!"}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleGeneratePostcard('postcard')}
              disabled={isGenerating || !userImage}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              {isGenerating && generationStyle === 'postcard' ? "AI 사진엽서 생성 중..." : "경주 AI 사진엽서 만들기"}
            </Button>
            <Button
              onClick={() => handleGeneratePostcard('fourcut')}
              disabled={isGenerating || !userImage}
              size="lg"
              variant="secondary"
              className="bg-theme-purple text-white hover:bg-theme-purple/90"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isGenerating && generationStyle === 'fourcut' ? "미나와 4컷사진 생성 중..." : "미나와 경주 4컷사진 만들기"}
            </Button>
          </div>

          {generatedPostcard && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-xl font-semibold mb-4">✨ 완성된 AI 사진 ✨</h3>
              <img
                src={generatedPostcard}
                alt={`AI 생성 경주 ${generationStyle === 'fourcut' ? '4컷 사진' : '사진엽서'}`}
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto max-h-[500px] object-contain"
              />
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={handleDownloadImage} variant="outline">
                  <Download className="mr-2 h-4 w-4" /> 다운로드
                </Button>
                <Button 
                  onClick={() => {
                    setGeneratedPostcard(null)
                    toast.info("새로운 사진을 만들어보세요!")
                  }}
                  variant="ghost"
                >
                  다시 만들기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">💡 사용 팁</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 얼굴이 선명하게 나온 사진을 사용하면 더 좋은 결과를 얻을 수 있어요</li>
          <li>• 배경이 단순한 사진일수록 합성 품질이 향상됩니다</li>
          <li>• 4컷 사진은 세로 형태로, 사진엽서는 가로 형태로 생성됩니다</li>
          <li>• 이미지 생성에는 약 30초~1분 정도 소요됩니다</li>
        </ul>
      </div>
    </div>
  )
}
