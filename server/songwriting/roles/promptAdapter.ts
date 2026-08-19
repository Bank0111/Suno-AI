import { SongwriterRole } from './schema';

export function buildRolePrompt(
  role: SongwriterRole,
  context?: {
    targetContentLanguage?: string;
    sectionType?: string;
    story?: string;
  }
): string {
  const lines: string[] = [];

  lines.push(`=== SONGWRITER ROLE & CRAFT MINDSET: ${role.name} ===`);
  lines.push(`[ROLE IDENTITY & EXPERTISE]`);
  lines.push(`- Role: ${role.identity.profession}`);
  if (role.identity.expertise?.length) lines.push(`- Expertise: ${role.identity.expertise.join('; ')}`);

  lines.push(`\n[PERSONA & CHARACTER VOICE]`);
  lines.push(`- Voice: ${role.persona.voice}`);
  lines.push(`- Attitude: ${role.persona.attitude}`);
  if (role.persona.storytellingStyle?.length) lines.push(`- Storytelling Principles: ${role.persona.storytellingStyle.join('; ')}`);

  lines.push(`\n[SONGCRAFT & HOOK DISCIPLINE]`);
  if (role.songcraft.hookStyle?.length) lines.push(`- Hook Discipline: ${role.songcraft.hookStyle.join('; ')}`);
  if (role.songcraft.rhymeApproach?.length) lines.push(`- Rhyme & Meter Approach: ${role.songcraft.rhymeApproach.join('; ')}`);
  if (role.songcraft.phrasing?.length) lines.push(`- Phrasing & Cadence: ${role.songcraft.phrasing.join('; ')}`);

  // เพิ่มกฎควบคุมการเว้นจังหวะลมหายใจตรงนี้
  lines.push(`\n[BREATH-POCKET & PHRASING SPACING]`);
  lines.push(`- Use ellipsis (...) or micro-pauses at natural phrasing intervals to guide vocal breath control and prevent rushed delivery.`);
  lines.push(`- Keep lines concise (6-10 syllables) so singers or AI generation tools have natural breathing space between lines.`);

  lines.push(`\n[IMAGERY & VOCABULARY DISCIPLINE]`);
  if (role.imagery.preferred?.length) lines.push(`- Preferred Imagery: ${role.imagery.preferred.join('; ')}`);
  if (role.vocabulary.preferred?.length) lines.push(`- Preferred Vocabulary: ${role.vocabulary.preferred.join('; ')}`);
  if (role.vocabulary.avoid?.length) lines.push(`- Pitfalls to Avoid: ${role.vocabulary.avoid.join('; ')}`);

  lines.push(`\n[AUTHENTICITY & PHASE 5.7 QUALITY GATES]`);
  lines.push(`- STORY FIDELITY OVER STEREOTYPES: User Story and facts ALWAYS override generic tropes.`);
  lines.push(`- [NO ACADEMIC JARGON]: ห้ามใช้ศัพท์รายงานวิชาการหรือวิจัย (บริบท, มิติ, กำแพงชนชั้น, ปัจจัย)`);
  lines.push(`- [NO PROSE REPORTING]: ห้ามแจกแจงลำดับแบบร้อยแก้ว (จากนั้นก็... แล้วจึง...)`);
  lines.push(`- [NO VOCATIONAL DUMP IN HOOK]: ห้ามยัดเยียดรายชื่อเครื่องมือช่างใน Chorus หรือ Bridge`);

  return lines.join('\n');
}