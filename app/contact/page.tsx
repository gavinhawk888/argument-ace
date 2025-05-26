"use client"

import { useLocalStorage } from "@/hooks/use-local-storage"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast'

export default function ContactPage() {
  const [language] = useLocalStorage<string>("language", "english")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate form submission
    toast({
      title: language === "chinese" ? "消息已发送" : "Message Sent",
      description: language === "chinese" 
        ? "感谢您的反馈，我们会尽快回复您。" 
        : "Thank you for your feedback. We'll get back to you soon.",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-8 flex-1">
        <h1 className="mb-6 text-3xl font-bold">
          {language === "chinese" ? "联系我们" : "Contact Us"}
        </h1>

        <p className="mb-8 text-lg">
          {language === "chinese" 
            ? "有问题或建议？请填写下面的表格，我们会尽快回复您。" 
            : "Have a question or suggestion? Fill out the form below and we'll get back to you as soon as possible."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              {language === "chinese" ? "姓名" : "Name"}
            </label>
            <Input 
              id="name" 
              placeholder={language === "chinese" ? "请输入您的姓名" : "Enter your name"} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              {language === "chinese" ? "电子邮箱" : "Email"}
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder={language === "chinese" ? "请输入您的电子邮箱" : "Enter your email"} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium">
              {language === "chinese" ? "消息" : "Message"}
            </label>
            <Textarea 
              id="message" 
              rows={5} 
              placeholder={language === "chinese" ? "请输入您的消息" : "Enter your message"} 
              required 
            />
          </div>

          <Button type="submit" className="w-full">
            {language === "chinese" ? "发送消息" : "Send Message"}
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  )
}