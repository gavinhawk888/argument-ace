"use client"

import { useLanguage } from "@/hooks/language-context"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { FileText, Users, AlertTriangle, Scale, Gavel, Clock } from "lucide-react"

export default function TermsPage() {
  const { language } = useLanguage()
  if (!language) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100/60 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FileText className="h-4 w-4" />
              {language === "chinese" ? "服务协议" : "Service Agreement"}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {language === "chinese" ? "服务条款" : "Terms of Service"}
            </h1>
            <p className="text-xl text-gray-600">
              {language === "chinese" 
                ? "使用我们的服务即表示您同意遵守以下条款和条件"
                : "By using our services, you agree to comply with the following terms and conditions"
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {language === "chinese" ? "最后更新：2024年12月" : "Last updated: December 2024"}
            </p>
          </div>

          {/* 服务条款内容 */}
          <div className="space-y-12">
            {/* 接受条款 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Scale className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "接受条款" : "Acceptance of Terms"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "通过访问和使用 Argument Ace 服务，您确认您已阅读、理解并同意受本服务条款的约束。如果您不同意这些条款，请不要使用我们的服务。"
                    : "By accessing and using Argument Ace services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
                  }
                </p>
                <p>
                  {language === "chinese" 
                    ? "我们保留随时修改这些条款的权利。任何修改将在发布后立即生效。您继续使用服务将构成对修订条款的接受。"
                    : "We reserve the right to modify these terms at any time. Any modifications will be effective immediately upon posting. Your continued use of the service will constitute acceptance of the revised terms."
                  }
                </p>
              </div>
            </section>

            {/* 服务描述 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "服务描述" : "Service Description"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === "chinese" ? "1. 服务内容" : "1. Service Content"}
                  </h3>
                  <p>
                    {language === "chinese" 
                      ? "Argument Ace 是一个基于人工智能的语音辩论助手服务，提供语音识别、智能回应生成等功能。我们的服务旨在帮助用户提升辩论和沟通技巧。"
                      : "Argument Ace is an artificial intelligence-based voice debate assistant service that provides speech recognition, intelligent response generation, and other features. Our service aims to help users improve their debate and communication skills."
                    }
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === "chinese" ? "2. 服务可用性" : "2. Service Availability"}
                  </h3>
                  <p>
                    {language === "chinese" 
                      ? "我们努力保持服务的可用性，但不保证服务将不间断或无错误。我们可能会因维护、更新或其他原因临时暂停服务。"
                      : "We strive to maintain service availability, but do not guarantee that the service will be uninterrupted or error-free. We may temporarily suspend service for maintenance, updates, or other reasons."
                    }
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === "chinese" ? "3. 服务改进" : "3. Service Improvement"}
                  </h3>
                  <p>
                    {language === "chinese" 
                      ? "我们保留随时修改、更新或停止全部或部分服务的权利，恕不另行通知。我们将努力提前通知重大变更。"
                      : "We reserve the right to modify, update, or discontinue all or part of the service at any time without notice. We will strive to provide advance notice of significant changes."
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* 用户责任 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "用户责任与行为准则" : "User Responsibilities and Code of Conduct"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "使用我们的服务时，您同意："
                    : "When using our services, you agree to:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    {language === "chinese" 
                      ? "仅将服务用于合法目的，不进行任何违法或有害活动"
                      : "Use the service only for lawful purposes and not engage in any illegal or harmful activities"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "不上传、传输或分享任何攻击性、诽谤性、仇恨性或非法内容"
                      : "Not upload, transmit, or share any offensive, defamatory, hateful, or illegal content"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "不尝试破坏、干扰或未授权访问我们的系统或服务"
                      : "Not attempt to damage, interfere with, or gain unauthorized access to our systems or services"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "不滥用服务或进行可能影响其他用户体验的行为"
                      : "Not abuse the service or engage in behavior that may affect other users' experience"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "尊重他人的权利和隐私"
                      : "Respect the rights and privacy of others"
                    }
                  </li>
                </ul>
              </div>
            </section>

            {/* 知识产权 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Gavel className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "知识产权" : "Intellectual Property"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "Argument Ace 服务及其所有内容、功能和技术均为我们或我们的许可方所有，受版权、商标和其他知识产权法律保护。"
                    : "The Argument Ace service and all its content, features, and technology are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws."
                  }
                </p>
                <p>
                  {language === "chinese" 
                    ? "您可以使用我们的服务进行个人、非商业用途。未经我们明确书面许可，您不得复制、修改、分发、销售或出租我们服务的任何部分。"
                    : "You may use our service for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or rent any part of our service without our express written permission."
                  }
                </p>
              </div>
            </section>

            {/* 免责声明 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "免责声明" : "Disclaimer"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "我们的服务按\"现状\"提供，不提供任何明示或暗示的保证，包括但不限于："
                    : "Our service is provided \"as is\" without any express or implied warranties, including but not limited to:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    {language === "chinese" 
                      ? "服务的准确性、可靠性或完整性"
                      : "The accuracy, reliability, or completeness of the service"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "AI生成内容的适用性或准确性"
                      : "The suitability or accuracy of AI-generated content"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "服务不会中断或无错误"
                      : "That the service will be uninterrupted or error-free"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "服务满足您的特定需求"
                      : "That the service will meet your specific requirements"
                    }
                  </li>
                </ul>
                <p className="font-semibold text-gray-800">
                  {language === "chinese" 
                    ? "重要提醒：AI生成的内容仅供参考，不应作为专业建议。用户应该独立判断和验证信息的准确性。"
                    : "Important Note: AI-generated content is for reference only and should not be considered professional advice. Users should independently judge and verify the accuracy of information."
                  }
                </p>
              </div>
            </section>

            {/* 责任限制 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Scale className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "责任限制" : "Limitation of Liability"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "在适用法律允许的最大范围内，我们不对以下情况承担责任："
                    : "To the maximum extent permitted by applicable law, we shall not be liable for:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    {language === "chinese" 
                      ? "因使用或无法使用服务而导致的任何直接、间接、偶然或后果性损害"
                      : "Any direct, indirect, incidental, or consequential damages arising from the use or inability to use the service"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "由AI生成内容的使用而产生的任何后果"
                      : "Any consequences arising from the use of AI-generated content"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "数据丢失、业务中断或利润损失"
                      : "Data loss, business interruption, or loss of profits"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "第三方内容或服务造成的损害"
                      : "Damages caused by third-party content or services"
                    }
                  </li>
                </ul>
              </div>
            </section>

            {/* 终止服务 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="h-6 w-6 text-gray-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "服务终止" : "Service Termination"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "我们保留在以下情况下暂停或终止您对服务的访问权限："
                    : "We reserve the right to suspend or terminate your access to the service in the following circumstances:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    {language === "chinese" 
                      ? "违反本服务条款"
                      : "Violation of these Terms of Service"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "从事非法或有害活动"
                      : "Engaging in illegal or harmful activities"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "滥用或误用服务"
                      : "Abuse or misuse of the service"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "出于技术、法律或安全原因"
                      : "For technical, legal, or security reasons"
                    }
                  </li>
                </ul>
              </div>
            </section>

            {/* 适用法律 */}
            <section className="bg-blue-50/50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {language === "chinese" ? "适用法律和争议解决" : "Governing Law and Dispute Resolution"}
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "本服务条款受相关司法管辖区法律管辖。因本条款或服务使用而产生的任何争议应通过友好协商解决。如协商不成，争议应提交至有管辖权的法院解决。"
                    : "These Terms of Service are governed by the laws of the relevant jurisdiction. Any disputes arising from these terms or the use of the service should be resolved through amicable consultation. If consultation fails, disputes should be submitted to a court of competent jurisdiction."
                  }
                </p>
              </div>
            </section>

            {/* 联系信息 */}
            <section className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {language === "chinese" ? "联系我们" : "Contact Us"}
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "如果您对本服务条款有任何疑问或需要澄清，请通过以下方式联系我们："
                    : "If you have any questions about these Terms of Service or need clarification, please contact us through the following means:"
                  }
                </p>
                <p>
                  <strong>{language === "chinese" ? "邮箱：" : "Email: "}</strong>
                  <a href="mailto:gavinhawk888@gmail.com" className="text-blue-600 hover:text-blue-800">
                    gavinhawk888@gmail.com
                  </a>
                </p>
                <p>
                  {language === "chinese" 
                    ? "我们会尽快回复您的咨询。"
                    : "We will respond to your inquiries as soon as possible."
                  }
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 