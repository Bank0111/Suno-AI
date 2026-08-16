import { GoogleGenAI } from '@google/genai';
import { SongInput, SongCreativeDirection, DeepCreativeAnalysis } from '../src/types/songwriting';
import { getVocabularyContext } from './vocabulary/engine';
import { formatVocabularyPromptGuidance } from './vocabulary/adapter';
import { SmartVocabularyResult } from './vocabulary/types';
import { deriveCreativeDirection } from './creativeDirection';
import { buildLyricPhrasingDirective } from './phrasing';
import { retrieveTrainingContext, RetrievedTrainingContext } from './training';
import { resolveSongwriterRole, ResolvedSongwriterRole, buildRolePrompt, SongwriterRole } from './songwriting/roles';

export function formatDeepCreativeAnalysisGuidance(
  analysis?: DeepCreativeAnalysis,
  targetLanguage: string = "ไทย"
): string {
  if (!analysis) return "";

  const parts: string[] = [];
  parts.push(`=== DEEP CREATIVE STORY CONCEPT & SONGWRITING BLUEPRINT ===`);
  
  if (analysis.coreMessage) {
    parts.push(`- แก่นแท้ของเพลง (Core Message): "${analysis.coreMessage}"`);
  }
  if (analysis.primaryConflict) {
    parts.push(`- ปมความขัดแย้งหลัก (Primary Conflict): ${analysis.primaryConflict}`);
  }
  if (analysis.emotionalArc) {
    parts.push(`- เส้นทางอารมณ์ (Emotional Arc): ${analysis.emotionalArc}`);
  }
  if (analysis.characterMotivation) {
    parts.push(`- แรงจูงใจและความปรารถนาของตัวละคร (Character Motivation): ${analysis.characterMotivation}`);
  }
  if (analysis.povLogic) {
    parts.push(`- ตรรกะมุมมองการเล่า (POV Logic): ${analysis.povLogic}`);
  }
  if (analysis.centralHookIdea) {
    parts.push(`- ไอเดียท่อนฮุก (Central Hook Idea): "${analysis.centralHookIdea}"`);
  }
  if (analysis.clicheAvoidanceAngle) {
    parts.push(`- มุมมองเฉพาะตัวเพื่อหลีกเลี่ยง Cliché (Unique Specific Angle): ${analysis.clicheAvoidanceAngle}`);
  }
  if (analysis.keyMotifs && analysis.keyMotifs.length > 0) {
    parts.push(`- สัญลักษณ์หลักที่ใช้ซ้ำในเพลง (Key Motifs): ${analysis.keyMotifs.join(', ')}`);
  }
  if (analysis.imageryAnchors && analysis.imageryAnchors.length > 0) {
    parts.push(`- ภาพและรายละเอียดเฉพาะที่ต้องร้อยเรียงในเนื้อเพลง (Specific Imagery Anchors): ${analysis.imageryAnchors.join(' | ')}`);
  }
  if (analysis.endingIdea) {
    parts.push(`- แนวทางบทสรุปตอนจบ (Ending Idea): ${analysis.endingIdea}`);
  }
  if (analysis.sectionBlueprint && analysis.sectionBlueprint.length > 0) {
    parts.push(`- พิมพ์เขียวแนวทางการเล่าของแต่ละท่อน (Section Blueprint):`);
    analysis.sectionBlueprint.forEach((sb) => {
      parts.push(`  • [${sb.section}]: ${sb.guidance}`);
    });
  }

  parts.push(`[คำสั่งกำกับการประพันธ์] ต้องนำแก่นเพลง (Core Message), ปมขัดแย้ง, ภาพเฉพาะเจาะจง (Imagery Anchors), สัญลักษณ์ (Motifs), และพิมพ์เขียวของแต่ละท่อน (Section Blueprint) ไปใช้เป็นแกนหลักในการเขียนเนื้อร้องทุกท่อนอย่างเคร่งครัด`);

  return parts.join('\n');
}

export function resolveTargetContentLanguage(
  input?: { language?: string; customLanguage?: string },
  currentSongLanguage?: string
): { targetContentLanguage: string; languageInstruction: string; isTargetThai: boolean } {
  let lang = "";

  // 1. Explicit User Selection
  if (input?.language) {
    if (input.language === "Custom" && input.customLanguage?.trim()) {
      lang = input.customLanguage.trim();
    } else if (input.language !== "Custom" && input.language.trim()) {
      lang = input.language.trim();
    }
  }

  // 2. Custom Language fallback if input.language wasn't set or was Custom without trimmed customLanguage
  if (!lang && input?.customLanguage?.trim()) {
    lang = input.customLanguage.trim();
  }

  // 3. Song Current Language fallback
  if (!lang && currentSongLanguage?.trim()) {
    lang = currentSongLanguage.trim();
  }

  // 4. System Default (only when absolutely nothing was specified)
  if (!lang) {
    lang = "ไทย";
  }

  const isTargetThai = lang === "ไทย" || lang.toLowerCase() === "thai";
  const isEnglish = lang.toLowerCase() === "english";

  let languageInstruction = "";
  if (isTargetThai) {
    languageInstruction = `=== TARGET CONTENT LANGUAGE: ภาษาไทย (Thai) ===
- ประพันธ์เนื้อร้อง (Lyrics), ชื่อเพลง (Title), และเรื่องราว (Story/Concept) ทั้งหมดเป็น "ภาษาไทย"
- ใส่ใจวรรณยุกต์ เสียงสระ จำนวนพยางค์ จุดพักหายใจ ให้ร้องลื่นเป็นธรรมชาติ`;
  } else if (isEnglish) {
    languageInstruction = `=== TARGET CONTENT LANGUAGE: English ===
- Write all song lyrics, song title, and songwriting story content strictly in "English".
- DO NOT translate or output lyrics/story in Thai. Everything in the songwriting output must be in natural, singable English.
- Focus on natural English rhythm, cadence, meter, syllable stress, singability, and internal/end rhymes.`;
  } else {
    languageInstruction = `=== TARGET CONTENT LANGUAGE: ${lang} ===
- Write all song lyrics, song title, and songwriting story content strictly in "${lang}".
- DO NOT output lyrics or story in Thai unless the target language is Thai. Everything in the songwriting output must be in natural, authentic ${lang}.
- Ensure natural singability, cadence, rhythm, and lyrical flow appropriate for ${lang}.`;
  }

  return {
    targetContentLanguage: lang,
    languageInstruction,
    isTargetThai,
  };
}

