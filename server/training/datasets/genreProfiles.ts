import { GenreLanguageProfile } from '../types';

/**
 * GENRE LANGUAGE PROFILES DATASET
 * Guidance matrices for lyrical pacing, imagery focus, rhyme density,
 * recommended action verbs, and banned tropes per musical genre.
 */
export const GENRE_LANGUAGE_PROFILES: GenreLanguageProfile[] = [
  {
    genreKey: 'Country / Folk',
    displayName: 'Thai Country / Folk & ลูกทุ่งเพื่อชีวิต',
    narrativePacing: 'เล่าเรื่องเรียงตามลำดับเวลา (Chronological Storytelling) ชัดเจน ตรงไปตรงมา อบอุ่น',
    imageryFocus: 'everyday-objects',
    rhymeDensityPreference: 'natural-cadence',
    recommendedVerbs: ['ขี่มอไซค์', 'บีบแตร', 'สบตา', 'ชะลอ', 'แอบยิ้ม', 'ถามข่าว', 'คิดถึง', 'ผิงไฟ'],
    bannedTropes: [
      'คำศัพท์คณิตศาสตร์ (คูณสอง, บวกหนึ่ง)',
      'ภาษากวีราชสำนัก (นฤมิต, นภา, ภิรมย์)',
      'สำนวนแปลกที่ไร้ความจริงใจ (วิ่งแส่หาใคร)',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'R&B / Soul',
    displayName: 'Thai R&B / Soul',
    narrativePacing: 'โฟกัสอารมณ์ความรู้สึก ห้วงเวลาปัจจุบัน และผัสสะทางกายอย่างประณีต',
    imageryFocus: 'sensory-touch',
    rhymeDensityPreference: 'conversational-free',
    recommendedVerbs: ['สัมผัส', 'โอบกอด', 'กระซิบ', 'สะท้อน', 'หลับตา', 'ทอดสายตา', 'เจือจาง', 'ไหวหวั่น'],
    bannedTropes: [
      'คำหยาบคายกระด้าง',
      'วลีอกหักฟูมฟายซ้ำซาก (น้ำตารินไหลอาบสองแก้ม)',
      'ภาษาถิ่นที่ไม่เข้ากับบรรยากาศเมือง',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'Hip-Hop / Rap',
    displayName: 'Thai Hip-Hop / Rap & Trap',
    narrativePacing: 'กระชับ ฉับไว จังหวะเน้นเสียงชัดเจน (Punchy Bar-by-bar Cadence)',
    imageryFocus: 'street-cadence',
    rhymeDensityPreference: 'internal-assonance',
    recommendedVerbs: ['ลุย', 'ก้าว', 'คว้า', 'ตะโกน', 'พิสูจน์', 'เหยียบ', 'พุ่งชน', 'จ้องมอง'],
    bannedTropes: [
      'คำราชาศัพท์/กวีโบราณ (ข้าพเจ้า, ภิรมย์, สุริยัน)',
      'ประโยคยาวเยิ่นเย้อที่ขาด Rhythm',
      'คำหวานเลี่ยนแบบป๊อปดั้งเดิม',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'Indie / Pop',
    displayName: 'Thai Indie / Pop & Bedroom Pop',
    narrativePacing: 'บทสนทนาเป็นธรรมชาติ ไดอารีส่วนตัว อารมณ์สังเกตการณ์',
    imageryFocus: 'everyday-objects',
    rhymeDensityPreference: 'conversational-free',
    recommendedVerbs: ['รดน้ำ', 'เปิดเพลง', 'แบ่งหูฟัง', 'มองออกไป', 'บันทึก', 'เผลอยิ้ม', 'เดินผ่าน'],
    bannedTropes: [
      'การสัมผัสสระแบบไร้สาระ (กินข้าวกับเต่าใต้เงา)',
      'การเปรียบเทียบเชิงอภินิหาร/ดวงดาวเกินจริง',
    ],
    sourceType: 'synthetic-expert',
  },
  {
    genreKey: 'English Pop',
    displayName: 'International English Pop',
    narrativePacing: 'Universal emotional clarity, strong melodic hooks, modern phrasing',
    imageryFocus: 'melodic-pop',
    rhymeDensityPreference: 'natural-cadence',
    recommendedVerbs: ['stay', 'whisper', 'glow', 'remember', 'drive', 'fade', 'breathe', 'reach'],
    bannedTropes: [
      'Non-English / Thai language contamination',
      'Awkward robotic literal translations',
    ],
    sourceType: 'synthetic-expert',
  },
];
