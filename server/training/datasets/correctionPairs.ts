import { LyricCorrectionPair } from '../types';

/**
 * CORRECTION PAIRS DATASET (SYNTHETIC REASONING & REFINEMENT PAIRS)
 * Real-world pairs illustrating how to transform awkward, robotic, or cliché phrasing
 * into natural, singable Thai lyrics while strictly preserving original meaning, POV, and mood.
 */
export const CORRECTION_PAIRS: LyricCorrectionPair[] = [
  // Pair 1: Math Metaphor -> Concrete Physical Action
  {
    id: 'pair-folk-001',
    context: {
      genre: 'Country / Folk',
      persona: 'หนุ่มบ้านนอก ขี้เล่น จริงใจ',
      personaKey: 'rustic-playful-male',
      mood: 'Playful / Cheerful',
      section: 'Verse',
    },
    originalFlawed: 'ตกหลุมความน่ารักคูณสองเข้าเต็มตา จะให้ทำยังไงใจมันพองโตขึ้นมา',
    diagnosis: 'คำว่า "คูณสอง" และ "ใจมันพองโตขึ้นมา" เป็นสำนวนประดิษฐ์ที่ขาดความเป็นธรรมชาติของหนุ่มบ้าน ๆ',
    correctedNatural: 'เจอเธอยิ้มให้จัง ๆ ก็แทบเซไปข้างทาง ใจมันเต้นตึกตักไม่เป็นท่าเลยเรา',
    improvementTechnique: 'เปลี่ยนการเปรียบเทียบตัวเลข เป็นอาการเขินรูปธรรม (เซไปข้างทาง, ใจเต้นตึกตัก) ที่ฟังดูจริงใจและร้องง่าย',
    sourceType: 'synthetic-expert',
  },

  // Pair 2: Awkward Phrasing -> Sincere Speech
  {
    id: 'pair-folk-002',
    context: {
      genre: 'Country / Folk',
      persona: 'หนุ่มบ้านนอก ขี้เล่น จริงใจ',
      personaKey: 'rustic-playful-male',
      mood: 'Playful / Cheerful',
      section: 'Verse',
    },
    originalFlawed: 'ไม่ได้กะล่อนไม่ได้คิดวิ่งแส่หาใคร แค่อยากให้เธอเปิดใจลองคบดู',
    diagnosis: 'คำว่า "วิ่งแส่หาใคร" เป็นสำนวนห้วนและกระด้าง ไม่สอดคล้องกับโทนจีบสาวแบบน่ารัก',
    correctedNatural: 'ไม่ได้เจ้าชู้เที่ยวไปมองใครที่ไหน แค่อยากถามดูว่ามีแฟนแล้วหรือยัง',
    improvementTechnique: 'แทนที่คำกระด้างด้วยคำถามตรงไปตรงมา ("มีแฟนแล้วหรือยัง") ที่เข้าถึงผู้ฟังได้ทันที',
    sourceType: 'synthetic-expert',
  },

  // Pair 3: Extreme Cliché -> Specific Concrete Senses
  {
    id: 'pair-rnb-001',
    context: {
      genre: 'R&B / Soul',
      persona: 'คนเมืองเหงา อ่อนไหว',
      personaKey: 'urban-intimate-soul',
      mood: 'Melancholic / Romantic',
      section: 'Chorus',
    },
    originalFlawed: 'รักเธอสุดหัวใจ น้ำตารินไหลเจ็บปวดเหลือเกิน ขาดเธอไม่ได้โลกมืดมนไปหมด',
    diagnosis: 'การซ้อนทับคำสำเร็จรูป (รักเธอสุดหัวใจ, น้ำตารินไหล, ขาดเธอไม่ได้) ทำให้เพลงขาดเอกลักษณ์และอารมณ์ลึกซึ้ง',
    correctedNatural: 'แค่ไฟห้องดับลง ความทรงจำก็สว่างขึ้นมา รอยยิ้มเธอในรูปถ่ายยังทำร้ายกันทุกคืน',
    improvementTechnique: 'เปลี่ยนความรู้สึกนามธรรม เป็นภาพเปรียบต่างทางแสง (ไฟดับลงแต่ความทรงจำสว่าง) และรูปถ่าย',
    sourceType: 'synthetic-expert',
  },

  // Pair 4: Archaic/Stiff Words -> Contemporary Street Language
  {
    id: 'pair-hiphop-001',
    context: {
      genre: 'Hip-Hop / Rap',
      persona: 'นักสู้ข้างถนน (Street MC)',
      personaKey: 'street-hustler-mc',
      mood: 'Energetic / Confident',
      section: 'Verse',
    },
    originalFlawed: 'ข้าพเจ้าพร้อมประจักษ์ความสามารถแด่ปวงชน เพื่อให้สุริยันส่องนำทางข้าไป',
    diagnosis: 'ใช้คำราชาศัพท์/ภาษากึ่งราชการ ("ข้าพเจ้า", "ประจักษ์", "สุริยัน") ซึ่งขัดกับวัฒนธรรมเพลงฮิปฮอป',
    correctedNatural: 'ก้าวขึ้นเวทีด้วยสองมือกับไมค์ตัวเดิม จะทำให้ทุกคนต้องจำชื่อกูให้ขึ้นใจ',
    improvementTechnique: 'ใช้สรรพนามและคำเรียกอุปกรณ์ดนตรีจริง (ไมค์ตัวเดิม, สองมือ) พร้อมจังหวะคำหนักแน่น',
    sourceType: 'synthetic-expert',
  },

  // Pair 5: Forced Meaningless Rhyme -> Natural Story Flow
  {
    id: 'pair-indie-001',
    context: {
      genre: 'Indie / Pop',
      persona: 'คนเล่าเรื่องช่างสังเกต',
      personaKey: 'indie-storyteller',
      mood: 'Warm / Nostalgic',
      section: 'Verse',
    },
    originalFlawed: 'มองดูกระเป๋าแล้วใจมันก็เศร้า เลยไปกินข้าวกับเต่าที่อยู่ใต้เงาต้นไม้',
    diagnosis: 'แต่งเรื่องไร้สาระเพราะติดกับดักการหาคำลงสระ "เอา" (เป๋า, เศร้า, ข้าว, เต่า, เงา)',
    correctedNatural: 'หยิบกระเป๋าใบเดิมที่เธอเคยเลือกให้ ยังจำได้ดีว่าวันนั้นเรายิ้มให้กันแค่ไหน',
    improvementTechnique: 'ปลดล็อกสัมผัสบังคับ แล้วเขียนเล่าเรื่องราวความทรงจำที่เชื่อมโยงกับสิ่งของอย่างมีความหมาย',
    sourceType: 'synthetic-expert',
  },

  // Pair 6: English Pop - Trite Cliche -> Concrete Tactile Metaphor
  {
    id: 'pair-eng-001',
    context: {
      genre: 'English Pop',
      persona: 'Modern English Songwriter',
      personaKey: 'english-pop-narrator',
      mood: 'Melancholic / Hopeful',
      section: 'Chorus',
    },
    originalFlawed: 'I love you with all my heart and tears are falling down my face tonight',
    diagnosis: 'Overused generic emotional statements that sound like uninspired pop clichés.',
    correctedNatural: 'Your silhouette is fading in the rearview glass, but I still feel the radio playing our song',
    improvementTechnique: 'Replaced hollow declarations with dynamic visual action (rearview mirror) and sensory memory (radio).',
    sourceType: 'synthetic-expert',
  },
  // Pair 7: Rural / Agrarian Terminology Accuracy (คันแทนา -> คันไถนา / คันนา)
  {
    id: 'pair-folk-003',
    context: {
      genre: 'Country / Folk',
      persona: 'หนุ่มบ้านนอก เล่าเรื่องชีวิตจริง',
      personaKey: 'rustic-sincere-storyteller',
      mood: 'Melancholic / Nostalgic',
      section: 'Verse',
    },
    originalFlawed: 'ยืนพิงคันแทนาตอนแดดร่ม มองดูทุ่งนาที่ว่างเปล่า',
    diagnosis: 'incorrect term: "คันแทนา" เป็นคำที่สับสนหรือผิดเพี้ยนในการใช้งานภาษาไทยมาตรฐาน/วรรณศิลป์พื้นบ้าน (ควรใช้ "คันไถนา" หากหมายถึงเครื่องมือไถ หรือ "คันนา" หากหมายถึงทางเดินดินกั้นน้ำในนา)',
    correctedNatural: 'ยืนพิงคันไถนาตอนแดดร่ม มองดูทุ่งนาที่ว่างเปล่า',
    improvementTechnique: 'correct term: แทนที่ด้วย "คันไถนา" (หรือ "คันนา") ซึ่งเป็นวัตถุและเครื่องมือที่มีอยู่จริงตามวิถีชาวนาไทย',
    sourceType: 'synthetic-expert',
  },
];
