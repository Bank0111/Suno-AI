import { VocabularyItem } from "../types";

/**
 * Categorized Thai Vocabulary Database (World-Class Production Edition)
 * Fixed anomalies, typos, and massively expanded regional dialects.
 */
export const CATEGORIZED_VOCABULARY: VocabularyItem[] = [
    // === Love / Romance (ความรัก) ===
    { id: 'src-love-01', word: 'เชื่อ', category: 'love', tags: ['เชื่อมั่น', 'ศรัทธา'], weight: 8 },
    { id: 'src-love-02', word: 'ให้ใจ', category: 'love', tags: ['จริงใจ', 'มอบใจ'], weight: 9 },
    { id: 'src-love-03', word: 'ทุ่มเท', category: 'love', tags: ['พยายาม', 'ตั้งใจ'], weight: 8 },
    { id: 'src-love-04', word: 'หัวใจ', category: 'love', tags: ['ใจ', 'ความรู้สึก'], weight: 10 },
    { id: 'src-love-05', word: 'ความรัก', category: 'love', tags: ['รัก', 'ความผูกพัน'], weight: 10 },
    { id: 'src-love-06', word: 'รักแท้', category: 'love', tags: ['รักจริง', 'มั่นคง'], weight: 9 },
    { id: 'tgt-01', word: 'โอบกอด', category: 'Love & Connection', tags: ['กอด', 'อบอุ่น'], weight: 9 },
    { id: 'tgt-02', word: 'แววตา', category: 'Love & Connection', tags: ['ตา', 'มอง'], weight: 8 },
    { id: 'tgt-03', word: 'เคียงข้าง', category: 'Love & Connection', tags: ['ข้างๆ', 'ร่วมทาง'], weight: 8 },
    { id: 'tgt-05', word: 'พรหมลิขิต', category: 'Love & Connection', tags: ['โชคชะตา', 'คู่กัน'], weight: 9 },

    // === Heartbreak / Sadness (ความเศร้า/อกหัก) ===
    { id: 'src-sad-01', word: 'สุดท้าย', category: 'heartbreak', tags: ['จบ', 'อวสาน'], weight: 9 },
    { id: 'src-sad-02', word: 'เสียใจ', category: 'heartbreak', tags: ['เศร้า', 'เจ็บ'], weight: 10 },
    { id: 'src-sad-03', word: 'เสียน้ำตา', category: 'heartbreak', tags: ['ร้องไห้', 'น้ำตา'], weight: 8 },
    { id: 'src-sad-04', word: 'เหงา', category: 'sadness', tags: ['อ้างว้าง', 'โดดเดี่ยว'], weight: 10 },
    { id: 'src-sad-11', word: 'ขาดใจ', category: 'heartbreak', tags: ['เจ็บปวด', 'ทรมาร'], weight: 9 },
    { id: 'tgt-06', word: 'ร่องรอย', category: 'Heartbreak & Loneliness', tags: ['แผล', 'อดีต'], weight: 9 },
    { id: 'tgt-07', word: 'เจือจาง', category: 'Heartbreak & Loneliness', tags: ['เลือนลาง', 'หายไป'], weight: 9 },
    { id: 'tgt-09', word: 'แตกสลาย', category: 'Heartbreak & Loneliness', tags: ['พัง', 'เจ็บปวด'], weight: 10 },

    // === Longing / Nostalgia (ความคิดถึง/ความทรงจำ) ===
    { id: 'tgt-10', word: 'ห้วงคำนึง', category: 'Nostalgia & Memory', tags: ['ความคิด', 'อดีต'], weight: 9 },
    { id: 'tgt-11', word: 'ย้อนเวลา', category: 'Nostalgia & Memory', tags: ['อดีต', 'เมื่อก่อน'], weight: 8 },
    { id: 'tgt-12', word: 'ภาพจำ', category: 'Nostalgia & Memory', tags: ['ทรงจำ', 'ติดตา'], weight: 9 },
    { id: 'tgt-13', word: 'กาลครั้งหนึ่ง', category: 'Nostalgia & Memory', tags: ['นิทาน', 'เมื่อก่อน'], weight: 8 },

    // === Nature & Atmosphere (ธรรมชาติ/บรรยากาศ) ===
    { id: 'tgt-17', word: 'สายลมยามเย็น', category: 'Nature & Atmosphere', tags: ['ลม', 'ผ่อนคลาย'], weight: 8 },
    { id: 'tgt-18', word: 'ท้องฟ้าสีหม่น', category: 'Nature & Atmosphere', tags: ['ฟ้า', 'เมฆ', 'ฝน'], weight: 8 },
    { id: 'tgt-19', word: 'กลิ่นฝน', category: 'Nature & Atmosphere', tags: ['ฝน', 'ดิน', 'ความสดชื่น'], weight: 9 },
    
    // === Modern / Youth / Urban (สมัยใหม่/ชีวิตคนเมือง) ===
    { id: 'src-mod-02', word: 'โทรหา', category: 'modern', tags: ['สายซ้อน', 'โทร'], weight: 8 },
    { id: 'src-mod-07', word: 'ความรู้สึก', category: 'modern', tags: ['อารมณ์'], weight: 9 },
    { id: 'src-mod-fixed-01', word: 'ลัลลัลลา', category: 'modern', tags: ['ร้องเพลง', 'ร่าเริง'], weight: 6 }, // ย้ายและแก้มาจากตั้ลลัลลาที่ผิดหมวด
    { id: 'tgt-14', word: 'แสงไฟเมืองหลวง', category: 'Urban & Modern Life', tags: ['เมือง', 'กลางคืน'], weight: 9 },

    // ==========================================
    // 🌍 DEEP REGIONAL DIALECTS (ภาษาถิ่นขั้นลึก)
    // ==========================================

    // --- ภาคอีสาน (Isan Dialect & Molam) ---
    { id: 'isan-01', word: 'เพิ่น', category: 'Thai Regional & Dialect', tags: ['เขา', 'คุณ'], regionalTag: 'isan', weight: 10 },
    { id: 'isan-02', word: 'ข่อย', category: 'Thai Regional & Dialect', tags: ['ฉัน', 'ผม'], regionalTag: 'isan', weight: 10 },
    { id: 'isan-03', word: 'อ้าย', category: 'Thai Regional & Dialect', tags: ['พี่ชาย', 'คนรัก'], regionalTag: 'isan', weight: 10 },
    { id: 'isan-04', word: 'หลอยคิดฮอด', category: 'Thai Regional & Dialect', tags: ['แอบคิดถึง', 'อีสาน'], regionalTag: 'isan', weight: 10 },
    { id: 'isan-05', word: 'จอบเบิ่ง', category: 'Thai Regional & Dialect', tags: ['แอบมอง', 'อีสาน'], regionalTag: 'isan', weight: 9 },
    { id: 'isan-06', word: 'ขี้ตั๋ว', category: 'Thai Regional & Dialect', tags: ['โกหก', 'หลอกลวง', 'อีสาน'], regionalTag: 'isan', weight: 10 },
    { id: 'isan-07', word: 'ฮักแพง', category: 'Thai Regional & Dialect', tags: ['รักและหวงแหน', 'อีสาน'], regionalTag: 'isan', weight: 10 },
    { id: 'isan-08', word: 'ถิ่ม', category: 'Thai Regional & Dialect', tags: ['ทิ้ง', 'ทอดทิ้ง', 'อีสาน'], regionalTag: 'isan', weight: 10 },
    { id: 'isan-09', word: 'นำก้น', category: 'Thai Regional & Dialect', tags: ['ตามหลัง', 'ตามไป', 'อีสาน'], regionalTag: 'isan', weight: 8 },
    { id: 'isan-10', word: 'ตาฮัก', category: 'Thai Regional & Dialect', tags: ['น่ารัก', 'เอ็นดู', 'อีสาน'], regionalTag: 'isan', weight: 9 },
    { id: 'isan-11', word: 'ผู้บ่าวผู้สาว', category: 'Thai Regional & Dialect', tags: ['หนุ่มสาว', 'อีสาน'], regionalTag: 'isan', weight: 9 },

    // --- ภาคใต้ (Southern Dialect & Indie Rock) ---
    { id: 'south-01', word: 'แหลง', category: 'Thai Regional & Dialect', tags: ['พูด', 'ใต้'], regionalTag: 'south', weight: 10 },
    { id: 'south-02', word: 'ข้องใจ', category: 'Thai Regional & Dialect', tags: ['คิดถึง', 'ห่วงหา', 'ใต้'], regionalTag: 'south', weight: 10 },
    { id: 'south-03', word: 'หวังเหวิด', category: 'Thai Regional & Dialect', tags: ['กังวล', 'เป็นห่วง', 'ใต้'], regionalTag: 'south', weight: 10 },
    { id: 'south-04', word: 'รักจังหู', category: 'Thai Regional & Dialect', tags: ['รักมาก', 'ใต้'], regionalTag: 'south', weight: 10 },
    { id: 'south-05', word: 'ขี้หก', category: 'Thai Regional & Dialect', tags: ['โกหก', 'ใต้'], regionalTag: 'south', weight: 10 },
    { id: 'south-06', word: 'พรือโฉ้', category: 'Thai Regional & Dialect', tags: ['ว้าวุ่น', 'บอกไม่ถูก', 'ใต้'], regionalTag: 'south', weight: 9 },
    { id: 'south-07', word: 'พันพรือ', category: 'Thai Regional & Dialect', tags: ['ยังไง', 'เป็นไงบ้าง', 'ใต้'], regionalTag: 'south', weight: 10 },
    { id: 'south-08', word: 'แขบๆ', category: 'Thai Regional & Dialect', tags: ['รีบๆ', 'เร่ง', 'ใต้'], regionalTag: 'south', weight: 8 },
    { id: 'south-09', word: 'หลบเรือน', category: 'Thai Regional & Dialect', tags: ['กลับบ้าน', 'ใต้'], regionalTag: 'south', weight: 9 },

    // --- ภาคเหนือ (Northern Dialect & Lanna Folk) ---
    { id: 'north-01', word: 'เปิ้น', category: 'Thai Regional & Dialect', tags: ['ฉัน', 'เขา', 'เหนือ'], regionalTag: 'north', weight: 10 },
    { id: 'north-02', word: 'ตั๋ว', category: 'Thai Regional & Dialect', tags: ['เธอ', 'เหนือ'], regionalTag: 'north', weight: 10 },
    { id: 'north-03', word: 'กึ๊ดเติงหา', category: 'Thai Regional & Dialect', tags: ['คิดถึง', 'เหนือ'], regionalTag: 'north', weight: 10 },
    { id: 'north-04', word: 'ฮักแต๊ฮักว่า', category: 'Thai Regional & Dialect', tags: ['รักจริงๆ', 'เหนือ'], regionalTag: 'north', weight: 10 },
    { id: 'north-05', word: 'ขี้จุ๊', category: 'Thai Regional & Dialect', tags: ['โกหก', 'เหนือ'], regionalTag: 'north', weight: 10 },
    { id: 'north-06', word: 'ปิ๊กบ้าน', category: 'Thai Regional & Dialect', tags: ['กลับบ้าน', 'เหนือ'], regionalTag: 'north', weight: 10 },
    { id: 'north-07', word: 'อิดหล้า', category: 'Thai Regional & Dialect', tags: ['เหนื่อยล้า', 'เหนือ'], regionalTag: 'north', weight: 8 },
    { id: 'north-08', word: 'ยะหยัง', category: 'Thai Regional & Dialect', tags: ['ทำอะไร', 'เหนือ'], regionalTag: 'north', weight: 9 },
    { id: 'north-09', word: 'บ่าได้กา', category: 'Thai Regional & Dialect', tags: ['ไม่ได้เหรอ', 'เหนือ'], regionalTag: 'north', weight: 9 }, // แก้ไขจาก บ่าได้ก๋า
    { id: 'north-10', word: 'ขะใจ๋', category: 'Thai Regional & Dialect', tags: ['รีบๆ', 'เหนือ'], regionalTag: 'north', weight: 8 }
];

