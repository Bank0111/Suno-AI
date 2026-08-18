// server/lexicon/thaiLexicon.ts

export interface LexiconCategory {
  category: string;
  keywords: string[]; // คำค้นหาเพื่อจับคู่กับ Story Prompt
  vocabulary: {
    concreteObjects: string[]; // วัตถุ/ฉากที่เป็นรูปธรรม
    emotionalPhrases: string[]; // สำนวน/คำตัดพ้อกระแทกใจ
    parallelPatterns: string[]; // โครงสร้างประโยคคู่ขนาน
    dialectWords?: string[]; // คำเฉพาะถิ่น (อีสาน/ใต้)
  };
}

// คลังคำศัพท์และสำนวนมาตรฐาน (สามารถขยายเพิ่มได้ไม่จำกัด)
export const THAI_SONG_LEXICON: LexiconCategory[] = [
  {
    category: "ช่าง/แรงงาน/อู่ซ่อม/โรงงาน",
    keywords: ["ช่าง", "อู่", "โรงงาน", "ซ่อม", "ประแจ", "เหงื่อ", "กรรมกร", "น้ำมัน"],
    vocabulary: {
      concreteObjects: [
        "ประแจ", "คราบน้ำมัน", "น็อตตัวเก่า", "ถุงมือผ้า", "รองเท้าเซฟตี้", 
        "เสียงเครื่องยนต์", "ห้องแถวสังกะสี", "ตั๋วรถเมล์", "กระป๋องเหรียญ"
      ],
      emotionalPhrases: [
        "แลกศักดิ์ศรีคนจน", "เหงื่อหยดแลกเงินร้อย", "มือเปื้อนคราบน้ำมัน", 
        "สู้เงินสดเขาไม่ไหว", "คนไร้ราคา", "ก้มหน้าขันน็อตซ่อมใจ"
      ],
      parallelPatterns: [
        "มือพี่เปื้อนคราบน้ำมัน... มือเขามีแหวนเพชรให้เธอ",
        "เหงื่อทั้งปีแลกได้แค่ค่าห้อง... เงินเขากองซื้อใจเธอไป"
      ]
    }
  },
  {
    category: "ลูกทุ่งชนบท/ท้องทุ่ง/พลัดถิ่น",
    keywords: ["บ้านนอก", "ทุ่งนา", "คันแทนา", "กระท่อม", "ชนบท", "กลิ่นดิน", "ฟาง"],
    vocabulary: {
      concreteObjects: [
        "ชานเรือนไม้", "รอยชายคา", "กลิ่นดินเปียก", "หลังคาสังกะสี", 
        "เสียงขลุ่ยผิว", "หยาดน้ำค้างบนยอดหญ้า", "กระติบข้าวเหนียว"
      ],
      emotionalPhrases: [
        "แผลเก่าบ่ทันหาย", "ฝากแผลใหม่ลงที่เก่า", "เอามีดมาฟันซ้ำรอยเดิม",
        "สมเพดใจเจ้าของ", "หลบมาดามใจ", "น้ำตาไหลรินบนตัก"
      ],
      parallelPatterns: [
        "ฝนเพิ่งจะขาดสาย... หนาวก็กรายย่างมา",
        "เขาเพิ่งจะบอกลา... เธอก็มาทิ้งกัน"
      ],
      dialectWords: ["บ่ทันหาย", "เจ้าของ", "ส่ำนี้", "ฮักหลาย", "ขี้ตั๋ว", "ส่างเมา"]
    }
  },
  {
    category: "ความรักในเมืองหลวง/คนสู้ชีวิต/ห้องเช่า",
    keywords: ["เมืองกรุง", "ห้องเช่า", "รถติด", "ตึกสูง", "ไฟแสงสี", "รถหรู", "คนจน"],
    vocabulary: {
      concreteObjects: [
        "ห้องเช่ารูหนู", "พัดลมส่ายเสียงดัง", "ไฟหน้าส่องทาง", "รถคันหรู", 
        "ป้ายรถเมล์สายเก่า", "เงาตึกสูงระฟ้า", "หน้าจอที่เงียบงัน"
      ],
      emotionalPhrases: [
        "ยืนมองไฟท้ายลับตา", "ยืนคนละฝั่งฝัน", "เมืองกว้างแต่ใจแคบ",
        "คนมีค่าแค่ลมปาก", "แพ้ความสบายของเขา"
      ],
      parallelPatterns: [
        "ห้องเช่าเรามันแคบเกินไป... รถหรูคันใหญ่เขาเลยพาเธอไปได้ไกลกว่า",
        "เรามีแค่ใจที่ภักดี... เขามีทุกอย่างที่ชีวิตเธอต้องการ"
      ]
    }
  }
];

// ฟังก์ชันดึงคำศัพท์ตาม Story Prompt อัตโนมัติ
export function matchLexiconByStory(storyPrompt: string): string {
  const matchedCategories = THAI_SONG_LEXICON.filter(cat => 
    cat.keywords.some(kw => storyPrompt.includes(kw))
  );

  const selected = matchedCategories.length > 0 ? matchedCategories : [THAI_SONG_LEXICON[0]];

  let promptInjection = `\n--- 📚 CURATED LEXICON PALETTE (คลังคำศัพท์และสำนวนแนะนำเฉพาะเรื่องนี้) ---\n`;
  selected.forEach(cat => {
    promptInjection += `[หมวด: ${cat.category}]\n`;
    promptInjection += `- ภาพจำ/วัตถุรูปธรรม: ${cat.vocabulary.concreteObjects.join(", ")}\n`;
    promptInjection += `- วลีและสำนวนกินใจ: ${cat.vocabulary.emotionalPhrases.join(", ")}\n`;
    promptInjection += `- ตัวอย่างคู่ขนาน: ${cat.vocabulary.parallelPatterns.join(" | ")}\n`;
    if (cat.vocabulary.dialectWords) {
      promptInjection += `- ภาษาถิ่น: ${cat.vocabulary.dialectWords.join(", ")}\n`;
    }
  });

  return promptInjection;
}