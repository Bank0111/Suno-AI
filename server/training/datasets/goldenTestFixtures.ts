import { GoldenTestFixture } from '../types';

/**
 * GOLDEN TEST FIXTURES DATASET (PHASE 5.7 GOLDEN STANDARDS)
 * Benchmark test definitions for automated evaluation across core genres.
 */
export const GOLDEN_TEST_FIXTURES: GoldenTestFixture[] = [
  // A. Thai Country Folk
  {
    id: 'golden-test-country-folk',
    title: 'Thai Country Folk: Sincere Playful Neighbor Story',
    targetLanguage: 'ไทย',
    config: {
      genre: 'Country / Folk',
      moods: ['ขี้เล่น (Playful)', 'สดใส (Upbeat / Cheerful)'],
      story: 'หนุ่มบ้านนอกแอบชอบสาวข้างบ้าน แกล้งแซวทุกวันแต่ใจจริงรักเขามาก อยากขอเป็นแฟนแต่เขิน',
      pointOfView: 'first-person',
      wordTone: 'ขี้เล่น เข้าถึงง่าย',
      languageStyle: 'ภาษาพูดตรงไปตรงมา',
      bpm: 96,
      tempo: 'ปานกลาง (96 BPM)',
      vocalType: 'ชาย',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'หนุ่มบ้าน ๆ จริงใจ ขี้เล่น ตรงไปตรงมา (Playful & Sincere Folk Narrator)',
      targetRegister: 'spoken',
      mustIncludeSemanticThemes: ['ความแอบชอบ', 'วิถีชีวิตข้างบ้าน', 'ความเขิน', 'ความจริงใจ'],
      mustAvoidPatterns: [
        'คูณสอง',
        'บวกหนึ่ง',
        'วิ่งแส่',
        'ใจมันพองโตขึ้นมา',
        'ดวงฤทัย',
        'ดาวดึงส์',
        'ประแจ',
        'น็อต',
        'คราบน้ำมัน',
      ],
    },
    knownFailurePatternsToDetect: [
      'robotic-math-metaphor',
      'awkward-slang',
      'poetic-register-mismatch',
      'unsupported-genre-decoration',
    ],
    sourceType: 'synthetic-expert',
  },

  // B. Thai R&B / Soul
  {
    id: 'golden-test-rnb-soul',
    title: 'Thai R&B / Soul: Intimate Late Night Longing',
    targetLanguage: 'ไทย',
    config: {
      genre: 'R&B / Soul',
      moods: ['โรแมนติก (Romantic)', 'เหงา (Melancholic)'],
      story: 'ความรักที่ต้องเก็บซ่อนไว้ในใจ สัมผัสไออุ่นและร่องรอยความทรงจำยามค่ำคืน',
      pointOfView: 'first-person',
      wordTone: 'ลึกซึ้ง นุ่มนวล',
      languageStyle: 'ภาษาสละสลวย',
      bpm: 78,
      tempo: 'ช้า นุ่มนวล (78 BPM)',
      vocalType: 'ชาย',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'คนเมืองร่วมสมัย ถ่ายทอดความรู้สึกลึกซึ้ง (Modern Urban Narrator)',
      targetRegister: 'conversational',
      mustIncludeSemanticThemes: ['ความทรงจำ', 'ไออุ่น', 'แววตา', 'ความเงียบ', 'ความรู้สึกส่วนตัว'],
      mustAvoidPatterns: [
        'คำหยาบกระด้าง',
        'กอดเสาเถียง',
        'คำถิ่นที่ไม่เข้าบริบทเมือง',
        'น้ำตารินไหลอาบแก้ม',
        'ทำให้ฉันรู้สึกเศร้า',
        'อธิบายความเจ็บ',
      ],
    },
    knownFailurePatternsToDetect: [
      'cliche-overload',
      'dialect-leak',
      'rhythm-stumble',
      'emotional-over-explanation',
    ],
    sourceType: 'synthetic-expert',
  },

  // C. Thai Hip-Hop
  {
    id: 'golden-test-hiphop',
    title: 'Thai Hip-Hop: Street Struggle & Ambition',
    targetLanguage: 'ไทย',
    config: {
      genre: 'Hip-Hop / Rap',
      moods: ['มีพลัง (Energetic)', 'มั่นใจ (Confident)'],
      story: 'เด็กหนุ่มต่อสู้ในเมืองหลวง ไม่ยอมแพ้ต่อโชคชะตา เดินหน้าพิสูจน์ตัวเองบนถนน',
      pointOfView: 'first-person',
      wordTone: 'ดุดัน ตรงไปตรงมา',
      languageStyle: 'ภาษาสตรีท / ทันสมัย',
      bpm: 92,
      tempo: 'หนักแน่น กระชับ (92 BPM)',
      vocalType: 'ชาย',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'Street / Hip-Hop Voice (มั่นใจ มุ่งมั่น สตรีท)',
      targetRegister: 'spoken',
      mustIncludeSemanticThemes: ['การต่อสู้', 'เมืองหลวง', 'ความฝัน', 'หยาดเหงื่อ', 'สองมือ'],
      mustAvoidPatterns: [
        'ข้าพเจ้า',
        'สุริยัน',
        'นภา',
        'ภิรมย์',
        'นฤมิต',
        'ธารกำนัล',
        'บริบท',
        'ขับเคลื่อน',
        'จากนั้นก็',
      ],
    },
    knownFailurePatternsToDetect: [
      'archaic-poetic-mismatch',
      'passive-sentimentality',
      'awkward-collocation',
      'narrative-prose-reporting',
    ],
    sourceType: 'synthetic-expert',
  },

  // D. English Pop
  {
    id: 'golden-test-english-pop',
    title: 'English Pop: Late Night Coast Drive',
    targetLanguage: 'English',
    config: {
      genre: 'English Pop',
      moods: ['Melancholic', 'Hopeful'],
      story: 'A late night drive along the coast thinking about second chances and lost love',
      pointOfView: 'first-person',
      wordTone: 'Warm & reflective',
      languageStyle: 'Modern conversational English',
      bpm: 110,
      tempo: 'Upbeat Melancholy (110 BPM)',
      vocalType: 'Female',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'Modern English Songwriter',
      targetRegister: 'conversational',
      mustIncludeSemanticThemes: ['heart', 'stay', 'remember', 'coast', 'drive', 'glow'],
      mustAvoidPatterns: [
        'Thai script',
        'any Thai loan words',
        'bottom of my heart',
        'tears falling down like waterfalls',
      ],
    },
    knownFailurePatternsToDetect: [
      'language-cross-contamination',
      'generic-emotional-filler',
    ],
    sourceType: 'synthetic-expert',
  },

  // E. Thai Lukthung / อีสาน
  {
    id: 'golden-test-lukthung',
    title: 'Thai Lukthung: Isan Farmer\'s Longing',
    targetLanguage: 'ไทย',
    config: {
      genre: 'Lukthung',
      moods: ['เศร้า (Melancholic)', 'อาลัยอาวรณ์ (Longing)'],
      story: 'ชาวนาอีสานรักผู้หญิงคนหนึ่งที่ต้องไปทำงานไกลบ้าน เฝ้ารอด้วยความคิดถึงและหวังว่าเธอจะกลับมา',
      pointOfView: 'first-person',
      wordTone: 'จริงใจ เข้มข้น',
      languageStyle: 'สำเนียงอีสานธรรมชาติ',
      bpm: 82,
      tempo: 'ปานกลางถึงช้า (82 BPM)',
      vocalType: 'ชาย',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'คนอีสานหัวใจเข้มข้น พูดตรงไปตรงมา (isan-sincere-heart)',
      targetRegister: 'dialect',
      mustIncludeSemanticThemes: ['การรอคอย', 'คิดฮอด', 'ทุ่งนา', 'ความเข้มแข็ง'],
      mustAvoidPatterns: ['รักเธอสุดหัวใจ', 'ประแจ', 'น็อต', 'คราบน้ำมัน', 'เครื่องยนต์', 'บริบท', 'ขับเคลื่อน'],
    },
    knownFailurePatternsToDetect: [
      'unsupported-genre-decoration',
      'generic-central-thai-phrasing',
      'dialect-inconsistency',
      'cliche-overload',
    ],
    sourceType: 'synthetic-expert',
  },

  // F. Rock / Alternative
  {
    id: 'golden-test-rock',
    title: 'Rock: Defiance After Heartbreak',
    targetLanguage: 'ไทย',
    config: {
      genre: 'Rock',
      moods: ['โกรธ (Angry)', 'มีพลัง (Empowered)'],
      story: 'คนที่เพิ่งผ่านความสัมพันธ์ที่เจ็บปวดมา ตัดสินใจลุกขึ้นสู้และไม่ยอมให้ใครมาทำร้ายจิตใจอีก',
      pointOfView: 'first-person',
      wordTone: 'ดิบ ตรงไปตรงมา มีพลัง',
      languageStyle: 'ภาษาพูดหนักแน่น',
      bpm: 140,
      tempo: 'เร็ว หนักแน่น (140 BPM)',
      vocalType: 'ไม่ระบุ',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'คนหัวขบถ ไม่ยอมจำนน (rock-defiant-soul)',
      targetRegister: 'spoken',
      mustIncludeSemanticThemes: ['การลุกขึ้นสู้', 'ความโกรธ', 'พลัง', 'การไม่ยอมแพ้'],
      mustAvoidPatterns: ['รักเธอสุดหัวใจ', 'ดวงฤทัย', 'ข้าพเจ้า', 'บริบท', 'อธิบายความเจ็บ'],
    },
    knownFailurePatternsToDetect: [
      'register-mismatch',
      'generic-emotional-filler',
      'forced-rhyme',
      'passive-sentimentality',
    ],
    sourceType: 'synthetic-expert',
  },

  // G. City Pop
  {
    id: 'golden-test-citypop',
    title: 'City Pop: Late Night Drive Alone',
    targetLanguage: 'ไทย',
    config: {
      genre: 'City Pop',
      moods: ['เหงา (Lonely)', 'เท่ (Cool / Detached)'],
      story: 'คนทำงานในเมืองใหญ่ขับรถเล่นยามค่ำคืนคนเดียว นึกถึงความสัมพันธ์ที่จบไปแล้วแต่ไม่แสดงความอ่อนแอออกมาตรงๆ',
      pointOfView: 'first-person',
      wordTone: 'เท่ นิ่ง แต่แฝงความเหงา',
      languageStyle: 'ภาษาเมืองร่วมสมัย',
      bpm: 100,
      tempo: 'กลาง กรูฟลื่นไหล (100 BPM)',
      vocalType: 'หญิง',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'คนเมืองยามค่ำคืน เท่แต่โดดเดี่ยว (city-pop-night-drifter)',
      targetRegister: 'conversational',
      mustIncludeSemanticThemes: ['ไฟเมือง', 'การขับรถ', 'ความเหงา', 'ระยะห่างทางอารมณ์'],
      mustAvoidPatterns: ['รักเธอสุดหัวใจ', 'คิดฮอด', 'สำเนียงอีสาน', 'อธิบายความเจ็บ'],
    },
    knownFailurePatternsToDetect: [
      'dialect-leak',
      'emotional-over-explanation',
      'generic-emotional-filler',
      'register-mismatch',
    ],
    sourceType: 'synthetic-expert',
  },

  // H. Pop (Mainstream)
  {
    id: 'golden-test-pop',
    title: 'Pop: First Love at School Gate',
    targetLanguage: 'ไทย',
    config: {
      genre: 'Pop',
      moods: ['สดใส (Upbeat)', 'มีความหวัง (Hopeful)'],
      story: 'นักเรียนสองคนตกหลุมรักกันครั้งแรกที่หน้าประตูโรงเรียน ความรู้สึกใสซื่อและเรียบง่าย',
      pointOfView: 'first-person',
      wordTone: 'สดใส เข้าถึงง่าย',
      languageStyle: 'ภาษาพูดธรรมดา',
      bpm: 118,
      tempo: 'สนุกสนาน (118 BPM)',
      vocalType: 'ไม่ระบุ',
    },
    expectedLexicalBehavior: {
      requiredVoicePersona: 'คนธรรมดาที่มองโลกในแง่ดี (universal-pop-optimist)',
      targetRegister: 'conversational',
      mustIncludeSemanticThemes: ['ความรักครั้งแรก', 'ความสุข', 'ความหวัง'],
      mustAvoidPatterns: ['บริบท', 'ปัจจัย', 'ประโยคยาวซับซ้อน', 'ศัพท์เฉพาะทาง'],
    },
    knownFailurePatternsToDetect: [
      'rhythm-stumble',
      'awkward-collocation',
      'genre-mismatch',
    ],
    sourceType: 'synthetic-expert',
  },
];