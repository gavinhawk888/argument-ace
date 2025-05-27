"use client"

import { useLanguage } from "@/hooks/language-context"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function AboutPage() {
  const { language } = useLanguage()
  if (!language) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-8 flex-1">
        <h1 className="mb-6 text-3xl font-bold">
          {language === "chinese" ? "关于 吵架包赢" : "About Argument Ace"}
        </h1>

        <div className="prose max-w-none">
          {language === "chinese" ? (
            <>
              <p className="text-lg mb-4">
                吵架包赢是一款创新的应用程序，旨在帮助人们在争论中更加自信和有说服力。
              </p>
              
              <p className="mb-4">
                我们都曾经历过这样的情况：当争论正酣，我们突然语塞，无法有效地表达自己的观点。吵架包赢正是为解决这个问题而生的。
              </p>
              
              <p className="mb-4">
                通过先进的语音识别技术，吵架包赢能够捕捉对方的论点，并即时生成精彩的回应。这些回应不仅有力，而且富有说服力，能帮助您在任何辩论中占据上风。
              </p>
              
              <p className="mb-6">
                无论是家庭争论、工作讨论还是朋友间的辩论，吵架包赢都能帮助您表达自己的观点，赢得每一场辩论。
              </p>
              
              <h2 className="text-2xl font-bold mb-4">我们的使命</h2>
              
              <p className="mb-4">
                我们的使命是促进更有建设性的沟通，帮助人们更清晰、更有效地表达自己的观点。虽然应用名为"吵架包赢"，但我们真正的目标是通过提供有建设性的回应，减少情绪化的冲突，促进理性的讨论。
              </p>
            </>
          ) : (
            <>
              <p className="text-lg mb-4">
                Argument Ace is an innovative application designed to help people be more confident and persuasive in arguments.
              </p>
              
              <p className="mb-4">
                We've all been there - in the heat of an argument, we find ourselves at a loss for words, unable to effectively express our point of view. Argument Ace was created to solve this problem.
              </p>
              
              <p className="mb-4">
                Using advanced voice recognition technology, Argument Ace captures the other person's arguments and generates brilliant responses in real-time. These responses are not only powerful but also persuasive, helping you gain the upper hand in any debate.
              </p>
              
              <p className="mb-6">
                Whether it's a family disagreement, a work discussion, or a debate among friends, Argument Ace helps you articulate your viewpoint and win every argument.
              </p>
              
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              
              <p className="mb-4">
                Our mission is to foster more constructive communication by helping people express their viewpoints more clearly and effectively. While the app is named "Argument Ace," our real goal is to reduce emotional conflicts and promote rational discussion by providing constructive responses.
              </p>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}