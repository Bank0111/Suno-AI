import { BadLyricExemplar } from '../types';

/**
 * BAD LYRICS DATASET (SYNTHETIC FAILURE CASES)
 * Documented examples of awkward phrasing, robotic metaphors, forced rhymes,
 * and AI-generation slop for detection and regression evaluation.
 */
export const BAD_EXEMPLARS: BadLyricExemplar[] = [
  // 1. Robotic / Forced Math Metaphor in Folk/Love Song
  {
    id: 'bad-math-001',
    genre: 'Country / Folk',
    sectionType: 'Verse',
    flawedLines: [
      'ตกหลุมความน่ารักคูณสองเข้าเต็มตา',
      'จะให้ทำยังไงใจมันพองโตขึ้นมา',
      'ไม่ได้กะล่อนไม่ได้คิดวิ่งแส่หาใคร',
    ],
    flawType: 'robotic-metaphor',
    rootCause: 'การนำคำศัพท์คณิตศาสตร์ ("คูณสอง") และสำนวนแปลกห้วน ("วิ่งแส่หาใคร", "ใจมันพองโตขึ้นมา") มาใช้ ทำให้ภาษาเพลงขาดความซื่อตรงและความเป็นมนุษย์',
    detectedSignals: ['คูณสอง', 'วิ่งแส่หาใคร', 'ใจมันพองโตขึ้นมา'],
    sourceType: 'synthetic-failure-case',
  },

  // 2. Forced Archaic Poetic Words in Modern Urban Context
  {
    id: 'bad-poetic-001',
    genre: 'Hip-Hop / Rap',
    sectionType: 'Verse',
    flawedLines: [
      'เดินอยู่บนถนนเห็นแสงสุรีย์ส่องนภา',
      'จิตใจข้าพเจ้าเปี่ยมด้วยความภิรมย์ยิ่งนักหนา',
      'จะขอประจักษ์ความจริงต่อธารกำนัล',
    ],
    flawType: 'register-mismatch',
    rootCause: 'การเลือกคำภาษาวรรณศิลป์ยุคโบราณและราชาศัพท์ ("สุรีย์", "ภิรมย์", "ธารกำนัล") ในเพลงแร็ปแนวสตรีท ทำให้หลุดจาก Character Voice โดยสิ้นเชิง',
    detectedSignals: ['สุรีย์', 'ภิรมย์', 'ธารกำนัล', 'ข้าพเจ้า'],
    sourceType: 'synthetic-failure-case',
  },

  // 3. Extreme Cliché Overload & Generic Emotional Soup
  {
    id: 'bad-cliche-001',
    genre: 'Pop',
    sectionType: 'Chorus',
    flawedLines: [
      'รักเธอสุดหัวใจ น้ำตารินไหลอาบสองแก้ม',
      'หัวใจแหลกสลายเหมือนโดนมีดกรีดแทง',
      'ขาดเธอไม่ได้ โลกทั้งใบมืดมนลงทันตา',
      'ขอรักนิรันดร์ตราบชั่วฟ้าดินสลาย',
    ],
    flawType: 'cliche-overload',
    rootCause: 'ใช้วลีสำเร็จรูปซ้ำซากติดต่อกันทุกบรรทัด ไม่มีรายละเอียดเฉพาะตัวของเรื่องราว ทำให้เพลงดูไร้น้ำหนักและน่าเบื่อ',
    detectedSignals: ['รักเธอสุดหัวใจ', 'น้ำตาริน', 'หัวใจแหลกสลาย', 'รักนิรันดร์', 'ชั่วฟ้าดินสลาย'],
    sourceType: 'synthetic-failure-case',
  },

  // 4. Forced Rhyme Leading to Meaningless/Nonsense Lines
  {
    id: 'bad-rhyme-001',
    genre: 'Indie / Pop',
    sectionType: 'Verse',
    flawedLines: [
      'ฉันมองดูกระเป๋า',
      'แล้วใจมันก็เศร้า',
      'เลยไปกินข้าวกับเต่า',
      'ที่อยู่ใต้เงาต้นไม้',
    ],
    flawType: 'forced-rhyme',
    rootCause: 'ผู้แต่งถูกบีบด้วยสระ "เอา" (เป๋า - เศร้า - เต่า - เงา) จนแต่งประโยคที่ไร้เหตุผลและทำลายเรื่องราวของเพลง',
    detectedSignals: ['กินข้าวกับเต่า'],
    sourceType: 'synthetic-failure-case',
  },

  // 5. Persona Break in Rustic Male Song
  {
    id: 'bad-persona-001',
    genre: 'Country / Folk',
    sectionType: 'Chorus',
    flawedLines: [
      'โอ้ดวงฤทัยของพี่ ช่างงดงามดั่งเทพธิดา',
      'สถิตอยู่ ณ สรวงสวรรค์ชั้นดาวดึงส์',
      'พี่จะขอเทิดทูนบูชาตราบชีพวาย',
    ],
    flawType: 'persona-break',
    rootCause: 'หนุ่มบ้านนอกที่ควรพูดภาษาซื่อๆ กลับกลายเป็นนักประพันธ์บทสวดหรือกวีโบราณ ทำลายความน่าเชื่อถือของตัวละคร',
    detectedSignals: ['ดวงฤทัย', 'ดาวดึงส์', 'ชีพวาย', 'เทิดทูนบูชา'],
    sourceType: 'synthetic-failure-case',
  },

  // 6. Rhythm Stumble & Syllable Bloat
  {
    id: 'bad-rhythm-001',
    genre: 'R&B / Soul',
    sectionType: 'Verse',
    flawedLines: [
      'ในคืนวันที่เธอตัดสินใจเดินจากฉันไปโดยไม่บอกกล่าวเหตุผลอะไรเลยแม้แต่นิดเดียว',
      'ฉันนั่งคิดทบทวนดูทั้งหมดว่าฉันทำอะไรผิดพลาดไปตรงไหนหรือเปล่า',
    ],
    flawType: 'rhythm-stumble',
    rootCause: 'พยางค์ยาวเกินไปถึง 24 และ 21 พยางค์ในหนึ่งวรรค ทำให้ไม่สามารถลงห้องดนตรีหรือร้องได้อย่างลื่นไหล',
    detectedSignals: ['พยางค์เกิน 16 พยางค์', 'ขาดจุดพักหายใจ'],
    sourceType: 'synthetic-failure-case',
  },

  // 7. English Pop: Cross-Contamination / Robotic Phrasing
  {
    id: 'bad-eng-001',
    genre: 'English Pop',
    sectionType: 'Chorus',
    flawedLines: [
      'I love you from the bottom of my heart forever and ever',
      'Tears falling down like waterfalls from my eyes',
      'Without you I cannot live anymore baby',
    ],
    flawType: 'cliche-overload',
    rootCause: 'Trite and hyper-cliché English phrasing with zero concrete imagery or unique perspective.',
    detectedSignals: ['bottom of my heart', 'tears falling down', 'cannot live anymore'],
    sourceType: 'synthetic-failure-case',
  },
];
