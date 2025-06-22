// 클래스 이름 조합을 위한 유틸리티 함수들을 가져옵니다.
import { clsx, type ClassValue } from "clsx"
// Tailwind CSS 클래스 병합을 위한 유틸리티 함수를 가져옵니다.
import { twMerge } from "tailwind-merge"

/**
 * CSS 클래스 이름을 안전하게 병합하는 유틸리티 함수
 * 
 * @param {...ClassValue[]} inputs - 병합할 클래스 이름들. 문자열, 객체, 배열, null, undefined 등 다양한 형식 지원
 * @returns {string} 병합된 클래스 이름 문자열
 * 
 * @example
 * // 기본 사용법
 * cn("p-4", "bg-blue-500") // "p-4 bg-blue-500"
 * 
 * // 조건부 클래스
 * cn("p-4", isActive && "bg-blue-500") // isActive가 true인 경우에만 "p-4 bg-blue-500"
 * 
 * // 객체 스타일
 * cn({"text-red-500": hasError, "font-bold": isImportant}) // 조건에 따라 클래스 적용
 */
export function cn(...inputs: ClassValue[]) {
  // clsx로 클래스 이름을 정규화한 후, twMerge로 Tailwind 클래스 충돌 해결
  return twMerge(clsx(inputs))
}
