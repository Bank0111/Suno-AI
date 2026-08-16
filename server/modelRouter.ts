import { GoogleGenAI } from "@google/genai";

export interface ModelTierConfig {
  tier: "best" | "next_best" | "fast" | "light";
  modelId: string;
  labelTh: string;
}

export interface ModelMeta {
  modelId: string;
  modelTier: "best" | "next_best" | "fast" | "light";
  labelTh: string;
  fallbackUsed: boolean;
  fallbackReason?: "quota" | "unavailable" | null;
  userMessage?: string;
}

// 1. CENTRAL MODEL PRIORITY CONFIGURATION
// Best Quality (gemini-3.1-pro-preview) → Quality High (gemini-3.6-flash) → Fast (gemini-3.1-flash-lite) → Light (gemini-flash-latest)
export const MODEL_PRIORITY: ModelTierConfig[] = [
  {
    tier: "best",
    modelId: "gemini-3.1-pro-preview",
    labelTh: "รุ่นคุณภาพสูงสุด",
  },
  {
    tier: "next_best",
    modelId: "gemini-3.6-flash",
    labelTh: "รุ่นคุณภาพสูง",
  },
  {
    tier: "fast",
    modelId: "gemini-3.1-flash-lite",
    labelTh: "รุ่นความเร็วสูง",
  },
  {
    tier: "light",
    modelId: "gemini-flash-latest",
    labelTh: "รุ่นสำรอง",
  },
];

export function isQuotaOrAvailabilityError(err: any): { isQuota: boolean; isUnavailable: boolean } {
  const msg = (err?.message || String(err)).toUpperCase();
  const isQuota =
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("RATE_LIMIT") ||
    msg.includes("QUOTA") ||
    msg.includes("LIMIT EXCEEDED") ||
    msg.includes("EXCEEDED");

  const isUnavailable =
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("HIGH DEMAND") ||
    msg.includes("OVERLOADED") ||
    msg.includes("CAPACITY") ||
    msg.includes("TEMPORARILY");

  return { isQuota, isUnavailable };
}

export function isInvalidApiKeyError(err: any): boolean {
  const msg = (err?.message || String(err)).toUpperCase();
  return (
    msg.includes("API_KEY_INVALID") ||
    msg.includes("INVALID API KEY") ||
    msg.includes("API KEY NOT VALID") ||
    msg.includes("API_KEY_SERVICE_BLOCKED")
  );
}

export async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ response: any; modelMeta: ModelMeta }> {
  let lastError: any = null;

  for (let i = 0; i < MODEL_PRIORITY.length; i++) {
    const tierConfig = MODEL_PRIORITY[i];
    try {
      console.log(`[ModelRouter] Executing with priority model [${i + 1}/${MODEL_PRIORITY.length}]: ${tierConfig.modelId} (${tierConfig.labelTh})`);
      
      const response = await ai.models.generateContent({
        model: tierConfig.modelId,
        contents: params.contents,
        config: params.config,
      });

      const fallbackUsed = i > 0;
      let userMessage = "";

      if (!fallbackUsed) {
        userMessage = "ใช้ AI รุ่นคุณภาพสูงสุด";
      } else if (i === 1) {
        userMessage = "ขณะนี้ AI รุ่นคุณภาพสูงสุดไม่พร้อมใช้งาน ระบบกำลังเปลี่ยนไปใช้รุ่นถัดไปโดยอัตโนมัติ";
      } else if (i === 2) {
        userMessage = "⚠️ โควต้าของ AI รุ่นนี้ถูกใช้ครบแล้ว กำลังเปลี่ยนไปใช้รุ่นถัดไปโดยอัตโนมัติ";
      } else {
        userMessage = "ℹ️ ขณะนี้กำลังใช้ AI รุ่นสำรอง คุณยังสามารถใช้งานระบบแต่งเพลงได้ตามปกติ";
      }

      const modelMeta: ModelMeta = {
        modelId: tierConfig.modelId,
        modelTier: tierConfig.tier,
        labelTh: tierConfig.labelTh,
        fallbackUsed,
        fallbackReason: fallbackUsed ? "quota" : null,
        userMessage,
      };

      return { response, modelMeta };
    } catch (err: any) {
      lastError = err;
      const rawMsg = err?.message || String(err);

      // Halt only if the API key itself is explicitly invalid across all calls
      if (isInvalidApiKeyError(err)) {
        console.error(`[ModelRouter] Invalid API key error detected. Halting model fallback loop.`);
        throw new Error("ไม่สามารถใช้ Gemini API Key นี้ได้ กรุณาตรวจสอบ API Key");
      }

      const { isQuota, isUnavailable } = isQuotaOrAvailabilityError(err);
      if (isQuota) {
        console.info(`[ModelRouter] Model ${tierConfig.modelId} hit quota limit. Falling back to next tier.`);
      } else if (isUnavailable) {
        console.info(`[ModelRouter] Model ${tierConfig.modelId} temporarily unavailable. Falling back to next tier.`);
      } else {
        console.info(`[ModelRouter] Model ${tierConfig.modelId} encountered error (${rawMsg}). Falling back to next tier.`);
      }

      continue;
    }
  }

  console.error("[ModelRouter] All model tiers exhausted:", lastError?.message || lastError);
  
  const lastMsg = (lastError?.message || String(lastError)).toUpperCase();
  if (lastMsg.includes("QUOTA") || lastMsg.includes("RESOURCE_EXHAUSTED") || lastMsg.includes("429")) {
    throw new Error("โควต้าของ AI ทุกรุ่นถูกใช้ครบแล้วในขณะนี้ กรุณารอประมาณ 1 นาทีแล้วลองใหม่อีกครั้ง");
  }

  throw new Error("ไม่สามารถเรียกใช้ AI ได้ในขณะนี้ กรุณาตรวจสอบ Gemini API Key หรือโควต้าของคุณแล้วลองใหม่อีกครั้ง");
}
