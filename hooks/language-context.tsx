"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "chinese" | "english"

interface LanguageContextProps {
  language: Language | undefined
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language | undefined>(undefined)

  useEffect(() => {
    // 只在客户端初始化
    const stored = (localStorage.getItem("language") as Language) || "english"
    setLanguageState(stored)
  }, [])

  useEffect(() => {
    if (language) localStorage.setItem("language", language)
  }, [language])

  const setLanguage = (lang: Language) => setLanguageState(lang)

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
} 