"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, X, User } from "lucide-react"

export default function PersonaPage() {
  const [persona, setPersona] = useState({
    name: "미나",
    age: "20세",
    personality: "밝고 활발하며 호기심이 많은 성격. Z세대의 트렌드에 민감하고 새로운 것을 좋아함.",
    interests: ["패션", "카페", "음악", "여행", "기술", "뷰티"],
    speechStyle:
      "친근하고 재미있는 말투. 이모티콘을 자주 사용하며, 'ㅋㅋ', '헐', '대박' 같은 젊은 세대 언어를 자연스럽게 구사",
    prohibitedWords: ["정치", "종교", "혐오", "욕설"],
    sampleSentences: [
      "안녕하세요! 오늘도 좋은 하루 보내고 계신가요? 😊",
      "와 진짜 대박이에요! 이거 완전 제 스타일이네요 ✨",
      "음... 그건 저도 한번 생각해봐야겠어요! 🤔",
      "여러분 의견이 정말 궁금해요! 댓글로 알려주세요 💕",
    ],
  })

  const [newInterest, setNewInterest] = useState("")
  const [newProhibitedWord, setNewProhibitedWord] = useState("")
  const [newSampleSentence, setNewSampleSentence] = useState("")

  const addInterest = () => {
    if (newInterest.trim() && !persona.interests.includes(newInterest.trim())) {
      setPersona((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setPersona((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  const addProhibitedWord = () => {
    if (newProhibitedWord.trim() && !persona.prohibitedWords.includes(newProhibitedWord.trim())) {
      setPersona((prev) => ({
        ...prev,
        prohibitedWords: [...prev.prohibitedWords, newProhibitedWord.trim()],
      }))
      setNewProhibitedWord("")
    }
  }

  const removeProhibitedWord = (word: string) => {
    setPersona((prev) => ({
      ...prev,
      prohibitedWords: prev.prohibitedWords.filter((w) => w !== word),
    }))
  }

  const addSampleSentence = () => {
    if (newSampleSentence.trim()) {
      setPersona((prev) => ({
        ...prev,
        sampleSentences: [...prev.sampleSentences, newSampleSentence.trim()],
      }))
      setNewSampleSentence("")
    }
  }

  const removeSampleSentence = (index: number) => {
    setPersona((prev) => ({
      ...prev,
      sampleSentences: prev.sampleSentences.filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to your database
    console.log("Saving persona:", persona)
    alert("페르소나 설정이 저장되었습니다!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="mr-3 h-8 w-8" />
            페르소나 설정
          </h1>
          <p className="text-gray-600">미나의 성격, 말투, 관심사 등을 정의하여 일관된 캐릭터를 유지하세요</p>
        </div>
        <Button onClick={handleSave} className="bg-primary">
          <Save className="mr-2 h-4 w-4" />
          저장하기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>미나의 기본적인 캐릭터 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={persona.name}
                onChange={(e) => setPersona((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="age">나이</Label>
              <Input
                id="age"
                value={persona.age}
                onChange={(e) => setPersona((prev) => ({ ...prev, age: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="personality">성격</Label>
              <Textarea
                id="personality"
                value={persona.personality}
                onChange={(e) => setPersona((prev) => ({ ...prev, personality: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Speech Style */}
        <Card>
          <CardHeader>
            <CardTitle>말투 및 표현</CardTitle>
            <CardDescription>미나의 대화 스타일과 표현 방식</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="speechStyle">말투 특징</Label>
              <Textarea
                id="speechStyle"
                value={persona.speechStyle}
                onChange={(e) => setPersona((prev) => ({ ...prev, speechStyle: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>관심사</CardTitle>
          <CardDescription>미나가 관심을 가지고 있는 주제들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {persona.interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                {interest}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeInterest(interest)} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="새 관심사 추가"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addInterest()}
            />
            <Button onClick={addInterest} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prohibited Words */}
      <Card>
        <CardHeader>
          <CardTitle>금지어</CardTitle>
          <CardDescription>미나가 사용하지 않아야 할 단어나 주제</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {persona.prohibitedWords.map((word) => (
              <Badge key={word} variant="destructive" className="flex items-center gap-1">
                {word}
                <X className="h-3 w-3 cursor-pointer hover:text-red-300" onClick={() => removeProhibitedWord(word)} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="새 금지어 추가"
              value={newProhibitedWord}
              onChange={(e) => setNewProhibitedWord(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addProhibitedWord()}
            />
            <Button onClick={addProhibitedWord} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Sentences */}
      <Card>
        <CardHeader>
          <CardTitle>예시 문장</CardTitle>
          <CardDescription>미나의 말투를 보여주는 대표적인 문장들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {persona.sampleSentences.map((sentence, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm flex-1">{sentence}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSampleSentence(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="새 예시 문장 추가"
              value={newSampleSentence}
              onChange={(e) => setNewSampleSentence(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSampleSentence()}
            />
            <Button onClick={addSampleSentence} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
