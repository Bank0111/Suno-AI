import { BadLyricExemplar } from '../types';

/**
 * BAD LYRICS DATASET (SYNTHETIC FAILURE CASES)
 * Documented examples of awkward phrasing, robotic metaphors, forced rhymes,
 * vocational dumps, academic jargon, and AI slop for detection and regression evaluation.
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

  // 8. Vocational Tool Dumping in Chorus / Hook (Phase 5.5B Gate)
  {
    id: 'bad-vocational-001',
    genre: 'Country / Folk',
    sectionType: 'Chorus',
    flawedLines: [
      'จับประแจขันน็อตเบอร์สิบสองให้แน่นหนา',
      'คราบน้ำมันเปื้อนชุดเซฟตี้แต่ใจยังคิดถึงเธอ',
      'เปลี่ยนหัวเทียนใหม่พร้อมสายพานโรงงาน',
      'รักเราเหมือนเครื่องจักรที่เดินเครื่องไม่หยุดหย่อน',
    ],
    flawType: 'register-mismatch',
    rootCause: 'ท่อนฮุกถูกยัดเยียดชื่ออุปกรณ์ช่าง (ประแจ, น็อต, ชุดเซฟตี้, หัวเทียน) แทนที่จะเป็นพื้นที่ของแก่นอารมณ์และสัจธรรมชีวิต (Mechanical Dump)',
    detectedSignals: ['ประแจ', 'น็อต', 'ชุดเซฟตี้', 'หัวเทียน', 'สายพาน'],
    sourceType: 'synthetic-failure-case',
  },

  // 9. Academic Jargon & Research Paper Tone (Phase 5.7 Gate)
  {
    id: 'bad-academic-001',
    genre: 'Indie / Pop',
    sectionType: 'Verse',
    flawedLines: [
      'ในบริบทสังคมที่เต็มไปด้วยกำแพงชนชั้น',
      'ขับเคลื่อนความสัมพันธ์ผ่านมิติของกาลเวลา',
      'ปัจจัยความเหงาส่งผลกระทบต่อจิตใจ',
    ],
    flawType: 'awkward-collocation',
    rootCause: 'ใช้ภาษาเขียนรายงานวิชาการ ("บริบท", "มิติ", "ขับเคลื่อน", "ปัจจัย") ขัดกับความเป็นบทเพลงอย่างรุนแรง',
    detectedSignals: ['บริบท', 'กำแพงชนชั้น', 'ขับเคลื่อน', 'มิติ', 'ปัจจัย'],
    sourceType: 'synthetic-failure-case',
  },

  // 10. Narrative Prose Reporting (Phase 5.7 Gate)
  {
    id: 'bad-prose-001',
    genre: 'Pop',
    sectionType: 'Verse',
    flawedLines: [
      'จากนั้นฉันก็เดินไปที่ป้ายรถเมล์สายเดิม',
      'แล้วจึงหยิบกระเป๋าสตางค์ขึ้นมาจ่ายเงิน',
      'ขั้นตอนต่อไปคือการนั่งรอเธอโทรมา',
    ],
    flawType: 'awkward-collocation',
    rootCause: 'แจกแจงลำดับเหตุการณ์แบบบันทึกประจำวันหรือร้อยแก้ว ("จากนั้นก็...", "แล้วจึง...", "ขั้นตอนต่อไป")',
    detectedSignals: ['จากนั้นก็', 'แล้วจึง', 'ขั้นตอนต่อไป'],
    sourceType: 'synthetic-failure-case',
  },

  // 11. Emotional Over-Explanation (Phase 5.7 Gate)
  {
    id: 'bad-overexplain-001',
    genre: 'R&B / Soul',
    sectionType: 'Verse',
    flawedLines: [
      'มองเห็นแก้วกาแฟวางอยู่บนโต๊ะไม้',
      'ภาพนี้ทำให้ฉันรู้สึกเศร้าและเหงาใจอย่างบอกไม่ถูก',
      'ฉันอยากอธิบายความเจ็บนี้ให้เธอได้ยิน',
    ],
    flawType: 'cliche-overload',
    rootCause: 'อธิบายความรู้สึกซ้ำซ้อนตรงๆ ("ทำให้ฉันรู้สึกเศร้า", "อธิบายความเจ็บ") หลังจากวางภาพฉากไปแล้ว ไม่เว้นพื้นที่ว่างให้ผู้ฟังคิดตาม (Telling not Showing)',
    detectedSignals: ['ทำให้ฉันรู้สึกเศร้า', 'อธิบายความเจ็บ'],
    sourceType: 'synthetic-failure-case',
  },

  // 12. Repetitive End-Rhymes in Single Section
  {
    id: 'bad-rhyme-repeat-001',
    genre: 'Pop',
    sectionType: 'Chorus',
    flawedLines: [
      'อยากจะชวนเธอไปนั่งคุยเล่น',
      'ไม่อยากปล่อยให้เวลามันผ่านไปเล่นๆ',
      'เรื่องความรักฉันไม่เคยคิดเล่น',
      'เปิดหัวใจให้เห็นชัดเจน',
    ],
    flawType: 'forced-rhyme',
    rootCause: 'ลงท้ายด้วยคำซ้ำคำเดิมหรือเสียงสระเดิมติดกัน 3 ครั้งในท่อนเดียว ("เล่น", "เล่นๆ", "เล่น")',
    detectedSignals: ['เล่น', 'เล่นๆ', 'เล่น'],
    sourceType: 'synthetic-failure-case',
  },
];