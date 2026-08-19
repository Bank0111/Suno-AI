import { ThaiLyricKnowledgeEntry } from '../types';

/**
 * THAI LYRIC KNOWLEDGE BASE (SYNTHETIC EXPERT GENERATED - PHASE 5.7)
 * Comprehensive units of song-friendly phrases, natural speech collocations,
 * concrete imagery, perspective shifts, and rhythmic stress patterns for Thai songwriting.
 */
export const THAI_LYRIC_KNOWLEDGE_BASE: ThaiLyricKnowledgeEntry[] = [
  // =========================================================================
  // 1. Everyday Actions & Concrete Movement (การกระทำในชีวิตประจำวัน / ท่าทางรูปธรรม)
  // =========================================================================
  {
    id: 'tlk-act-001',
    phrase: 'ขี่มอไซค์ผ่านหน้าบ้าน',
    syllableCount: 6,
    rhythmicStress: '0-0-1-0-1-1',
    naturalRegister: 'spoken',
    semanticDomains: ['ความแอบชอบ', 'วิถีชีวิต', 'บ้านนอก', 'ความสดใส'],
    rhymeEnding: { vowelGroup: 'อาน', toneCategory: 'โท' },
    collocationPairs: ['แกล้งบีบแตร', 'มองหาเธอ', 'ชะลอรถ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-act-002',
    phrase: 'แกล้งเดินวนไปหา',
    syllableCount: 5,
    rhythmicStress: '1-0-1-0-1',
    naturalRegister: 'spoken',
    semanticDomains: ['ความแอบชอบ', 'ขี้เล่น', 'ความเขิน'],
    rhymeEnding: { vowelGroup: 'อา', toneCategory: 'สามัญ' },
    collocationPairs: ['หาเรื่องคุย', 'สบสายตา', 'ไม่กล้าทัก'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-act-003',
    phrase: 'หยิบมือถือขึ้นมาดู',
    syllableCount: 6,
    rhythmicStress: '0-0-1-0-0-1',
    naturalRegister: 'conversational',
    semanticDomains: ['คนเมือง', 'ความเหงา', 'รอข้อความ', 'ความสัมพันธ์'],
    rhymeEnding: { vowelGroup: 'อู', toneCategory: 'สามัญ' },
    collocationPairs: ['ดูแชทเก่า', 'รอเธอตอบ', 'เปิดหน้าจอ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-act-004',
    phrase: 'นั่งรถเมล์กลับห้อง',
    syllableCount: 5,
    rhythmicStress: '1-0-1-0-1',
    naturalRegister: 'conversational',
    semanticDomains: ['ชีวิตคนเมือง', 'ความเหนื่อยล้า', 'ความเหงา'],
    rhymeEnding: { vowelGroup: 'ออง', toneCategory: 'โท' },
    collocationPairs: ['มองออกนอกหน้าต่าง', 'สายตาเหม่อ', 'ฟังเพลงเดิม'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-act-005',
    phrase: 'แอบยิ้มคนเดียวในใจ',
    syllableCount: 6,
    rhythmicStress: '0-1-0-1-0-1',
    naturalRegister: 'conversational',
    semanticDomains: ['ความสุข', 'แอบรัก', 'ความเขิน'],
    rhymeEnding: { vowelGroup: 'ไอ', toneCategory: 'สามัญ' },
    collocationPairs: ['เวลาเธอทักมา', 'ตอนเห็นหน้าเธอ', 'เขินจนเก็บไม่อยู่'],
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 2. Weather, Atmosphere & Senses (บรรยากาศ กลิ่นอาย และผัสสะ)
  // =========================================================================
  {
    id: 'tlk-atm-001',
    phrase: 'กลิ่นดินตอนฝนพรำ',
    syllableCount: 5,
    rhythmicStress: '0-1-0-1-1',
    naturalRegister: 'conversational',
    semanticDomains: ['บรรยากาศ', 'ความทรงจำ', 'ความเหงา', 'ความคิดถึง'],
    rhymeEnding: { vowelGroup: 'อำ', toneCategory: 'สามัญ' },
    collocationPairs: ['ลอยเข้าหน้าต่าง', 'พาใจคิดถึง', 'เย็นชุ่มฉ่ำ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-atm-002',
    phrase: 'แสงไฟนีออนสลัว',
    syllableCount: 5,
    rhythmicStress: '0-1-0-1-0',
    naturalRegister: 'conversational',
    semanticDomains: ['กลางคืน', 'คนเมือง', 'เหงา', 'บาร์'],
    rhymeEnding: { vowelGroup: 'อัว', toneCategory: 'เอก' },
    collocationPairs: ['ร้านเดิมที่คุ้นเคย', 'แก้วเครื่องดื่ม', 'ค่ำคืนยาวนาน'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-atm-003',
    phrase: 'ลมหนาวพัดชายทุ่ง',
    syllableCount: 5,
    rhythmicStress: '0-1-1-0-1',
    naturalRegister: 'conversational',
    semanticDomains: ['ชนบท', 'ความคิดถึง', 'บรรยากาศธรรมชาติ'],
    rhymeEnding: { vowelGroup: 'อุง', toneCategory: 'โท' },
    collocationPairs: ['พาใจหวั่นไหว', 'คิดถึงคนไกล', 'ผิงไฟคลายหนาว'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-atm-004',
    phrase: 'ฟ้าร้องเตือนก่อนฝนเท',
    syllableCount: 6,
    rhythmicStress: '0-1-1-0-0-1',
    naturalRegister: 'spoken',
    semanticDomains: ['ธรรมชาติ', 'ความรีบเร่ง', 'ความทรงจำ'],
    rhymeEnding: { vowelGroup: 'เอ', toneCategory: 'สามัญ' },
    collocationPairs: ['เปียกปอนทั้งตัว', 'หลบใต้ชายคา', 'กางร่มคันเก่า'],
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 3. Heart & Subtle Emotions (อารมณ์ความรู้สึกตรงไปตรงมา)
  // =========================================================================
  {
    id: 'tlk-emo-001',
    phrase: 'ใจมันเต้นไม่เป็นจังหวะ',
    syllableCount: 7,
    rhythmicStress: '0-0-1-0-0-1-0',
    naturalRegister: 'spoken',
    semanticDomains: ['ความเขิน', 'ความรัก', 'ตกหลุมรัก'],
    rhymeEnding: { vowelGroup: 'อะ', toneCategory: 'เอก' },
    collocationPairs: ['ตอนเธอสบตา', 'เดินเข้ามาใกล้', 'ไม่กล้ามองตรงๆ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-emo-002',
    phrase: 'อยากคุยแต่ไม่กล้าทัก',
    syllableCount: 6,
    rhythmicStress: '0-1-0-0-1-1',
    naturalRegister: 'spoken',
    semanticDomains: ['แอบรัก', 'ความไม่มั่นใจ', 'ขี้อาย'],
    rhymeEnding: { vowelGroup: 'อัก', toneCategory: 'ตรี' },
    collocationPairs: ['กลัวเธอรำคาญ', 'พิมพ์แล้วลบ', 'ได้แค่มอง'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-emo-003',
    phrase: 'แววตาที่ดูเปลี่ยนไป',
    syllableCount: 6,
    rhythmicStress: '0-1-0-0-1-1',
    naturalRegister: 'conversational',
    semanticDomains: ['ความเฉยชา', 'หมดรัก', 'ความเศร้า'],
    rhymeEnding: { vowelGroup: 'ไอ', toneCategory: 'สามัญ' },
    collocationPairs: ['ไม่มีฉันในนั้น', 'เย็นชาขึ้นทุกวัน', 'ไม่เหมือนวันเก่า'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-emo-004',
    phrase: 'กอดตัวเองตอนดึกดื่น',
    syllableCount: 6,
    rhythmicStress: '0-1-0-0-1-1',
    naturalRegister: 'conversational',
    semanticDomains: ['อกหัก', 'ความอ้างว้าง', 'กลางคืน'],
    rhymeEnding: { vowelGroup: 'อืน', toneCategory: 'เอก' },
    collocationPairs: ['ห้องนอนที่ว่างเปล่า', 'คิดถึงเธอเหลือเกิน', 'น้ำตาซึมหมอน'],
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 4. Playful & Conversational Dialogue (ภาษาพูดและบทสนทนาขี้เล่น)
  // =========================================================================
  {
    id: 'tlk-ply-001',
    phrase: 'ถ้าไม่ติดว่าขี้อาย',
    syllableCount: 6,
    rhythmicStress: '0-0-1-0-1-1',
    naturalRegister: 'spoken',
    semanticDomains: ['ขี้เล่น', 'แซว', 'ความจริงใจ'],
    rhymeEnding: { vowelGroup: 'อาย', toneCategory: 'สามัญ' },
    collocationPairs: ['จะบอกรักไปแล้ว', 'คงขอเป็นแฟน', 'ไม่ปล่อยให้หลุดมือ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-ply-002',
    phrase: 'น่ารักจนต้องยอมแพ้',
    syllableCount: 6,
    rhythmicStress: '0-1-0-0-1-1',
    naturalRegister: 'spoken',
    semanticDomains: ['คลั่งรัก', 'ชมแฟน', 'ขี้เล่น'],
    rhymeEnding: { vowelGroup: 'แอ', toneCategory: 'ตรี' },
    collocationPairs: ['ใจอ่อนระทวย', 'ไม่รู้จะพูดยังไง', 'ยิ้มทีโลกละลาย'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-ply-003',
    phrase: 'แกล้งถามว่ามีแฟนยัง',
    syllableCount: 6,
    rhythmicStress: '1-1-0-0-1-1',
    naturalRegister: 'spoken',
    semanticDomains: ['จีบ', 'หยอกล้อ', 'ลองเชิง'],
    rhymeEnding: { vowelGroup: 'อัง', toneCategory: 'สามัญ' },
    collocationPairs: ['ถ้ายังว่างขอจอง', 'รอคำตอบอยู่นะ', 'ทำเป็นเนียนถาม'],
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 5. Urban & Hip-Hop Cadence Units (จังหวะและคำพูดสไตล์เมือง / ฮิปฮอป)
  // =========================================================================
  {
    id: 'tlk-urb-001',
    phrase: 'ลุยงานจนดึกทุกคืน',
    syllableCount: 6,
    rhythmicStress: '0-1-0-1-0-1',
    naturalRegister: 'spoken',
    semanticDomains: ['สู้ชีวิต', 'ทำงานหนัก', 'คนเมือง'],
    rhymeEnding: { vowelGroup: 'อืน', toneCategory: 'สามัญ' },
    collocationPairs: ['ไม่เคยยอมแพ้', 'หาเงินสร้างอนาคต', 'ความฝันยังอยู่'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-urb-002',
    phrase: 'บนทางที่ไม่มีทางลัด',
    syllableCount: 7,
    rhythmicStress: '0-1-0-0-0-1-1',
    naturalRegister: 'conversational',
    semanticDomains: ['พิสูจน์ตัวเอง', 'แรงบันดาลใจ', 'ฮิปฮอป'],
    rhymeEnding: { vowelGroup: 'อัด', toneCategory: 'ตรี' },
    collocationPairs: ['ต้องก้าวไปข้างหน้า', 'กัดฟันสู้ต่อ', 'ไม่มีอะไรได้มาง่ายๆ'],
    sourceType: 'synthetic-expert',
  },

  // =========================================================================
  // 6. Bridge Perspective Shifts & Outro Lingering Images (Phase 5.7)
  // =========================================================================
  {
    id: 'tlk-brg-001',
    phrase: 'เพิ่งรู้ว่าที่ผ่านมา',
    syllableCount: 6,
    rhythmicStress: '0-1-0-0-1-0',
    naturalRegister: 'conversational',
    semanticDomains: ['จุดเปลี่ยนมุมมอง', 'บริดจ์', 'ความเข้าใจ'],
    rhymeEnding: { vowelGroup: 'อา', toneCategory: 'เอก' },
    collocationPairs: ['ไม่ได้แค่แซวเล่น', 'ใจมันรักจริง', 'ไม่ใช่แค่เรื่องตลก'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-brg-002',
    phrase: 'ไม่ได้ต้องการเริ่มใหม่',
    syllableCount: 7,
    rhythmicStress: '0-0-0-1-1-1-0',
    naturalRegister: 'conversational',
    semanticDomains: ['การตระหนักรู้', 'ยอมรับความจริง', 'ความเปราะบาง'],
    rhymeEnding: { vowelGroup: 'ไอ', toneCategory: 'เอก' },
    collocationPairs: ['แค่อยากบอกความจริง', 'เข้าใจทุกเหตุผล', 'ขอบคุณช่วงเวลาดีๆ'],
    sourceType: 'synthetic-expert',
  },
  {
    id: 'tlk-out-001',
    phrase: 'ปล่อยให้ความเงียบจางไป',
    syllableCount: 7,
    rhythmicStress: '0-0-0-1-0-1-0',
    naturalRegister: 'conversational',
    semanticDomains: ['ท่อนจบ', 'ภาพจำตกผลึก', 'ความคิดถึง'],
    rhymeEnding: { vowelGroup: 'ไอ', toneCategory: 'สามัญ' },
    collocationPairs: ['ปิดไฟดวงสุดท้าย', 'เสียงเพลงค่อยๆ เบาลง', 'รอยยิ้มยังคงอยู่'],
    sourceType: 'synthetic-expert',
  },
];