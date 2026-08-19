import {
  ROLE_REGISTRY,
  listAllRoles,
  getRoleById,
  resolveSongwriterRole,
  buildRolePrompt,
  SongwriterRole,
  ResolvedSongwriterRole,
} from '../../songwriting/roles';

export interface RoleValidationResult {
  roleId: string;
  roleName: string;
  hasIdentity: boolean;
  hasMusicalContext: boolean;
  hasLanguage: boolean;
  hasPersona: boolean;
  hasVocabulary: boolean;
  hasImagery: boolean;
  hasSongcraft: boolean;
  hasAuthenticity: boolean;
  hasConstraints: boolean;
  hasEvaluation: boolean;
  promptGeneratedLength: number;
  isValid: boolean;
}

export interface RoleResolutionTestCase {
  name: string;
  input: {
    language?: string;
    genre?: string | string[];
    subGenre?: string | string[];
    mood?: string | string[];
    requestedRole?: string;
    story?: string;
  };
  expectedRoleId: string;
  expectedResolutionSource: 'EXPLICIT_USER' | 'GENRE_LANGUAGE_MATCH' | 'GENRE_FAMILY_MATCH' | 'GENERIC_FALLBACK';
}

export const ROLE_RESOLUTION_TEST_CASES: RoleResolutionTestCase[] = [
  {
    name: 'Explicit User Selection: thai_country_folk requested explicitly',
    input: {
      language: 'ไทย',
      genre: 'Pop',
      requestedRole: 'thai_country_folk',
      story: 'เรื่องราวในเมืองกรุง',
    },
    expectedRoleId: 'thai_country_folk',
    expectedResolutionSource: 'EXPLICIT_USER',
  },
  {
    name: 'Thai + ลูกทุ่ง / เพื่อชีวิต -> thai_country_folk',
    input: {
      language: 'ไทย',
      genre: 'ลูกทุ่งเพื่อชีวิต',
      story: 'การทำงานหาเงินส่งกลับบ้าน',
    },
    expectedRoleId: 'thai_country_folk',
    expectedResolutionSource: 'GENRE_LANGUAGE_MATCH',
  },
  {
    name: 'Thai + R&B / Soul -> thai_rnb_soul',
    input: {
      language: 'ไทย',
      genre: ['Thai R&B', 'Neo-Soul'],
      story: 'ความสัมพันธ์คลุมเครือยามค่ำคืนในห้องนอน',
    },
    expectedRoleId: 'thai_rnb_soul',
    expectedResolutionSource: 'GENRE_LANGUAGE_MATCH',
  },
  {
    name: 'Thai + Hip-Hop / Rap -> thai_hiphop',
    input: {
      language: 'ไทย',
      genre: 'Thai Hip-Hop',
      subGenre: 'Boom Bap',
      story: 'การต่อสู้ดิ้นรนของคนรุ่นใหม่บนถนนสายความฝัน',
    },
    expectedRoleId: 'thai_hiphop',
    expectedResolutionSource: 'GENRE_LANGUAGE_MATCH',
  },
  {
    name: 'Any Language + Soundtrack / OST / ละคร -> film_tv_songwriter',
    input: {
      language: 'ไทย',
      genre: 'Original Soundtrack (OST)',
      story: 'เพลงประกอบละครย้อนยุคดราม่าเข้มข้น',
    },
    expectedRoleId: 'film_tv_songwriter',
    expectedResolutionSource: 'GENRE_FAMILY_MATCH',
  },
  {
    name: 'English + Indie Pop / Bedroom Pop -> indie_pop',
    input: {
      language: 'English',
      genre: 'Bedroom Pop',
      story: 'Late night quiet thoughts in a small bedroom by the window',
    },
    expectedRoleId: 'indie_pop',
    expectedResolutionSource: 'GENRE_FAMILY_MATCH',
  },
  {
    name: 'Any Language + Dance Pop / Synth Pop / Commercial -> commercial_pop',
    input: {
      language: 'English',
      genre: ['Dance Pop', 'Synth Pop'],
      story: 'Summer dance party with high energy and vibrant colors',
    },
    expectedRoleId: 'commercial_pop',
    expectedResolutionSource: 'GENRE_FAMILY_MATCH',
  },
  {
    name: 'Unmatched Genre / Language -> generic_multilingual Fallback',
    input: {
      language: 'Japanese',
      genre: 'Enka / Traditional Folk',
      story: 'Mountain journey during winter snow',
    },
    expectedRoleId: 'generic_multilingual',
    expectedResolutionSource: 'GENERIC_FALLBACK',
  },
];

