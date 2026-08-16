import { getStoredApiKey } from '../utils/storage';

export async function fetchGeminiApi<T>(
  endpoint: string,
  bodyData?: Record<string, any>
): Promise<T> {
  const apiKey = getStoredApiKey() || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['x-gemini-api-key'] = apiKey;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: bodyData ? JSON.stringify(bodyData) : JSON.stringify({}),
  });

  const responseText = await response.text();
  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch (_parseErr) {
    if (!response.ok) {
      throw new Error(`API Error (${response.status}): ไม่สามารถเชื่อมต่อกับบริการ API ได้ในขณะนี้`);
    }
    throw new Error('รูปแบบข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง');
  }

  if (!response.ok) {
    let rawError = data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Gemini API';

    if (rawError === 'GEMINI_API_KEY_REQUIRED' || response.status === 401) {
      throw new Error('กรุณาเชื่อมต่อ Gemini API Key ที่ STEP 01');
    }

    let errorMessage = '';

    if (typeof rawError === 'string') {
      try {
        const parsed = JSON.parse(rawError);
        errorMessage = parsed.error?.message || parsed.message || rawError;
      } catch (_) {
        errorMessage = rawError;
      }
    } else if (typeof rawError === 'object' && rawError !== null) {
      errorMessage = rawError.message || JSON.stringify(rawError);
    } else {
      errorMessage = String(rawError);
    }

    if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
      errorMessage = 'โมเดล AI กำลังมีผู้ใช้งานจำนวนมากในขณะนี้ กรุณากดลองใหม่อีกครั้งในอีกสักครู่';
    }

    throw new Error(errorMessage);
  }

  return data as T;
}
