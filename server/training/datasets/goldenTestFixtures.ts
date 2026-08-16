import { GoldenTestFixture } from '../types';

/**
 * GOLDEN TEST FIXTURES DATASET
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
      mustAvoidPatterns: ['คูณสอง', 'บวกหนึ่ง', 'วิ่งแส่', 'ใจมันพองโตขึ้นมา', 'ดวงฤทัย', 'ดาวดึงส์'],
    },
    knownFailurePatternsToDetect: [
      'robotic-math-metaphor',
      'awkward-slang',
      'poetic-register-mismatch',
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
      mustAvoidPatterns: ['คำหยาบกระด้าง', 'กอดเสาเถียง', 'คำถิ่นที่ไม่เข้าบริบทเมือง', 'น้ำตารินไหลอาบแก้ม'],
    },
    knownFailurePatternsToDetect: [
      'cliche-overload',
      'dialect-leak',
      'rhythm-stumble',
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
      mustAvoidPatterns: ['ข้าพเจ้า', 'สุริยัน', 'นภา', 'ภิรมย์', 'นฤมิต', 'ธารกำนัล'],
    },
    knownFailurePatternsToDetect: [
      'archaic-poetic-mismatch',
      'passive-sentimentality',
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
      mustAvoidPatterns: ['Thai script', 'any Thai loan words'],
    },
    knownFailurePatternsToDetect: [
      'language-cross-contamination',
    ],
    sourceType: 'synthetic-expert',
  },
];
