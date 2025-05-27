"use client"

import { Settings, Mic } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/hooks/language-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useHasMounted } from "@/hooks/use-has-mounted"

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const hasMounted = useHasMounted();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
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
        
        <div className="flex items-center gap-2">
          {pathname !== "/" && (
            <Link href="/">
              <Button variant="ghost" size="sm">
                {language === "chinese" ? "主页" : "Home"}
              </Button>
            </Link>
          )}
          {pathname !== "/about" && (
            <Link href="/about">
              <Button variant="ghost" size="sm">
                {language === "chinese" ? "关于" : "About"}
              </Button>
            </Link>
          )}
          {pathname !== "/contact" && (
            <Link href="/contact">
              <Button variant="ghost" size="sm">
                {language === "chinese" ? "联系" : "Contact"}
              </Button>
            </Link>
          )}
          {pathname !== "/" && pathname !== "/settings" && (
            <Button variant="ghost" size="icon">
              <Mic className="h-5 w-5" />
            </Button>
          )}
          {pathname !== "/settings" && (
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Avatar className={cn(pathname === "/settings" ? "block" : "hidden md:block")}>
            <AvatarImage src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" alt="User avatar" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div className="flex items-center border rounded overflow-hidden ml-2">
            <button
              className={cn(
                "px-2 py-1 text-sm font-semibold transition",
                language === "chinese" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600"
              )}
              onClick={() => setLanguage("chinese")}
            >
              中文
            </button>
            <span className="text-gray-300">/</span>
            <button
              className={cn(
                "px-2 py-1 text-sm font-semibold transition",
                language === "english" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600"
              )}
              onClick={() => setLanguage("english")}
            >
              Eng
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}