/**
 * STRICT HARD-BANNED WORDS
 * ลบคำที่พิมพ์ผิด (ดวย, หน้าด่าน) และแก้ไขให้ถูกต้อง
 */
export const HARD_BANNED_WORDS: string[] = [
  'ควย', 'เหี้ย', 'สัส', 'เย็ด', 'มึงกู', 'กระจอก', 'หน้าด้าน', 'จิ๋ม',
  'เย็ดแม่', 'ชั่วช้า', 'fuck', 'shit', 'bitch', 'sex', 'kill', 'death', 'blood',
  
  // ==========================================
  // ⚠️ BANNED MODERN WORDS (TIMELESS MANDATE)
  // แบนคำศัพท์สมัยใหม่เพื่อให้เพลงมีความคลาสสิก ไม่ผูกติดกับเทคโนโลยีมากเกินไป
  // ==========================================
  'ตีสอง', 'ห้องเดิม', 'หน้าจอมือถือ', 'สตอรี่', 'มูฟออน', 'แชท', 'บล็อกเบอร์',
  'เพลย์ลิสต์', 'แก้วกาแฟ', 'ร้าน', 'รูปคู่', 'รูปถ่าย', 'แจ้งเตือน', 'อันฟอล',
  'หน้าจอ', 'ห้องนี้'
];