export function getPovLabel(pov?: string): string {
  switch (pov) {
    case 'first-person':
      return 'บุคคลที่ 1 – ฉัน / เรา (ผู้เล่าอยู่ในเหตุการณ์โดยตรง)';
    case 'second-person':
      return 'บุคคลที่ 2 – เธอ / คุณ (ผู้เล่าพูดกับอีกคนโดยตรง)';
    case 'third-person':
      return 'บุคคลที่ 3 – เขา / เธอ (ผู้เล่ามองตัวละครจากภายนอก/Storytelling)';
    case 'mixed':
      return 'สลับมุมมอง (อนุญาตให้เปลี่ยน POV ระหว่างเพลงตามเหตุผลทางการเล่าเรื่อง)';
    case 'auto':
    default:
      return 'ให้ AI เลือกให้เหมาะกับเรื่อง (วิเคราะห์ Story + Genre + Style + Mood แล้วเลือก POV ที่เหมาะสมที่สุด และรักษา POV ให้สม่ำเสมอดลอดเพลง)';
  }
}

export function logReferenceDetails(endpointName: string, ref?: any): void {
  const isActive = !!(ref && ref.applied === true && (ref.analysis || ref.source || ref.creativeDirection));
  console.log(`[Reference] ${endpointName} active: ${isActive}`);
  if (isActive) {
    console.log(`[Reference] Reference as Creative Direction Source: applied`);
    console.log(`[Reference] Title/Source: ${ref.title || ref.source || 'N/A'}${ref.artist ? ` / ${ref.artist}` : ''}`);
    if (ref.creativeDirection) {
      console.log(`[Reference] Stored Creative Direction: Genre=${JSON.stringify(ref.creativeDirection.genre)}, Mood=${JSON.stringify(ref.creativeDirection.mood)}, Tempo=${JSON.stringify(ref.creativeDirection.tempo)}`);
    } else if (ref.analysis) {
      console.log(`[Reference] Genre: ${ref.analysis?.genre?.join(', ') || 'N/A'}`);
      console.log(`[Reference] Mood: ${ref.analysis?.mood?.join(', ') || 'N/A'}`);
      console.log(`[Reference] Tempo: ${ref.analysis?.tempo || 'N/A'}`);
      console.log(`[Reference] Vocal: ${ref.analysis?.vocal || 'N/A'}`);
      console.log(`[Reference] Instrumentation: ${ref.analysis?.instrumentation?.join(', ') || 'N/A'}`);
    }
  }
}

