import { SectionFunctionType } from './types';

export interface SectionFunctionDefinition {
  type: string;
  functionExpected: SectionFunctionType;
  primaryRole: string;
  failureSign: string;
  canBeProtectedIfStrong: boolean;
}

export const SECTION_FUNCTION_DEFINITIONS: Record<string, SectionFunctionDefinition> = {
  'verse 1': {
    type: 'Verse 1',
    functionExpected: 'scene-setup',
    primaryRole: 'เปิดฉาก วางบรรยากาศ กำหนดน้ำเสียงตัวละคร และปูสถานการณ์ตั้งต้น',
    failureSign: 'พร่ำเพ้อลอยๆ ไร้บรรยากาศ หรือยัดเยียดลิสต์รายชื่อสิ่งของ/อุปกรณ์การทำงานติดต่อกัน (Object Dumping)',
    canBeProtectedIfStrong: false,
  },
  verse: {
    type: 'Verse',
    functionExpected: 'scene-setup',
    primaryRole: 'สร้างภาพจำ บรรยากาศแวดล้อม และขับเคลื่อนเรื่องราวไปข้างหน้า',
    failureSign: 'บรรยายร้อยแก้วยาวเยิ่นเย้อ หรือใช้คำบอกอารมณ์ตรงๆ ซ้ำซ้อน',
    canBeProtectedIfStrong: false,
  },
  'pre-chorus': {
    type: 'Pre-Chorus',
    functionExpected: 'emotional-lift',
    primaryRole: 'ยกระดับความรู้สึก เร่งแรงดันอารมณ์ และส่งต่อเข้าสู่ท่อน Hook ได้อย่างทรงพลัง',
    failureSign: 'อารมณ์เนือยราบเรียบเหมือน Verse ทั่วไป หรือตัดขาดจากท่อนฮุก',
    canBeProtectedIfStrong: false,
  },
  chorus: {
    type: 'Chorus',
    functionExpected: 'central-hook',
    primaryRole: 'ส่งมอบแก่นความจริงสูงสุด (Core Truth), ท่อนจำ Earworm, และ Punchline คมคาย',
    failureSign: 'เล่าเหตุการณ์ซ้ำซ้อน, ยัดเยียดชื่ออุปกรณ์ช่าง/เครื่องมือเฉพาะทาง, หรือขาดประโยคฮุกที่ติดหู',
    canBeProtectedIfStrong: true,
  },
  'verse 2': {
    type: 'Verse 2',
    functionExpected: 'escalation-new-info',
    primaryRole: 'เปิดเผยข้อมูลใหม่ เล่าผลกระทบ ความทรงจำ หรือการเปลี่ยนแปลงของเวลา',
    failureSign: 'เล่าฉากและสิ่งของชุดเดิมซ้ำจาก Verse 1 โดยไม่มีพัฒนาการของเรื่องราว',
    canBeProtectedIfStrong: false,
  },
  bridge: {
    type: 'Bridge',
    functionExpected: 'perspective-shift',
    primaryRole: 'จุดเปลี่ยนมุมมองทางอารมณ์ (Psychological Shift), การตระหนักรู้สัจธรรม หรือการเปิดเผยความเปราะบาง',
    failureSign: 'เป็นเพียง Verse 3 ที่เล่าเหตุการณ์ต่อ หรือตัดพ้อเรื่องเดิมโดยไม่มีมุมมองใหม่',
    canBeProtectedIfStrong: false,
  },
  outro: {
    type: 'Outro',
    functionExpected: 'closure-afterglow',
    primaryRole: 'ทิ้งภาพจำสุดท้ายที่ตกผลึกในใจผู้ฟัง (Final Lingering Image) หรือปิดฉากอย่างตราตรึง',
    failureSign: 'จบห้วนไร้อารมณ์ตกผลึก หรือแค้วนซ้ำท่อนฮุกอย่างเคว้งคว้างไร้ทิศทาง',
    canBeProtectedIfStrong: true,
  },
};

