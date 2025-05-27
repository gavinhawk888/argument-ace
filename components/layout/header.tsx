"use client"

import { Settings, Mic, Menu, Info, Mail, Home as HomeIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/hooks/language-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useHasMounted } from "@/hooks/use-has-mounted"
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
}

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const hasMounted = useHasMounted();

  const mainNavLinks: NavLink[] = [
    { href: "/", labelKey: "home", text: "Home", show: pathname !== "/", icon: HomeIcon },
    { href: "/about", labelKey: "about", text: "About", show: pathname !== "/about", icon: Info },
    { href: "/contact", labelKey: "contact", text: "Contact", show: pathname !== "/contact", icon: Mail },
  ];

  const LanguageSwitcher = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center border rounded overflow-hidden", className)}>
      <button
        className={cn(
          "flex-1 px-3 py-1.5 text-sm font-medium transition-colors text-center whitespace-nowrap",
          language === "chinese" 
            ? "bg-blue-50 text-blue-600"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => setLanguage("chinese")}
      >
        中文
      </button>
      <div className="h-5 w-px bg-border" />
      <button
        className={cn(
          "flex-1 px-3 py-1.5 text-sm font-medium transition-colors text-center whitespace-nowrap",
          language === "english" 
            ? "bg-blue-50 text-blue-600"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => setLanguage("english")}
      >
        Eng
      </button>
    </div>
  );

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex-1 flex justify-center md:flex-none md:justify-start">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-blue-500" />
            <Link href="/" className="text-xl font-bold">
              Argument Ace
              {pathname !== "/settings" && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {hasMounted ? (language === "chinese" ? "语音版" : "Voice Edition") : "Voice Edition"}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <nav className="hidden md:flex items-center gap-1">
            {mainNavLinks.map((link) => (
              link.show && (
                <Link key={link.href} href={link.href}>
                  <Button variant="ghost" size="sm">
                    {language === "chinese" ? (link.labelKey === "home" ? "主页" : link.labelKey === "about" ? "关于" : "联系") : link.text}
                  </Button>
                </Link>
              )
            ))}
            {pathname !== "/" && pathname !== "/settings" && pathname !== "/contact" && (
              <Button variant="ghost" size="icon" aria-label={language === "chinese" ? "开始辩论" : "Start Debate"}>
                <Mic className="h-5 w-5" />
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

          <div className="hidden md:flex">
            <LanguageSwitcher />
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
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
                          <SheetClose asChild key={link.href}>
                            <Link href={link.href}>
                              <Button variant="ghost" className="w-full justify-start text-base gap-2">
                                {LinkIcon && <LinkIcon className="h-5 w-5" />}
                                {language === "chinese" ? (link.labelKey === "home" ? "主页" : link.labelKey === "about" ? "关于" : "联系") : link.text}
                              </Button>
                            </Link>
                          </SheetClose>
                        )
                      )
                    })}
                    {pathname !== "/" && pathname !== "/settings" && pathname !== "/contact" && (
                       <SheetClose asChild>
                          <Button variant="ghost" className="w-full justify-start gap-2 text-base">
                            <Mic className="h-5 w-5" />
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
                   <LanguageSwitcher className="w-full"/>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}