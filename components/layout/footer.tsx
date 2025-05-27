"use client"

import { useLanguage } from "@/hooks/language-context"

export default function Footer() {
  const { language } = useLanguage()
  if (!language) return null;

  return (
    <footer className="border-t py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500">
        © 2024 Argument Ace. {language === "chinese" ? "版权所有。" : "All rights reserved."}
      </div>
    </footer>
  )
}