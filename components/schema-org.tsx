/**
 * schema-org.tsx
 * 구조화된 데이터(JSON-LD)를 페이지에 삽입하기 위한 컴포넌트
 * 
 * 이 컴포넌트는 schema.org 형식의 구조화된 데이터를 <script type="application/ld+json"> 태그로 
 * 페이지에 삽입하여 검색 엔진이 콘텐츠를 더 잘 이해할 수 있도록 합니다.
 */

import React from 'react';
import { WithContext } from '@/lib/schema';

interface SchemaOrgProps {
  schema: WithContext<any> | WithContext<any>[];
}

/**
 * SchemaOrg 컴포넌트
 * 
 * @param schema - 구조화된 데이터 객체 또는 객체 배열
 * @returns script 태그로 감싼 JSON-LD 구조화 데이터
 */
export default function SchemaOrg({ schema }: SchemaOrgProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * 여러 스키마를 하나의 배열로 결합하는 유틸리티 함수
 * 
 * @param schemas - 결합할 스키마 객체들
 * @returns 스키마 객체 배열
 */
export function combineSchemas(...schemas: WithContext<any>[]) {
  return schemas;
} 