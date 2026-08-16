import { SectionFunctionType } from './types';

export interface SectionFunctionDefinition {
  type: string;
  functionExpected: SectionFunctionType;
  primaryRole: string;
  failureSign: string;
  canBeProtectedIfStrong: boolean;
}

export const SECTION_FUNCTION_DEFINITIONS: Record<string, SectionFunctionDefinition> = {
  'verse 1': {
    type: 'Verse 1',
    functionExpected: 'scene-setup',
    primaryRole: 'Set the initial scene, establish character voice, grounded sensory details, and initial status quo.',
    failureSign: 'Vague generic complaints without concrete objects/actions, or jumping straight to climax.',
    canBeProtectedIfStrong: false,
  },
  verse: {
    type: 'Verse',
    functionExpected: 'scene-setup',
    primaryRole: 'Establish concrete imagery, persona, and narrative progression.',
    failureSign: 'Unfocused rambling or abstract emotional labels.',
    canBeProtectedIfStrong: false,
  },
  'pre-chorus': {
    type: 'Pre-Chorus',
    functionExpected: 'emotional-lift',
    primaryRole: 'Build anticipation, tighten rhythmic tension, create harmonic transition into the hook.',
    failureSign: 'Deflating momentum or reading like another standard verse line.',
    canBeProtectedIfStrong: false,
  },
  chorus: {
    type: 'Chorus',
    functionExpected: 'central-hook',
    primaryRole: 'Deliver core emotional payoff, memorable hook line, singable repetitive anchors, central theme.',
    failureSign: 'Complex convoluted exposition or weak forgettable payoff without punchy hook.',
    canBeProtectedIfStrong: true,
  },
  'verse 2': {
    type: 'Verse 2',
    functionExpected: 'escalation-new-info',
    primaryRole: 'Introduce NEW narrative information, development, consequence, or escalation of time/actions.',
    failureSign: 'Section-redundancy: repeating Verse 1 ideas with slightly different synonyms without advancing story.',
    canBeProtectedIfStrong: false,
  },
  bridge: {
    type: 'Bridge',
    functionExpected: 'perspective-shift',
    primaryRole: 'Provide emotional contrast, sudden realization, epiphany, or peak vulnerability.',
    failureSign: 'Filler verses that just restate the chorus theme without shift in perspective.',
    canBeProtectedIfStrong: false,
  },
  outro: {
    type: 'Outro',
    functionExpected: 'closure-afterglow',
    primaryRole: 'Provide fading resolution, lingering final image, or echo of the core hook.',
    failureSign: 'Abrupt cutoff without emotional resonance or introducing entirely new unresolved plotlines.',
    canBeProtectedIfStrong: true,
  },
};

export function getSectionFunction(sectionTypeStr: string): SectionFunctionDefinition {
  const norm = sectionTypeStr.toLowerCase().trim();
  if (norm.includes('verse 1') || norm === 'verse 1') return SECTION_FUNCTION_DEFINITIONS['verse 1'];
  if (norm.includes('verse 2') || norm === 'verse 2') return SECTION_FUNCTION_DEFINITIONS['verse 2'];
  if (norm.includes('pre-chorus') || norm.includes('pre chorus')) return SECTION_FUNCTION_DEFINITIONS['pre-chorus'];
  if (norm.includes('chorus') || norm.includes('hook')) return SECTION_FUNCTION_DEFINITIONS['chorus'];
  if (norm.includes('bridge')) return SECTION_FUNCTION_DEFINITIONS['bridge'];
  if (norm.includes('outro')) return SECTION_FUNCTION_DEFINITIONS['outro'];
  if (norm.includes('verse')) return SECTION_FUNCTION_DEFINITIONS['verse'];

  return {
    type: sectionTypeStr,
    functionExpected: 'scene-setup',
    primaryRole: 'Support narrative flow and musical structure.',
    failureSign: 'Lack of emotional or structural coherence.',
    canBeProtectedIfStrong: false,
  };
}

/**
 * 1-5 Scoring Rubric Standard:
 * 1: Unusable / Critical Failure (Language contamination, broken persona, nonsensical phrasing)
 * 2: Heavy Issues (Robotic metaphors, jarring archaisms in casual genre, extreme clichés)
 * 3: Mediocre / Below Standard (Generic lines, low imagery, minor rhythm stumbles)
 * 4: Good / Usable (Solid songcraft, minor polish needed on 1-2 words/lines)
 * 5: Masterful / Exemplary (Vivid imagery, effortless naturalness, memorable hook, perfect persona)
 */
export const CRITIC_RUBRIC_GUIDELINES = `
[SCORE RUBRIC GUIDELINE: 1 - 5 SCALE]
- 5.0 (Masterful): Effortless natural colloquial phrasing, vivid 'show don't tell' sensory anchors, authentic character voice, perfect singability.
- 4.0 (Good / Usable): Clear story, relatable emotion, good cadence; 1-2 minor lines might benefit from slight lexical polish.
- 3.0 (Mediocre): Functional but uses familiar tropes, weak imagery, or slightly stiff collocations.
- 2.0 (Heavy Issues): Obvious robotic metaphors (e.g. math terms 'คูณสอง', '100%'), archaic/royal terms intruding into street/folk genres (e.g. 'ข้าพเจ้า', 'สุริยัน', 'ดวงฤทัย'), or trite clichés.
- 1.0 (Critical / Unusable): Language contamination (e.g. Thai in English pop), complete breakdown of meter/singability, or total semantic disconnect.
`;
