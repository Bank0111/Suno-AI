import { SongwriterRole } from './schema';

/**
 * Builds a clean, structured, non-bloated prompt block for Gemini instruction.
 * Follows strict prompt priority:
 * Role establishes MINDSET & CRAFT PRINCIPLES, never fabricating story facts.
 */
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
  if (role.identity.expertise && role.identity.expertise.length > 0) {
    lines.push(`- Expertise: ${role.identity.expertise.join('; ')}`);
  }

  lines.push(`\n[PERSONA & CHARACTER VOICE]`);
  lines.push(`- Voice: ${role.persona.voice}`);
  lines.push(`- Attitude: ${role.persona.attitude}`);
  if (role.persona.storytellingStyle && role.persona.storytellingStyle.length > 0) {
    lines.push(`- Storytelling Principles: ${role.persona.storytellingStyle.join('; ')}`);
  }

  lines.push(`\n[SONGCRAFT & HOOK DISCIPLINE]`);
  if (role.songcraft.hookStyle && role.songcraft.hookStyle.length > 0) {
    lines.push(`- Hook Discipline: ${role.songcraft.hookStyle.join('; ')}`);
  }
  if (role.songcraft.rhymeApproach && role.songcraft.rhymeApproach.length > 0) {
    lines.push(`- Rhyme & Meter Approach: ${role.songcraft.rhymeApproach.join('; ')}`);
  }
  if (role.songcraft.phrasing && role.songcraft.phrasing.length > 0) {
    lines.push(`- Phrasing & Cadence: ${role.songcraft.phrasing.join('; ')}`);
  }
  if (context?.sectionType && role.songcraft.sectionPriorities) {
    const matchedSec = role.songcraft.sectionPriorities.find((p) =>
      p.toLowerCase().includes(context.sectionType!.toLowerCase())
    );
    if (matchedSec) {
      lines.push(`- Section Priority for [${context.sectionType}]: ${matchedSec}`);
    }
  }

  lines.push(`\n[VOCABULARY & REGISTER RULES]`);
  if (role.vocabulary.registerRules && role.vocabulary.registerRules.length > 0) {
    lines.push(`- Register Rules: ${role.vocabulary.registerRules.join('; ')}`);
  }
  if (role.vocabulary.avoid && role.vocabulary.avoid.length > 0) {
    lines.push(`- Pitfalls to Avoid: ${role.vocabulary.avoid.join('; ')}`);
  }

  lines.push(`\n[AUTHENTICITY & CONFLICT RESOLUTION PRINCIPLE]`);
  if (role.authenticity.principles && role.authenticity.principles.length > 0) {
    lines.push(`- Authenticity Mandate: ${role.authenticity.principles.join('; ')}`);
  }
  lines.push(`- STORY FIDELITY OVER STEREOTYPES: The User Story and factual evidence ALWAYS override generic genre tropes. Do NOT inject rural/street/luxury clichés if the user story does not specify them.`);

  lines.push(`\n[ROLE CONSTRAINTS]`);
  if (role.constraints.mustDo && role.constraints.mustDo.length > 0) {
    lines.push(`- Must Do: ${role.constraints.mustDo.join('; ')}`);
  }
  if (role.constraints.mustAvoid && role.constraints.mustAvoid.length > 0) {
    lines.push(`- Must Avoid: ${role.constraints.mustAvoid.join('; ')}`);
  }

  return lines.join('\n');
}