export function validateRoleProfiles(): {
  allValid: boolean;
  totalRoles: number;
  results: RoleValidationResult[];
} {
  const allRoles = listAllRoles();
  const results: RoleValidationResult[] = allRoles.map((role) => {
    const hasIdentity = Boolean(role.identity?.profession && (role.identity?.expertise?.length || 0) > 0);
    const hasMusicalContext = Boolean(role.musicalContext?.genre && (role.musicalContext?.subgenre?.length || 0) > 0);
    const hasLanguage = Boolean(role.language?.primary && role.language?.languageProfile);

    const storytellingStyleValid = Array.isArray(role.persona?.storytellingStyle)
      ? role.persona.storytellingStyle.length > 0
      : Boolean(role.persona?.storytellingStyle);

    const hasPersona = Boolean(role.persona?.voice && role.persona?.attitude && storytellingStyleValid);
    const hasVocabulary = Boolean(role.vocabulary?.preferred && role.vocabulary?.avoid && role.vocabulary?.registerRules);
    const hasImagery = Boolean(role.imagery?.preferred && role.imagery?.rules);
    const hasSongcraft = Boolean(role.songcraft?.hookStyle && role.songcraft?.rhymeApproach && role.songcraft?.phrasing);
    const hasAuthenticity = Boolean((role.authenticity?.principles?.length || 0) > 0);
    const hasConstraints = Boolean((role.constraints?.mustDo?.length || 0) > 0 && (role.constraints?.mustAvoid?.length || 0) > 0);
    const hasEvaluation = Boolean((role.evaluation?.primaryMetrics?.length || 0) > 0);

    let promptGeneratedLength = 0;
    try {
      const prompt = buildRolePrompt(role, { targetContentLanguage: 'th', sectionType: 'Chorus' });
      promptGeneratedLength = prompt.length;
    } catch {
      promptGeneratedLength = 0;
    }

    const isValid =
      hasIdentity &&
      hasMusicalContext &&
      hasLanguage &&
      hasPersona &&
      hasVocabulary &&
      hasImagery &&
      hasSongcraft &&
      hasAuthenticity &&
      hasConstraints &&
      hasEvaluation &&
      promptGeneratedLength > 100;

    return {
      roleId: role.id,
      roleName: role.name,
      hasIdentity,
      hasMusicalContext,
      hasLanguage,
      hasPersona,
      hasVocabulary,
      hasImagery,
      hasSongcraft,
      hasAuthenticity,
      hasConstraints,
      hasEvaluation,
      promptGeneratedLength,
      isValid,
    };
  });

  const allValid = results.every((r) => r.isValid);
  return {
    allValid,
    totalRoles: allRoles.length,
    results,
  };
}

export function executeRoleResolutionTests(): {
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  testResults: Array<{
    testName: string;
    passed: boolean;
    resolvedRoleId: string;
    expectedRoleId: string;
    resolvedSource: string;
    expectedSource: string;
    matchReason: string;
  }>;
} {
  const testResults = ROLE_RESOLUTION_TEST_CASES.map((tc) => {
    const resolved = resolveSongwriterRole(tc.input);
    const roleMatches = resolved.role.id === tc.expectedRoleId;
    const sourceMatches = resolved.resolutionSource === tc.expectedResolutionSource;
    const passed = roleMatches && sourceMatches;

    return {
      testName: tc.name,
      passed,
      resolvedRoleId: resolved.role.id,
      expectedRoleId: tc.expectedRoleId,
      resolvedSource: resolved.resolutionSource,
      expectedSource: tc.expectedResolutionSource,
      matchReason: resolved.matchReason,
    };
  });

  const passedTests = testResults.filter((r) => r.passed).length;
  return {
    allPassed: passedTests === testResults.length,
    totalTests: testResults.length,
    passedTests,
    testResults,
  };
}