export function formatReferenceGuidance(ref?: any, creativeDir?: SongCreativeDirection): string {
  if (!ref || ref.applied !== true || (!ref.analysis && !ref.source && !ref.creativeDirection)) return "";

  const cleanVal = (val: any): string | null => {
    if (val === null || val === undefined) return null;
    const str = String(val).trim();
    if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str === 'NaN' || str === '[object Object]') {
      return null;
    }
    return str;
  };

  const a = ref.analysis || {};
  const parts: string[] = [];

  const title = cleanVal(ref.title);
  const artist = cleanVal(ref.artist || ref.channel);
  const source = cleanVal(ref.source);

  parts.push(`=== ACTIVE REFERENCE GUIDANCE (Creative Direction Source) ===`);
  if (title || artist) {
    parts.push(`- เพลงอ้างอิงที่เป็นแหล่งทิศทางสร้างสรรค์: ${title || 'ไม่ระบุชื่อ'} ${artist ? `(ศิลปิน/ช่อง: ${artist})` : ''}`);
  } else if (source) {
    parts.push(`- แหล่งข้อมูลอ้างอิง: ${source}`);
  }
  parts.push(`- กฎการใช้ Reference เป็น Creative Direction Source (STRICT RULES):`);
  parts.push(`  1. ใช้ Reference เพื่อกำหนดทิศทางดนตรี: Groove, Rhythmic feel, Instrumentation, Vocal Character, Production Character และ Songwriting Dynamic`);
  parts.push(`  2. [กฎเหล็กเด็ดขาด] ห้ามคัดลอกเนื้อเพลง, ห้ามคัดลอกท่อน Hook, ห้ามคัดลอกทำนอง/เมโลดี้, ห้ามคัดลอกประโยค หรือเนื้อหาเรื่องราวเดิมของเพลงอ้างอิงเด็ดขาด!`);
  parts.push(`  3. ต้องแต่งบทเพลงใหม่ทั้งหมดโดยยึดเรื่องราว (Story) ของผู้ใช้เป็นศูนย์กลาง 100%`);
  parts.push(`  4. ลำดับความสำคัญ: การตั้งค่าเฉพาะเจาะจงของผู้ใช้ (Explicit User Setting) สำคัญสูงสุด -> ทิศทางจาก Reference -> AI เลือกให้อัตโนมัติจาก Story`);

  if (creativeDir) {
    const formatFieldVal = (f?: any) => {
      if (!f) return null;
      const v = Array.isArray(f.value) ? f.value.join(', ') : cleanVal(f.value);
      return v ? `${v} [แหล่งที่มา: ${f.sourceLabel || f.source}]` : null;
    };
    const g = formatFieldVal(creativeDir.genre);
    const m = formatFieldVal(creativeDir.mood);
    const t = formatFieldVal(creativeDir.tempo);
    const voc = formatFieldVal(creativeDir.vocal);
    const rhy = formatFieldVal(creativeDir.rhythm);
    const inst = formatFieldVal(creativeDir.instrumentation);
    const prod = formatFieldVal(creativeDir.productionCharacter);

    if (g) parts.push(`- ทิศทางแนวเพลง (Genre Direction): ${g}`);
    if (m) parts.push(`- ทิศทางอารมณ์ (Mood Direction): ${m}`);
    if (t) parts.push(`- ทิศทางความเร็ว (Tempo Direction): ${t}`);
    if (voc) parts.push(`- ทิศทางเสียงร้อง (Vocal Direction): ${voc}`);
    if (rhy) parts.push(`- ทิศทางจังหวะ (Rhythm/Groove): ${rhy}`);
    if (inst) parts.push(`- ทิศทางการเรียบเรียงดนตรี (Instrumentation): ${inst}`);
    if (prod) parts.push(`- ทิศทางการผลิตเสียง (Production Character): ${prod}`);
  } else {
    const cleanGenre = Array.isArray(a.genre) ? a.genre.map(cleanVal).filter(Boolean) : [];
    const cleanMood = Array.isArray(a.mood) ? a.mood.map(cleanVal).filter(Boolean) : [];
    const cleanInstr = Array.isArray(a.instrumentation) ? a.instrumentation.map(cleanVal).filter(Boolean) : [];
    const cleanStruct = Array.isArray(a.structure) ? a.structure.map(cleanVal).filter(Boolean) : [];

    if (cleanGenre.length > 0) parts.push(`- Reference Genre: ${cleanGenre.join(', ')}`);
    if (cleanMood.length > 0) parts.push(`- Reference Mood: ${cleanMood.join(', ')}`);
    if (cleanVal(a.tempo)) parts.push(`- Reference Tempo: ${cleanVal(a.tempo)}`);
    if (cleanVal(a.vocal)) parts.push(`- Reference Vocal Character: ${cleanVal(a.vocal)}`);
    if (cleanInstr.length > 0) parts.push(`- Reference Instrumentation: ${cleanInstr.join(', ')}`);
    if (cleanVal(a.rhythm)) parts.push(`- Reference Rhythm/Groove: ${cleanVal(a.rhythm)}`);
    if (cleanStruct.length > 0) parts.push(`- Reference Structure: ${cleanStruct.join(' -> ')}`);
    if (cleanVal(a.lyricApproach)) parts.push(`- Reference Songwriting Character: ${cleanVal(a.lyricApproach)}`);
    if (cleanVal(a.rhymeApproach)) parts.push(`- Reference Rhyme/Flow: ${cleanVal(a.rhymeApproach)}`);
    if (cleanVal(a.productionCharacter)) parts.push(`- Reference Production Character: ${cleanVal(a.productionCharacter)}`);
    if (cleanVal(a.overallDirection)) parts.push(`- Reference Overall Direction: ${cleanVal(a.overallDirection)}`);
  }

  return parts.join('\n');
}

export function formatSongwritingStyle(style?: any, customStyle?: string): string {
  if (typeof style === 'string' && style.trim()) {
    return style.trim();
  }
  if (typeof style === 'object' && style !== null && style.name) {
    return `${style.name}${style.description ? ` (${style.description})` : ''}`;
  }
  if (customStyle && customStyle.trim()) {
    return customStyle.trim();
  }
  return "ให้ AI กำหนดสไตล์การแต่งเพลงที่เหมาะสมกับแนวเพลงและอารมณ์";
}

export interface StyleExecutionInput {
  pov?: string;
  genres: string[];
  songwritingStyle: string;
  moods: string[];
  rhymeStyle: string;
  wordTone: string;
  languageStyle: string;
  tempo: string;
  rhythm: string;
  vocal: string;
  story?: string;
}

