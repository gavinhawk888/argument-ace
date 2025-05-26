"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize state with initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    // Get from local storage by key
    const item = window.localStorage.getItem(key)
    // Parse stored json or return initialValue
    if (item) {
      try {
        setStoredValue(JSON.parse(item))
      } catch (error) {
        console.log(error)
        setStoredValue(initialValue)
      }
    }
  }, [key, initialValue])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value)
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}