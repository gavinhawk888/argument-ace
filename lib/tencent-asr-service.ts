// tencent-asr-service.ts
// 说明：腾讯云实时语音识别服务 - 基于官方文档 https://cloud.tencent.com/document/api/1093/48982
// 支持中英文和多种中文方言识别

/**
 * 环境变量配置:
 * TENCENT_ASR_APPID - 腾讯云应用ID
 * TENCENT_ASR_SECRET_ID - 腾讯云密钥ID  
 * TENCENT_ASR_SECRET_KEY - 腾讯云密钥
 */

interface TencentAsrResultWord {
  word: string;
  start_time: number;
  end_time: number;
  stable_flag: number;
}

interface TencentAsrResult {
  slice_type: number; // 0: 整个句子的中间结果, 1: 整个句子的最终结果, 2: 一段话的最终结果
  index: number;
  start_time: number; // 相对于音频流开始的毫秒数
  end_time: number; // 相对于音频流开始的毫秒数
  voice_text_str: string;
  word_size: number;
  word_list: TencentAsrResultWord[];
}

export interface TencentAsrResponse {
  code: number; // 0 表示正常
  message: string;
  voice_id: string;
  message_id: string;
  result?: TencentAsrResult;
  final?: number; // 1 表示音频流全部识别结束
}

