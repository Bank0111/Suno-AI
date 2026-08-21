import { GoodLyricExemplar } from '../types';

/**
 * GOOD LYRICS DATASET (ORIGINAL SYNTHETIC EXEMPLARS)
 * High-craft lyric sections demonstrating natural phrasing, consistent character voice,
 * concrete imagery, perspective shifts in bridge, and rhythmic singability across benchmark genres.
 */
export const GOOD_EXEMPLARS: GoodLyricExemplar[] = [
  // =========================================================================
  // 1. Thai Country / Folk (หนุ่มบ้านนอก ซื่อ จริงใจ ขี้เล่น)
  // =========================================================================
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
  {
    id: 'good-folk-003',
    genre: 'Country / Folk',
    personaVoice: 'หนุ่มบ้านนอก เปิดเผยความรู้สึกจริงจัง',
    personaKey: 'rustic-sincere-male',
    sectionType: 'Bridge',
    lines: [
      'จากที่เคยคิดว่าแซวเล่นไปวันๆ',
      'พอเห็นเธอมีคนมาคุยด้วยใจมันก็เริ่มหวั่นไหว',
      'เพิ่งรู้ว่าที่ทำไปทั้งหมดไม่ใช่แค่เรื่องตลก',
      'แต่อ้ายตกหลุมรักเจ้าจนหมดหัวใจไปตั้งนานแล้ว',
    ],
    whyItWorks: {
      naturalnessScore: 9.8,
      imageryType: 'emotional',
      characterConsistency: 'Perspective Shift ชัดเจน: เปลี่ยนจากท่าทีขี้เล่นมาสู่ความรู้สึกเปราะบางและจริงจังอย่างลงตัว',
      singabilityPacing: 'ไดนามิกดนตรีชะลอลง ให้พื้นที่กับเสียงร้องเน้นอารมณ์',
    },
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 2. Thai R&B / Soul (คนเมืองเหงา ลึกซึ้ง นุ่มนวล)
  // =========================================================================
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
      singabilityPacing: 'สัมผัสสระ (จำ - ค่ำ, คืน - ตื่น, เธอ - เรื่อย) ไหลลื่น',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-rnb-003',
    genre: 'R&B / Soul',
    personaVoice: 'คนเมืองตกผลึกความจริงของความสัมพันธ์',
    personaKey: 'urban-intimate-soul',
    sectionType: 'Bridge',
    lines: [
      'ไม่ได้ต้องการให้เธอกลับมาเพื่อเริ่มต้นใหม่',
      'แค่อยากบอกความจริงว่าฉันเข้าใจทุกเหตุผล',
      'ที่ตรงนี้จะยังคงเงียบงันและอบอุ่น',
      'แม้รู้ดีว่าพรุ่งนี้จะไม่มีเธอกลับมาอีกแล้ว',
    ],
    whyItWorks: {
      naturalnessScore: 9.6,
      imageryType: 'emotional',
      characterConsistency: 'Epiphany / Realization: ก้าวข้ามจากการตัดพ้อไปสู่การยอมรับความจริงอย่างเป็นผู้ใหญ่ ไม่ฟูมฟาย',
      singabilityPacing: 'คอร์ดส่งขึ้นบันไดเสียงสูงเพื่อสร้างจุดพีกทางอารมณ์',
    },
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 3. Thai Hip-Hop / Rap (Street Cadence, Real Talk)
  // =========================================================================
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
  {
    id: 'good-hiphop-003',
    genre: 'Hip-Hop / Rap',
    personaVoice: 'เด็กหนุ่มสู้ชีวิต เล่าความคืบหน้าของเรื่องราว',
    personaKey: 'street-hustler-mc',
    sectionType: 'Verse',
    lines: [
      'ส้นรองเท้าผ้าใบขาดวิ่นจากการเดินข้ามสะพานลอย',
      'เงินในบัญชีเหลือร้อยเดียวแต่ไรม์กูมีค่าเป็นล้าน',
      'เพื่อนร่วมรุ่นทยอยยอมแพ้แล้วแยกย้ายกลับบ้าน',
      'แต่กูยังยืนเขียนบาร์ต่อไปจนกว่าแสงไฟจะส่องลงมา',
    ],
    whyItWorks: {
      naturalnessScore: 9.7,
      imageryType: 'concrete',
      characterConsistency: 'Verse 2 Progression: ยกระดับเดิมพัน (เพื่อนถอดใจ, เงินเหลือร้อยเดียว) ขับเคลื่อนเรื่องราวไปข้างหน้า ไม่เล่าเรื่องพัดลมซ้ำจาก Verse 1',
      singabilityPacing: 'สัมผัสปลายวรรค (ลอย - ร้อย - ถอย/บ้าน - มา) ลงบน Snare แน่นอน',
    },
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 4. Thai Indie / Pop (เรื่องราวเฉพาะตัว บรรยากาศละมุน)
  // =========================================================================
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
      singabilityPacing: 'ร้องง่าย ไหลตามวรรคพูดปกติของคนรุ่นใหม่',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-indie-003',
    genre: 'Indie / Pop',
    personaVoice: 'คนช่างสังเกต ทิ้งภาพจำสุดท้ายอย่างตราตรึง',
    personaKey: 'indie-storyteller',
    sectionType: 'Outro',
    lines: [
      'แดดยามเย็นค่อยๆ ลับขอบหน้าต่างไป',
      'เพลงเดิมยังเล่นวนซ้ำในหูฟังข้างเดิม',
      'กับรอยยิ้มจางๆ ที่ยังไม่ยอมหายไปไหน',
    ],
    whyItWorks: {
      naturalnessScore: 9.9,
      imageryType: 'sensory',
      characterConsistency: 'Closure & Afterglow: ทิ้งภาพจำเชิงผัสสะและพื้นที่ว่างทางอารมณ์ (Negative Space) ได้อย่างละมุนละไม',
      singabilityPacing: 'ท่วงทำนองค่อยๆ เฟดลงตามบรรยากาศเพลง',
    },
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 5. English Pop (Contemporary, Reflective, Conversational)
  // =========================================================================
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

  // =========================================================================
  // 6. Thai Lukthung / อีสาน (Isan Regional Folk — Sincere, Dialect-Rich)
  // =========================================================================
  {
    id: 'good-lukthung-001',
    genre: 'Lukthung',
    personaVoice: 'คนอีสานรอคอยคนรักที่ไปทำงานไกลบ้าน คิดฮอดทุกวันแต่ยังเข้มแข็ง',
    personaKey: 'isan-sincere-heart',
    sectionType: 'Verse',
    lines: [
      'แดดยามเช้าส่องผ่านทุ่งนา',
      'เสียงไก่ขันปลุกให้ตื่นทุกวัน',
      'เจ้าเคยเดินผ่านคันนาเส้นนั้น',
      'ยิ้มให้กันก่อนเจ้าจากไปไกล',
    ],
    whyItWorks: {
      naturalnessScore: 9.5,
      imageryType: 'concrete',
      characterConsistency: 'ใช้ภาพชนบทที่แท้จริง (ทุ่งนา, คันนา, ไก่ขัน) เพียงพอสร้างบรรยากาศ ไม่ยัดคำเกษตรกรรมซ้อนกันเกินจำเป็น',
      singabilityPacing: 'จังหวะช้าแบบลูกทุ่งดั้งเดิม พยางค์ 8-8-8-8 สม่ำเสมอ',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-lukthung-002',
    genre: 'Lukthung',
    personaVoice: 'คนอีสานรอคอยคนรักที่ไปทำงานไกลบ้าน คิดฮอดทุกวันแต่ยังเข้มแข็ง',
    personaKey: 'isan-sincere-heart',
    sectionType: 'Chorus',
    lines: [
      'อ้ายเกิดมาจน แต่หัวใจอ้ายบ่จน',
      'คิดฮอดเจ้าทุกคืนวันจนนอนบ่หลับ',
      'ไกลแค่ไหนอ้ายกะยังฮักเจ้าคนเดียว',
      'บ่มีวันเปลี่ยนแปรผันไปหาใคร',
    ],
    whyItWorks: {
      naturalnessScore: 9.6,
      imageryType: 'emotional',
      characterConsistency: 'ใช้คำอีสานธรรมชาติ (ฮัก, คิดฮอด, บ่) พูดจากใจตรงไปตรงมาแบบคนอีสานแท้ ไม่ประดิษฐ์คำ',
      singabilityPacing: 'สัมผัสใน "จน-จน" วนซ้ำสร้าง Hook จำง่าย เอื้อนเสียงลงตัวกับจังหวะลูกทุ่ง',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-lukthung-003',
    genre: 'Lukthung',
    personaVoice: 'คนอีสานตกผลึกความเข้าใจเรื่องความรักที่แท้จริง',
    personaKey: 'isan-sincere-heart',
    sectionType: 'Bridge',
    lines: [
      'เพิ่งฮู้ว่าความฮักที่แท้จริง',
      'บ่ได้อยู่ที่เงินทองหรือของกำนัล',
      'อยู่ที่ใจที่มั่นคงบ่เปลี่ยนผัน',
      'แม้วันคืนจะพาเฮาห่างไกลกัน',
    ],
    whyItWorks: {
      naturalnessScore: 9.4,
      imageryType: 'emotional',
      characterConsistency: 'Perspective Shift ชัดเจนจากการเล่าความคิดถึงสู่การตกผลึกความเข้าใจเรื่องความรัก ไม่ตัดพ้อซ้ำ',
      singabilityPacing: 'จังหวะช้าลงเน้นคำร้อง เปิดพื้นที่ให้เอื้อนเสียงตอนท้ายวรรค',
    },
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 7. Rock / Alternative (ดิบ ตรง มีพลัง)
  // =========================================================================
  {
    id: 'good-rock-001',
    genre: 'Rock',
    personaVoice: 'คนที่ผ่านความเจ็บปวดมาและเลือกลุกขึ้นสู้ ไม่ยอมจำนน',
    personaKey: 'rock-defiant-soul',
    sectionType: 'Verse',
    lines: [
      'ฝ่าฝนที่กระหน่ำลงมาทุกคืน',
      'ล้มกี่ครั้งก็ยังลุกขึ้นยืน',
      'ไม่มีใครเข้าใจแต่ช่างมัน',
      'กูเดินเส้นทางที่กูเลือกเอง',
    ],
    whyItWorks: {
      naturalnessScore: 9.3,
      imageryType: 'narrative',
      characterConsistency: 'ภาษาดิบ ตรงไปตรงมา ไม่ปรุงแต่งคำ สื่อพลังต่อสู้ผ่านการกระทำ (ล้ม-ลุก) แทนการอธิบายความรู้สึก',
      singabilityPacing: 'วรรคสั้นกระแทกจังหวะ ลง Downbeat ชัดเจนตรงกับดนตรีร็อค',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-rock-002',
    genre: 'Rock',
    personaVoice: 'คนที่ผ่านความเจ็บปวดมาและเลือกลุกขึ้นสู้ ไม่ยอมจำนน',
    personaKey: 'rock-defiant-soul',
    sectionType: 'Chorus',
    lines: [
      'ทลายกำแพงที่กั้นขวางหัวใจ',
      'ปล่อยเสียงกรีดร้องให้ดังก้อง',
      'ต่อให้โลกจะบดขยี้กูแค่ไหน',
      'กูจะยืนสู้จนวินาทีสุดท้าย',
    ],
    whyItWorks: {
      naturalnessScore: 9.5,
      imageryType: 'emotional',
      characterConsistency: 'Punchline ทรงพลัง ("กูจะยืนสู้จนวินาทีสุดท้าย") ไม่ประนีประนอมทางอารมณ์ ตรงตาม Character Voice ของแนวเพลง',
      singabilityPacing: 'วรรคไต่ระดับความเข้มขึ้นเรื่อยๆ เปิดพื้นที่ให้ Belt เสียงในวรรคท้าย',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-rock-003',
    genre: 'Rock',
    personaVoice: 'คนที่ตกผลึกว่าความเจ็บปวดคือบทเรียน ไม่ใช่ความพ่ายแพ้',
    personaKey: 'rock-defiant-soul',
    sectionType: 'Bridge',
    lines: [
      'เพิ่งเข้าใจว่าที่ผ่านมาทั้งหมด',
      'ไม่ใช่ความพ่ายแพ้แต่คือบทเรียน',
      'ทุกแผลเป็นคือหลักฐานว่ากูยังยืนอยู่',
      'และกูจะไม่มีวันคุกเข่าให้ใคร',
    ],
    whyItWorks: {
      naturalnessScore: 9.6,
      imageryType: 'emotional',
      characterConsistency: 'Perspective Shift จากความเจ็บปวดสู่การตระหนักรู้ ("แผลเป็นคือหลักฐาน") คงความดิบและพลังไว้ตลอด',
      singabilityPacing: 'จังหวะลดลงชั่วคราวก่อนไต่กลับสู่จุดพีกใน Chorus สุดท้าย',
    },
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 8. City Pop (เมืองยามค่ำคืน หรูหราแต่โดดเดี่ยว)
  // =========================================================================
  {
    id: 'good-citypop-001',
    genre: 'City Pop',
    personaVoice: 'คนเมืองยามค่ำคืน ดูมั่นใจภายนอกแต่มีความเหงาซ่อนอยู่',
    personaKey: 'city-pop-night-drifter',
    sectionType: 'Verse',
    lines: [
      'ไฟถนนวิ่งผ่านกระจกรถคันนี้',
      'วิทยุเปิดเพลงเก่าที่เราเคยฟัง',
      'ตึกสูงสะท้อนแสงในค่ำคืนเดียวดาย',
      'เมืองนี้กว้างใหญ่แต่ทำไมใจฉันแคบลง',
    ],
    whyItWorks: {
      naturalnessScore: 9.4,
      imageryType: 'sensory',
      characterConsistency: 'ใช้ภาพเมืองยามค่ำคืน (ไฟถนน, กระจกรถ, ตึกสูง) สื่อความเหงาโดยไม่พูดตรงๆ ตรงกับความเท่นิ่งของแนวเพลง',
      singabilityPacing: 'กรูฟลื่นไหลสม่ำเสมอ วรรคยาวปานกลางเข้ากับจังหวะ Smooth Groove',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-citypop-002',
    genre: 'City Pop',
    personaVoice: 'คนเมืองยามค่ำคืน ดูมั่นใจภายนอกแต่มีความเหงาซ่อนอยู่',
    personaKey: 'city-pop-night-drifter',
    sectionType: 'Chorus',
    lines: [
      'แค่ขับรถไปเรื่อยไม่มีจุดหมาย',
      'ให้ไฟสีในเมืองพาใจลอยไป',
      'คืนนี้ขอเป็นแค่คนแปลกหน้า',
      'ที่ไม่ต้องอธิบายว่าเหงาแค่ไหน',
    ],
    whyItWorks: {
      naturalnessScore: 9.2,
      imageryType: 'emotional',
      characterConsistency: 'รักษาระยะห่างทางอารมณ์ ("ไม่ต้องอธิบายว่าเหงาแค่ไหน") แทนการฟูมฟาย ตรงกับบุคลิกเท่แต่เปราะบางของ City Pop',
      singabilityPacing: 'เมโลดี้ไหลลื่นไม่มีจุดสะดุด เอื้อต่อการร้องแบบผ่อนคลาย',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-citypop-003',
    genre: 'City Pop',
    personaVoice: 'คนเมืองทิ้งภาพจำสุดท้ายของค่ำคืนอันเดียวดาย',
    personaKey: 'city-pop-night-drifter',
    sectionType: 'Outro',
    lines: [
      'รถจอดสนิทที่ดาดฟ้าเดิม',
      'มองไฟเมืองกระพริบจนเช้าตรู่',
      'คืนนี้ก็ผ่านไปอีกคืนเหมือนเดิม',
    ],
    whyItWorks: {
      naturalnessScore: 9.7,
      imageryType: 'sensory',
      characterConsistency: 'Closure แบบไม่ปิดเรื่องสมบูรณ์ ทิ้งภาพจำ (ดาดฟ้า, ไฟเมืองกระพริบ) ให้ผู้ฟังรู้สึกตามเอง ตรงกับ Negative Space ของแนวเพลง',
      singabilityPacing: 'ท่วงทำนองค่อยๆ เฟดลง วรรคสั้นลงเรื่อยๆ',
    },
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 9. Pop (Mainstream — จำง่าย เข้าถึงง่าย สดใส)
  // =========================================================================
  {
    id: 'good-pop-001',
    genre: 'Pop',
    personaVoice: 'นักเรียนสองคนตกหลุมรักกันครั้งแรก ความรู้สึกใสซื่อเรียบง่าย',
    personaKey: 'universal-pop-optimist',
    sectionType: 'Verse',
    lines: [
      'เจอเธอวันแรกที่หน้าประตูโรงเรียน',
      'ยิ้มให้กันแล้วโลกก็เปลี่ยนไปทันที',
      'ไม่รู้ทำไมใจถึงเต้นแรงแบบนี้',
      'แค่มองตาเธอก็ลืมทุกอย่างรอบกาย',
    ],
    whyItWorks: {
      naturalnessScore: 9.3,
      imageryType: 'narrative',
      characterConsistency: 'ภาษาเรียบง่ายตรงไปตรงมา เข้าถึงคนฟังทุกวัยได้ทันทีโดยไม่ต้องตีความ',
      singabilityPacing: 'พยางค์สม่ำเสมอ 9-9-9-9 ร้องตามได้ง่ายตั้งแต่ฟังครั้งแรก',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-pop-002',
    genre: 'Pop',
    personaVoice: 'คนที่พบความสุขและความหวังจากการมีใครสักคนอยู่ข้างๆ',
    personaKey: 'universal-pop-optimist',
    sectionType: 'Chorus',
    lines: [
      'เธอคือแสงแดดในวันที่มืดมน',
      'เธอคือเหตุผลให้ฉันยิ้มได้ทุกวัน',
      'ไม่ว่าจะเกิดอะไรขึ้นข้างหน้า',
      'มีเธออยู่ตรงนี้ก็พอแล้วสำหรับฉัน',
    ],
    whyItWorks: {
      naturalnessScore: 9.4,
      imageryType: 'emotional',
      characterConsistency: 'Hook Line จำง่ายและเป็นสากล ("เธอคือแสงแดด") เหมาะกับผู้ฟังวงกว้างโดยไม่ต้องมีบริบทเฉพาะทาง',
      singabilityPacing: 'จังหวะเปิดกว้าง ร้องตามได้ทันทีตั้งแต่ครั้งแรกที่ได้ยิน',
    },
    sourceType: 'synthetic-expert',
  },
  {
    id: 'good-pop-003',
    genre: 'Pop',
    personaVoice: 'คนที่มั่นใจในความรักและพร้อมเผชิญทุกอย่างไปด้วยกัน',
    personaKey: 'universal-pop-optimist',
    sectionType: 'Outro',
    lines: [
      'จับมือเดินไปด้วยกันตลอดไป',
      'ไม่ว่าฝนจะตกหรือแดดจะแรง',
      'มีเธอข้างกาย ฉันพร้อมสู้ทุกวัน',
    ],
    whyItWorks: {
      naturalnessScore: 9.5,
      imageryType: 'emotional',
      characterConsistency: 'ปิดเรื่องด้วยความหวังและความมั่นใจ ตรงตามอารมณ์สดใสที่ Pop mainstream ต้องการ',
      singabilityPacing: 'วรรคสั้นกระชับ ปิดท้ายด้วยประโยคที่ติดหูง่าย',
    },
    sourceType: 'synthetic-expert',
  },
];