export function buildPovExecutionDirective(input: StyleExecutionInput): string {
  const parts: string[] = [];

  // 1. POV Execution Directive
  const povKey = input.pov || 'auto';
  parts.push(`[1. POV EXECUTION DIRECTIVE]`);
  switch (povKey) {
    case 'first-person':
      parts.push(`- ผู้เล่าเป็นเจ้าของประสบการณ์โดยตรง: ใช้สรรพนามบุคคลที่ 1 ("ฉัน", "ผม", "เรา") รักษาสรรพนามและอารมณ์ความรู้สึกภายในอย่างสม่ำเสมอตลอดเพลง ห้ามสลับไปพูดถึงตัวเองเป็นบุคคลที่ 3 โดยไม่มีเหตุผล`);
      break;
    case 'second-person':
      parts.push(`- ผู้เล่าพูดกับอีกคนโดยตรง: ใช้สรรพนามบุคคลที่ 2 ("เธอ", "คุณ") เป็นการสื่อสารแบบสองต่อสอง รักษาความสัมพันธ์ระหว่างผู้พูดและผู้ฟังให้อยู่ในกรอบการสนทนาโดยตรง`);
      break;
    case 'third-person':
      parts.push(`- ผู้เล่ามองตัวละครจากภายนอก: ใช้สรรพนามบุคคลที่ 3 ("เขา", "เธอ", "ตัวละคร") บรรยายเหตุการณ์และเรื่องราวจากมุมมองผู้สังเกตการณ์ ห้ามหลุดกลับเป็นสรรพนามบุคคลที่ 1 ("ฉัน") โดยเด็ดขาด`);
      break;
    case 'mixed':
      parts.push(`- สลับมุมมองตามหน้าที่ทางการเล่าเรื่อง: อนุญาตให้เปลี่ยน POV ระหว่าง Section ได้เฉพาะเมื่อมีหน้าที่ทางการเล่าเรื่องชัดเจน (เช่น Verse เป็นภาพกว้าง/บุคคลที่ 3 และ Chorus เป็นบทสนทนา/บุคคลที่ 1) และต้องรักษาความชัดเจนในแต่ละ Section`);
      break;
    case 'auto':
    default:
      parts.push(`- วิเคราะห์ Story, Genre, Style และ Mood เพื่อเลือก POV ที่ส่งพลังอารมณ์ดีที่สุด โดยให้ประกาศ POV ที่เลือกในโครงสร้างความคิดก่อนเขียน และรักษา POV นั้นอย่างสม่ำเสมอทั้งเพลง`);
      break;
  }

  // 2. Genre & Songwriting Style Execution Directive
  parts.push(`\n[2. GENRE & SONGWRITING STYLE EXECUTION DIRECTIVE]`);
  const joinedGenresAndStyle = [...input.genres, input.songwritingStyle].join(' ').toLowerCase();

  const isPop = joinedGenresAndStyle.includes('pop') || joinedGenresAndStyle.includes('ป๊อป');
  const isRockAlt = joinedGenresAndStyle.includes('rock') || joinedGenresAndStyle.includes('alternative') || joinedGenresAndStyle.includes('ร็อก') || joinedGenresAndStyle.includes('ร็อค');
  const isIndie = joinedGenresAndStyle.includes('indie') || joinedGenresAndStyle.includes('อินดี้') || joinedGenresAndStyle.includes('folk') || joinedGenresAndStyle.includes('โฟล์ค');
  const isLukThungPueaChiwit = joinedGenresAndStyle.includes('ลูกทุ่ง') || joinedGenresAndStyle.includes('เพื่อชีวิต') || joinedGenresAndStyle.includes('country') || joinedGenresAndStyle.includes('คันทรี');
  const isRnBSoul = joinedGenresAndStyle.includes('r&b') || joinedGenresAndStyle.includes('rnb') || joinedGenresAndStyle.includes('soul') || joinedGenresAndStyle.includes('อาร์แอนด์บี') || joinedGenresAndStyle.includes('โซล');
  const isHipHopRap = joinedGenresAndStyle.includes('hip-hop') || joinedGenresAndStyle.includes('hiphop') || joinedGenresAndStyle.includes('rap') || joinedGenresAndStyle.includes('แร็ป') || joinedGenresAndStyle.includes('ฮิปฮอป') || joinedGenresAndStyle.includes('trap');

  if (isHipHopRap) {
    parts.push(`- การประพันธ์สไตล์ Hip-Hop/Rap: เน้น Cadence ที่มีจังหวะจะโคน, สัมผัสใน (Internal Rhyme) ที่แพรวพราว, รายละเอียดการเล่าเรื่องที่จริงใจกระชับ, Wordplay ที่สอดคล้องกับเรื่องราว และจังหวะภาษาพูดที่มี Attitude`);
  } else if (isRnBSoul) {
    parts.push(`- การประพันธ์สไตล์ R&B/Soul: เน้นความละเอียดอ่อนทางอารมณ์ (Emotional Nuance), ภาษาร้องที่เป็นธรรมชาติลื่นไหล, สัมผัสในที่เชื่อมเมโลดี้ง่าย (Internal Rhyme / Melodic Phrasing), และการทวนซ้ำวลีที่มีเป้าหมายทางดนตรี`);
  } else if (isLukThungPueaChiwit) {
    parts.push(`- การประพันธ์สไตล์ ลูกทุ่ง/เพื่อชีวิต: เน้นการเล่าเรื่องแบบธรรมชาติ (Natural Storytelling), ใช้รายละเอียดของชีวิตจริง (คน, งาน, สถานที่, ความดิ้นรน), ภาษาซื่อตรง จริงใจ สลักจิตวิญญาณ และสอดคล้องกับบริบทวัฒนธรรม`);
  } else if (isIndie) {
    parts.push(`- การประพันธ์สไตล์ Indie/Alternative Folk: เน้นภาพเปรียบเทียบที่ไม่ซ้ำใคร (Unusual Imagery), รายละเอียดเฉพาะตัวที่มองเห็นภาพชัด (Specific Details), มุมมองส่วนตัวที่ลึกซึ้ง และหลีกเลี่ยงสำนวนสำเร็จรูป (Formulaic Phrasing)`);
  } else if (isRockAlt) {
    parts.push(`- การประพันธ์สไตล์ Rock/Alternative: เน้น ทัศนคติที่เด็ดเดี่ยว (Attitude), สร้างความขัดแย้ง/แรงปะทะทางอารมณ์ (Tension), ใช้ภาษาที่คมชัด มีน้ำหนัก และปล่อยพลังในท่อน Chorus อย่างทรงพลัง`);
  } else if (isPop) {
    parts.push(`- การประพันธ์สไตล์ Pop: เน้น ภาษาที่เข้าถึงง่าย (Accessible Language), การลำดับอารมณ์ที่ชัดเจน, Hook ที่จำง่ายและติดหู, และการทวนซ้ำประโยคอย่างมีเป้าหมายสร้าง Identity`);
  } else {
    parts.push(`- การประพันธ์ตามสไตล์แนวเพลง: ผสมผสานภาษาที่เป็นธรรมชาติ การลำดับอารมณ์ที่ชัดเจน และ Hook ที่มีเอกลักษณ์สอดคล้องกับสไตล์ ${input.songwritingStyle || 'สไตล์เพลง'}`);
  }

  // 3. Mood Execution Directive
  parts.push(`\n[3. MOOD EXECUTION DIRECTIVE]`);
  const joinedMoods = input.moods.join(' ').toLowerCase();
  
  if (joinedMoods.includes('เศร้า') || joinedMoods.includes('อกหัก') || joinedMoods.includes('ผิดหวัง') || joinedMoods.includes('sad') || joinedMoods.includes('melancholic')) {
    parts.push(`- การถ่ายทอดอารมณ์เศร้า (Show Don't Tell): แสดงความเจ็บปวดผ่านรายละเอียด ฉาก สิ่งของรอบตัว และพฤติกรรม หลีกเลี่ยงการพูดย้ำเพียงแค่คำว่า "ฉันเศร้า" หรือ "ฉันเสียใจ" ซ้ำๆ โดยไม่มีภาพรองรับ`);
  } else if (joinedMoods.includes('รัก') || joinedMoods.includes('โรแมนติก') || joinedMoods.includes('หวาน') || joinedMoods.includes('love') || joinedMoods.includes('romantic')) {
    parts.push(`- การถ่ายทอดอารมณ์รัก/โรแมนติก: เน้นปฏิสัมพันธ์ (Interaction), รายละเอียดเชิงสัมผัส (Sensory details: สายตา, สัมผัส, เสียง) และบรรยากาศความใกล้ชิดที่สัมผัสได้จริง`);
  } else if (joinedMoods.includes('โกรธ') || joinedMoods.includes('แค้น') || joinedMoods.includes('ประชด') || joinedMoods.includes('angry')) {
    parts.push(`- การถ่ายทอดอารมณ์โกรธ/แค้น: ใช้ Diction และ Cadence ที่มีแรงปะทะ คมชัด ฟาดฟัน และจังหวะประโยคที่เด็ดเดี่ยวสะท้อนอารมณ์เดือดดาล`);
  } else if (joinedMoods.includes('คิดถึง') || joinedMoods.includes('เหงา') || joinedMoods.includes('อาลัย') || joinedMoods.includes('nostalgic') || joinedMoods.includes('lonely')) {
    parts.push(`- การถ่ายทอดอารมณ์คิดถึง/เหงา: เน้นสิ่งของเฉพาะตัว (Memory cues), สถานที่เดิม, ความเงียบรอบตัว และมิติเวลาที่ค้างคา`);
  } else if (joinedMoods.includes('สุข') || joinedMoods.includes('สดใส') || joinedMoods.includes('สนุก') || joinedMoods.includes('happy') || joinedMoods.includes('upbeat')) {
    parts.push(`- การถ่ายทอดอารมณ์สดใส/มีสุข: ใช้ภาพบรรยากาศที่เปิดกว้าง จังหวะประโยคที่กระปรี้กระเปร่า มีพลังก้าวไปข้างหน้า`);
  } else {
    parts.push(`- การถ่ายทอดอารมณ์ (${input.moods.join(', ')}): ใช้ภาพเปรียบเทียบ เหตุการณ์ และฉากที่ชัดเจนสะท้อนอารมณ์หลักโดยไม่ต้องใช้ Label ซ้ำๆ`);
  }

  // 4. Rhyme, Word Tone & Language Style Execution Directive
  parts.push(`\n[4. RHYME & LANGUAGE EXECUTION DIRECTIVE]`);
  parts.push(`- การใช้สัมผัส (${input.rhymeStyle}): เน้นจังหวะภาษาพูดที่เป็นธรรมชาติ มีสัมผัสใน (Internal Rhyme) ที่ไหลลื่น ไม่บังคับสัมผัสสระจนทำลายความหมายจริง`);
  parts.push(`- โทนคำ (${input.wordTone}) & วิธีใช้ภาษา (${input.languageStyle}): ใช้ภาษาที่สอดคล้องกับโทนที่กำหนด หลีกเลี่ยงภาษาประดิษฐ์ซับซ้อนเกินจำเป็น ให้คำร้องมีความจริงใจและร้องเข้าปากง่าย (Singability)`);

  // 5. Tempo, Rhythm & Vocal Execution Directive
  parts.push(`\n[5. TEMPO, RHYTHM & VOCAL EXECUTION DIRECTIVE]`);
  if (input.tempo.includes('เร็ว') || input.tempo.includes('Fast') || input.tempo.includes('120')) {
    parts.push(`- Tempo เร็ว: ใช้ประโยคคำร้องกระชับ จังหวะคำแน่น (Tighter Cadence) เพื่อให้สอดคล้องกับบีทที่รวดเร็ว`);
  } else if (input.tempo.includes('ช้า') || input.tempo.includes('Slow') || input.tempo.includes('60') || input.tempo.includes('70')) {
    parts.push(`- Tempo ช้า: ใช้ประโยคคำร้องยาวขึ้น ทิ้งช่วงให้มี space หายใจและใส่อารมณ์ได้อย่างลึกซึ้ง`);
  } else {
    parts.push(`- Tempo ปานกลาง: ใช้ประโยคความยาวสมดุล ทอดจังหวะคำร้องได้อย่างเป็นธรรมชาติ`);
  }

  if (input.vocal.includes('นุ่มนวล') || input.vocal.includes('เบา') || input.vocal.includes('กระซิบ') || input.vocal.includes('Intimate')) {
    parts.push(`- Vocal Direction: เน้นคำร้องสไตล์พูดคุยใกล้ชิด ทอดเสียงนุ่มนวล เป็นกันเอง`);
  } else if (input.vocal.includes('ทรงพลัง') || input.vocal.includes('หนักแน่น') || input.vocal.includes('Powerful')) {
    parts.push(`- Vocal Direction: เน้นจังหวะคำร้องที่หนักแน่น มีพลัง โดยเฉพาะท่อน Hook Peak ที่ส่งพลังเสียงได้อย่างเต็มที่`);
  }

  return parts.join('\n');
}

