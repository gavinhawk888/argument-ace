import 'dotenv/config'
import fs from 'fs'
import path from 'path'

/**
 * Deepgram 环境配置验证脚本
 * 用于确保测试环境正确配置
 */

interface ValidationResult {
  check: string
  status: 'pass' | 'fail' | 'warning'
  message: string
}

class DeepgramSetupValidator {
  private results: ValidationResult[] = []

  // 添加验证结果
  private addResult(check: string, status: 'pass' | 'fail' | 'warning', message: string) {
    this.results.push({ check, status, message })
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
    console.log(`${icon} ${check}: ${message}`)
  }

  // 检查API密钥配置
  checkApiKey() {
    console.log('\n🔑 检查 API 密钥配置...')
    
    const apiKey = process.env.DEEPGRAM_API_KEY
    
    if (!apiKey) {
      this.addResult(
        'API密钥存在性',
        'fail',
        'DEEPGRAM_API_KEY 未在环境变量中配置'
      )
      return false
    }

    if (apiKey === 'your_deepgram_api_key_here' || apiKey === '你的真实API密钥') {
      this.addResult(
        'API密钥有效性',
        'fail',
        'DEEPGRAM_API_KEY 为占位符，请配置真实的API密钥'
      )
      return false
    }

    if (apiKey.length < 20) {
      this.addResult(
        'API密钥格式',
        'warning',
        'API密钥长度似乎太短，请确认是否正确'
      )
    } else {
      this.addResult(
        'API密钥格式',
        'pass',
        '密钥格式看起来正确'
      )
    }

    this.addResult(
      'API密钥配置',
      'pass',
      `已配置 (长度: ${apiKey.length})`
    )
    return true
  }

  // 检查测试音频文件
  checkTestAudioFile() {
    console.log('\n🎵 检查测试音频文件...')
    
    const audioFiles = ['test3.wav', 'test.wav', 'test.webm', 'test.mp3']
    let foundFile = null

    for (const filename of audioFiles) {
      const filePath = path.resolve(process.cwd(), filename)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        foundFile = { filename, size: stats.size, path: filePath }
        break
      }
    }

    if (!foundFile) {
      this.addResult(
        '测试音频文件',
        'fail',
        '未找到测试音频文件 (test3.wav, test.wav, test.webm, test.mp3)'
      )
      return false
    }

    this.addResult(
      '测试音频文件',
      'pass',
      `找到 ${foundFile.filename} (${(foundFile.size / 1024).toFixed(1)} KB)`
    )

    if (foundFile.size < 1000) {
      this.addResult(
        '音频文件大小',
        'warning',
        '文件大小很小，可能不包含足够的音频数据'
      )
    } else if (foundFile.size > 10 * 1024 * 1024) {
      this.addResult(
        '音频文件大小',
        'warning',
        '文件很大，可能影响测试性能'
      )
    } else {
      this.addResult(
        '音频文件大小',
        'pass',
        '文件大小合适'
      )
    }

    return true
  }

  // 检查依赖
  checkDependencies() {
    console.log('\n📦 检查项目依赖...')
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      
      if (packageJson.dependencies['@deepgram/sdk']) {
        this.addResult(
          'Deepgram SDK',
          'pass',
          `已安装 v${packageJson.dependencies['@deepgram/sdk']}`
        )
      } else {
        this.addResult(
          'Deepgram SDK',
          'fail',
          '未安装 @deepgram/sdk'
        )
        return false
      }

      if (packageJson.devDependencies?.['tsx'] || packageJson.dependencies?.['tsx']) {
        this.addResult(
          'TypeScript 运行器',
          'pass',
          'tsx 已安装'
        )
      } else {
        this.addResult(
          'TypeScript 运行器',
          'warning',
          'tsx 未安装，可能影响测试运行'
        )
      }

    } catch (error) {
      this.addResult(
        '依赖检查',
        'fail',
        `无法读取 package.json: ${error}`
      )
      return false
    }

    return true
  }

  // 检查网络连接
  async checkNetworkConnectivity() {
    console.log('\n🌐 检查网络连接...')
    
    try {
      // 使用AbortController实现超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('https://api.deepgram.com', {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      this.addResult(
        'Deepgram API 可达性',
        'pass',
        `API 端点可访问 (状态: ${response.status})`
      )
      return true
    } catch (error) {
      this.addResult(
        'Deepgram API 可达性',
        'fail',
        `无法连接到 Deepgram API: ${error instanceof Error ? error.message : error}`
      )
      return false
    }
  }

  // 检查服务文件
  checkServiceFiles() {
    console.log('\n📁 检查服务文件...')
    
    const requiredFiles = [
      'lib/deepgram-service.ts',
      'app/api/speech/route.ts',
      'test-deepgram-unit.ts'
    ]

    let allFilesExist = true

    for (const filePath of requiredFiles) {
      if (fs.existsSync(filePath)) {
        this.addResult(
          path.basename(filePath),
          'pass',
          '文件存在'
        )
      } else {
        this.addResult(
          path.basename(filePath),
          'fail',
          '文件不存在'
        )
        allFilesExist = false
      }
    }

    return allFilesExist
  }

  // 生成验证报告
  generateReport() {
    console.log('\n📊 验证报告')
    console.log('=' .repeat(50))
    
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const warnings = this.results.filter(r => r.status === 'warning').length
    const total = this.results.length

    console.log(`📈 检查结果: ${passed} 通过, ${failed} 失败, ${warnings} 警告`)
    
    if (failed === 0) {
      console.log('\n🎉 环境配置正确！可以运行 Deepgram 测试。')
      console.log('\n🚀 运行测试命令:')
      console.log('npm run test:deepgram-unit')
      console.log('# 或者')
      console.log('npx tsx test-deepgram-unit.ts')
    } else {
      console.log('\n⚠️ 环境配置存在问题，需要修复以下项目:')
      this.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(`  ❌ ${result.check}: ${result.message}`)
        })
      
      console.log('\n💡 修复建议:')
      if (this.results.some(r => r.check.includes('API密钥') && r.status === 'fail')) {
        console.log('1. 在 .env.local 中配置有效的 DEEPGRAM_API_KEY')
        console.log('2. 获取API密钥: https://console.deepgram.com/')
      }
      if (this.results.some(r => r.check.includes('音频文件') && r.status === 'fail')) {
        console.log('3. 将测试音频文件 test3.wav 放在项目根目录')
      }
      if (this.results.some(r => r.check.includes('SDK') && r.status === 'fail')) {
        console.log('4. 安装 Deepgram SDK: npm install @deepgram/sdk')
      }
    }

    if (warnings > 0) {
      console.log('\n⚠️ 警告项目:')
      this.results
        .filter(r => r.status === 'warning')
        .forEach(result => {
          console.log(`  ⚠️ ${result.check}: ${result.message}`)
        })
    }
  }

  // 运行所有验证
  async runAllChecks() {
    console.log('🔍 Deepgram 环境配置验证')
    console.log('=' .repeat(50))
    
    this.checkApiKey()
    this.checkTestAudioFile()
    this.checkDependencies()
    this.checkServiceFiles()
    await this.checkNetworkConnectivity()
    
    this.generateReport()
  }
}

// 主函数
async function main() {
  const validator = new DeepgramSetupValidator()
  await validator.runAllChecks()
}

// 运行验证
if (require.main === module) {
  main().catch(error => {
    console.error('💥 验证过程异常:', error)
    process.exit(1)
  })
}

 