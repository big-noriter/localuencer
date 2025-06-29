import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * 네비게이션 메뉴 컴포넌트
 * 
 * Radix UI의 NavigationMenu를 기반으로 한 사용자 정의 네비게이션 메뉴입니다.
 * 웹사이트의 주요 탐색 메뉴로 사용됩니다.
 */
const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

/**
 * 네비게이션 메뉴 목록 컴포넌트
 * 
 * 메뉴 항목들을 담는 컨테이너입니다.
 */
const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

/**
 * 네비게이션 메뉴 항목
 * 
 * 개별 메뉴 항목을 나타냅니다.
 */
const NavigationMenuItem = NavigationMenuPrimitive.Item

/**
 * 네비게이션 메뉴 트리거 스타일
 * 
 * 메뉴 트리거 버튼의 스타일을 정의합니다.
 */
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)

/**
 * 네비게이션 메뉴 트리거 컴포넌트
 * 
 * 서브메뉴를 열기 위한 트리거 버튼입니다.
 */
const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

/**
 * 네비게이션 메뉴 콘텐츠 컴포넌트
 * 
 * 서브메뉴의 내용을 담는 컨테이너입니다.
 * 지연 로딩 기능을 포함하여 성능을 최적화합니다.
 */
const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => {
  // 콘텐츠 로딩 상태 관리
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  // 컴포넌트 마운트/언마운트 시 로딩 상태 관리
  React.useEffect(() => {
    // 컴포넌트가 마운트되면 로드 상태를 true로 설정
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 10); // 아주 짧은 지연 시간으로 성능 최적화
    
    return () => {
      // 타이머 정리 및 언마운트 시 로드 상태 초기화
      clearTimeout(timer);
      setIsLoaded(false);
    };
  }, []);

  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
        className
      )}
      {...props}
    >
      {/* 콘텐츠가 로드되기 전에는 로딩 스피너 표시 */}
      {isLoaded ? props.children : (
        <div className="flex justify-center items-center p-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </NavigationMenuPrimitive.Content>
  );
})
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

/**
 * 네비게이션 메뉴 링크
 * 
 * 메뉴 항목 내의 링크를 나타냅니다.
 */
const NavigationMenuLink = NavigationMenuPrimitive.Link

/**
 * 네비게이션 메뉴 뷰포트
 * 
 * 서브메뉴가 표시되는 영역을 정의합니다.
 */
const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

/**
 * 네비게이션 메뉴 인디케이터
 * 
 * 현재 선택된 메뉴 항목을 표시하는 인디케이터입니다.
 */
const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

// 모든 컴포넌트 내보내기
export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
