import { AvoidanceRuleEntry } from '../types';

/**
 * AVOIDANCE KNOWLEDGE DATASET (MULTI-TIERED AVOIDANCE RULES)
 * Categorized constraints for fine-grained vocabulary control, preventing generic clichés,
 * awkward robotic phrases, academic jargon, and context clashes without excessive global blacklisting.
 */
export const AVOIDANCE_RULES: AvoidanceRuleEntry[] = [
  // =========================================================================
  // 1. HARD_BLOCK: Offensive, illegal, or strictly forbidden terms
  // =========================================================================
  {
    id: 'avoid-hard-001',
    termOrPhrase: 'คำหยาบคายรุนแรง / เหยียดเชื้อชาติ / ละเมิดสิทธิ',
    tier: 'HARD_BLOCK',
    contextConditions: {},
    reason: 'ขัดต่อมาตรฐานความปลอดภัยและนโยบายเนื้อหา',
    suggestedAlternatives: ['ใช้คำเปรียบเทียบเชิงอารมณ์', 'ใช้คำพูดตรงไปตรงมาแต่ไม่หยาบคาย'],
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 2. CONTEXTUAL_AVOID: Robotic, Academic Jargon & Genre Mismatches
  // =========================================================================
  {
    id: 'avoid-ctx-001',
    termOrPhrase: 'คูณสอง / บวกหนึ่ง / เปอร์เซ็นต์ / ตัวคูณ / 100%',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {
      genres: ['Country / Folk', 'Lukthung', 'R&B / Soul', 'Indie / Pop', 'Hip-Hop / Rap'],
    },
    reason: 'ศัพท์คณิตศาสตร์ทำให้เพลงรักหรือเพลงโฟล์กฟังดูเหมือนโปรโมชั่นสินค้าหรือระบบคอมพิวเตอร์ ขาดความเป็นมนุษย์',
    suggestedAlternatives: ['ยิ่งกว่าเดิม', 'ทวีคูณ (ในบริบทที่เหมาะสม)', 'มากมาย', 'เต็มหัวใจ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-ctx-002',
    termOrPhrase: 'วิ่งแส่ / แส่หา',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {
      genres: ['Country / Folk', 'Pop', 'R&B / Soul'],
    },
    reason: 'สำนวนกระด้างและฟังดูแปลกห้วนในการร้องเพลงรัก',
    suggestedAlternatives: ['เที่ยวไปมองใคร', 'เหลียวมองใคร', 'สนใจใคร'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-ctx-003',
    termOrPhrase: 'ใจมันพองโตขึ้นมา',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {
      genres: ['Country / Folk', 'Hip-Hop / Rap'],
    },
    reason: 'สำนวนหนังสือวรรณกรรมเยาวชน ไม่เข้ากับภาษาพูดของหนุ่มบ้าน ๆ หรือแร็ปเปอร์',
    suggestedAlternatives: ['ใจเต้นตึกตัก', 'ใจเต้นแรง', 'ยิ้มจนแก้มปริ', 'เขินจนเก็บไม่อยู่'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-ctx-004',
    termOrPhrase: 'ข้าพเจ้า / ประจักษ์ / สุริยัน / นภา / สรวงสวรรค์ / กานดา',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {
      genres: ['Hip-Hop / Rap', 'R&B / Soul', 'Indie / Pop', 'Rock'],
    },
    reason: 'ศัพท์วรรณศิลป์ชั้นสูงหรือคำราชาศัพท์ขัดแย้งกับสไตล์ดนตรีร่วมสมัยและภาษาพูดริมถนน',
    suggestedAlternatives: ['ฉัน / ผม / ตัวกู', 'มองเห็น / พิสูจน์', 'ท้องฟ้า / แสงแดด', 'โลกความจริง', 'คนดี / เธอ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-ctx-005',
    termOrPhrase: 'บริบท / มิติใหม่ / กำแพงชนชั้น / ขับเคลื่อน / โครงสร้างทางสังคม / ปัจจัย',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {},
    reason: 'ศัพท์เชิงวิชาการ รายงานข่าว หรือภาษาบทความวิจัย ไม่ใช่ภาษาที่มนุษย์ใช้ร้องเพลงเพื่อถ่ายทอดความรู้สึก',
    suggestedAlternatives: ['เรื่องราวรอบตัว', 'ความต่างของสองเรา', 'แรงผลักดันในใจ', 'โลกความเป็นจริง'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-ctx-006',
    termOrPhrase: 'ประแจ / น็อต / ไขควง / คราบน้ำมัน / ชุดเซฟตี้ / หัวเทียน / สายพาน (ในท่อน Chorus / Hook / Bridge)',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {
      sections: ['Chorus', 'Hook', 'Bridge'],
    },
    reason: 'ท่อนฮุกและบริดจ์ต้องเป็นพื้นที่ของแก่นอารมณ์และสัจธรรมชีวิต การยัดเยียดชื่ออุปกรณ์ช่างทำให้เพลงเสียความลึกซึ้ง (Mechanical Dump)',
    suggestedAlternatives: ['สองมือที่เปื้อน', 'หยาดเหงื่อ', 'ทางเดินชีวิต', 'ความจน', 'หัวใจที่สู้ไม่ถอย'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-ctx-007',
    termOrPhrase: 'จากนั้นก็... / แล้วจึง... / ขั้นตอนต่อไป / ในลำดับแรก (Narrative Prose Reporting)',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {},
    reason: 'ภาษาแจกแจงลำดับเหตุการณ์การเดินทางแบบร้อยแก้วหรือบันทึกประจำวัน ขาดความเป็นบทกวีและจังหวะดนตรี',
    suggestedAlternatives: ['ตัดภาพไปที่การกระทำสำคัญทันที', 'ใช้ภาพสัมผัสบอกบรรยากาศแทนการแจงขั้นตอน'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-ctx-008',
    termOrPhrase: 'ทำให้ฉันรู้สึกเศร้า / บอกตรงๆ ว่าเหงาใจ / อธิบายความเจ็บ (Emotional Over-Explanation)',
    tier: 'CONTEXTUAL_AVOID',
    contextConditions: {},
    reason: 'เขียนบรรยายบอกความรู้สึกตรงๆ ซ้ำซ้อนหลังสร้างภาพฉากไปแล้ว ไม่เปิดพื้นที่ว่าง (Negative Space) ให้ผู้ฟังรู้สึกเอง',
    suggestedAlternatives: ['ปล่อยให้ภาพและเหตุการณ์ทำหน้าที่สื่ออารมณ์ (Show Don\'t Tell)'],
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 3. LOW_PREFERENCE: Overused Clichés that weaken lyric quality
  // =========================================================================
  {
    id: 'avoid-low-001',
    termOrPhrase: 'รักเธอสุดหัวใจ / คิดถึงเธอสุดหัวใจ',
    tier: 'LOW_PREFERENCE',
    contextConditions: {},
    reason: 'วลีสำเร็จรูปซ้ำซาก ขาดความสดใหม่และเอกลักษณ์เฉพาะตัวของเพลง',
    suggestedAlternatives: ['มีแค่เธอคนเดียว', 'หมดทั้งใจที่มี', 'บอกอาการจริงทางกายหรือพฤติกรรม'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-low-002',
    termOrPhrase: 'น้ำตาริน / น้ำตาไหลรินอาบสองแก้ม',
    tier: 'LOW_PREFERENCE',
    contextConditions: {},
    reason: 'คำบรรยายความเศร้าแบบซ้ำซากที่พบเกร่อในเพลง AI',
    suggestedAlternatives: ['กลั้นน้ำตาไว้ไม่อยู่', 'ตาพร่ามัว', 'กอดตัวเองเงียบๆ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-low-003',
    termOrPhrase: 'ฟ้าหลังฝน',
    tier: 'LOW_PREFERENCE',
    contextConditions: {},
    reason: 'สำนวนเปรียบเทียบความหวังที่ซ้ำซาก ควรใช้อุปมาเหตุการณ์ในชีวิตจริงแทน',
    suggestedAlternatives: ['แดดยามเช้าส่องเข้ามา', 'ถนนแห้งสนิทหลังพายุพัดผ่าน', 'ก้าวข้ามคืนที่มืดมิด'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-low-004',
    termOrPhrase: 'รักนิรันดร์ / ชั่วฟ้าดินสลาย',
    tier: 'LOW_PREFERENCE',
    contextConditions: {},
    reason: 'คำสัญญาลอยๆ ที่เป็นนามธรรมเกินไป ขาดความสมจริง',
    suggestedAlternatives: ['อยู่ข้างกันไปทุกวัน', 'จนผมขาวไปด้วยกัน', 'ในวันที่แก่เฒ่า'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'avoid-low-005',
    termOrPhrase: 'ใจดวงน้อย / โลกมืดมน / รอวันเธอกลับมา',
    tier: 'LOW_PREFERENCE',
    contextConditions: {},
    reason: 'ประโยคสำเร็จรูปที่สามารถสลับไปใส่เพลงไหนก็ได้ ขาดความเฉพาะเจาะจงของเรื่องเล่า',
    suggestedAlternatives: ['ระบุสิ่งของ สถานที่ หรือเหตุการณ์ที่ตัวละครในเพลงกำลังเผชิญจริง'],
    sourceType: 'synthetic-expert',
  },
];