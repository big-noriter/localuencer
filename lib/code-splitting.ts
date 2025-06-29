import { lazy } from 'react';

/**
 * 컴포넌트 지연 로딩을 위한 유틸리티 함수
 * 
 * 이 함수는 컴포넌트를 필요할 때만 불러오는 지연 로딩을 구현합니다.
 * 웹사이트의 초기 로딩 시간을 줄이고 성능을 향상시킵니다.
 * 
 * @param importFn 컴포넌트를 가져오는 import 함수
 * @param loadingTimeout 로딩 타임아웃 시간(밀리초)
 * @returns 지연 로딩된 컴포넌트
 * 
 * @example
 * // 사용 예시
 * const LazyComponent = lazyLoad(() => import('@/components/heavy-component'));
 */
export function lazyLoad(importFn: () => Promise<any>, loadingTimeout = 3000) {
  return lazy(() => {
    // 타임아웃 처리 - 로딩이 너무 오래 걸리면 에러 발생
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`컴포넌트 로딩이 ${loadingTimeout}ms 이후 타임아웃 되었습니다`));
      }, loadingTimeout);
    });

    // 실제 컴포넌트 로딩과 타임아웃 중 먼저 완료되는 것 반환
    return Promise.race([
      importFn(),
      timeoutPromise
    ]).catch(error => {
      console.error('컴포넌트 지연 로딩 실패:', error);
      // 에러 발생 시 한 번 더 시도
      return importFn();
    });
  });
}

/**
 * 라우트 기반 코드 스플리팅을 위한 유틸리티 함수
 * 
 * 페이지 라우트에 따라 필요한 컴포넌트만 로드하는 함수입니다.
 * 웹사이트의 초기 로딩 속도를 개선합니다.
 * 
 * @param componentPath 컴포넌트 경로
 * @returns 지연 로딩된 컴포넌트
 * 
 * @example
 * // 사용 예시
 * const DynamicPage = loadRouteComponent('@/app/[locale]/some-page');
 */
export function loadRouteComponent(componentPath: string) {
  return lazyLoad(() => import(/* webpackChunkName: "[request]" */ `${componentPath}`));
}

/**
 * 이미지 프리로딩 유틸리티 함수
 * 
 * 이미지를 미리 로드하여 사용자가 실제로 보기 전에 준비합니다.
 * 사용자 경험을 개선하고 이미지가 나타날 때 깜빡임을 줄입니다.
 * 
 * @param src 이미지 소스 URL
 * @returns 이미지 로딩 Promise
 * 
 * @example
 * // 사용 예시
 * useEffect(() => {
 *   preloadImage('/large-hero.jpg');
 * }, []);
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 다중 이미지 프리로딩 유틸리티 함수
 * 
 * 여러 이미지를 한 번에 미리 로드합니다.
 * 갤러리나 슬라이더와 같이 여러 이미지를 사용하는 컴포넌트에 유용합니다.
 * 
 * @param sources 이미지 소스 URL 배열
 * @returns 모든 이미지 로딩 Promise
 * 
 * @example
 * // 사용 예시
 * useEffect(() => {
 *   preloadImages(['/image1.jpg', '/image2.jpg']);
 * }, []);
 */
export function preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(preloadImage));
}

/**
 * 중요 스타일시트 프리로딩 유틸리티 함수
 * 
 * 중요한 스타일시트를 미리 로드하여 페이지 렌더링을 최적화합니다.
 * 사용자가 페이지를 볼 때 스타일이 이미 로드되어 있어 깜빡임이 줄어듭니다.
 * 
 * @param href 스타일시트 URL
 * 
 * @example
 * // 사용 예시
 * useEffect(() => {
 *   preloadStylesheet('/critical.css');
 * }, []);
 */
export function preloadStylesheet(href: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * 스크립트 지연 로딩 유틸리티 함수
 * 
 * 필요할 때만 자바스크립트 파일을 로드합니다.
 * 초기 페이지 로딩 시간을 줄이고 성능을 향상시킵니다.
 * 
 * @param src 스크립트 URL
 * @param options 스크립트 옵션 (async, defer)
 * @returns 스크립트 로딩 Promise
 * 
 * @example
 * // 사용 예시
 * useEffect(() => {
 *   loadScript('/analytics.js', { async: true });
 * }, []);
 */
export function loadScript(
  src: string, 
  options: { async?: boolean; defer?: boolean } = {}
): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = reject;
    
    // 옵션 적용
    if (options.async) script.async = true;
    if (options.defer) script.defer = true;
    
    // 문서에 스크립트 추가
    document.body.appendChild(script);
  });
} 