import { GenreLanguageProfile } from '../types';

/**
 * GENRE LANGUAGE PROFILES DATASET (PHASE 5.7 MULTI-GENRE CRAFT MATRICES)
 * Guidance matrices for lyrical pacing, imagery focus, rhyme density,
 * recommended action verbs, and banned tropes per musical genre.
 */
export const GENRE_LANGUAGE_PROFILES: GenreLanguageProfile[] = [
  {
    genreKey: 'Country / Folk',
    displayName: 'Thai Country / Folk & ลูกทุ่งเพื่อชีวิต',
    narrativePacing: 'เล่าเรื่องเรียงตามลำดับเวลา (Chronological Storytelling) ชัดเจน ซื่อตรง อบอุ่น มีสัมผัสในลื่นไหล',
    imageryFocus: 'everyday-objects',
    rhymeDensityPreference: 'natural-cadence',
    recommendedVerbs: ['ขี่มอไซค์', 'บีบแตร', 'สบตา', 'ชะลอ', 'แอบยิ้ม', 'ถามข่าว', 'คิดถึง', 'ผิงไฟ', 'ตักน้ำ'],
    bannedTropes: [
      'คำศัพท์คณิตศาสตร์และหุ่นยนต์ (คูณสอง, บวกหนึ่ง, 100%)',
      'ภาษากวีราชสำนักและราชาศัพท์ (นฤมิต, นภา, ภิรมย์, กานดา)',
      'การยัดเยียดลิสต์รายชื่อเครื่องมือช่างในท่อนฮุก (ประแจ, น็อต, คราบน้ำมัน, ชุดเซฟตี้)',
      'สำนวนแปลกห้วนที่ไร้ความจริงใจ (วิ่งแส่หาใคร, ใจมันพองโตขึ้นมา)',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'R&B / Soul',
    displayName: 'Thai R&B / Soul',
    narrativePacing: 'โฟกัสห้วงเวลาปัจจุบัน บรรยากาศแวดล้อม และผัสสะทางกายอย่างประณีต (Atmospheric & Sensual Flow)',
    imageryFocus: 'sensory-touch',
    rhymeDensityPreference: 'conversational-free',
    recommendedVerbs: ['สัมผัส', 'โอบกอด', 'กระซิบ', 'สะท้อน', 'หลับตา', 'ทอดสายตา', 'เจือจาง', 'ไหวหวั่น', 'ริน'],
    bannedTropes: [
      'วลีอกหักฟูมฟายซ้ำซาก (น้ำตารินไหลอาบสองแก้ม, ขาดเธอไม่ได้โลกมืดมน)',
      'การอธิบายความรู้สึกซ้ำซ้อนตรงๆ (ทำให้ฉันรู้สึกเศร้า, อธิบายความเจ็บ)',
      'ภาษาถิ่นที่ไม่เข้ากับบรรยากาศเมือง (เช่น เสาเถียง ในเพลง Urban R&B)',
      'คำหยาบคายกระด้างที่ทำลายมิติความเปราะบางของอารมณ์',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'Hip-Hop / Rap',
    displayName: 'Thai Hip-Hop / Rap & Trap',
    narrativePacing: 'กระชับ ฉับไว จังหวะเน้นเสียงหนักแน่น ไรม์คู่ ไรม์สลับ คมคาย (Punchy Bar-by-bar Cadence)',
    imageryFocus: 'street-cadence',
    rhymeDensityPreference: 'internal-assonance',
    recommendedVerbs: ['ลุย', 'ก้าว', 'คว้า', 'ตะโกน', 'พิสูจน์', 'เหยียบ', 'พุ่งชน', 'จ้องมอง', 'บดขยี้'],
    bannedTropes: [
      'คำราชาศัพท์และภาษาวรรณคดีโบราณ (ข้าพเจ้า, ภิรมย์, สุริยัน, สรวงสวรรค์)',
      'ประโยคยาวเยิ่นเย้อที่ไร้จุดเน้นจังหวะ (Syllable Bloat)',
      'คำหวานเลี่ยนแบบป๊อปดั้งเดิม (ดวงใจดวงน้อย, รักเธอชั่วฟ้าดินสลาย)',
      'ภาษาแจกแจงขั้นตอนแบบร้อยแก้ว (จากนั้นก็... แล้วจึง...)',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'Indie / Pop',
    displayName: 'Thai Indie / Pop & Bedroom Pop',
    narrativePacing: 'บทสนทนาเป็นธรรมชาติ ไดอารีส่วนตัว อารมณ์สังเกตการณ์ที่จับใจความธรรมดาให้มีความหมาย',
    imageryFocus: 'everyday-objects',
    rhymeDensityPreference: 'conversational-free',
    recommendedVerbs: ['รดน้ำ', 'เปิดเพลง', 'แบ่งหูฟัง', 'มองออกไป', 'บันทึก', 'เผลอยิ้ม', 'เดินผ่าน', 'ฮัมเพลง'],
    bannedTropes: [
      'ศัพท์วิชาการ รายงานข่าว หรือบทความวิจัย (บริบท, มิติใหม่, ขับเคลื่อน, กำแพงชนชั้น, ปัจจัย)',
      'การสัมผัสสระแบบไร้สาระเพื่อเอาไรม์ (กินข้าวกับเต่าใต้เงาต้นไม้)',
      'การเปรียบเทียบเชิงอภินิหารหรือดวงดาวเกินจริงที่ทำลายความติดดิน',
      'คำลงท้ายวรรคซ้ำคำเดิมเกิน 2 ครั้งในท่อนเดียวกัน',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'English Pop',
    displayName: 'International English Pop',
    narrativePacing: 'Universal emotional clarity, strong melodic hooks, modern conversational phrasing',
    imageryFocus: 'melodic-pop',
    rhymeDensityPreference: 'natural-cadence',
    recommendedVerbs: ['stay', 'whisper', 'glow', 'remember', 'drive', 'fade', 'breathe', 'reach', 'trace'],
    bannedTropes: [
      'Non-English or Thai language script contamination',
      'Hyper-cliché statements without concrete imagery (bottom of my heart, tears like waterfalls)',
      'Awkward robotic literal translations lacking natural English idiom cadence',
    ],
    sourceType: 'synthetic-expert',
  },
];