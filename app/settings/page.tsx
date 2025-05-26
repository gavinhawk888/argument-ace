"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [language, setLanguage] = useLocalStorage<string>("language", "english")
  const [version] = useState("1.0.0")

  // Handle language toggle
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto max-w-xl p-4 flex-1">
        <h1 className="mb-8 text-3xl font-bold">
          {language === "chinese" ? "设置" : "Settings"}
        </h1>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            {language === "chinese" ? "语言" : "Language"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={language === "english" ? "default" : "outline"}
              className="justify-center h-16 w-full"
              onClick={() => handleLanguageChange("english")}
            >
              English
            </Button>
            <Button
              variant={language === "chinese" ? "default" : "outline"}
              className="justify-center h-16 w-full"
              onClick={() => handleLanguageChange("chinese")}
            >
              Chinese
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            {language === "chinese" ? "帮助" : "Help"}
          </h2>

          <Card>
            <CardContent className="p-0">
              <Button variant="ghost" className="flex w-full justify-between p-4 h-auto">
                <span>{language === "chinese" ? "反馈" : "Feedback"}</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Separator />
              <Button variant="ghost" className="flex w-full justify-between p-4 h-auto">
                <span>{language === "chinese" ? "帮助中心" : "Help Center"}</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            {language === "chinese" ? "关于" : "About"}
          </h2>

          <Card>
            <CardContent className="p-0">
              <div className="flex justify-between p-4">
                <span>{language === "chinese" ? "版本" : "Version"}</span>
                <span>{version}</span>
              </div>
              <Separator />
              <Button variant="ghost" className="flex w-full justify-between p-4 h-auto">
                <span>{language === "chinese" ? "服务条款" : "Terms of Service"}</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Separator />
              <Button variant="ghost" className="flex w-full justify-between p-4 h-auto">
                <span>{language === "chinese" ? "隐私政策" : "Privacy Policy"}</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}