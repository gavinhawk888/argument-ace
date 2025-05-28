"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useLanguage } from "@/hooks/language-context"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useHasMounted } from "@/hooks/use-has-mounted"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage()
  const hasMounted = useHasMounted()
  if (!language) return null;
  const [version] = useState("1.0.0")

  // Handle language toggle
  const handleLanguageChange = (newLanguage: string) => {
    if (newLanguage === "chinese" || newLanguage === "english") {
      setLanguage(newLanguage)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto max-w-xl p-4 flex-1">
        <h1 className="mb-8 text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          {language === "chinese" ? "设置" : "Settings"}
        </h1>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {language === "chinese" ? "语言" : "Language"}
          </h2>

          <div className="flex gap-3 max-w-sm">
            <Button
              variant={language === "english" ? "default" : "outline"}
              className={cn(
                "flex-1 justify-center h-12 transition-all duration-300 font-medium",
                language === "english" 
                  ? "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg"
                  : "border-sky-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-sky-300"
              )}
              onClick={() => handleLanguageChange("english")}
            >
              Eng
            </Button>
            <Button
              variant={language === "chinese" ? "default" : "outline"}
              className={cn(
                "flex-1 justify-center h-12 transition-all duration-300 font-medium",
                language === "chinese" 
                  ? "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg"
                  : "border-sky-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-sky-300"
              )}
              onClick={() => handleLanguageChange("chinese")}
            >
              中文
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {language === "chinese" ? "帮助" : "Help"}
          </h2>

          <Card className="border-sky-100 hover:border-sky-200 transition-colors">
            <CardContent className="p-0">
              <a 
                href="mailto:gavinhawk888@gmail.com?subject=Argument Ace - 反馈&body=反馈内容：%0A%0A使用场景：%0A%0A建议改进：%0A%0A"
                className="block"
              >
                <Button variant="ghost" className="flex w-full justify-between p-4 h-auto hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                  <span>{language === "chinese" ? "反馈" : "Feedback"}</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </a>
              <Separator className="bg-sky-100" />
              <a 
                href="mailto:gavinhawk888@gmail.com?subject=Argument Ace - 帮助请求&body=遇到的问题：%0A%0A详细描述：%0A%0A"
                className="block"
              >
                <Button variant="ghost" className="flex w-full justify-between p-4 h-auto hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                  <span>{hasMounted ? (language === "chinese" ? "帮助中心" : "Help Center") : "Help Center"}</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {hasMounted ? (language === "chinese" ? "关于" : "About") : "About"}
          </h2>

          <Card className="border-sky-100 hover:border-sky-200 transition-colors">
            <CardContent className="p-0">
              <div className="flex justify-between p-4 text-gray-700">
                <span>{hasMounted ? (language === "chinese" ? "版本" : "Version") : "Version"}</span>
                <span className="text-blue-600 font-medium">{version}</span>
              </div>
              <Separator className="bg-sky-100" />
              <Link href="/terms" className="block">
                <Button variant="ghost" className="flex w-full justify-between p-4 h-auto hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                  <span>{hasMounted ? (language === "chinese" ? "服务条款" : "Terms of Service") : "Terms of Service"}</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Separator className="bg-sky-100" />
              <Link href="/privacy" className="block">
                <Button variant="ghost" className="flex w-full justify-between p-4 h-auto hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                  <span>{hasMounted ? (language === "chinese" ? "隐私政策" : "Privacy Policy") : "Privacy Policy"}</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}