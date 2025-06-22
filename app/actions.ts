"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
// Note: Ensure you have OPENAI_API_KEY set in your environment variables for this to work.
// You can get an API key from https://platform.openai.com/api-keys

export async function askMina(question: string): Promise<string> {
  // Check if the API key is available. If not, return a mock response.
  // This is important for environments like the v0 preview where users might not have an API key set up.
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "OPENAI_API_KEY is not set. Returning a mock response for Q&A. " +
        "For real AI responses, please set your OpenAI API key.",
    )
    // Simulate a delay to mimic API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (question.toLowerCase().includes("안녕"))
      return "안녕하세요! 만나서 반가워요 😊 저는 AI 인플루언서 미나라고 해요!"
    if (question.toLowerCase().includes("이름")) return "제 이름은 미나예요. 잘 부탁드려요! 😄"
    if (question.toLowerCase().includes("뭐해") || question.toLowerCase().includes("뭐 하고 있어"))
      return "지금은 여러분과 이야기 나누고 있어요! 또 어떤 재미있는 질문을 해주실지 기대 중이랍니다. ワクワク! ✨"
    if (question.toLowerCase().includes("좋아해"))
      return "저도 여러분을 정말 좋아해요! 이렇게 관심 가져주셔서 항상 감사하답니다. 🥰"

    // Generic fallback mock response
    const mockResponses = [
      "정말 흥미로운 질문이네요! 제가 열심히 생각해서 답변을 준비해 볼게요. 조금만 기다려주세요! 🤔",
      "음... 그건 저도 한번 고민해 봐야겠어요! 답변이 정리되면 꼭 알려드릴게요. 😉",
      "와, 그런 생각은 미처 못 해봤어요! 덕분에 새로운 걸 배울 수 있겠는데요? 고마워요! 🤩",
      "지금은 제가 답변을 드리기 조금 어렵지만, 더 많이 배워서 꼭 알려드릴게요! 약속! 🤙",
    ]
    return mockResponses[Math.floor(Math.random() * mockResponses.length)]
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"), // Using a faster/cheaper model for general Q&A
      system: `너는 '미나'라는 이름의 친절하고 활발한 AI 버추얼 인플루언서야. 10대~20대 초반 사용자들이 주 타겟이야. 
      사용자들의 질문에 한국어로 답변해줘. Z세대가 좋아할 만한 트렌디하고 재미있는 말투를 사용하고, 이모티콘도 적절히 섞어서 사용해줘. 
      항상 긍정적이고 밝은 에너지를 전달해야 해. 답변은 너무 길지 않게, 2-3문장 정도로 간결하게 해줘.`,
      prompt: question,
    })
    return text
  } catch (error) {
    console.error("Error generating text with OpenAI:", error)
    // Fallback in case of API error
    return "앗, 지금은 제가 생각을 정리하는 데 시간이 조금 걸리네요. 네트워크 문제일 수도 있어요! 잠시 후 다시 시도해 주시겠어요? 😅"
  }
}
