import { PhrasingDirectiveInput } from './types';

export function buildLyricPhrasingDirective(input: PhrasingDirectiveInput): string {
  const parts: string[] = [];

  // Core Principles
  parts.push(`=== LYRIC PHRASING & SINGABILITY DIRECTIVE (การวรรคเนื้อร้องและจังหวะการร้องจริง) ===
หลักการจัดวรรค (Phrasing Principles):
1. กฎ 1 บรรทัด = 1 Natural Singable Phrase: ต้องเป็นวรรคที่ร้องได้จบใน 1 ลมหายใจ
2. [สำคัญมาก] สัดส่วนพยางค์ (Syllable Limit): บังคับความยาว 6 ถึง 10 พยางค์ต่อหนึ่งบรรทัด (ห้ามยาวเกิน 10 พยางค์เด็ดขาด) เพื่อไม่ให้ล้นห้องดนตรี
3. สมดุลของวรรคคู่: บรรทัดที่อยู่ติดกันควรมีจำนวนพยางค์เท่ากันหรือใกล้เคียงกัน (เช่น 7-7, 8-8) ห้ามสั้นยาวสลับกันผิดธรรมชาติ
4. โครงสร้างสัมผัส (Rhyme Scheme): คำสุดท้ายของวรรคก่อนหน้า ควรส่งสัมผัสสระไปยังคำที่ 1-3 ของวรรคถัดไปเสมอ
5. ความพร้อมสำหรับ Suno: ห้ามใส่ตัวเลขนับพยางค์ คำอธิบาย หรือวงเล็บใดๆ ในเนื้อเพลง`);

  // 1. Tempo & BPM Phrasing Rules
  const tempoLower = (input.tempo || '').toLowerCase();
  const rawBpm = typeof input.bpm === 'number' ? input.bpm : parseInt(String(input.bpm || '0'), 10);
  const isFastTempo = tempoLower.includes('เร็ว') || tempoLower.includes('fast') || rawBpm >= 120;
  const isSlowTempo = tempoLower.includes('ช้า') || tempoLower.includes('slow') || (rawBpm > 0 && rawBpm <= 75);

  parts.push(`\n[TEMPO & BREATH SPACING: ${input.tempo}${input.bpm ? ` (${input.bpm} BPM)` : ''}]`);
  if (isSlowTempo) {
    parts.push(`- จังหวะช้า (Slow Tempo): อนุญาตให้ประโยคยาวขึ้นได้ตามเมโลดี้ แต่ต้องเว้นช่องว่าง (Space) สำหรับการหายใจและทอดเสียง (Breathing room & sustained notes) ให้ความรู้สึกนิ่งและลึกซึ้ง`);
  } else if (isFastTempo) {
    parts.push(`- จังหวะเร็ว (Fast Tempo): ใช้ประโยคสั้นกระชับ จังหวะคำกระชับแน่น (Tighter Cadence & Higher Syllable Density) หลีกเลี่ยงประโยคพรรณนายืดยาว เพื่อให้นักร้องออกเสียงทันจังหวะบีท`);
  } else {
    parts.push(`- จังหวะปานกลาง (Mid Tempo): ใช้ความยาววรรคระดับกลาง จังหวะการพูดและการร้องดำเนินไปอย่างเป็นธรรมชาติ (Natural Cadence) มีจังหวะพักหายใจระหว่างวรรคอย่างพอดี`);
  }

  // 2. Genre & Songwriting Style Phrasing Rules
  const joinedGenres = [...(input.genres || []), input.songwritingStyle || ''].join(' ').toLowerCase();
  const isPop = joinedGenres.includes('pop') || joinedGenres.includes('ป๊อป');
  const isRnBSoul = joinedGenres.includes('r&b') || joinedGenres.includes('rnb') || joinedGenres.includes('soul') || joinedGenres.includes('อาร์แอนด์บี') || joinedGenres.includes('โซล');
  const isHipHopRap = joinedGenres.includes('hip-hop') || joinedGenres.includes('hiphop') || joinedGenres.includes('rap') || joinedGenres.includes('แร็ป') || joinedGenres.includes('ฮิปฮอป') || joinedGenres.includes('trap');
  const isRock = joinedGenres.includes('rock') || joinedGenres.includes('alternative') || joinedGenres.includes('ร็อก') || joinedGenres.includes('ร็อค') || joinedGenres.includes('metal');
  const isIndie = joinedGenres.includes('indie') || joinedGenres.includes('folk') || joinedGenres.includes('อินดี้') || joinedGenres.includes('โฟล์ค');
  const isLukThungPueaChiwit = joinedGenres.includes('ลูกทุ่ง') || joinedGenres.includes('เพื่อชีวิต') || joinedGenres.includes('country') || joinedGenres.includes('คันทรี');

  parts.push(`\n[GENRE-SPECIFIC PHRASING: ${input.genres.join(', ')}]`);
  if (isHipHopRap) {
    parts.push(`- Hip-Hop / Rap: Cadence ชัดเจน, Syllable Density สูง, การตัดบรรทัดต้องตรงตาม Flow และ Bar จังหวะเคาะ, เน้น Internal Rhyme และ Accent คำท้ายวรรค`);
  } else if (isRnBSoul) {
    parts.push(`- R&B / Soul: วรรคแบบ Conversational ผสม Melodic Phrasing, เว้น Space ให้เอื้อนเสียง, เปิดสระท้ายคำเพื่อลากเสียง (Sustained Notes), สัมผัสในเชื่อมต่อลื่นไหล`);
  } else if (isLukThungPueaChiwit) {
    parts.push(`- ลูกทุ่ง / เพื่อชีวิต: Phrasing เล่าเรื่องตรงไปตรงมาเหมือนพูดคุย (Conversational Storytelling), ร้องเข้าปากง่าย สัมผัสธรรมชาติ ไม่บิดสำเนียงภาษาพูดเพื่อเอาสัมผัส`);
  } else if (isIndie) {
    parts.push(`- Indie / Folk: ภาษาสนทนาเป็นธรรมชาติ (Natural Speech), ยอมรับ Asymmetric Phrasing (ความยาววรรคไม่เท่ากัน) ได้ตามการเล่าเรื่อง แต่อย่าปล่อยให้กลายเป็นร้อยแก้ว (Prose)`);
  } else if (isRock) {
    parts.push(`- Rock / Alternative: Phrase แข็งแรง คมชัดตรง Downbeat, วรรคมีพลังกระแทกกระทั้น (Impact), Chorus ต้องปลดปล่อยพลังอย่างเต็มที่`);
  } else if (isPop) {
    parts.push(`- Pop: Phrasing สมมาตรจำง่าย ร้องตามได้ทันที, Chorus วรรคเปิดกว้างและเน้น Hook Line ชัดเจน, จังหวะเคาะสัมผัสลงตัว`);
  } else {
    parts.push(`- สไตล์ตาม Creative Direction: ผสมผสานวรรคคำร้องที่ร้องง่าย สัมผัสลื่นไหล และมีจังหวะหายใจที่สอดคล้องกับเครื่องดนตรีและอารมณ์เพลง`);
  }

  // 3. Vocal Delivery Phrasing Rules
  const vocalLower = (input.vocal || '').toLowerCase();
  parts.push(`\n[VOCAL DELIVERY PHRASING: ${input.vocal}]`);
  if (vocalLower.includes('นุ่มนวล') || vocalLower.includes('กระซิบ') || vocalLower.includes('เบา') || vocalLower.includes('intimate')) {
    parts.push(`- Intimate / Soft Vocal: วรรคสั้นถึงกลาง เล่าเรื่องใกล้ชิด มีพื้นที่เว้นวรรคหายใจ (Breathing space) ให้ผู้ฟังรู้สึกถึงความเงียบและความเปราะบาง`);
  } else if (vocalLower.includes('ทรงพลัง') || vocalLower.includes('หนักแน่น') || vocalLower.includes('powerful') || vocalLower.includes('belting')) {
    parts.push(`- Powerful / Belt Vocal: วรรคค่อย ๆ ไต่ระดับ (Build-up) ไปหาคำสำคัญในวรรคท้าย เปิดพื้นที่ให้ลากเสียงคีย์สูงในท่อน Climax`);
  } else if (vocalLower.includes('เร็ว') || vocalLower.includes('rap') || vocalLower.includes('fast')) {
    parts.push(`- Fast / Rap Vocal: วรรคเกาะกลุ่มกันแน่น (Tighter Grouping) มีน้ำหนักการกระแทกคำสม่ำเสมอ`);
  } else {
    parts.push(`- Standard Vocal: วรรคคำร้องสมดุล เข้ากับลมหายใจปกติของนักร้อง`);
  }

  // 4. Section-Aware Phrasing Rules
  parts.push(`\n[SECTION-AWARE PHRASING RULES]
- Verse: วรรคแบบเล่าเรื่อง (Storytelling) เป็นธรรมชาติ ปูบริบทของเหตุการณ์
- Pre-Chorus: วรรคเพิ่ม Momentum และ Tension ให้คำร้องค่อยๆ กระชับหรือส่งต่อไปหา Chorus
- Chorus: วรรคต้องเน้น Hook Line ชัดเจน เว้นวรรคให้ประโยคจำง่าย โดดเด่น ร้องตามได้ทันที
- Bridge: วรรคเปลี่ยนรูปแบบ (Shift Phrasing / Contrast) เพื่อสร้างจุดเปลี่ยนทางอารมณ์และนำสู่ Climax
- Outro: วรรคสั้นลง ปล่อย Space ให้ดนตรีค่อยๆ Fade Out หรือทิ้งท้ายด้วยความเงียบ`);

  return parts.join('\n');
}