export function getSectionFunction(sectionTypeStr: string): SectionFunctionDefinition {
  const norm = sectionTypeStr.toLowerCase().trim();
  if (norm.includes('verse 1') || norm === 'verse 1') return SECTION_FUNCTION_DEFINITIONS['verse 1'];
  if (norm.includes('verse 2') || norm === 'verse 2') return SECTION_FUNCTION_DEFINITIONS['verse 2'];
  if (norm.includes('pre-chorus') || norm.includes('pre chorus') || norm.includes('lift') || norm.includes('build')) return SECTION_FUNCTION_DEFINITIONS['pre-chorus'];
  if (norm.includes('chorus') || norm.includes('hook') || norm.includes('drop')) return SECTION_FUNCTION_DEFINITIONS['chorus'];
  if (norm.includes('bridge') || norm.includes('breakdown')) return SECTION_FUNCTION_DEFINITIONS['bridge'];
  if (norm.includes('outro') || norm.includes('fade')) return SECTION_FUNCTION_DEFINITIONS['outro'];
  if (norm.includes('verse')) return SECTION_FUNCTION_DEFINITIONS['verse'];

  return {
    type: sectionTypeStr,
    functionExpected: 'scene-setup',
    primaryRole: 'สนับสนุนโครงสร้างดนตรีและการเล่าเรื่องที่กลมกลืน',
    failureSign: 'ขาดความต่อเนื่องทางอารมณ์และฉันทลักษณ์',
    canBeProtectedIfStrong: false,
  };
}

/**
 * 1-5 Scoring Rubric Standard:
 * 5.0: Masterful (ภาพชัด ภาษาเป็นธรรมชาติ สัมผัสลื่นไหล สอดคล้องตามแนวดนตรีอย่างสมบูรณ์)
 * 4.0: Good / Usable (โครงสร้างดี อารมณ์ชัด อาจต้องขัดเกลาคำเล็กน้อย 1-2 คำ)
 * 3.0: Mediocre (สำนวนโหล ภาษากลางๆ ไม่โดดเด่น หรือมีสัมผัสสะดุดเล็กน้อย)
 * 2.0: Heavy Issues (คำท้ายลงซ้ำกันในท่อนเดียว, ศัพท์วิชาการ/หุ่นยนต์, ยัดเยียดอุปกรณ์ช่างในฮุก)
 * 1.0: Critical Failure (ภาษาปนเปื้อน, ฉันทลักษณ์พัง, เนื้อหาขัดแย้งกับแก่นเรื่องโดยสิ้นเชิง)
 */
export const CRITIC_RUBRIC_GUIDELINES = `
[SCORE RUBRIC GUIDELINES: 1 - 5 SCALE]
- 5.0 (Masterful): สำนวนภาษาพูดธรรมชาติลื่นไหล ภาพเปรียบเทียบเชิงอารมณ์บาดลึก (Show Don't Tell), สัมผัสใน-นอกไพเราะ, ประโยคฮุกจำง่ายติดหู, ตรงตามขนบของแนวดนตรี 100%
- 4.0 (Good / Usable): เล่าเรื่องและสื่ออารมณ์ชัดเจน ฉันทลักษณ์ลงตัว อาจมี 1-2 วรรคที่ปรับคำให้คมขึ้นได้
- 3.0 (Mediocre): ใช้คำบอกอารมณ์ตรงๆ ซ้ำซาก (Generic Emotion), ภาพบรรยากาศไม่ชัดเจน, หรือสำนวนภาษาแข็งกระด้าง
- 2.0 (Heavy Issues): 
    * มีคำลงท้ายวรรคซ้ำเสียงเดิมเกิน 2 ครั้งในท่อนเดียวกัน (Repetitive End-Rhymes เช่น เล่น-เล่น-เล่น)
    * ยัดเยียดชื่ออุปกรณ์ช่าง/เครื่องมือเฉพาะทางลงในท่อน Chorus หรือ Bridge
    * มีคำศัพท์เชิงวิชาการ/ภาษาบทความ (เช่น บริบท, มิติ, กำแพงชนชั้น, ขับเคลื่อน) หรือคำหุ่นยนต์ (คูณสอง, 100%)
- 1.0 (Critical / Unusable): ภาษาปนเปื้อน (เช่น ปนภาษาไทยในเพลงสากล), เสียจังหวะห้องดนตรีอย่างรุนแรง, หรือแต่งออกนอกโจทย์
`;