export interface CreativeContextOptions {
  endpoint: 'generate-song' | 'refine-song' | 'rewrite-section' | 'expand-idea';
  songId?: string;
  currentSong?: any;
  sectionIndex?: number;
  sectionType?: string;
  userInstruction?: string;
  isNewAngle?: boolean;
  ai?: GoogleGenAI;
}

export interface BuiltCreativeContext {
  story: string;
  creativeDirection: SongCreativeDirection;
  allGenres: string[];
  genresStr: string;
  allMoods: string[];
  moodsStr: string;
  songwritingStyleStr: string;
  langStr: string;
  targetContentLanguage: string;
  languageInstruction: string;
  isTargetThai: boolean;
  wordToneStr: string;
  languageStyleStr: string;
  povStr: string;
  rhymeStyleStr: string;
  tempoStr: string;
  bpmStr: string;
  rhythmStr: string;
  vocalStr: string;
  structureStr: string;
  
  styleExecutionDirective: string;
  styleExecutionBlock: string;

  lyricPhrasingDirective: string;
  lyricPhrasingBlock: string;

  vocabContext: SmartVocabularyResult | null;
  vocabGuidance: string;
  isVocabActive: boolean;

  creativeAnalysis?: DeepCreativeAnalysis | null;
  creativeAnalysisGuidance: string;
  creativeAnalysisBlock: string;

