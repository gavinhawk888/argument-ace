"use client"

import { useLanguage } from "@/hooks/language-context"
// import { useHasMounted } from "@/hooks/use-has-mounted" // No longer needed for this page content
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
// Input, Textarea, useToast are no longer needed as the form is removed.

// vercel debug: 20240527

export default function ContactPage() {
  const { language } = useLanguage()
  // const { toast } = useToast() // toast is no longer needed

  // handleSubmit is no longer needed

  const authorEmail = "gavinhawk888@gmail.com";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-8 flex-1">
        <h1 className="mb-6 text-3xl font-bold">
          {language === "chinese" ? "联系我们" : "Contact Us"}
        </h1>

        {/* Removed introductory paragraph */}

        <div className="space-y-3 text-lg mb-8">
          <p>作者：Gavin Hawk</p>
          <p>邮箱：{authorEmail}</p>
          <p>  X   ：@gavinhuang888</p>
        </div>

        {/* Removed form */}

        <a 
          href={`mailto:${authorEmail}`}
          className="w-full md:w-auto"
        >
          <Button className="w-full md:w-auto">
            {language === "chinese" ? "发送邮件" : "Send Email"}
          </Button>
        </a>
      </main>

      <Footer />
    </div>
  )
}