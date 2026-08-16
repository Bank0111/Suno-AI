import { PersonaProfile } from '../types';

/**
 * PERSONA PROFILES DATASET
 * Explicit behavioral and linguistic profiles defining speech patterns,
 * vocabulary allowances, and register constraints per character archetype.
 */
export const PERSONA_PROFILES: PersonaProfile[] = [
  {
    personaKey: 'rustic-playful-male',
    displayName: 'หนุ่มบ้าน ๆ จริงใจ ขี้เล่น',
    description: 'ชายหนุ่มชนบทหรือบ้านใกล้เรือนเคียง แอบชอบหญิงสาว ชอบหยอกล้อแต่ใจจริงซื่อสัตย์',
    primaryRegisters: ['spoken', 'conversational', 'dialect'],
    speechTraits: {
      colloquialLevel: 'high',
      isPlayful: true,
      isRustic: true,
      isUrban: false,
      particles: ['หนา', 'เด้อ', 'เนี่ย', 'ล่ะ', 'จัง'],
    },
    vocabularyAllowance: {
      preferredWords: ['มอไซค์', 'ข้างบ้าน', 'แกล้ง', 'บีบแตร', 'จริงใจ', 'เขิน', 'ซื่อๆ', 'ชวนคุย'],
      forbiddenRegisters: ['formal', 'literary', 'poetic'],
      forbiddenMetaphors: ['คณิตศาสตร์/ระบบคอมพิวเตอร์', 'คำราชาศัพท์', 'บทกวีชั้นสูง'],
    },
    sourceType: 'synthetic-expert',
  },
  {
    personaKey: 'urban-secret-crush',
    displayName: 'สาวเมืองแอบรัก',
    description: 'หญิงสาววัยทำงานหรือนักศึกษาในเมืองใหญ่ แอบชอบใครบางคนแต่เก็บความรู้สึกไว้กับสิ่งของรอบตัว',
    primaryRegisters: ['conversational', 'spoken', 'neutral'],
    speechTraits: {
      colloquialLevel: 'medium',
      isPlayful: false,
      isRustic: false,
      isUrban: true,
      particles: ['นะ', 'มั้ย', 'สิ', 'หน่อย'],
    },
    vocabularyAllowance: {
      preferredWords: ['แชท', 'กาแฟ', 'แอบมอง', 'รอยยิ้ม', 'ข้อความ', 'ขี้อาย', 'ร้านเดิม', 'หูฟัง'],
      forbiddenRegisters: ['formal', 'dialect'],
      forbiddenMetaphors: ['คำหยาบคาย', 'สำนวนลูกทุ่งโบราณ'],
    },
    sourceType: 'synthetic-expert',
  },
  {
    personaKey: 'urban-hustler-worker',
    displayName: 'คนทำงานเมืองใหญ่',
    description: 'คนสู้ชีวิตในเมืองกรุง ทำงานหนักเพื่ออนาคตและความฝัน เผชิญกับความเหนื่อยล้าแต่ไม่ยอมแพ้',
    primaryRegisters: ['conversational', 'spoken'],
    speechTraits: {
      colloquialLevel: 'high',
      isPlayful: false,
      isRustic: false,
      isUrban: true,
      particles: ['วะ', 'ดิ', 'ไง', 'นะเว้ย'],
    },
    vocabularyAllowance: {
      preferredWords: ['รถติด', 'รถไฟฟ้า', 'ดึกดื่น', 'เงินเดือน', 'ก้าวต่อ', 'เหนื่อย', 'สู้', 'ห้องเช่า'],
      forbiddenRegisters: ['formal', 'literary'],
      forbiddenMetaphors: ['คำกวีโบราณ', 'คำหวานเลี่ยนเกินจริง'],
    },
    sourceType: 'synthetic-expert',
  },
  {
    personaKey: 'heartbroken-direct-speaker',
    displayName: 'คนอกหักพูดตรง',
    description: 'คนที่เพิ่งจบความสัมพันธ์ เจ็บปวดแต่ยอมรับความจริง พูดจาชัดเจน ไม่อ้อนวอนขอคืนดีแบบฟูมฟาย',
    primaryRegisters: ['conversational', 'spoken'],
    speechTraits: {
      colloquialLevel: 'medium',
      isPlayful: false,
      isRustic: false,
      isUrban: false,
      particles: ['เหอะ', 'แล้วกัน', 'จบ', 'พอ'],
    },
    vocabularyAllowance: {
      preferredWords: ['จบกันที', 'ปล่อยมือ', 'ความจริง', 'เหนื่อยใจ', 'โชคดีนะ', 'ไม่เป็นไร', 'ตัดใจ'],
      forbiddenRegisters: ['formal', 'poetic'],
      forbiddenMetaphors: ['คำสัญญาตลอดกาล', 'น้ำตารินไหลอาบสองแก้ม'],
    },
    sourceType: 'synthetic-expert',
  },
  {
    personaKey: 'indie-storyteller',
    displayName: 'นักเล่าเรื่องสาย Indie',
    description: 'คนช่างสังเกต ละเอียดอ่อนต่อรายละเอียดเล็กๆ ในชีวิตประจำวัน บรรยากาศอบอุ่นและมีกลิ่นอายความคิดถึง',
    primaryRegisters: ['conversational', 'neutral', 'literary'],
    speechTraits: {
      colloquialLevel: 'medium',
      isPlayful: false,
      isRustic: false,
      isUrban: true,
      particles: ['มั้ง', 'เนอะ', 'เลย', 'เงียบๆ'],
    },
    vocabularyAllowance: {
      preferredWords: ['แดดร่มลมตก', 'ต้นไม้', 'กระถาง', 'รูปถ่าย', 'ฟิล์ม', 'เพลงโปรด', 'วันวาน', 'ความทรงจำ'],
      forbiddenRegisters: ['formal'],
      forbiddenMetaphors: ['สแควร์รูท/เปอร์เซ็นต์', 'คำหยาบรุนแรง'],
    },
    sourceType: 'synthetic-expert',
  },
  {
    personaKey: 'street-hustler-mc',
    displayName: 'Street / Hip-Hop Voice',
    description: 'แร็ปเปอร์ริมถนน มั่นใจ ดุดัน เล่าเรื่องราวจากประสบการณ์จริงและไรม์ที่เฉียบคม',
    primaryRegisters: ['spoken'],
    speechTraits: {
      colloquialLevel: 'high',
      isPlayful: false,
      isRustic: false,
      isUrban: true,
      particles: ['เว้ย', 'ดิ', 'ไง', 'วะ'],
    },
    vocabularyAllowance: {
      preferredWords: ['ไมค์', 'เวที', 'ไรม์', 'ถนน', 'สองมือ', 'หยาดเหงื่อ', 'พิสูจน์', 'ไม่ยอมแพ้'],
      forbiddenRegisters: ['formal', 'literary', 'poetic'],
      forbiddenMetaphors: ['สุริยัน/จันทรา', 'นภา/สวรรค์', 'คำราชาศัพท์'],
    },
    sourceType: 'synthetic-expert',
  },
];
