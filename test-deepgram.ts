import 'dotenv/config'
import { createClient } from '@deepgram/sdk';
import fs from 'fs';
import path from 'path';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '你的真实API密钥';

async function testDeepgram() {
  if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === '你的真实API密钥' || DEEPGRAM_API_KEY === 'your_deepgram_api_key_here') {
    console.error('请在.env.local中配置有效的DEEPGRAM_API_KEY');
    return;
  }

  // 你需要准备一段本地音频文件，比如 test.wav 或 test.webm
  const audioPath = path.resolve(__dirname, 'test.wav');
  if (!fs.existsSync(audioPath)) {
    console.error('请将一段测试音频文件命名为 test.wav 放在 project 目录下');
    return;
  }

  const audio = fs.readFileSync(audioPath);
  const deepgram = createClient(DEEPGRAM_API_KEY);

  console.log('准备发送音频，文件大小:', audio.length);

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audio,
      {
        model: 'nova-2',
        language: 'zh-CN',
        smart_format: true,
        punctuate: true,
      }
    );
    if (error) {
      console.error('Deepgram error:', error);
    } else {
      console.log('识别结果:', result.results?.channels[0]?.alternatives[0]?.transcript);
    }
  } catch (err) {
    console.error('API调用异常:', err);
  }
}

testDeepgram(); 