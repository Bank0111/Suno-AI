import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { SongInput } from "../src/types/songwriting";
import { callGeminiWithFallback } from "./modelRouter";
import {
  getVocabularyContext,
  formatVocabularyPromptGuidance,
  validateSongVocabulary,
  formatVocabularySummary,
} from "./vocabulary";
import {
  refineSongLyricPhrasing,
  validateLyricPhrasing,
} from "./phrasing";
import {
  runSongwritingCriticAndRewrite,
  buildSongBlueprint,
  formatBlueprintForPrompt,
  buildHookCandidates,
  formatHookCraftForPrompt,
  listAllRoles,
  getRoleById,
  resolveSongwriterRole,
} from "./songwriting";
import {
  validateRoleProfiles,
  executeRoleResolutionTests,
} from "./training/benchmark/roleValidation";
import {
  buildCreativeContext,
  getPovLabel,
  formatReferenceGuidance,
  logReferenceDetails,
  resolveTargetContentLanguage,
} from "./creativeContext";
import {
  extractYouTubeVideoId,
  getCanonicalYouTubeUrl,
  resolveYouTubeMetadata,
} from "./youtubeUtils";

dotenv.config();

export function getGeminiClient(req: express.Request): GoogleGenAI {
  const userKey = req.headers["x-gemini-api-key"] as string | undefined;
  const apiKey = userKey && userKey.trim();

  if (!apiKey) {
    const error: any = new Error("GEMINI_API_KEY_REQUIRED");
    error.status = 401;
    error.code = "GEMINI_API_KEY_REQUIRED";
    throw error;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function sendApiError(res: express.Response, err: any, defaultMessage: string = "Internal server error") {
  if (err.message === "GEMINI_API_KEY_REQUIRED" || err.code === "GEMINI_API_KEY_REQUIRED" || err.status === 401) {
    return res.status(401).json({
      ok: false,
      error: "GEMINI_API_KEY_REQUIRED",
    });
  }
  return res.status(err.status || 500).json({
    ok: false,
    error: err.message || defaultMessage,
  });
}//

// ฟังก์ชันดึงข้อมูลศิลปินและเพศจาก MusicBrainz
async function fetchArtistGenderFromMusicBrainz(artistName: string): Promise<string | null> {
  if (!artistName || artistName.trim() === '') return null;
  try {
    const cleanArtist = encodeURIComponent(artistName.trim());
    const res = await fetch(`https://musicbrainz.org/ws/2/artist/?query=artist:${cleanArtist}&fmt=json`, {
      headers: {
        'User-Agent': 'IntelligentSongWriter/1.0.0 ( contact@example.com )'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const artist = data.artists?.[0];
    if (!artist) return null;

    let info = `ศิลปิน: ${artist.name}`;
    if (artist.type) info += ` (${artist.type})`;
    if (artist.gender) info += `, เพศศิลปินตามฐานข้อมูล: ${artist.gender}`;
    return info;
  } catch (error) {
    console.warn('MusicBrainz lookup skipped:', error);
    return null;
  }
}

export function createApiRouter(): express.Router {
  const router = express.Router();

  // Health check
  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Role Engine: List all available songwriter roles
  router.get("/songwriting/roles", (_req, res) => {
    try {
      const roles = listAllRoles();
      res.json({ ok: true, roles });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || "Failed to list songwriter roles" });
    }
  });

  // Role Engine: Resolve appropriate role based on inputs
  router.post("/songwriting/roles/resolve", (req, res) => {
    try {
      const resolved = resolveSongwriterRole(req.body || {});
      res.json({ ok: true, resolved });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || "Failed to resolve songwriter role" });
    }
  });

  // Role Engine: Run automated role profiles validation & resolution benchmark
  router.get("/benchmark/roles", (_req, res) => {
    try {
      const profilesValidation = validateRoleProfiles();
      const resolutionTests = executeRoleResolutionTests();
      res.json({
        ok: true,
        profilesValidation,
        resolutionTests,
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || "Failed to run role benchmarks" });
    }
  });

  // 1. Verify API Key
  router.post("/gemini/verify", async (req, res) => {
    try {
      const ai = getGeminiClient(req);
      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: "Return the exact string 'OK'",
      });

      if (response.text) {
        res.json({ ok: true, _modelMeta: modelMeta });
      } else {
        res.status(400).json({ ok: false, error: "No response received from Gemini" });
      }
    } catch (err: any) {
      console.error("Verify API error:", err.message);
      sendApiError(res, err, "Invalid API key or network error");
    }
  });

  // 2. Random Story Generator
  router.post("/gemini/random-story", async (req, res) => {
    try {
      const { language, customLanguage } = req.body;
      const { targetContentLanguage, languageInstruction, isTargetThai } = resolveTargetContentLanguage({
        language,
        customLanguage,
      });

      const ai = getGeminiClient(req);

      const prompt = isTargetThai
        ? `สร้างเรื่องราว ไอเดีย หรือพล็อตเพลงสั้นๆ ภาษาไทย 1 เรื่องที่มีมิติ ลึกซึ้ง เหมาะนำไปแต่งเนื้อเพลง
ระบุ:
- ฉาก / บรรยากาศ
- ความสัมพันธ์ / ความขัดแย้งของตัวละคร
- อารมณ์ความรู้สึกหลัก
- จุดเปลี่ยนของเรื่องราว
- คติหรือข้อคิด / ภาพจำในใจ

เขียนในรูปแบบย่อหน้าที่อ่านง่าย เป็นธรรมชาติ ไม่ต้องมีหัวข้อย่อยยาวเกินไป ความยาวประมาณ 4-6 ประโยค`
        : `Generate a compelling, deep, and emotionally resonant song story idea/concept in ${targetContentLanguage}.

${languageInstruction}

Include in the story concept:
- Setting & Atmosphere
- Relationship / Conflict of characters
- Core Emotion & Tone
- Turning point or emotional climax
- Memorable imagery or parting thought

Write as a cohesive, natural paragraph (around 4-6 sentences) strictly in ${targetContentLanguage}, ready to be developed into full song lyrics. DO NOT use Thai. Output exclusively in ${targetContentLanguage}.`;

      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: prompt,
      });

      res.json({ story: response.text?.trim() || "", _modelMeta: modelMeta });
    } catch (err: any) {
      console.error("Random story error:", err.message);
      sendApiError(res, err, "Failed to generate random story");
    }
  });

  // 3. Deep Creative Story Analysis Engine
  router.post("/gemini/expand-idea", async (req, res) => {
    try {
      const { story, input: rawInput, language, customLanguage } = req.body;
      const rawStory = (story || rawInput?.story || "").trim();

      if (!rawStory) {
        res.status(400).json({ error: "Story text is required" });
        return;
      }

      const input: SongInput = rawInput
        ? { ...rawInput, story: rawStory }
        : {
            story: rawStory,
            genres: req.body.genres || ["Pop"],
            customGenre: req.body.customGenre,
            moods: req.body.moods || ["เศร้า"],
            customMood: req.body.customMood,
            songwritingStyle: req.body.songwritingStyle || null,
            customSongwritingStyle: req.body.customSongwritingStyle,
            language: language || req.body.language || "ไทย",
            customLanguage: customLanguage || req.body.customLanguage,
            wordTone: req.body.wordTone || "เป็นธรรมชาติ เข้าใจง่าย",
            languageStyle: req.body.languageStyle || "ตรงไปตรงมา",
            pointOfView: req.body.pointOfView || "auto",
            rhymeStyle: req.body.rhymeStyle || "ให้ AI เลือกให้เหมาะสม",
            tempo: req.body.tempo || "ปานกลาง (80–100 BPM)",
            bpm: req.body.bpm ?? 90,
            rhythmCharacteristics: req.body.rhythmCharacteristics || ["มีชีวิตชีวา"],
            vocalType: req.body.vocalType || "หญิง",
            vocalCustomDescription: req.body.vocalCustomDescription,
            structure: req.body.structure || ["Intro", "Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Bridge", "Chorus", "Outro"],
            reference: req.body.reference,
            creativeDirection: req.body.creativeDirection,
          };

      const ai = getGeminiClient(req);

      const context = await buildCreativeContext(input, {
        endpoint: "expand-idea",
        ai,
      });

      const systemInstruction = `คุณคือ Creative Story & Songwriting Master Analyst ครูเพลง และผู้กำกับเชิงสร้างสรรค์ระดับมืออาชีพ

หน้าที่ของคุณคือการวิเคราะห์และขยายไอเดียเรื่องราว (Deep Creative Story Analysis) เพื่อค้นหา "แก่นของเพลง (Core of the Song)" และสร้างพิมพ์เขียวทางความคิดที่พร้อมส่งต่อให้ Songwriting Engine เขียนเนื้อเพลงระดับผลงานชิ้นเอก

# กฎเหล็กเชิงสร้างสรรค์ (CREATIVE PRINCIPLES)
1. ห้ามขยาย Prompt ด้วยการแต่งรายละเอียดแบบสุ่มเพื่อแค่ให้เรื่องยาวขึ้น
2. ห้ามเติมข้อมูลกลวง ๆ ที่ไม่ได้รับใช้แก่นของเพลง
3. ทุกรายละเอียดที่ค้นพบต้องตอบสนองต่อ "ความรู้สึกหลัก", "ปมความขัดแย้ง", และ "การเปลี่ยนแปลงทางอารมณ์"
4. หลีกเลี่ยงภาษาสำเร็จรูป (Clichés) ค้นหามุมมองเฉพาะตัว (Unique Specific Angle)
5. Reference Interpretation: ${context.isReferenceActive ? `อิง Reference: "${input.reference?.title || 'เพลงอ้างอิง'}" ${input.reference?.artist ? `โดย ${input.reference.artist}` : ''} เพื่อกำหนด "วิธีเล่า" (Pacing, Energy, Groove, Vocal Attitude, Repetition Dynamics) โดยเด็ดขาด ห้ามนำเนื้อหา เรื่องราว หรือเนื้อเพลงของ Reference มาลอกเลียนแบบเด็ดขาด!` : 'ไม่มีเพลงอ้างอิง (เน้นความสดใหม่จาก Story และ Mood/Genre เป็นหลัก)'}
6. Semantic Disambiguation: หากใน Prompt มีคำกำกวม หรือคำที่มีหลายมิติความหมาย ให้ถอดรหัสโดยสอดคล้องกับ Story + Genre (${context.genresStr}) + Mood (${context.moodsStr}) + Reference + Songwriting Style (${context.songwritingStyleStr})

# กรอบการวิเคราะห์ 7 มิติ (ANALYSIS ENGINES)
1. DEEP INTERPRETATION (แก่นและปมลึก):
   - Core Theme & Subthemes: เรื่องนี้เกี่ยวกับอะไรในระดับสัจธรรมมนุษย์หรือความรู้สึกส่วนลึก
   - Emotional Core: ความรู้สึกดิบที่แท้จริง
   - Hidden Conflict: สิ่งที่ตัวละครต้องการ (Want) vs สิ่งที่เผชิญอยู่จริงหรือไม่อาจได้มา (Reality/Obstacle)
   - Character Motivation: ตัวละครกำลังวิ่งหนีอะไร ยึดติดอะไร หรือต้องการยอมรับอะไร
   - POV Logic: ใครกำลังพูดกับใคร ในสถานการณ์ใด และมีอะไรที่อีกฝ่ายไม่รู้หรือไม่ยอมพูด
2. SPECIFICITY ENGINE (3–7 ภาพและรายละเอียดเฉพาะ):
   - กำหนด 3–7 ภาพเจาะจง เช่น สถานที่เฉพาะ, ช่วงเวลา, วัตถุสิ่งของที่มีเรื่องราว, พฤติกรรมเล็ก ๆ ที่สื่อความหมาย, sensory cues (แสง, เสียง, กลิ่น, อุณหภูมิ)
3. MOTIF ENGINE (1–2 สัญลักษณ์หลัก):
   - สัญลักษณ์หรือ Motif ที่เป็นภาพจำและร้อยเรียงซ้ำตลอดทั้งเพลง
4. CONTRAST ENGINE (มิติความตัดกัน):
   - ภายนอก vs ภายใน, อดีต vs ปัจจุบัน, สิ่งที่พูด vs สิ่งที่รู้สึก, ความอยากลืม vs การจำได้
5. GENRE & MOOD SYNTHESIS:
   - ผสาน Genre (${context.genresStr}) เพื่อกำหนดจังหวะการเล่าและ architecture ของเพลง
   - ผสาน Mood (${context.moodsStr}) เพื่อกำหนดอุณหภูมิอารมณ์และความตึงเครียด (Tension)
6. CLICHÉ FILTER & UNIQUE ANGLE:
   - สกัดหามุมมองเฉพาะตัวที่ทำให้เรื่องนี้ไม่ตกเป็นเพลงอกหัก/เพลงรักแบบสำเร็จรูป
7. SECTION BLUEPRINT (พิมพ์เขียวการเล่าแต่ละท่อน):
   - วางแผนหน้าที่ของ Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Final Chorus, Outro อย่างเป็นขั้นตอน

# TARGET CONTENT LANGUAGE
- ภาษาเป้าหมาย: ${context.targetContentLanguage}
${context.languageInstruction}
- ทุกฟิลด์ใน JSON ต้องสร้างเป็นภาษา "${context.targetContentLanguage}" โดยสมบูรณ์ ห้ามมีภาษาอื่นปนเปื้อน

# OUTPUT CONSTRAINT
- ส่งคืนเฉพาะผลลัพธ์ JSON ตาม Schema ที่กำหนด ห้ามส่ง Chain-of-Thought หรือ Internal reasoning`;

      const prompt = `โปรดทำการวิเคราะห์เชิงสร้างสรรค์ (Deep Creative Story Analysis) จากไอเดียและบริบทเพลงต่อไปนี้:

${context.userCreativeSettingsBlock}

${context.referenceGuidanceBlock}

=== คำสั่งวิเคราะห์ ===
โปรดสร้าง Song Concept และ Blueprint ที่พร้อมใช้ประพันธ์เพลง ประกอบด้วย:
1. expandedStory: เรื่องราวและภาพรวมคอนเซปต์เพลงที่ขยายมิติแล้ว (1-2 ย่อหน้าอันทรงพลังและเห็นภาพชัดเจน)
2. coreMessage: แก่นแท้ของเพลง (1 ประโยคสั้น คม ชัด)
3. emotionalArc: เส้นทางอารมณ์ตั้งแต่ต้นจนจบ
4. primaryConflict: ปมความขัดแย้งหลัก (สิ่งที่ต้องการ vs ความเป็นจริง)
5. characterMotivation: แรงจูงใจและความปรารถนาของตัวละคร
6. povLogic: ตรรกะมุมมองการเล่า (ใครพูดกับใคร)
7. keyMotifs: สัญลักษณ์หลัก 1-2 อย่างที่ใช้ซ้ำในเพลง
8. imageryAnchors: 3 ถึง 7 ภาพและรายละเอียดเฉพาะ (สถานที่, เวลา, วัตถุ, sensory details)
9. centralHookIdea: ไอเดียท่อนฮุก (วลีหรือแกนของ Chorus)
10. endingIdea: บทสรุปตอนจบและภาพสุดท้ายของเพลง
11. sectionBlueprint: พิมพ์เขียวการเล่าเรื่องของแต่ละท่อนตามโครงสร้างเพลง
12. clicheAvoidanceAngle: มุมมองเฉพาะตัวเพื่อหลีกเลี่ยงความซ้ำซาก`;

      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              expandedStory: {
                type: Type.STRING,
                description: "เรื่องราวและคอนเซปต์เพลงที่ขยายมิติแล้ว (1-2 ย่อหน้าที่ทรงพลังและเห็นภาพชัดเจน) พร้อมนำไปแต่งเพลง",
              },
              coreMessage: {
                type: Type.STRING,
                description: "แก่นแท้ของเพลง (1 ประโยคสั้น คม ชัด สื่อถึงสัจธรรมหรืออารมณ์หลัก)",
              },
              emotionalArc: {
                type: Type.STRING,
                description: "เส้นทางอารมณ์ของเพลง",
              },
              primaryConflict: {
                type: Type.STRING,
                description: "ปมความขัดแย้งหลัก (สิ่งที่ตัวละครต้องการ vs สิ่งที่เป็นจริงหรือไม่อาจได้มา)",
              },
              characterMotivation: {
                type: Type.STRING,
                description: "แรงจูงใจ ความปรารถนา หรือสิ่งที่ตัวละครกำลังหนี/ตามหา",
              },
              povLogic: {
                type: Type.STRING,
                description: "ตรรกะมุมมองการเล่า (ใครพูดกับใคร และพูดในสถานการณ์ใด)",
              },
              keyMotifs: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "สัญลักษณ์หลัก 1-2 อย่างที่จะใช้ซ้ำในเพลง เช่น 'ไฟท้ายสีแดง', 'แก้วกาแฟที่เย็นชืด'",
              },
              imageryAnchors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 ถึง 7 ภาพและรายละเอียดเฉพาะ (สถานที่, เวลา, วัตถุ, พฤติกรรม, sensory details) ที่จะนำไปร้อยเรียงในเนื้อเพลง",
              },
              centralHookIdea: {
                type: Type.STRING,
                description: "ไอเดียท่อนฮุก (วลีหลักหรือประโยคเด็ดที่จะเป็นหัวใจของ Chorus)",
              },
              endingIdea: {
                type: Type.STRING,
                description: "ภาพสุดท้ายหรือความรู้สึกตกค้างในตอนจบของเพลง (Outro / Resolution)",
              },
              sectionBlueprint: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    section: { type: Type.STRING, description: "ชื่อท่อน เช่น Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Outro" },
                    guidance: { type: Type.STRING, description: "หน้าที่และแนวทางการเล่าในท่อนนี้" },
                  },
                  required: ["section", "guidance"],
                },
                description: "พิมพ์เขียวการเล่าเรื่องของแต่ละท่อน",
              },
              clicheAvoidanceAngle: {
                type: Type.STRING,
                description: "มุมมองเฉพาะตัวเพื่อหลีกเลี่ยงความซ้ำซาก (อะไรที่ทำให้เพลงนี้ไม่เหมือนเพลงทั่วไป)",
              },
            },
            required: [
              "expandedStory",
              "coreMessage",
              "emotionalArc",
              "primaryConflict",
              "keyMotifs",
              "imageryAnchors",
              "centralHookIdea",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      const expandedText = parsed.expandedStory || rawStory;

      res.json({
        success: true,
        expandedIdea: expandedText,
        creativeAnalysis: parsed,
        _modelMeta: modelMeta,
      });
    } catch (err: any) {
      console.error("Deep Creative Analysis / Expand idea error:", err.message);
      sendApiError(res, err, "Failed to analyze and expand story idea");
    }
  });

  // 4. Recommend Song Structure
  router.post("/gemini/recommended-structure", async (req, res) => {
    try {
      const { story, genres, moods, language, customLanguage } = req.body;
      const { targetContentLanguage } = resolveTargetContentLanguage({ language, customLanguage });
      const ai = getGeminiClient(req);

      const prompt = `วิเคราะห์พล็อตเรื่องและทิศทางเพลงต่อไปนี้ แล้วแนะนำโครงสร้างเพลง (Song Structure) ที่เหมาะสมที่สุด:
เรื่องราว: ${story || "ไม่ระบุ"}
แนวเพลง: ${(genres || []).join(", ") || "Pop"}
อารมณ์: ${(moods || []).join(", ") || "เศร้า"}
ภาษาเนื้อร้องเป้าหมาย: ${targetContentLanguage}

เลือกโครงสร้างจากส่วนเหล่านี้เท่านั้น: Intro, Verse, Pre-Chorus, Chorus, Post-Chorus, Bridge, Breakdown, Rap, Hook, Outro.`;

      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              structure: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "รายชื่อส่วนของเพลงตามลำดับ เช่น Intro, Verse, Pre-Chorus, Chorus, Verse, Chorus, Bridge, Chorus, Outro",
              },
              reasoning: {
                type: Type.STRING,
                description: "เหตุผลสั้นๆ ภาษาไทย ว่าทำไมโครงสร้างนี้จึงเหมาะกับเพลงนี้",
              },
            },
            required: ["structure", "reasoning"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        structure: parsed.structure || ["Intro", "Verse", "Pre-Chorus", "Chorus", "Verse", "Chorus", "Bridge", "Outro"],
        reasoning: parsed.reasoning || "โครงสร้างแบบมาตรฐานที่ช่วยส่งผ่านอารมณ์เพลงได้สมบูรณ์",
        _modelMeta: modelMeta,
      });
    } catch (err: any) {
      console.error("Recommended structure error:", err.message);
      sendApiError(res, err, "Failed to recommend structure");
    }
  });

  // 4a. Resolve YouTube Metadata
  router.post("/gemini/resolve-youtube", async (req, res) => {
    try {
      const { youtubeUrl } = req.body;
      if (!youtubeUrl || typeof youtubeUrl !== "string") {
        res.status(400).json({
          verified: false,
          error: "โปรดระบุลิงก์ YouTube",
        });
        return;
      }

      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        res.status(400).json({
          verified: false,
          error: "ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด",
        });
        return;
      }

      const meta = await resolveYouTubeMetadata(videoId);
      if (!meta || !meta.title) {
        res.status(404).json({
          verified: false,
          videoId,
          canonicalUrl: getCanonicalYouTubeUrl(videoId),
          error: "ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด",
        });
        return;
      }

      res.json({
        verified: true,
        success: true,
        videoId: meta.videoId,
        canonicalUrl: meta.canonicalUrl,
        title: meta.title,
        channel: meta.channel || meta.artist,
        artist: meta.artist || meta.channel,
        thumbnailUrl: meta.thumbnailUrl,
      });
    } catch (err: any) {
      console.error("Resolve YouTube error:", err.message);
      res.status(500).json({
        verified: false,
        error: "ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด",
      });
    }
  });

  // 4b. Analyze Reference Song
  router.post("/gemini/analyze-reference", async (req, res) => {
    try {
      const { youtubeUrl, songText } = req.body;
      if (!youtubeUrl?.trim() && !songText?.trim()) {
        res.status(400).json({ error: "โปรดใส่ลิงก์ YouTube หรือระบุชื่อเพลง/ศิลปิน" });
        return;
      }

      let confirmedTitle: string | undefined;
      let confirmedArtist: string | undefined;
      let canonicalUrl: string | undefined;
      let videoId: string | undefined;
      let sourceType: "youtube" | "text" = "text";

      if (youtubeUrl?.trim()) {
        videoId = extractYouTubeVideoId(youtubeUrl.trim()) || undefined;
        if (videoId) {
          canonicalUrl = getCanonicalYouTubeUrl(videoId);
          sourceType = "youtube";
          const meta = await resolveYouTubeMetadata(videoId);
          if (meta && meta.title) {
            confirmedTitle = meta.title;
            confirmedArtist = meta.artist || meta.channel;
          }
        }
      }

      if (songText?.trim()) {
        if (!confirmedTitle) {
          confirmedTitle = songText.trim();
        }
      }

      if (!confirmedTitle) {
        res.json({
          sourceType: youtubeUrl ? "youtube" : "text",
          source: canonicalUrl || youtubeUrl || songText || "",
          title: undefined,
          artist: undefined,
          identityVerified: false,
          analysisVerified: false,
          audioAnalysisAvailable: false,
          mediaAnalysisStatus: "unavailable",
          confidence: "unavailable",
          sourceProvenance: "unavailable",
          warningMessage: "ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด",
          analysis: undefined,
        });
        return;
      }

      const ai = getGeminiClient(req);

      function cleanStr(v: any): string | undefined {
        if (v === null || v === undefined) return undefined;
        const str = String(v).trim();
        if (!str || str.toLowerCase() === "null" || str.toLowerCase() === "undefined" || str === "NaN" || str === "[object Object]") {
          return undefined;
        }
        return str;
      }

      function cleanArr(arr: any): string[] | undefined {
        if (!Array.isArray(arr)) return undefined;
        const cleaned = arr
          .map(cleanStr)
          .filter((item): item is string => typeof item === "string" && item.length > 0);
        return cleaned.length > 0 ? cleaned : undefined;
      }

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          warningMessage: { type: Type.STRING },
          analysis: {
            type: Type.OBJECT,
            properties: {
              genre: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Genre/Subgenre จากที่ได้ยินในเพลงจริง" },
              mood: { type: Type.ARRAY, items: { type: Type.STRING }, description: "อารมณ์และบรรยากาศเสียงเพลง" },
              tempo: { type: Type.STRING, description: "ความเร็ว BPM และ Meter ของเพลงจริง เช่น '128 BPM (4/4)'" },
              vocal: { type: Type.STRING, description: "ลักษณะเสียงร้อง เทคนิค และ Vocal processing ที่ได้ยินจริง" },
              instrumentation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "เครื่องดนตรีและ sound palette ที่ได้ยินในเพลง" },
              rhythm: { type: Type.STRING, description: "จังหวะ กรู๊ฟ เบสแพตเทิร์น คิก และ percussion groove" },
              structure: { type: Type.ARRAY, items: { type: Type.STRING }, description: "โครงสร้างท่อนเพลงที่ได้ยิน" },
              lyricApproach: { type: Type.STRING, description: "ลักษณะการแบ่งวรรค ความยาวท่อน และกลยุทธ์การย้ำคำ" },
              rhymeApproach: { type: Type.STRING, description: "สไตล์สัมผัสและจังหวะคำ" },
              productionCharacter: { type: Type.STRING, description: "ลักษณะโปรดักชัน ซาวด์สเตจ และ energy curve" },
              overallDirection: { type: Type.STRING, description: "สรุปหลักการทางดนตรีและ reference DNA" },
            },
            required: ["genre", "mood", "tempo", "vocal", "instrumentation", "rhythm"],
          },
        },
        required: ["analysis"],
      };

      let analysisResult: any = null;
      let finalModelMeta: any = null;
      let mediaAnalysisSucceeded = false;

      if (sourceType === "youtube" && canonicalUrl) {
        const officialArtistInfo = confirmedArtist ? await fetchArtistGenderFromMusicBrainz(confirmedArtist) : null;

        const multimodalPrompt = `คุณคือผู้เชี่ยวชาญด้านดนตรีวิทยา (Musicologist) และ Audio Engineer ระดับมืออาชีพ
ได้รับวิดีโอเพลง YouTube อ้างอิงต่อไปนี้:
- Canonical URL: ${canonicalUrl}
- ยืนยันตัวตน: "${confirmedTitle}" ${confirmedArtist ? `โดย ${confirmedArtist}` : ''}
${officialArtistInfo ? `- ข้อมูลทางการจากฐานข้อมูลดนตรีโลก (MusicBrainz): "${officialArtistInfo}"` : ''}
${songText && songText.trim() !== confirmedTitle ? `- ข้อมูลเพิ่มเติมจากผู้ใช้: "${songText.trim()}"` : ''}

ภารกิจสำคัญ: 
1. ตรวจสอบข้อมูลศิลปินและเพศจากฐานข้อมูลทางการที่ระบุไว้ข้างต้นเป็นหลัก (หากระบุเพศชัดเจน เช่น Male / Female ห้ามเดาสลับเพศเด็ดขาด)
2. วิเคราะห์องค์ประกอบดนตรีจริงจากแทร็กเสียง:
   - VOCAL CHARACTER & GENDER: ระบุเพศและลักษณะเสียงร้องตามจริง
   - GENRE & SUBGENRE: แนวเพลงที่แท้จริง
   - TEMPO & BPM: ความเร็ว BPM
   - INSTRUMENTATION: เครื่องดนตรีที่ได้ยินจริง

ส่งผลลัพธ์ใน JSON Schema ที่กำหนดเท่านั้น ห้ามมีข้อความอื่นนอกเหนือจาก JSON`;

        try {
          const contents = [
            {
              fileData: {
                fileUri: canonicalUrl,
                mimeType: "video/*",
              },
            },
            {
              text: multimodalPrompt,
            },
          ];

          const { response, modelMeta } = await callGeminiWithFallback(ai, {
            contents,
            config: {
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          analysisResult = JSON.parse(response.text || "{}");
          finalModelMeta = modelMeta;
          mediaAnalysisSucceeded = Boolean(analysisResult?.analysis);

          console.log(`[ReferenceMedia] identityVerified=true mediaInput=youtube mediaAnalysisAvailable=${mediaAnalysisSucceeded} model=${modelMeta.modelId} analysisSource=youtube_media`);
        } catch (mediaErr: any) {
          console.warn("[ReferenceMedia] Direct YouTube media analysis failed or not available for this video:", mediaErr.message);
          mediaAnalysisSucceeded = false;
        }
      }

      if (!mediaAnalysisSucceeded) {
        const isTextInput = sourceType === "text";
        const promptSourceDesc = `ข้อมูลเพลงอ้างอิง:
- ชื่อเพลง: "${confirmedTitle}"
${confirmedArtist ? `- ศิลปิน/ช่อง: "${confirmedArtist}"` : ''}
${songText && songText.trim() !== confirmedTitle ? `- ข้อมูลที่ผู้ใช้ระบุเพิ่มเติม: "${songText.trim()}"` : ''}`;

        const prompt = `วิเคราะห์คุณลักษณะทางดนตรีและสไตล์การเขียนเพลงจากข้อมูลเพลงอ้างอิง:
${promptSourceDesc}

คำสั่ง:
1. วิเคราะห์คุณลักษณะเฉพาะทางดนตรี สไตล์การเขียนเพลง อารมณ์ จังหวะ และโปรดักชันของเพลง "${confirmedTitle}" ${confirmedArtist ? `โดย ${confirmedArtist}` : ''}
2. ห้ามเดาหรือขยายขอบเขตเกินหลักฐานที่ระบุ (DO NOT OVER-INFER)
3. ห้ามคัดลอกเนื้อเพลงต้นฉบับ

ส่งผลลัพธ์ใน JSON Schema`;

        const { response, modelMeta } = await callGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        analysisResult = JSON.parse(response.text || "{}");
        finalModelMeta = modelMeta;

        console.log(`[ReferenceMedia] identityVerified=true mediaInput=none mediaAnalysisAvailable=false model=${modelMeta.modelId} analysisSource=${isTextInput ? "user_input" : "youtube_metadata"}`);
      }

      const rawAnalysis = analysisResult?.analysis || {};

      const sanitizedAnalysis = {
        genre: cleanArr(rawAnalysis.genre),
        mood: cleanArr(rawAnalysis.mood),
        tempo: cleanStr(rawAnalysis.tempo),
        vocal: cleanStr(rawAnalysis.vocal),
        instrumentation: cleanArr(rawAnalysis.instrumentation),
        rhythm: cleanStr(rawAnalysis.rhythm),
        structure: cleanArr(rawAnalysis.structure),
        lyricApproach: cleanStr(rawAnalysis.lyricApproach),
        rhymeApproach: cleanStr(rawAnalysis.rhymeApproach),
        productionCharacter: cleanStr(rawAnalysis.productionCharacter),
        overallDirection: cleanStr(rawAnalysis.overallDirection),
        confidence: (mediaAnalysisSucceeded ? "verified" : "inferred") as "verified" | "inferred",
        source: (mediaAnalysisSucceeded
          ? "youtube_media"
          : (sourceType === "youtube" ? "youtube_metadata" : "user_input")) as any,
      };

      const sourceProvenance = mediaAnalysisSucceeded
        ? "youtube_media"
        : (sourceType === "youtube" ? "youtube_metadata" : "user_input");

      res.json({
        sourceType,
        source: canonicalUrl || youtubeUrl || songText || "",
        videoId,
        canonicalUrl,
        title: cleanStr(confirmedTitle),
        channel: cleanStr(confirmedArtist),
        artist: cleanStr(confirmedArtist),
        identityVerified: true,
        analysisVerified: mediaAnalysisSucceeded,
        audioAnalysisAvailable: mediaAnalysisSucceeded,
        mediaAnalysisStatus: mediaAnalysisSucceeded ? "verified" : "unavailable",
        confidence: mediaAnalysisSucceeded ? "verified" : "inferred",
        sourceProvenance,
        warningMessage: mediaAnalysisSucceeded
          ? cleanStr(analysisResult?.warningMessage)
          : (sourceType === "youtube"
              ? "ไม่สามารถประมวลผลเสียงจาก YouTube URL ได้โดยตรง ระบบจึงแสดงผลการวิเคราะห์บริบททางดนตรี (Inferred Context) คุณสามารถระบุ Tempo, Vocal หรือเครื่องดนตรีเพิ่มเติมได้ในส่วน User-Provided Details"
              : cleanStr(analysisResult?.warningMessage)),
        analysis: sanitizedAnalysis,
        _modelMeta: finalModelMeta,
      });
    } catch (err: any) {
      if (err.message === "GEMINI_API_KEY_REQUIRED" || err.code === "GEMINI_API_KEY_REQUIRED" || err.status === 401) {
        return res.status(401).json({ ok: false, error: "GEMINI_API_KEY_REQUIRED" });
      }
      console.error("Analyze reference error:", err.message);
      res.json({
        sourceType: req.body.youtubeUrl ? "youtube" : "text",
        source: req.body.youtubeUrl || req.body.songText || "",
        identityVerified: false,
        analysisVerified: false,
        audioAnalysisAvailable: false,
        mediaAnalysisStatus: "failed",
        confidence: "unavailable",
        sourceProvenance: "unavailable",
        warningMessage: "ไม่สามารถวิเคราะห์ข้อมูลเพลงอ้างอิงได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือระบุข้อมูลเพิ่มเติมในส่วน User-Provided Details",
        analysis: undefined,
      });
    }
  });

  // 5. Generate Song
  router.post("/gemini/generate-song", async (req, res) => {
    try {
      const { input, isNewAngle, songId } = req.body;
      if (!input || !input.story) {
        res.status(400).json({ error: "Missing song input parameters" });
        return;
      }

      const ai = getGeminiClient(req);

      const context = await buildCreativeContext(input, {
        endpoint: "generate-song",
        songId,
        isNewAngle,
        ai,
      });

      // PASS 0.5: Song Blueprint + Hook Craft Engine (Pre-generation Architectural Planning)
      let blueprintPromptBlock = "";
      let hookCraftPromptBlock = "";
      let protectedHookLines: string[] = [];

      try {
        const songBlueprint = await buildSongBlueprint(context, ai);
        const hookCraftResult = await buildHookCandidates(songBlueprint, context, ai);
        blueprintPromptBlock = `\n\n${formatBlueprintForPrompt(songBlueprint)}`;
        hookCraftPromptBlock = `\n\n${formatHookCraftForPrompt(hookCraftResult)}`;
        protectedHookLines = hookCraftResult.protectedHookLines || [];
      } catch (bpErr: any) {
        console.warn(`[SongBlueprint] Non-blocking warning during blueprinting: ${bpErr.message}`);
      }

      const systemInstruction = `คุณคือ Intelligent AI Song Writer สตูดิโอนักแต่งเพลงระดับมืออาชีพ ครูเพลง และนักเขียนเพลงชั้นครู

คุณต้องประพันธ์เนื้อเพลงให้ได้มาตรฐานระดับนักแต่งเพลงมืออาชีพโดยเคร่งครัดตามหลักการต่อไปนี้:

# CORE CREATIVE PRINCIPLE
- เป้าหมายไม่ใช่การสร้าง "กลอนที่คล้องจอง" แต่คือการสร้าง "เพลงที่มีความหมาย มีภาพ มีเรื่องราว มีเสียงภาษา มี Hook และมีพัฒนาการทางอารมณ์"
- ทุกบรรทัดต้องมีเหตุผลว่าทำไมจึงอยู่ในเพลง คุณภาพสำคัญกว่าปริมาณคำคล้องจอง

# 1. ORIGINALITY — หลีกเลี่ยงภาษาสำเร็จรูป (Clichés)
- หลีกเลี่ยงวลีสำเร็จรูปซ้ำซาก เช่น: "รักเธอสุดหัวใจ", "น้ำตาริน", "ใจสลาย", "คิดถึงเธอเหลือเกิน", "อยู่ไม่ได้ถ้าไม่มีเธอ", "ขาดเธอไม่ได้", "เจ็บจนแทบขาดใจ", "ฟ้าหลังฝน", "รักนิรันดร์", "หัวใจดวงนี้", "เธอคือทุกอย่าง", "โลกทั้งใบของฉัน", "จากกันทั้งน้ำตา"
- ห้ามใช้ประโยคที่ใครก็ใช้กับเพลงรักอื่นได้โดยไม่ต้องเปลี่ยนคำ (Specificity > Generic Emotion)

# 2. STORY-SPECIFIC LANGUAGE
- ดึงรายละเอียดเฉพาะจาก Story ของผู้ใช้มาใช้จริง เช่น สถานที่, เวลา, สิ่งของ, บุคคล, พฤติกรรม, บทสนทนา, กลิ่น, เสียง, แสง, อุณหภูมิ, ความทรงจำ, เหตุการณ์สำคัญ, รายละเอียดเล็ก ๆ ที่คนทั่วไปไม่คิดถึง

# 3. SHOW, DON'T TELL
- ห้ามบอกอารมณ์ตรง ๆ (เช่น ไม่พูดแค่ "ฉันเศร้ามาก" หรือ "คิดถึงเธอ")
- แต่ให้สร้างภาพแทน (Imagery) เช่น "แก้วใบเดิมยังวางอยู่ฝั่งที่เธอเคยนั่ง" หรือ "ทุกครั้งที่รถไฟขบวนสุดท้ายผ่าน ฉันยังเผลอมองไปที่ประตูเดิม"
- ใช้ ภาพ ฉาก การกระทำ สิ่งของ ภาษากาย สถานที่ ความทรงจำ ให้ผู้ฟังรู้สึกโดยไม่ต้องบอกตรง ๆ

# 4. INTERNAL + END RHYME & SINGABILITY (RHYTHM & CADENCE MANDATE)
- เป้าหมายสูงสุด: 1 บรรทัด = 1 Phrasing ที่ร้องได้จริงตามห้องดนตรี (Singable Phrase)
- [กฎเหล็กพยางค์]: บังคับความยาว 6 ถึง 10 พยางค์ต่อหนึ่งบรรทัด (ห้ามยาวเกิน 10 พยางค์เด็ดขาด) เพื่อไม่ให้ล้นห้องดนตรีและนักร้องมีช่องว่างหายใจ
- [สมดุลของวรรค]: บรรทัดที่อยู่คู่กันในท่อนเดียวกัน ต้องมีจำนวนพยางค์เท่ากันหรือใกล้เคียงกัน (เช่น 7-7 หรือ 8-8) ห้ามสั้นยาวสลับกันแบบผิดธรรมชาติ
- [สัมผัสคล้องจอง (Rhyme Scheme)]:
  * คำสุดท้ายของบรรทัดที่ 1 ต้องมีสัมผัสสระและตัวสะกดคล้องจองกับ คำที่ 1-3 ของบรรทัดที่ 2
  * คำสุดท้ายของบรรทัดที่ 2 ต้องสัมผัสสระคล้องจองกับ คำสุดท้ายของบรรทัดที่ 4
- [ห้ามเขียนแบบร้อยแก้ว (Anti-Prose)]: ห้ามนำประโยคเล่าเรื่องยาวๆ มาตัดบรรทัด ต้องกลั่นให้เป็นคำสั้น กระชับ มีน้ำหนักทางอารมณ์
${context.isTargetThai
  ? "- ภาษาไทย: บังคับสัมผัสสระข้ามบรรทัด (Cross-line Rhyme) เลี่ยงการลงท้ายด้วยคำตายหรือสระเสียงสั้นในท่อนฮุก เน้นสระเสียงยาวเพื่อให้เอื้อต่อการลากเสียงร้อง"
  : `- ภาษา ${context.targetContentLanguage}: บังคับ Meter, Syllable Stress, Singability, Rhyme Scheme ตามหลักสากลของภาษานั้นๆ ห้ามมีคำภาษาไทยปน`}

# 5. SECTION PURPOSE
- Verse 1: แนะนำโลกของเรื่อง สถานการณ์ ตัวละคร ฉาก จุดเริ่มต้นของความขัดแย้ง (อย่าเปิดหมดทันที)
- Verse 2: ต้องเพิ่มข้อมูลใหม่ / รายละเอียดใหม่ / เปลี่ยนมุมมอง หรือเพิ่มเดิมพัน ห้ามนำ Verse 1 มาเล่าซ้ำเด็ดขาด!
- Pre-Chorus: เพิ่ม tension ยกระดับอารมณ์ พาเข้าสู่ Hook
- Chorus: หัวใจของเพลง Central idea ชัดเจน มี Hook line ที่ติดหู จำง่าย ภาษาเหมาะกับการร้องซ้ำ
- Bridge: ต้องเปลี่ยนแปลงสิ่งใดสิ่งหนึ่ง เช่น เปลี่ยนมุมมอง, เปิดเผยความจริง, ยอมรับบางอย่าง, หรือเปลี่ยน emotional perspective
- Final Chorus: ไต่ระดับอารมณ์หรือปรับเปลี่ยนคำให้เกิด emotional payoff

# 6. EMOTIONAL ARC & HOOK
- วางพัฒนาการทางอารมณ์: Setup -> Tension -> Emotional Development -> Peak -> Resolution/Aftermath
- Hook ต้องจำง่าย มี identity เชื่อมกับ Story ไม่ generic ไม่เป็น cliché

# 7. CONSTRAINTS
- ภาษาเป้าหมายของเนื้อร้องและชื่อเพลง (Target Content Language): ${context.targetContentLanguage}
${context.languageInstruction}
- โทนคำ: ${context.wordToneStr}
- วิธีใช้ภาษา: ${context.languageStyleStr}
- สไตล์การแต่งเพลง (Songwriting Style): ${context.songwritingStyleStr}
- มุมมองการเล่าเรื่อง (POV): ${context.povStr}
- รูปแบบสัมผัส: ${context.rhymeStyleStr}
- ความเร็ว/จังหวะ: ${context.tempoStr} ${context.bpmStr ? `(${context.bpmStr})` : ''} - จังหวะ: ${context.rhythmStr}
- เสียงร้อง: ${context.vocalStr}
- ลำดับโครงสร้างเพลง (Sections) ต้องตรงตามนี้เป๊ะๆ: [${context.structureStr}]
- Style Prompt สำหรับ Suno ต้องเป็นภาษาอังกฤษที่กระชับ คมชัด แปลงแนวเพลง, อารมณ์, เสียงร้อง (${context.vocalStr}), Tempo, และลักษณะจังหวะเป็นภาษาอังกฤษที่เหมาะสม (ห้ามใส่ชื่อศิลปิน)

# 8. SECTION DIRECTIONS (PERFORMANCE & MUSIC DIRECTIONS FOR SUNO)
ในทุกๆ Section ต้องสร้าง Direction metadata สำหรับ Suno 2 ส่วน ดังนี้:
- performanceDirection: Vocal/performance delivery guidance (ภาษาอังกฤษ) เช่น "Melancholic, Reflective Vocal", "Building Emotion, Vocal slightly strained", "Powerful, Emotional Vocal", "Introspective, Softer Vocal", "Fade Out"
- musicDirection: Music/Arrangement guidance (ภาษาอังกฤษ) เช่น "Soft piano arpeggios, atmospheric synth pads slowly swell. Gentle acoustic guitar enters with a melancholic motif.", "Drums open up, warm strings swell", "Full instrumentation, layered harmonies"

กฎ Section Direction ตามประเภท:
- Intro: เน้นเครื่องดนตรี, atmosphere, texture, dynamics, mood การค่อยๆ เข้าสู่ Verse (Intro ไม่จำเป็นต้องมีเนื้อร้อง ให้ lyrics เป็น [] หรือเนื้อร้องสั้นๆ)
- Verse 1/2: Vocal direction สั้น คม สอดคล้องกับ emotional arc
- Pre-Chorus: แสดงการเพิ่มพลัง/rising tension
- Chorus: Vocal character + musical energy เมื่อเหมาะสม
- Bridge: สะท้อนการเปลี่ยนมุมมอง (Introspective/Perspective shift)
- Final Chorus: พลังสูงสุดของเพลง
- Outro: การลดพลัง, vocal fade, ending atmosphere

คำเตือนสำคัญ: ห้ามนำ performanceDirection หรือ musicDirection ไปใส่ใน array 'lyrics' โดยเด็ดขาด ให้ใส่แยกใน field 'performanceDirection' และ 'musicDirection' ของแต่ละ section เท่านั้น!

# 9. LYRIC PHRASING & SINGABILITY DIRECTIVE
${context.lyricPhrasingBlock}

# 10. VOCABULARY & LEXICAL CONTEXT GUIDANCE
${context.vocabGuidance}

# 11. INSPIRATION & REFERENCE PROFILE GUIDANCE
${context.referenceGuidance || "ไม่มีเพลงอ้างอิง"}

# 12. FEW-SHOT CRAFTSMANSHIP & EXEMPLAR GUIDANCE
${context.fewShotGuidanceBlock || "ไม่มีตัวอย่าง Few-shot เพิ่มเติม"}${context.rolePromptBlock || ""}${blueprintPromptBlock}${hookCraftPromptBlock}

# 13. MASTER SONGWRITING & DYNAMIC CONTRAST DIRECTIVE
- Show, Don't Tell: ถ่ายทอดความรู้สึกผ่านวัตถุรูปธรรม บรรยากาศ แสง เสียง และประสาทสัมผัส ห้ามบอกอารมณ์ตรงๆ
- Dynamic Contrast: วางสิ่งตรงข้ามไว้ด้วยกันในแต่ละท่อน (เช่น อบอุ่น vs เย็นชา, คนธรรมดา vs สิ่งที่เอื้อมไม่ถึง)
- Golden Hook Pattern: ท่อน Chorus ต้องมีวลีจำที่ใช้โครงสร้างประโยคคู่ขนาน (Parallel Pattern) หรือการเล่นคำซ้ำ เพื่อให้ติดหูทันที

# OUTPUT RULE
- ส่งเฉพาะ JSON ตาม Schema (title, stylePrompt, sections) ห้ามส่ง internal analysis หรือความคิดภายใน`;

      const prompt = `${isNewAngle ? "โปรดประพันธ์เพลงใหม่ในอีกมุมมองและ imagery ใหม่จาก Story เดิม:" : "โปรดประพันธ์เนื้อเพลงและ Style Prompt คุณภาพระดับครูเพลงจากโจทย์ต่อไปนี้:"}

${context.userCreativeSettingsBlock}
${context.creativeAnalysisBlock}

${context.styleExecutionBlock}

${context.lyricPhrasingBlock}

${context.referenceGuidanceBlock}

${context.vocabGuidanceBlock}${context.fewShotGuidanceBlock ? `\n\n${context.fewShotGuidanceBlock}` : ""}${context.rolePromptBlock || ""}${blueprintPromptBlock}${hookCraftPromptBlock}`;

      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "ชื่อเพลงภาษาไทย/อังกฤษ ที่ไพเราะและตรงกับเรื่องราว",
              },
              stylePrompt: {
                type: Type.STRING,
                description: "Suno Style Prompt ภาษาอังกฤษ เช่น 'Thai contemporary R&B, melancholic male vocals, acoustic guitar, warm electric piano, slow tempo, intimate atmosphere, emotional depth'",
              },
              sections: {
                type: Type.ARRAY,
                description: "เนื้อเพลงแยกตามส่วนที่กำหนดในโครงสร้าง พร้อม Section Directions",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "ชื่อส่วน เช่น Intro, Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Outro",
                    },
                    performanceDirection: {
                      type: Type.STRING,
                      description: "Vocal and performance delivery direction for Suno, e.g. 'Melancholic, Reflective Vocal'",
                    },
                    musicDirection: {
                      type: Type.STRING,
                      description: "Music and arrangement direction for Suno, e.g. 'Soft piano arpeggios, atmospheric synth pads slowly swell'",
                    },
                    lyrics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "บรรทัดเนื้อเพลงในส่วนนั้น (ห้ามนำ direction มาใส่ในนี้)",
                    },
                  },
                  required: ["type", "lyrics"],
                },
              },
            },
            required: ["title", "stylePrompt", "sections"],
          },
        },
      });

      const jsonText = response.text?.trim() || "";
      const parsed = JSON.parse(jsonText);

      // PASS 2: Check and Refine Lyric Phrasing & Singability (with Conditional Bypass)
      const { sections: phrasedSections, phrasingReport } = await refineSongLyricPhrasing(
        parsed,
        context,
        ai,
        { endpoint: "generate-song" }
      );
      parsed.sections = phrasedSections;

      // Quality Control Validation using Vocabulary Validator
      const allLyricsText = parsed.sections
        ? parsed.sections.flatMap((s: any) => s.lyrics || []).join("\n")
        : "";

      const validationReport = validateSongVocabulary(allLyricsText, context.vocabContext?.avoid || { hardBanned: [], overused: [], contextClash: [] });
      console.log("[VocabularyValidation] Report for generate-song:", {
        songId: songId || "N/A",
        isValid: validationReport.isValid,
        score: validationReport.score,
        hardBannedFound: validationReport.hardBannedFound,
        overusedFound: validationReport.overusedFound,
        contextClashFound: validationReport.contextClashFound,
        feedback: validationReport.feedback,
        phrasingScore: phrasingReport.score,
      });

      if (validationReport.hardBannedFound.length > 0) {
        console.warn(`[VocabularyValidation] WARNING: Hard banned words detected in generated lyrics: ${validationReport.hardBannedFound.join(", ")}`);
      }

      res.json({
        ...parsed,
        _modelMeta: modelMeta,
      });
    } catch (err: any) {
      console.error("Generate song error:", err.message);
      sendApiError(res, err, "Failed to generate song lyrics");
    }
  });

  // 5b. Refine Song
  router.post("/gemini/refine-song", async (req, res) => {
    try {
      const { input, currentSong, feedback } = req.body;
      if (!input || !currentSong || !currentSong.sections) {
        res.status(400).json({ error: "Missing required song refinement parameters" });
        return;
      }

      const ai = getGeminiClient(req);

      const context = await buildCreativeContext(input, {
        endpoint: "refine-song",
        songId: currentSong.id,
        currentSong,
        ai,
      });

      // PASS 0.5: Song Blueprint + Hook Craft Engine
      let blueprintPromptBlock = "";
      let hookCraftPromptBlock = "";
      let protectedHookLines: string[] = [];

      try {
        const songBlueprint = await buildSongBlueprint(context, ai, { songId: currentSong.id });
        const hookCraftResult = await buildHookCandidates(songBlueprint, context, ai);
        blueprintPromptBlock = `\n\n${formatBlueprintForPrompt(songBlueprint)}`;
        hookCraftPromptBlock = `\n\n${formatHookCraftForPrompt(hookCraftResult)}`;
        protectedHookLines = hookCraftResult.protectedHookLines || [];
      } catch (bpErr: any) {
        console.warn(`[SongBlueprint] Non-blocking warning during refine blueprinting: ${bpErr.message}`);
      }

      const currentLyricsText = currentSong.sections
        .map((s: any) => {
          let str = `[${s.type}]`;
          if (s.musicDirection) str += `\n(${s.musicDirection})`;
          if (s.performanceDirection) str += `\n[${s.performanceDirection}]`;
          if (s.lyrics && s.lyrics.length > 0) str += `\n${s.lyrics.join('\n')}`;
          return str;
        })
        .join('\n\n');

      const systemInstruction = `คุณคือ Intelligent AI Song Writer สตูดิโอนักแต่งเพลงระดับมืออาชีพ ครูเพลง และนักเขียนเพลงชั้นครู

หน้าที่ของคุณคือทำการ "ปรับแก้เนื้อเพลง (Refine Lyrics)" ให้มีมาตรฐานระดับครูเพลง

กฎเหล็กในการปรับแก้เนื้อเพลงและการรักษา REFERENCE CONSISTENCY:
1. ปฏิบัติตามลำดับความสำคัญ (PROMPT PRIORITY) โดยเคร่งครัด:
   USER CREATIVE SETTINGS -> ACTIVE REFERENCE GUIDANCE -> EXISTING SONG / CURRENT LYRICS -> REFINE INSTRUCTION
2. ห้ามเปลี่ยน Genre, Mood, Language (${context.targetContentLanguage}), Songwriting Style, POV, Tempo/BPM หรือ Vocal ที่ผู้ใช้กำหนดเองโดยเด็ดขาด โดยเนื้อเพลงและชื่อเพลงต้องแต่งเป็นภาษา "${context.targetContentLanguage}" เท่านั้น
3. รักษาภาษาของเนื้อเพลง (${context.targetContentLanguage}): ห้ามแปลหรือเปลี่ยนภาษาเป็นภาษาอื่น
4. หากมี Active Reference Profile ให้รักษา "Reference Consistency" จากเพลงเดิมที่สร้างขึ้น โดยรักษา tonal direction, genre character, rhythmic character, vocal character และ production direction จาก Active Reference
5. Active Reference มีหน้าที่รักษา: groove, rhythmic feel, instrumentation, vocal character, production character, songwriting characteristics
6. ไม่ควรคัดลอกเนื้อเพลงหรือ Hook จาก Reference
7. ปรับแก้ทั้งเนื้อเพลง และสร้าง/รักษา performanceDirection และ musicDirection ของทุก section ให้สอดคล้องกับอารมณ์ เรื่องราว และ Reference Profile
8. ปฏิบัติตามหลัก Lyric Phrasing & Singability: 1 line = 1 natural singable phrase ไม่ตัดกลางความหมาย เว้นจังหวะหายใจอย่างลงตัว
9. Style Prompt สำหรับ Suno ต้องสะท้อนแนวเพลง อารมณ์ และ Reference Profile ด้าน Groove / Instrumentation / Production อย่างถูกต้อง
10. ห้ามนำ performanceDirection หรือ musicDirection ไปใส่ใน array 'lyrics' ให้แยกใส่ใน field เฉพาะเท่านั้น
11. ห้ามแสดงขั้นตอนความคิด internal analysis ให้ส่งคืนเฉพาะ JSON ตาม Schema เท่านั้น`;

      const prompt = `โปรดทำการปรับแก้เนื้อเพลงและ Section Directions ให้เป็นระดับมืออาชีพ/ครูเพลง โดยปฏิบัติตามลำดับความสำคัญ (Prompt Priority) อย่างเคร่งครัด:

${context.userCreativeSettingsBlock}
${context.creativeAnalysisBlock}

${context.styleExecutionBlock}

${context.lyricPhrasingBlock}

${context.referenceGuidanceBlock}

=== 4. EXISTING SONG / CURRENT LYRICS (เพลงและเนื้อเพลงปัจจุบันที่นำมาปรับแก้) ===
- ชื่อเพลงเดิม: ${currentSong.title}
- Style Prompt เดิม: ${currentSong.stylePrompt}
- เนื้อเพลงและ Directions ปัจจุบัน:
${currentLyricsText}

=== 5. VOCABULARY & LEXICAL CONTEXT GUIDANCE ===
${context.vocabGuidance}

${context.fewShotGuidanceBlock ? `=== 6. FEW-SHOT CRAFTSMANSHIP & EXEMPLAR GUIDANCE ===\n${context.fewShotGuidanceBlock}\n\n` : ""}${context.rolePromptBlock || ""}${blueprintPromptBlock}${hookCraftPromptBlock}

=== 7. REFINE INSTRUCTION (คำแนะนำในการปรับแก้ครั้งนี้) ===
${feedback || "ปรับแก้ตามมาตรฐานครูเพลง: ขจัดคำสำเร็จรูป/Cliché, เพิ่ม Show Don't Tell (Imagery), ขัดเกลาสัมผัสในและเสียงภาษาร้องให้ไหลลื่น, เสริม Hook ให้ทรงพลัง"}

โปรดส่งคืนผลลัพธ์เป็น JSON (title, stylePrompt, sections) ที่ผ่านการปรับแก้เรียบร้อยแล้ว โดยรักษา Reference Consistency อย่างเคร่งครัด`;

      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "ชื่อเพลงที่ปรับแก้ไขเรียบร้อยแล้ว",
              },
              stylePrompt: {
                type: Type.STRING,
                description: "Style Prompt สำหรับ Suno ภาษาอังกฤษ",
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    performanceDirection: {
                      type: Type.STRING,
                      description: "Vocal and performance delivery direction for Suno",
                    },
                    musicDirection: {
                      type: Type.STRING,
                      description: "Music and arrangement direction for Suno",
                    },
                    lyrics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["type", "lyrics"],
                },
              },
            },
            required: ["title", "stylePrompt", "sections"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");

      // PASS 1.5: Songwriting Critic + Targeted Rewrite (Quality Gate)
      try {
        const criticRewriteResult = await runSongwritingCriticAndRewrite(parsed, context, ai, { protectedHookLines });
        parsed.sections = criticRewriteResult.finalLyrics;
        console.log(`[SongCritic Integration] Completed refine-song Critic pass. Overall Status: ${criticRewriteResult.criticReport.overallStatus}, Score: ${criticRewriteResult.criticReport.overallScore}/5, Rewritten Lines: ${criticRewriteResult.totalRewrittenLines}`);
      } catch (criticErr: any) {
        console.warn(`[SongCritic Integration] Non-blocking warning in refine-song Critic pass: ${criticErr.message}`);
      }

      // PASS 2: Check and Refine Lyric Phrasing & Singability
      const { sections: phrasedSections } = await refineSongLyricPhrasing(
        parsed,
        context,
        ai,
        { endpoint: "refine-song" }
      );
      parsed.sections = phrasedSections;

      res.json({
        ...parsed,
        _modelMeta: modelMeta,
      });
    } catch (err: any) {
      console.error("Refine song error:", err.message);
      sendApiError(res, err, "Failed to refine song lyrics");
    }
  });

  // 5c. Rewrite Specific Section
  router.post("/gemini/rewrite-section", async (req, res) => {
    try {
      const { input, currentSong, sectionIndex, sectionType, userInstruction } = req.body;
      if (!input || !currentSong || sectionIndex === undefined || !sectionType) {
        res.status(400).json({ error: "Missing required section rewrite parameters" });
        return;
      }

      const ai = getGeminiClient(req);

      const context = await buildCreativeContext(input, {
        endpoint: "rewrite-section",
        songId: currentSong.id,
        currentSong,
        sectionIndex,
        sectionType,
        userInstruction,
        ai,
      });

      // Fetch or build blueprint for section context
      let sectionBlueprintBlock = "";
      try {
        const songBlueprint = await buildSongBlueprint(context, ai, { songId: currentSong.id });
        const matchingPlan = songBlueprint.sectionPlans.find(
          (p) => p.sectionType.toLowerCase() === sectionType.toLowerCase() || p.sectionType.toLowerCase().includes(sectionType.toLowerCase())
        );
        if (matchingPlan) {
          sectionBlueprintBlock = `\n\n=== SECTION BLUEPRINT MANDATE FOR [${sectionType}] ===\n- Purpose: ${matchingPlan.purpose}\n- Narrative Job: ${matchingPlan.narrativeJob}\n- Emotional Job: ${matchingPlan.emotionalJob}\n- Info to Reveal: ${matchingPlan.informationToReveal.join('; ')}\n- Must Not Repeat: ${matchingPlan.mustNotRepeat.join('; ') || 'ไม่มี'}`;
        }
      } catch (bpErr: any) {
        console.warn(`[SongBlueprint] Non-blocking warning during section rewrite blueprint: ${bpErr.message}`);
      }

      const fullLyricsContext = currentSong.sections
        .map((s: any, idx: number) => {
          const isTarget = idx === sectionIndex;
          let str = `[${s.type}] ${isTarget ? "(<- ท่อนนี้คือท่อนที่จะถูก REWRITE)" : ""}`;
          if (s.musicDirection) str += `\n(${s.musicDirection})`;
          if (s.performanceDirection) str += `\n[${s.performanceDirection}]`;
          if (s.lyrics && s.lyrics.length > 0) str += `\n${s.lyrics.join('\n')}`;
          return str;
        })
        .join('\n\n');

      const targetSec = currentSong.sections[sectionIndex] || {};

      const systemInstruction = `คุณคือ Intelligent AI Song Writer สตูดิโอนักแต่งเพลงระดับมืออาชีพ ครูเพลง และนักเขียนเพลงชั้นครู

หน้าที่ของคุณคือ Rewrite เฉพาะท่อน "${sectionType}" (ลำดับที่ ${sectionIndex + 1}) ของเพลง ให้มีคุณภาพระดับมืออาชีพ

กฎการ Rewrite ท่อนเฉพาะและการรักษา REFERENCE CONSISTENCY:
1. ปฏิบัติตามลำดับความสำคัญ (PROMPT PRIORITY) โดยเคร่งครัด:
   USER CREATIVE SETTINGS -> ACTIVE REFERENCE GUIDANCE -> EXISTING SONG / CURRENT LYRICS -> REWRITE INSTRUCTION
2. Rewrite เฉพาะท่อน "${sectionType}" เป็นภาษา "${context.targetContentLanguage}" ให้เข้ากับบริบทเพลงทั้งหมดและเรื่องราวต้นฉบับ
3. รักษาภาษาของเนื้อเพลง (${context.targetContentLanguage}): ห้ามแปลหรือเปลี่ยนภาษาเป็นภาษาอื่น
4. หากมี Active Reference Profile ให้รักษา "Reference Consistency" ด้าน Groove, Rhythmic character, Instrumentation, Vocal character และ Production direction
5. ปรับปรุงทั้งเนื้อเพลง, performanceDirection (Vocal/Performance guidance) และ musicDirection (Music/Arrangement guidance) สำหรับท่อนนี้
6. ปฏิบัติตามหน้าที่เฉพาะของท่อน "${sectionType}":
   - หากเป็น Verse 1: สร้างฉาก เรื่องราว ความขัดแย้งเริ่มต้น
   - หากเป็น Verse 2: ต้องเพิ่มข้อมูลใหม่ รายละเอียดใหม่ หรือเปลี่ยนมุมมอง ห้ามฉายซ้ำ Verse 1
   - หากเป็น Pre-Chorus: สร้าง Tension ยกระดับอารมณ์เตรียมเข้า Hook
   - หากเป็น Chorus: สร้าง Central Idea และ Hook Line ที่จำติดหู ร้องซ้ำง่าย
   - หากเป็น Bridge: เปลี่ยนมุมมอง เปิดเผยความจริง ยอมรับบางอย่าง หรือเปลี่ยน emotional perspective
7. ปฏิบัติตามหลัก Lyric Phrasing & Singability: 1 line = 1 natural singable phrase ไม่ตัดกลางความหมาย เว้นจังหวะหายใจอย่างลงตัว
8. รักษาสัมผัส (Internal + End Rhyme), Singability, และหลีกเลี่ยง Cliché
9. ห้ามนำ direction ไปใส่ใน 'lyrics' array
10. คืนค่า JSON ทั้งเพลง (title, stylePrompt, sections) โดยที่ท่อนอื่นคงเดิมหรือปรับสมดุลเล็กน้อย และท่อน "${sectionType}" ถูก Rewrite ใหม่แล้ว`;

      const prompt = `โปรด Rewrite เฉพาะท่อน "${sectionType}" (ลำดับที่ ${sectionIndex + 1}) ของเพลงนี้ โดยปฏิบัติตามลำดับความสำคัญ (Prompt Priority):

${context.userCreativeSettingsBlock}
${context.creativeAnalysisBlock}

${context.styleExecutionBlock}

${context.lyricPhrasingBlock}

${context.referenceGuidanceBlock}

=== 4. EXISTING SONG / CURRENT LYRICS ===
ชื่อเพลง: ${currentSong.title}
${fullLyricsContext}

=== 5. VOCABULARY & LEXICAL CONTEXT GUIDANCE ===
${context.vocabGuidance}

${context.fewShotGuidanceBlock ? `=== 6. FEW-SHOT SECTION EXEMPLARS & GUIDANCE ===\n${context.fewShotGuidanceBlock}\n\n` : ""}${context.rolePromptBlock || ""}${sectionBlueprintBlock}

=== 7. REWRITE INSTRUCTION FOR SECTION [${sectionType}] ===
Performance Direction ปัจจุบัน: ${targetSec.performanceDirection || "ไม่ระบุ"}
Music Direction ปัจจุบัน: ${targetSec.musicDirection || "ไม่ระบุ"}
Lyrics ปัจจุบัน: ${(targetSec.lyrics || []).join(" | ")}
คำแนะนำพิเศษ: ${userInstruction || "Rewrite ให้ลึกซึ้งยิ่งขึ้นตามมาตรฐานครูเพลง ขจัดวลีสำเร็จรูป เพิ่มภาพ Imagery ชัดเจน และปรับ Section Directions ให้ทรงพลังยิ่งขึ้น"}

โปรดคืนค่า JSON สรุปเพลงทั้งหมด (title, stylePrompt, sections) ที่อัปเดตท่อน "${sectionType}" แล้ว โดยรักษา Reference Consistency`;

      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              stylePrompt: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    performanceDirection: {
                      type: Type.STRING,
                      description: "Vocal and performance direction for Suno",
                    },
                    musicDirection: {
                      type: Type.STRING,
                      description: "Music and arrangement direction for Suno",
                    },
                    lyrics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["type", "lyrics"],
                },
              },
            },
            required: ["title", "stylePrompt", "sections"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");

      // PASS 2: Check and Refine Lyric Phrasing & Singability for target section
      const { sections: phrasedSections } = await refineSongLyricPhrasing(
        parsed,
        context,
        ai,
        {
          endpoint: "rewrite-section",
          targetSectionIndex: sectionIndex,
          targetSectionType: sectionType,
        }
      );
      parsed.sections = phrasedSections;

      res.json({
        ...parsed,
        _modelMeta: modelMeta,
      });
    } catch (err: any) {
      console.error("Rewrite section error:", err.message);
      sendApiError(res, err, "Failed to rewrite section");
    }
  });

  // 6. YouTube Export Info Generator
  router.post("/gemini/youtube-info", async (req, res) => {
    try {
      const { title, stylePrompt, lyricsText } = req.body;
      if (!title || !lyricsText) {
        res.status(400).json({ error: "Title and lyrics text are required" });
        return;
      }

      const ai = getGeminiClient(req);

      const prompt = `จากข้อมูลเพลงที่แต่งเสร็จแล้วต่อไปนี้:
ชื่อเพลง: ${title}
Style Prompt: ${stylePrompt}
เนื้อเพลง:
${lyricsText}

ช่วยสร้างข้อมูลสำหรับเผยแพร่ลง YouTube:
1. YouTube Title: ชื่อคลิป YouTube ที่น่าสนใจและเข้ากับเพลง
2. YouTube Description: คำอธิบายคลิปภาษาไทย เล่าถึงความรู้สึก บรรยากาศ และแนวคิดของเพลงอย่างละเมียดละไม
3. Hashtags: แฮชแท็กที่เกี่ยวข้อง 5-8 อัน เช่น #เพลงใหม่ #เพลงเศร้า #SunoMusic`;

      const { response, modelMeta } = await callGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "ชื่อคลิป YouTube",
              },
              description: {
                type: Type.STRING,
                description: "คำโปรยรายละเอียดคลิป YouTube",
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "แฮชแท็ก YouTube",
              },
            },
            required: ["title", "description", "hashtags"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        title: parsed.title || `${title} — AI Original Song`,
        description: parsed.description || `เพลง ${title}\nเปลี่ยนเรื่องราวและความรู้สึกให้กลายเป็นบทเพลง`,
        hashtags: parsed.hashtags || ["#AISongWriter", "#SunoLyrics", "#OriginalSong"],
        _modelMeta: modelMeta,
      });
    } catch (err: any) {
      console.error("YouTube info error:", err.message);
      sendApiError(res, err, "Failed to generate YouTube details");
    }
  });

  // 7. Cover Art Generation endpoint (Guaranteed JSON API endpoint)
  router.post("/gemini/generate-cover-art", async (req, res) => {
    try {
      const { prompt, aspectRatio, referenceImage, songTitle, stylePrompt } = req.body;
      const ai = getGeminiClient(req);

      const imagePrompt = prompt || `Album cover art for song titled "${songTitle || 'Original Track'}", music style: ${stylePrompt || 'modern acoustic pop'}, artistic, aesthetic, high resolution`;

      // Try image generation via Gemini Imagen
      try {
        const imagenResponse = await ai.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: imagePrompt,
          config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio === "16:9" ? "16:9" : (aspectRatio === "9:16" ? "9:16" : (aspectRatio === "4:3" ? "4:3" : "1:1")),
            outputMimeType: "image/jpeg",
          },
        });

        const base64Image = imagenResponse.generatedImages?.[0]?.image?.imageBytes;
        if (base64Image) {
          const imageUrl = `data:image/jpeg;base64,${base64Image}`;
          res.json({
            ok: true,
            imageUrl,
            aspectRatio: aspectRatio || "1:1",
            prompt: imagePrompt,
          });
          return;
        }
      } catch (imgErr: any) {
        console.warn("Imagen generation fallback attempt:", imgErr.message);
      }

      // If Imagen model is not permitted with key or falls back
      res.json({
        ok: true,
        imageUrl: "",
        prompt: imagePrompt,
        message: "Cover art prompt generated",
      });
    } catch (err: any) {
      console.error("Generate cover art error:", err.message);
      sendApiError(res, err, "Failed to generate cover art");
    }
  });

  return router;
}

export function createApp(): express.Express {
  const app = express();

  // Support JSON & large payloads (e.g. Reference images up to 15MB)
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  const apiRouter = createApiRouter();

  // Mount API router on both /api and Netlify function paths and root
  app.use("/api", apiRouter);
  app.use("/.netlify/functions/api", apiRouter);
  app.use("/", apiRouter);

  // Guarantee JSON 404 for API endpoints
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ ok: false, error: "API endpoint not found" });
  });
  app.use("/.netlify/functions/api/*", (_req, res) => {
    res.status(404).json({ ok: false, error: "API endpoint not found" });
  });

  // Guarantee JSON error format
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[API Error]", err);
    res.status(err.status || 500).json({
      ok: false,
      error: err.message || "Internal server error",
    });
  });

  return app;
}
