"use client"

import { useLanguage } from "@/hooks/language-context"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Shield, Eye, Lock, UserCheck, Database, Globe } from "lucide-react"

export default function PrivacyPage() {
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
              <Shield className="h-4 w-4" />
              {language === "chinese" ? "隐私保护" : "Privacy Protection"}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {language === "chinese" ? "隐私政策" : "Privacy Policy"}
            </h1>
            <p className="text-xl text-gray-600">
              {language === "chinese" 
                ? "我们致力于保护您的隐私和个人信息安全"
                : "We are committed to protecting your privacy and personal information security"
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {language === "chinese" ? "最后更新：2024年12月" : "Last updated: December 2024"}
            </p>
          </div>

          {/* 隐私政策内容 */}
          <div className="space-y-12">
            {/* 概述 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "概述" : "Overview"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "Argument Ace（以下简称\"我们\"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。"
                    : "Argument Ace (hereinafter referred to as 'we') deeply understands the importance of personal information to you and will do our utmost to protect the security and reliability of your personal information. We are committed to maintaining your trust in us and adhering to the following principles to protect your personal information: principle of consistency of rights and responsibilities, principle of clear purpose, principle of choice and consent, principle of minimum necessity, principle of ensuring security, principle of subject participation, principle of openness and transparency."
                  }
                </p>
                <p>
                  {language === "chinese" 
                    ? "本隐私政策适用于您通过网站、移动应用程序或其他方式使用我们的服务。在使用我们的产品或服务前，请您仔细阅读并透彻理解本政策。"
                    : "This privacy policy applies to your use of our services through websites, mobile applications, or other means. Before using our products or services, please read and thoroughly understand this policy."
                  }
                </p>
              </div>
            </section>

            {/* 信息收集 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "我们收集的信息" : "Information We Collect"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === "chinese" ? "1. 语音数据" : "1. Voice Data"}
                  </h3>
                  <p>
                    {language === "chinese" 
                      ? "当您使用我们的语音识别功能时，我们会临时处理您的语音数据以提供AI回应服务。重要说明：我们不会永久存储您的语音数据，所有语音数据在处理完成后会立即删除。"
                      : "When you use our speech recognition feature, we temporarily process your voice data to provide AI response services. Important note: We do not permanently store your voice data, and all voice data is immediately deleted after processing."
                    }
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === "chinese" ? "2. 使用数据" : "2. Usage Data"}
                  </h3>
                  <p>
                    {language === "chinese" 
                      ? "我们可能收集有关您如何使用我们服务的信息，包括访问时间、功能使用频率等统计信息，这些信息用于改善服务质量，不包含任何个人身份信息。"
                      : "We may collect information about how you use our services, including access times, feature usage frequency, and other statistical information. This information is used to improve service quality and does not contain any personally identifiable information."
                    }
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {language === "chinese" ? "3. 技术信息" : "3. Technical Information"}
                  </h3>
                  <p>
                    {language === "chinese" 
                      ? "为了提供更好的服务体验，我们可能收集您的设备类型、操作系统、浏览器类型等技术信息。这些信息仅用于优化服务性能和兼容性。"
                      : "To provide a better service experience, we may collect technical information such as your device type, operating system, and browser type. This information is used solely to optimize service performance and compatibility."
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* 信息使用 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "信息的使用" : "Use of Information"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "我们使用收集的信息仅用于以下目的："
                    : "We use the collected information solely for the following purposes:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    {language === "chinese" 
                      ? "提供语音识别和AI回应服务"
                      : "Providing speech recognition and AI response services"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "改善和优化服务质量"
                      : "Improving and optimizing service quality"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "分析服务使用趋势（匿名统计）"
                      : "Analyzing service usage trends (anonymous statistics)"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "确保服务安全和防止滥用"
                      : "Ensuring service security and preventing abuse"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "遵守法律法规要求"
                      : "Complying with legal and regulatory requirements"
                    }
                  </li>
                </ul>
              </div>
            </section>

            {/* 信息保护 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "信息安全保护" : "Information Security Protection"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "我们采用多层次的安全措施来保护您的信息："
                    : "We employ multi-layered security measures to protect your information:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    {language === "chinese" 
                      ? "数据传输加密：使用HTTPS/TLS协议确保数据传输安全"
                      : "Data transmission encryption: Using HTTPS/TLS protocols to ensure secure data transmission"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "访问控制：严格限制对数据的访问权限"
                      : "Access control: Strictly limiting access permissions to data"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "数据最小化：仅收集和处理必要的数据"
                      : "Data minimization: Only collecting and processing necessary data"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "定期安全审计：定期检查和更新安全措施"
                      : "Regular security audits: Regularly checking and updating security measures"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "即时删除：语音数据处理完成后立即删除"
                      : "Immediate deletion: Voice data is deleted immediately after processing"
                    }
                  </li>
                </ul>
              </div>
            </section>

            {/* 第三方服务 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "第三方服务" : "Third-Party Services"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "我们的服务使用以下第三方技术提供商："
                    : "Our service uses the following third-party technology providers:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Deepgram：</strong>
                    {language === "chinese" 
                      ? "用于语音识别服务，符合企业级安全标准"
                      : "Used for speech recognition services, compliant with enterprise-level security standards"
                    }
                  </li>
                  <li>
                    <strong>Google Gemini：</strong>
                    {language === "chinese" 
                      ? "用于AI内容生成，遵循Google的隐私政策"
                      : "Used for AI content generation, following Google's privacy policy"
                    }
                  </li>
                </ul>
                <p>
                  {language === "chinese" 
                    ? "这些第三方服务提供商都有严格的隐私保护措施，我们仅在必要时与其共享匿名化的数据。"
                    : "These third-party service providers have strict privacy protection measures, and we only share anonymized data with them when necessary."
                  }
                </p>
              </div>
            </section>

            {/* 您的权利 */}
            <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {language === "chinese" ? "您的权利" : "Your Rights"}
                </h2>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "您对自己的个人信息享有以下权利："
                    : "You have the following rights regarding your personal information:"
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    {language === "chinese" 
                      ? "知情权：了解我们如何收集、使用和保护您的信息"
                      : "Right to know: Understanding how we collect, use, and protect your information"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "选择权：您可以选择是否使用我们的服务"
                      : "Right to choose: You can choose whether to use our services"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "查询权：查询我们是否处理了您的个人信息"
                      : "Right to inquiry: Inquiring whether we have processed your personal information"
                    }
                  </li>
                  <li>
                    {language === "chinese" 
                      ? "删除权：要求删除您的个人信息（如适用）"
                      : "Right to deletion: Requesting deletion of your personal information (if applicable)"
                    }
                  </li>
                </ul>
              </div>
            </section>

            {/* 政策更新 */}
            <section className="bg-blue-50/50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {language === "chinese" ? "政策更新" : "Policy Updates"}
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "我们可能会不时更新本隐私政策。当我们对政策做出重大更改时，我们会在网站上发布通知。我们建议您定期查看此页面以了解任何更改。"
                    : "We may update this privacy policy from time to time. When we make significant changes to the policy, we will post a notice on our website. We recommend that you regularly review this page to stay informed of any changes."
                  }
                </p>
              </div>
            </section>

            {/* 联系我们 */}
            <section className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {language === "chinese" ? "联系我们" : "Contact Us"}
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  {language === "chinese" 
                    ? "如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式联系我们："
                    : "If you have any questions, comments, or suggestions about this privacy policy, please contact us through the following means:"
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
                    ? "我们会在收到您的反馈后尽快回复。"
                    : "We will respond to your feedback as soon as possible."
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