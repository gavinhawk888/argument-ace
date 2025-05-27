"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize state with initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    // 初始化时同步本地存储
    const item = window.localStorage.getItem(key)
    if (item) {
      try {
        setStoredValue(JSON.parse(item))
      } catch {
        setStoredValue(initialValue)
      }
    }
    // 监听 storage 事件
    function handleStorage(event: StorageEvent) {
      if (event.key === key) {
        setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue)
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [key, initialValue])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    setStoredValue(value)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value))
      // 主动广播 storage 事件，确保同一页面所有 hook 都响应
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }))
    }
  }

  return [storedValue, setValue]
}