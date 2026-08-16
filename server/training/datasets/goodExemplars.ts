import { GoodLyricExemplar } from '../types';

/**
 * GOOD LYRICS DATASET (ORIGINAL SYNTHETIC EXEMPLARS)
 * High-craft lyric sections demonstrating natural Thai phrasing, consistent character voice,
 * concrete imagery, and rhythmic singability across benchmark genres.
 */
export const GOOD_EXEMPLARS: GoodLyricExemplar[] = [
  // 1. Thai Country / Folk (หนุ่มบ้านนอก ซื่อ จริงใจ ขี้เล่น)
  {
    id: 'good-folk-001',
    genre: 'Country / Folk',
    personaVoice: 'หนุ่มบ้านนอกแอบชอบสาวข้างบ้าน แกล้งแซวทุกวันแต่ใจจริงรักมาก',
    personaKey: 'rustic-playful-male',
    sectionType: 'Verse',
    lines: [
      'ขี่มอเตอร์ไซค์ผ่านหน้าบ้านเธอทุกเย็น',
      'แกล้งบีบแตรเล่นให้หมามันเห่าไปงั้น',
      'ใจจริงแค่อยากเห็นหน้าเธอสักนาที',
      'เผื่อฟลุ๊กเธอหันมายิ้มให้กันสักคราว',
    ],
    whyItWorks: {
      naturalnessScore: 10,
      imageryType: 'concrete',
      characterConsistency: 'ใช้พฤติกรรมจริงในชนบท (ขี่มอไซค์ บีบแตร หมาเห่า) สื่อสารซื่อๆ ไม่ใช้คำหวานเลี่ยน',
      singabilityPacing: 'จำนวนพยางค์ 8-8-8-8 สม่ำเสมอ ลงจังหวะห้องดนตรีโฟล์ก 4/4 พอดี',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-folk-002',
    genre: 'Country / Folk',
    personaVoice: 'หนุ่มบ้านนอกแอบชอบสาวข้างบ้าน แกล้งแซวทุกวันแต่ใจจริงรักมาก',
    personaKey: 'rustic-playful-male',
    sectionType: 'Chorus',
    lines: [
      'ไม่ได้หล่อเหมือนดาราในทีวี',
      'แต่ความจริงใจที่มี ให้เธอเกินร้อยเลยหนา',
      'ถ้าเธอตกลงยอมเป็นแฟนอ้ายขึ้นมา',
      'จะพาไปไหว้หลวงพ่อหน้าปากซอยทันที',
    ],
    whyItWorks: {
      naturalnessScore: 9.5,
      imageryType: 'narrative',
      characterConsistency: 'คำว่า "เกินร้อยเลยหนา" และ "ไหว้หลวงพ่อหน้าปากซอย" สะท้อนวัฒนธรรมชุมชนอย่างเป็นธรรมชาติ',
      singabilityPacing: 'วรรคเปิดสั้นกระชับ วรรคปิดมีจุดพีกอารมณ์ขันและจริงใจ',
    },
    sourceType: 'synthetic-expert',
  },

  // 2. Thai R&B / Soul (คนเมืองเหงา ลึกซึ้ง นุ่มนวล)
  {
    id: 'good-rnb-001',
    genre: 'R&B / Soul',
    personaVoice: 'คนเมืองมีความสัมพันธ์ที่คลุมเครือ นึกถึงสัมผัสและความรู้สึกยามค่ำคืน',
    personaKey: 'urban-intimate-soul',
    sectionType: 'Verse',
    lines: [
      'แสงไฟสลัวส่องสะท้อนแก้วกาแฟ',
      'กับข้อความสั้นๆ ที่เธอไม่ได้ตอบ',
      'กลิ่นน้ำหอมของเธอยังติดที่โซฟา',
      'เหมือนเธอยังนั่งอยู่ข้างๆ ไม่ได้ไปไหน',
    ],
    whyItWorks: {
      naturalnessScore: 9.8,
      imageryType: 'sensory',
      characterConsistency: 'เน้นประสาทสัมผัส (แสงสะท้อน กลิ่นน้ำหอมบนโซฟา) ถ่ายทอดความเหงาคนเมืองได้อย่างละเมียดละไม',
      singabilityPacing: 'มีช่วงหยุดหายใจท้ายวรรคเพื่อเอื้อต่อการร้องเมลิสมา (Melisma) และลากเสียงแบบ R&B',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-rnb-002',
    genre: 'R&B / Soul',
    personaVoice: 'คนเมืองมีความสัมพันธ์ที่คลุมเครือ นึกถึงสัมผัสและความรู้สึกยามค่ำคืน',
    personaKey: 'urban-intimate-soul',
    sectionType: 'Chorus',
    lines: [
      'แค่เศษเสี้ยวของความทรงจำ',
      'ยังทำให้ใจสั่นไหวทุกค่ำคืน',
      'ไม่อยากตื่นมาพบความจริงที่ไม่มีเธอ',
      'ยังคงกอดรอยยิ้มเธอไว้ในฝันเรื่อยไป',
    ],
    whyItWorks: {
      naturalnessScore: 9.2,
      imageryType: 'emotional',
      characterConsistency: 'น้ำเสียงตัดพ้ออย่างสุภาพ นุ่มนวล และสละสลวย ไม่โวยวาย',
      singabilityPacing: 'สัมผัสสระ (จำ - ค่ำ, คืน - ตื่น, เธอ - เผลอ/เรื่อย) ไหลลื่น',
    },
    sourceType: 'synthetic-expert',
  },

  // 3. Thai Hip-Hop / Rap (Street Cadence, Real Talk)
  {
    id: 'good-hiphop-001',
    genre: 'Hip-Hop / Rap',
    personaVoice: 'เด็กหนุ่มสู้ชีวิตในกรุงเทพฯ พิสูจน์ตัวเองจากศูนย์',
    personaKey: 'street-hustler-mc',
    sectionType: 'Verse',
    lines: [
      'เริ่มจากห้องเช่าแคบๆ พัดลมเก่าเปิดเบอร์สาม',
      'เขียนไรม์บนสมุดขาดๆ โดนดูถูกกี่สิบคำถาม',
      'ไม่มีเส้นสายมีแต่สองมือกับความพยายาม',
      'วันนี้เสียงกูต้องดังให้คนทั้งบางได้ยินชื่อกู',
    ],
    whyItWorks: {
      naturalnessScore: 9.6,
      imageryType: 'concrete',
      characterConsistency: 'รายละเอียดสมจริงมาก (พัดลมเบอร์สาม, สมุดขาดๆ) ใช้ภาษาพูดหนักแน่น ตรงไปตรงมา',
      singabilityPacing: 'สัมผัสในและสัมผัสปลายวรรค (สาม - ถาม - พยายาม) มีจังหวะ Boom Bap 16-bar flow ชัดเจน',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-hiphop-002',
    genre: 'Hip-Hop / Rap',
    personaVoice: 'เด็กหนุ่มสู้ชีวิตในกรุงเทพฯ พิสูจน์ตัวเองจากศูนย์',
    personaKey: 'street-hustler-mc',
    sectionType: 'Hook',
    lines: [
      'ก้าวออกมาจากมุมมืด ลุยไปข้างหน้าไม่หันกลับ',
      'หยาดเหงื่อทุกหยดที่ร่วงลงดิน คือราคาที่กูต้องจ่าย',
      'ถ้ายังหายใจก็ไม่มีคำว่ายอมแพ้',
    ],
    whyItWorks: {
      naturalnessScore: 9.0,
      imageryType: 'narrative',
      characterConsistency: 'Punchline ชัดเจน พลังงานสูง ไม่ประดิษฐ์คำสำนวนกวีที่ผิดที่ผิดทาง',
      singabilityPacing: 'วรรคสั้นกระแทกเสียงลง Beat ได้ง่าย',
    },
    sourceType: 'synthetic-expert',
  },

  // 4. Thai Indie / Pop (เรื่องราวเฉพาะตัว บรรยากาศละมุน)
  {
    id: 'good-indie-001',
    genre: 'Indie / Pop',
    personaVoice: 'คนช่างสังเกต มองความรักผ่านสิ่งของรอบตัว',
    personaKey: 'indie-storyteller',
    sectionType: 'Verse',
    lines: [
      'ต้นไม้กระถางที่เธอซื้อมาให้เมื่อวันก่อน',
      'ฉันรดน้ำทุกเช้าเหมือนกลัวมันจะเหี่ยวเฉาไป',
      'เหมือนกับความรู้สึกของเราในตอนนี้',
      'ที่ค่อยๆ เติบโตขึ้นทีละนิดในใจเงียบๆ',
    ],
    whyItWorks: {
      naturalnessScore: 9.7,
      imageryType: 'concrete',
      characterConsistency: 'ใช้อุปมาสิ่งของรอบตัว (ต้นไม้กระถาง) เล่าแบบสบายๆ คล้ายไดอารี',
      singabilityPacing: 'เมโลดี้อิสระแบบ Conversational Indie Melody เล่าเรื่องเป็นธรรมชาติ',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-indie-002',
    genre: 'Indie / Pop',
    personaVoice: 'คนช่างสังเกต มองความรักผ่านสิ่งของรอบตัว',
    personaKey: 'indie-storyteller',
    sectionType: 'Chorus',
    lines: [
      'แค่อยากมีเธอร่วมเดินในวันที่แดดร่มลมตก',
      'แบ่งหูฟังคนละข้างฟังเพลงโปรดเพลงเดิม',
      'ไม่ต้องมีคำสัญญาที่ยิ่งใหญ่อะไร',
      'แค่มีเธอข้างๆ แบบนี้ก็พอแล้ว',
    ],
    whyItWorks: {
      naturalnessScore: 9.6,
      imageryType: 'concrete',
      characterConsistency: 'ภาพ "แบ่งหูฟังคนละข้าง" สะท้อนความโรแมนติกแบบเรียบง่าย ไม่ใช้คำหวานฟุ่มเฟือย',
      singabilityPacing: 'ร้องง่าย ไหลตามวรรคพูดปกติของคนวัยรุ่น/คนรุ่นใหม่',
    },
    sourceType: 'synthetic-expert',
  },

  // 5. English Pop (Contemporary, Reflective, Conversational)
  {
    id: 'good-eng-001',
    genre: 'English Pop',
    personaVoice: 'Modern reflective songwriter driving late at night',
    personaKey: 'english-pop-narrator',
    sectionType: 'Verse',
    lines: [
      'Streetlights flickering on the wet asphalt',
      'Your old cassette still stuck inside the dash',
      'I tell myself that distance makes it easy',
      'Until the highway signs all point back home',
    ],
    whyItWorks: {
      naturalnessScore: 9.8,
      imageryType: 'concrete',
      characterConsistency: 'Grounded in tactile details (wet asphalt, stuck cassette, highway signs) rather than vague sorrow.',
      singabilityPacing: 'Natural English stress meter (iambic flow) with clean 8-10 syllable lines.',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-eng-002',
    genre: 'English Pop',
    personaVoice: 'Modern reflective songwriter driving late at night',
    personaKey: 'english-pop-narrator',
    sectionType: 'Chorus',
    lines: [
      'And if the coast is clear tonight',
      'I will leave the headlights on for you',
      'We never said our last goodbye',
      'Just let the ocean swallow the truth',
    ],
    whyItWorks: {
      naturalnessScore: 9.5,
      imageryType: 'emotional',
      characterConsistency: 'Open, memorable hook line with poignant ocean imagery.',
      singabilityPacing: 'Melodic vowel endings on key stressed beats.',
    },
    sourceType: 'synthetic-expert',
  },
];
