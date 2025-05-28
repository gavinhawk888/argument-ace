"use client"

import { Settings, Mic, Menu, Zap, HelpCircle, Home as HomeIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/hooks/language-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useHasMounted } from "@/hooks/use-has-mounted"
import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

interface NavLink {
  href: string;
  labelKey: string;
  text: string;
  show: boolean;
  icon?: React.ElementType;
  isScroll?: boolean;
}

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const hasMounted = useHasMounted();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // 监听URL哈希变化，自动定位到对应区域
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#features" || hash === "#faq") {
        setTimeout(() => {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            const headerHeight = 64;
            const elementPosition = element.offsetTop - headerHeight - 20;
            window.scrollTo({
              top: elementPosition,
              behavior: "smooth"
            });
          }
        }, 100);
      }
    };

    // 页面加载时检查哈希
    if (typeof window !== "undefined") {
      handleHashChange();
    }

    // 监听哈希变化
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const scrollToElement = (elementId: string, fromMobile: boolean = false) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerHeight = 64;
      const elementPosition = element.offsetTop - headerHeight - 20;
      
      // 如果是移动端调用，延迟执行以确保Sheet完全关闭
      const delay = fromMobile ? 400 : 0; // 增加移动端延迟
      setTimeout(() => {
        // 确保页面已完全加载和渲染
        if (document.readyState === 'complete') {
          window.scrollTo({
            top: elementPosition,
            behavior: "smooth"
          });
        } else {
          // 如果页面还在加载，等待加载完成
          window.addEventListener('load', () => {
            window.scrollTo({
              top: elementPosition,
              behavior: "smooth"
            });
          }, { once: true });
        }
      }, delay);
    }
  };

  const handleFeaturesClick = (fromMobile: boolean = false) => {
    if (pathname === "/") {
      scrollToElement("features", fromMobile);
    } else {
      window.location.href = "/#features";
    }
  };

  const handleFAQClick = (fromMobile: boolean = false) => {
    if (pathname === "/") {
      scrollToElement("faq", fromMobile);
    } else {
      window.location.href = "/#faq";
    }
  };

  const handleMobileNavClick = (action: string) => {
    // 立即关闭Sheet
    setIsSheetOpen(false);
    
    // 延迟执行滚动操作，确保Sheet完全关闭
    setTimeout(() => {
      if (action === "features") {
        handleFeaturesClick(true);
      } else if (action === "faq") {
        handleFAQClick(true);
      }
    }, 150); // 增加延迟时间，确保动画完成
  };

  const mainNavLinks: NavLink[] = [
    { href: "/", labelKey: "home", text: "Home", show: pathname !== "/", icon: HomeIcon },
    { href: "#features", labelKey: "features", text: "Features", show: true, icon: Zap, isScroll: true },
    { href: "#faq", labelKey: "faq", text: "FAQ", show: true, icon: HelpCircle, isScroll: true },
  ];

  const LanguageSwitcher = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center border border-sky-200 rounded overflow-hidden bg-white flex-shrink-0", className)}>
      <button
        className={cn(
          "px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 text-center whitespace-nowrap min-w-[36px] sm:min-w-[40px]",
          language === "chinese" 
            ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm"
            : "text-sky-600 hover:bg-blue-50 hover:text-blue-600"
        )}
        onClick={() => setLanguage("chinese")}
      >
        中文
      </button>
      <div className="h-5 w-px bg-sky-200" />
      <button
        className={cn(
          "px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 text-center whitespace-nowrap min-w-[36px] sm:min-w-[40px]",
          language === "english" 
            ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm"
            : "text-sky-600 hover:bg-blue-50 hover:text-blue-600"
        )}
        onClick={() => setLanguage("english")}
      >
        Eng
      </button>
    </div>
  );

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 max-w-full">
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
          <Link href="/" className="flex items-center min-w-0">
            <span className="text-lg sm:text-xl font-bold truncate">
              Argument Ace
            </span>
            {pathname !== "/settings" && (
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-sky-500 whitespace-nowrap hidden sm:inline">
                {hasMounted ? (language === "chinese" ? "语音版" : "Voice Edition") : "Voice Edition"}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-x-1 sm:gap-x-2">
          <nav className="hidden md:flex items-center gap-1">
            {mainNavLinks.map((link) => (
              link.show && (
                link.isScroll ? (
                  <Button 
                    key={link.href} 
                    variant="ghost" 
                    size="sm"
                    onClick={() => link.labelKey === "features" ? handleFeaturesClick() : handleFAQClick()}
                  >
                    {language === "chinese" ? (link.labelKey === "home" ? "主页" : link.labelKey === "features" ? "功能特点" : "常见问题") : link.text}
                  </Button>
                ) : (
                  <Link key={link.href} href={link.href}>
                    <Button variant="ghost" size="sm">
                      {language === "chinese" ? (link.labelKey === "home" ? "主页" : link.labelKey === "features" ? "功能特点" : "常见问题") : link.text}
                    </Button>
                  </Link>
                )
              )
            ))}
            {pathname !== "/" && pathname !== "/settings" && pathname !== "/faq" && (
              <Button variant="ghost" size="icon" aria-label={language === "chinese" ? "开始辩论" : "Start Debate"}>
                <Mic className="h-5 w-5 text-blue-500" />
              </Button>
            )}
            {pathname !== "/settings" && (
              <Link href="/settings">
                <Button variant="ghost" size="icon" aria-label={language === "chinese" ? "设置" : "Settings"}>
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </nav>

          <div className="hidden sm:flex">
            <LanguageSwitcher />
          </div>

          <div className="flex sm:hidden">
            <LanguageSwitcher />
          </div>

          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">{language === "chinese" ? "打开菜单" : "Open menu"}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px] flex flex-col p-0">
                <div className="flex-grow overflow-y-auto px-6">
                  <nav className="flex flex-col gap-3 mt-8">
                    {mainNavLinks.map((link) => {
                      const LinkIcon = link.icon;
                      return (
                        link.show && (
                          link.isScroll ? (
                            <Button 
                              key={link.href}
                              variant="ghost" 
                              className="w-full justify-start text-base gap-2"
                              onClick={() => handleMobileNavClick(link.labelKey)}
                            >
                              {LinkIcon && <LinkIcon className="h-5 w-5" />}
                              {language === "chinese" ? (link.labelKey === "home" ? "主页" : link.labelKey === "features" ? "功能特点" : "常见问题") : link.text}
                            </Button>
                          ) : (
                            <SheetClose asChild key={link.href}>
                              <Link href={link.href}>
                                <Button variant="ghost" className="w-full justify-start text-base gap-2">
                                  {LinkIcon && <LinkIcon className="h-5 w-5" />}
                                  {language === "chinese" ? (link.labelKey === "home" ? "主页" : link.labelKey === "features" ? "功能特点" : "常见问题") : link.text}
                                </Button>
                              </Link>
                            </SheetClose>
                          )
                        )
                      )
                    })}
                    {pathname !== "/" && pathname !== "/settings" && pathname !== "/faq" && (
                       <SheetClose asChild>
                          <Button variant="ghost" className="w-full justify-start gap-2 text-base">
                            <Mic className="h-5 w-5 text-blue-500" />
                            {language === "chinese" ? "开始辩论" : "Start Debate"}
                          </Button>
                        </SheetClose>
                    )}
                    {pathname !== "/settings" && (
                      <SheetClose asChild>
                        <Link href="/settings">
                          <Button variant="ghost" className="w-full justify-start gap-2 text-base">
                            <Settings className="h-5 w-5" />
                            {language === "chinese" ? "设置" : "Settings"}
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </nav>
                </div>
                <div className="px-6 pt-4 pb-8 border-t border-border mt-auto">
                   <div className="flex justify-center">
                     <LanguageSwitcher />
                   </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}