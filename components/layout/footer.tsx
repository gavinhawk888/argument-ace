"use client"

import { useLanguage } from "@/hooks/language-context"
import Link from "next/link"

export default function Footer() {
  const { language } = useLanguage()
  if (!language) return null;

  return (
    <footer className="border-t border-blue-100 py-6 mt-auto bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 版权信息 */}
          <div className="text-sm text-gray-600">
            © 2024 Argument Ace. {language === "chinese" ? "版权所有。" : "All rights reserved."}
          </div>
          
          {/* 链接区域 */}
          <div className="flex items-center gap-6 text-sm">
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {language === "chinese" ? "隐私政策" : "Privacy Policy"}
            </Link>
            <div className="h-4 w-px bg-gray-300"></div>
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {language === "chinese" ? "服务条款" : "Terms of Service"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}