  isReferenceActive: boolean;
  referenceGuidance: string;

  userCreativeSettingsBlock: string;
  referenceGuidanceBlock: string;
  vocabGuidanceBlock: string;

  trainingContext?: RetrievedTrainingContext;
  fewShotGuidanceBlock: string;

  resolvedRole?: ResolvedSongwriterRole;
  rolePromptBlock: string;
}

export async function buildCreativeContext(
  input: SongInput,
  options: CreativeContextOptions
): Promise<BuiltCreativeContext> {
  const story = (input.story || "").trim();

  // 1. Resolve Song Creative Direction (Priority: User Explicit > Reference > Auto from Story)
  // If Reference is applied and already has stored creativeDirection, use it (No Re-Analysis)
  const creativeDirection: SongCreativeDirection =
    (input.reference?.applied && input.reference.creativeDirection)
      ? input.reference.creativeDirection
      : deriveCreativeDirection(input);

  // Genre string & array
  const rawGenreVal = creativeDirection.genre?.value;
  const allGenres = Array.isArray(rawGenreVal)
    ? rawGenreVal
    : (typeof rawGenreVal === 'string' && rawGenreVal ? [rawGenreVal] : ['Pop']);
  const genresStr = allGenres.join(", ");

  // Mood string & array
  const rawMoodVal = creativeDirection.mood?.value;
  const allMoods = Array.isArray(rawMoodVal)
    ? rawMoodVal
    : (typeof rawMoodVal === 'string' && rawMoodVal ? [rawMoodVal] : ['เศร้า']);
  const moodsStr = allMoods.join(", ");

  // Songwriting Style
  const rawStyleVal = creativeDirection.songwritingStyle?.value;
  const songwritingStyleStr = typeof rawStyleVal === 'string' && rawStyleVal
    ? rawStyleVal
    : formatSongwritingStyle(input.songwritingStyle, input.customSongwritingStyle);

  // Language resolution with strict priority: Explicit User > Custom > Song Current > Default
  const { targetContentLanguage, languageInstruction, isTargetThai } = resolveTargetContentLanguage(
    input,
    options.currentSong?.language
  );
  const langStr = targetContentLanguage;

  // Word Tone, Language Style, Rhyme Style, POV
  const wordToneStr = input.wordTone || "เป็นธรรมชาติ เข้าใจง่าย";
  const languageStyleStr = (typeof creativeDirection.languageStyle?.value === 'string' && creativeDirection.languageStyle.value)
    ? creativeDirection.languageStyle.value
    : (input.languageStyle || "ตรงไปตรงมา");
  const povStr = getPovLabel(input.pointOfView);
  const rhymeStyleStr = (typeof creativeDirection.rhymeStyle?.value === 'string' && creativeDirection.rhymeStyle.value)
    ? creativeDirection.rhymeStyle.value
    : (input.rhymeStyle || "ให้ AI เลือกให้เหมาะสม");

  // Tempo & BPM
  const tempoStr = (typeof creativeDirection.tempo?.value === 'string' && creativeDirection.tempo.value)
    ? creativeDirection.tempo.value
    : (input.tempo || "ปานกลาง (80–100 BPM)");
  const rawBpm = creativeDirection.bpm?.value ?? input.bpm;
  const bpmStr = rawBpm ? `${rawBpm} BPM` : "";

  // Rhythm & Vocal
  const rawRhythmVal = creativeDirection.rhythm?.value;
  const rhythmStr = Array.isArray(rawRhythmVal)
    ? rawRhythmVal.join(", ")
    : (typeof rawRhythmVal === 'string' && rawRhythmVal ? rawRhythmVal : "จังหวะมาตรฐานตามแนวเพลง");
  const vocalStr = (typeof creativeDirection.vocal?.value === 'string' && creativeDirection.vocal.value)
    ? creativeDirection.vocal.value
    : (input.vocalType === "กำหนดเอง" && input.vocalCustomDescription
        ? `กำหนดเอง (${input.vocalCustomDescription})`
        : (input.vocalType || "หญิง"));

  // Structure
  let structureStr = "";
  let structureArray: string[] = [];
  if (options.endpoint === 'generate-song') {
    const rawStructVal = creativeDirection.structure?.value;
    const rawStructure = Array.isArray(rawStructVal) && rawStructVal.length > 0
      ? rawStructVal
      : (input.structure && input.structure.length > 0
          ? input.structure 
          : ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro"]);
    structureArray = rawStructure;
    structureStr = rawStructure.join(" -> ");
  } else if (options.currentSong?.sections && Array.isArray(options.currentSong.sections)) {
    structureArray = options.currentSong.sections.map((s: any) => s.type);
    structureStr = structureArray.join(" -> ");
  } else {
    structureArray = input.structure || ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro"];
    structureStr = structureArray.join(" -> ");
  }

  // Instrumentation & Production from Creative Direction
  const rawInstr = creativeDirection.instrumentation?.value;
  const instrStr = Array.isArray(rawInstr) ? rawInstr.join(', ') : (typeof rawInstr === 'string' ? rawInstr : 'เครื่องดนตรีหลักตามแนวเพลง');
  const rawProd = creativeDirection.productionCharacter?.value;
  const prodStr = typeof rawProd === 'string' && rawProd ? rawProd : 'Modern Production';

  // Build Contextual Style Execution Directive
  const styleExecutionDirective = buildPovExecutionDirective({
    pov: input.pointOfView,
    genres: allGenres,
    songwritingStyle: songwritingStyleStr,
    moods: allMoods,
    rhymeStyle: rhymeStyleStr,
    wordTone: wordToneStr,
    languageStyle: languageStyleStr,
    tempo: tempoStr,
    rhythm: rhythmStr,
    vocal: vocalStr,
    story,
  });

  // Build Lyric Phrasing & Singability Directive
  const lyricPhrasingDirective = buildLyricPhrasingDirective({
    genres: allGenres,
    songwritingStyle: songwritingStyleStr,
    moods: allMoods,
    tempo: tempoStr,
    bpm: rawBpm,
    rhythm: rhythmStr,
    vocal: vocalStr,
    rhymeStyle: rhymeStyleStr,
    wordTone: wordToneStr,
    languageStyle: languageStyleStr,
    structure: structureArray,
    sectionType: options.sectionType,
    story,
    creativeDirection,
  });

  // Active Reference
  const isReferenceActive = !!(input.reference && input.reference.applied === true && (input.reference.analysis || input.reference.source || input.reference.creativeDirection));
  logReferenceDetails(options.endpoint, input.reference);
  const referenceGuidance = formatReferenceGuidance(input.reference, creativeDirection);

  // Vocabulary Context
  let vocabContext: SmartVocabularyResult | null = null;
  let vocabGuidance = "ใช้คำศัพท์ทางดนตรีและภาษาที่เป็นธรรมชาติ เหมาะสมกับเรื่องราว";
  let isVocabActive = false;

  try {
    const targetSongId = options.songId || options.currentSong?.id;
    vocabContext = await getVocabularyContext(input, { songId: targetSongId }, options.ai);
    if (vocabContext) {
      vocabGuidance = formatVocabularyPromptGuidance(vocabContext);
      isVocabActive = (vocabContext.core?.length || 0) > 0 || (vocabContext.supporting?.length || 0) > 0;
    }
  } catch (err: any) {
    console.error(`[VocabularyEngine] Warning in ${options.endpoint}:`, err.message);
  }

  // Few-Shot Training Knowledge Retrieval
  const trainingContext: RetrievedTrainingContext = retrieveTrainingContext({
    language: targetContentLanguage,
    customLanguage: input.customLanguage,
    genres: allGenres,
    moods: allMoods,
    sectionType: options.sectionType,
    songwritingStyle: songwritingStyleStr,
    pointOfView: povStr,
    story,
    lexicalContext: vocabContext,
  });

  const fewShotGuidanceBlock = trainingContext.hasData
    ? trainingContext.promptGuidanceBlock
    : "";

  // Debug Logging for Development
  console.log(`[CreativeContext] endpoint: ${options.endpoint}`);
  console.log(`[CreativeContext] language: ${langStr}`);
  console.log(`[CreativeContext] genre: ${genresStr} (${creativeDirection.genre?.sourceLabel || creativeDirection.genre?.source})`);
  console.log(`[CreativeContext] mood: ${moodsStr} (${creativeDirection.mood?.sourceLabel || creativeDirection.mood?.source})`);
  console.log(`[CreativeContext] songwritingStyle: ${songwritingStyleStr}`);
  console.log(`[CreativeContext] pov: ${povStr}`);
  console.log(`[CreativeContext] tempo: ${tempoStr} (${creativeDirection.tempo?.sourceLabel || creativeDirection.tempo?.source})`);
  console.log(`[CreativeContext] bpm: ${bpmStr || 'N/A'}`);
  console.log(`[CreativeContext] rhythm: ${rhythmStr}`);
  console.log(`[CreativeContext] vocal: ${vocalStr} (${creativeDirection.vocal?.sourceLabel || creativeDirection.vocal?.source})`);
  console.log(`[CreativeContext] phrasingEngine: active`);
  console.log(`[CreativeContext] vocabulary: ${isVocabActive ? 'active' : 'inactive'}`);
  console.log(`[CreativeContext] reference: ${isReferenceActive ? 'active' : 'inactive'}`);
  console.log(`[CreativeContext] trainingKnowledge: ${trainingContext.hasData ? `active (${trainingContext.genreKey}, ${trainingContext.goodExemplars.length} good, ${trainingContext.correctionPairs.length} pairs)` : 'inactive'}`);

  // Formatted Prompt Blocks (Strict Priority: User Explicit > Reference > Auto)
  const modeLabel = isReferenceActive
    ? "REFERENCE-DRIVEN CREATIVE DIRECTION (สร้างเพลงใหม่จาก Story โดยใช้ทิศทางดนตรีจาก Reference)"
    : "AUTO / STORY-DRIVEN CREATIVE DIRECTION (วิเคราะห์ Story และกำหนด Creative Direction ทั้งหมดให้เหมาะสม)";

  const userCreativeSettingsBlock = `=== 1. CREATIVE DIRECTION & USER SETTINGS (${modeLabel}) ===
- เรื่องราว/พล็อต (Story Prompt): "${story}"
- ภาษาเป้าหมายของเนื้อร้องและเพลง (Target Content Language): ${targetContentLanguage}
- แนวเพลงหลัก (Genre): ${genresStr} [แหล่งที่มา: ${creativeDirection.genre?.sourceLabel || creativeDirection.genre?.source}]
- อารมณ์เพลงหลัก (Mood): ${moodsStr} [แหล่งที่มา: ${creativeDirection.mood?.sourceLabel || creativeDirection.mood?.source}]
- สไตล์การแต่งเพลง (Songwriting Style): ${songwritingStyleStr}
- ความเร็วเพลง/BPM: ${tempoStr}${bpmStr ? ` (${bpmStr})` : ''} [แหล่งที่มา: ${creativeDirection.tempo?.sourceLabel || creativeDirection.tempo?.source}]
- ลักษณะจังหวะ (Rhythm/Groove): ${rhythmStr} [แหล่งที่มา: ${creativeDirection.rhythm?.sourceLabel || creativeDirection.rhythm?.source}]
- เสียงร้องหลัก (Vocal Character): ${vocalStr} [แหล่งที่มา: ${creativeDirection.vocal?.sourceLabel || creativeDirection.vocal?.source}]
- การเรียบเรียงดนตรี (Instrumentation): ${instrStr} [แหล่งที่มา: ${creativeDirection.instrumentation?.sourceLabel || creativeDirection.instrumentation?.source}]
- ทิศทางการผลิตเสียง (Production Character): ${prodStr}
- โทนคำ: ${wordToneStr}
- วิธีใช้ภาษา: ${languageStyleStr}
- มุมมองการเล่าเรื่อง (POV): ${povStr}
- รูปแบบสัมผัส: ${rhymeStyleStr}
- ลำดับโครงสร้างเพลง: [${structureStr}]

${languageInstruction}`;

  const styleExecutionBlock = `=== 2. STYLE EXECUTION DIRECTIVE (แนวทางการประพันธ์และเล่าเรื่องเชิงลึก) ===
${styleExecutionDirective}`;

  const lyricPhrasingBlock = `${lyricPhrasingDirective}`;

  const referenceGuidanceBlock = isReferenceActive
    ? referenceGuidance
    : "=== 3. ACTIVE REFERENCE GUIDANCE ===\nไม่มีเพลงอ้างอิง (ใช้โหมด Auto Story Direction)";

  const vocabGuidanceBlock = `=== VOCABULARY & LEXICAL CONTEXT GUIDANCE ===
${vocabGuidance}`;

  // Deep Creative Analysis & Blueprint
  const creativeAnalysis = input.creativeAnalysis || null;
  const creativeAnalysisGuidance = creativeAnalysis
    ? formatDeepCreativeAnalysisGuidance(creativeAnalysis, targetContentLanguage)
    : "";
  const creativeAnalysisBlock = creativeAnalysisGuidance
    ? `\n\n${creativeAnalysisGuidance}`
    : "";

  // 13. Songwriter Role Resolution & Prompt Block (Role Engine v1.0)
  const resolvedRole = resolveSongwriterRole({
    language: targetContentLanguage,
    genre: allGenres,
    subGenre: typeof creativeDirection.genre?.value === 'string' ? [creativeDirection.genre.value] : (Array.isArray(creativeDirection.genre?.value) ? creativeDirection.genre?.value : []),
    mood: allMoods,
    persona: wordToneStr || languageStyleStr,
    storytellingStyle: songwritingStyleStr,
    requestedRole: (input as any).requestedRole || (input as any).roleId,
    story,
  });

  const rolePromptContent = buildRolePrompt(resolvedRole.role, {
    targetContentLanguage,
    sectionType: options.sectionType,
    story,
  });
  const rolePromptBlock = `\n\n=== 7. SONGWRITER ROLE & CRAFTSMANSHIP DIRECTIVE (${resolvedRole.role.name}) ===\n${rolePromptContent}`;

  return {
    story,
    creativeDirection,
    allGenres,
    genresStr,
    allMoods,
    moodsStr,
    songwritingStyleStr,
    langStr,
    targetContentLanguage,
    languageInstruction,
    isTargetThai,
    wordToneStr,
    languageStyleStr,
    povStr,
    rhymeStyleStr,
    tempoStr,
    bpmStr,
    rhythmStr,
    vocalStr,
    structureStr,
    styleExecutionDirective,
    styleExecutionBlock,
    lyricPhrasingDirective,
    lyricPhrasingBlock,
    vocabContext,
    vocabGuidance,
    isVocabActive,
    creativeAnalysis,
    creativeAnalysisGuidance,
    creativeAnalysisBlock,
    isReferenceActive,
    referenceGuidance,
    userCreativeSettingsBlock,
    referenceGuidanceBlock,
    vocabGuidanceBlock,
    trainingContext,
    fewShotGuidanceBlock,
    resolvedRole,
    rolePromptBlock,
  };
}