export interface TencentAsrHandlers {
  onOpen?: (event: Event) => void;
  onMessage?: (response: TencentAsrResponse) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

interface TencentAsrParams {
  appId: string;
  secretId: string;
  secretKey: string;
  engineModelType?: string; // 默认 '16k_zh-PY' 支持中英文+粤语
  voiceFormat?: number; // 默认 1 (pcm)
  needVad?: 0 | 1; // 默认 1 (开启静音检测)
  onHandlers: TencentAsrHandlers;
}

const BASE_URL = "asr.cloud.tencent.com/asr/v2/";

/**
 * 生成腾讯云API签名
 * 基于官方文档的签名算法实现
 */
async function generateSignature(
  params: Record<string, string | number>,
  secretKey: string,
  appId: string,
  domain: string,
  pathPrefix: string
): Promise<string> {
  // 1. 按参数名排序
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  // 2. 构建签名原文
  const stringToSign = `${domain}${pathPrefix}${appId}?${queryString}`;
  console.log('签名原文:', stringToSign);

  // 3. 使用HMAC-SHA1算法计算签名
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(stringToSign);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  // 4. Base64编码
  let binary = '';
  const bytes = new Uint8Array(signatureBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const signatureBase64 = btoa(binary);
  
  console.log('生成的签名:', signatureBase64);
  return signatureBase64; // 注意：返回base64编码的签名，URL编码会在后面处理
}

/**
 * 生成UUID作为voice_id
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class TencentAsrSession {
  private ws: WebSocket | null = null;
  private params: TencentAsrParams;
  private voiceId: string;
  private isConnected: boolean = false;
  private audioQueue: ArrayBuffer[] = [];

  constructor(params: TencentAsrParams) {
    this.params = params;
    this.voiceId = generateUUID(); // 每个会话都需要新的voice_id
  }

  public async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn("WebSocket已经连接");
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const expired = timestamp + 3600; // 签名有效期1小时
    const nonce = Date.now(); // 使用当前毫秒时间戳作为 nonce

    // 构建请求参数，使用16k_zh_large模型
    const queryParams: Record<string, string | number> = {
      engine_model_type: this.params.engineModelType || '16k_zh-PY', // 支持中英文+粤语
      expired: expired,
      needvad: this.params.needVad === undefined ? 1 : this.params.needVad,
      nonce: nonce,
      secretid: this.params.secretId,
      timestamp: timestamp,
      voice_format: this.params.voiceFormat || 1, // PCM 16k
      voice_id: this.voiceId,
    };
    
    const domain = "asr.cloud.tencent.com";
    const pathPrefix = "/asr/v2/";

    // 生成签名
    const signature = await generateSignature(queryParams, this.params.secretKey, this.params.appId, domain, pathPrefix);
    queryParams['signature'] = signature;

    // 构建WebSocket URL，注意对signature进行URL编码
    const urlParams = Object.keys(queryParams)
      .map(key => {
        const value = queryParams[key];
        // 对signature进行URL编码，其他参数保持原样
        if (key === 'signature') {
          return `${key}=${encodeURIComponent(value)}`;
        }
        return `${key}=${value}`;
      })
      .join('&');
    
    const wsUrl = `wss://${domain}${pathPrefix}${this.params.appId}?${urlParams}`;
    console.log('连接URL:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = (event) => {
      console.log("腾讯云ASR WebSocket连接成功");
      this.isConnected = true;
      
      // 连接成功后发送排队的音频数据
      if (this.audioQueue.length > 0) {
        console.log(`发送排队的 ${this.audioQueue.length} 个音频块`);
        this.audioQueue.forEach(audioData => {
          this.sendAudio(audioData);
        });
        this.audioQueue = [];
      }
      
      if (this.params.onHandlers.onOpen) {
        this.params.onHandlers.onOpen(event);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as TencentAsrResponse;
        console.log('收到消息:', data);
        
        if (this.params.onHandlers.onMessage) {
          this.params.onHandlers.onMessage(data);
        }
        
        // 如果是最后一条消息，标记识别结束
        if (data.final === 1) {
          console.log("腾讯云ASR: 识别完成", data);
          this.isConnected = false;
        }
      } catch (error) {
        console.error("解析腾讯云ASR消息出错:", error, event.data);
      }
    };

    this.ws.onerror = (event) => {
      console.error("腾讯云ASR WebSocket错误:", event);
      this.isConnected = false;
      if (this.params.onHandlers.onError) {
        this.params.onHandlers.onError(event);
      }
    };

    this.ws.onclose = (event) => {
      console.log("腾讯云ASR WebSocket关闭:", event.code, event.reason);
      this.isConnected = false;
      if (this.params.onHandlers.onClose) {
        this.params.onHandlers.onClose(event);
      }
      this.ws = null;
    };
  }

  /**
   * 发送音频数据
   * 建议每40ms发送40ms时长的数据包 (16kHz采样率对应1280字节)
   */
  public sendAudio(audioData: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isConnected) {
      this.ws.send(audioData);
    } else if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      // 如果正在连接，将音频数据加入队列
      console.log("WebSocket正在连接，音频数据加入队列");
      this.audioQueue.push(audioData);
    } else {
      console.error("WebSocket未连接，无法发送音频数据");
    }
  }

  /**
   * 发送结束信号
   */
  public end(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const endMessage = JSON.stringify({ type: "end" });
      this.ws.send(endMessage);
      console.log("发送ASR结束信号");
    } else {
      console.warn("WebSocket未连接，无法发送结束信号");
    }
  }

  /**
   * 关闭连接
   */
  public close(): void {
    if (this.ws) {
      this.isConnected = false;
      this.ws.close();
    }
  }

  /**
   * 获取当前会话的voice_id
   */
  public getVoiceId(): string {
    return this.voiceId;
  }

  /**
   * 检查连接状态
   */
  public isReady(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.isConnected;
  }
}

// 使用示例
/*
const session = new TencentAsrSession({
  appId: process.env.TENCENT_ASR_APPID!,
  secretId: process.env.TENCENT_ASR_SECRET_ID!,
  secretKey: process.env.TENCENT_ASR_SECRET_KEY!,
  engineModelType: '16k_zh-PY', // 支持中英文+粤语
  onHandlers: {
    onOpen: () => console.log("连接成功"),
    onMessage: (response) => {
      if (response.result && response.result.voice_text_str) {
        console.log("识别结果:", response.result.voice_text_str);
      }
    },
    onError: (error) => console.error("连接错误:", error),
    onClose: (event) => console.log("连接关闭:", event.code, event.reason)
  }
});

await session.connect();
// 发送音频数据...
session.end();
*/ 