/**
 * OVERUSED CLICHÉ WORDS & PHRASES (คำโหลที่ AI ชอบใช้ซ้ำ)
 */
export const OVERUSED_CLICHES: string[] = [
  'ดวงดาวในคืนนี้',
  'สายลมพัดผ่าน',
  'น้ำตาหยดลงมา',
  'หัวใจแตกสลาย',
  'ท้องฟ้าสีเทา',
  'รักเธอคนเดียวตลอดไป',
  'ไม่มีเธอแล้วจะอยู่อย่างไร',
  'ความรักเหมือนฝัน',
  'กุมมือกันไว้',
  'เฝ้าคอยเธอสืบไป',
];

/**
 * CONTEXT CLASH RULES (กฎป้องกันบริบทชนกัน)
 */
export const CONTEXT_CLASH_RULES: Array<{
  condition: {
    genres?: string[];
    moods?: string[];
    languageStyles?: string[];
  };
  clashWords: string[];
  reason: string;
}> = [
  {
    condition: {
      genres: ['Hip-Hop / Rap', 'Trap', 'EDM', 'Synth-pop / Dance', 'hiphop', 'dance'],
    },
    clashWords: [
      'ข้าพระพุทธเจ้า', 'พระมารดา', 'อสุรี', 'ภิรมย์', 'นฤมิต',
      'สุวรรณ', 'พิศมัย', 'อนงค์', 'เครื่องทรง', 'พารา', 'ธิดา',
    ],
    reason: 'คำราชาศัพท์/บาลีสันสกฤตโบราณไม่เข้ากับแนวเพลง Modern Urban / Hip-Hop',
  },
  {
    condition: {
      moods: ['เศร้า (Sad / Melancholic)', 'เจ็บปวด (Heartbroken)', 'มืดมน (Dark / Somber)', 'เศร้า', 'sadness', 'heartbreak'],
    },
    clashWords: [
      'สดใสซาบซ่า', 'ลั้นลา', 'ฮาเฮ', 'เริงร่า', 'ยิ้มแย้มสดใส', 'แฮปปี้',
    ],
    reason: 'คำสดใสเริงร่าขัดแย้งกับอารมณ์เพลงเศร้า/เจ็บปวด',
  },
  {
    condition: {
      languageStyles: ['ตรงไปตรงมา', 'ภาษาสตรีท / ทันสมัย'],
    },
    clashWords: [
      'ดั่งพุ่มพวง', 'สวรรค์ชั้นเจ็ด', 'ดั่งดวงหฤทัย', 'บุพเพสันนิวาส', 'กมลฉาย',
    ],
    reason: 'คำวรรณคดีโบราณขัดกับสไตล์ภาษาสตรีท/ตรงไปตรงมา',
  }
];

export const EXCLUDED_WORDS_TEMPLATES = [
  { name: 'Clean / Safe', words: 'fuck, shit, damn, bitch, sex, kill, death, blood' },
  { name: 'No Romance', words: 'love, heart, baby, kiss, miss you, darling' }
];

export const FAST_FLOW_COMPOSITION_INSTRUCTION =
  'สำหรับท่อนที่ทำเครื่องหมาย [Fast Flow] หรือ [Double Time] ต้องแต่งด้วยคำที่มีความหนาแน่นของพยางค์สูง มีสัมผัสในถี่ๆ และจังหวะรัวเร็วแบบ Chopping Rap';