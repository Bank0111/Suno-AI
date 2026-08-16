export interface SongwriterRole {
  id: string;
  name: string;

  identity: {
    profession: string;
    expertise: string[];
  };

  musicalContext: {
    genre: string;
    subgenre: string[];
    era?: string;
    culturalContext?: string;
  };

  language: {
    primary: string;
    languageProfile: string;
    register: string;
  };

  persona: {
    voice: string;
    attitude: string;
    pointOfView?: string;
    storytellingStyle: string[];
  };

  vocabulary: {
    preferred: string[];
    avoid: string[];
    registerRules: string[];
  };

  imagery: {
    preferred: string[];
    rules: string[];
  };

  songcraft: {
    hookStyle: string[];
    rhymeApproach: string[];
    phrasing: string[];
    sectionPriorities: string[];
  };

  vocalDelivery?: {
    characteristics: string[];
    phrasing?: string[];
  };

  authenticity: {
    principles: string[];
  };

  constraints: {
    mustDo: string[];
    mustAvoid: string[];
  };

  evaluation: {
    primaryMetrics: string[];
  };
}

export interface SongwriterRoleResolutionInput {
  language?: string;
  genre?: string | string[];
  subGenre?: string | string[];
  mood?: string | string[];
  persona?: string;
  storytellingStyle?: string | string[];
  culturalContext?: string;
  requestedRole?: string;
  story?: string;
}

export interface ResolvedSongwriterRole {
  role: SongwriterRole;
  languageProfileCode: string;
  resolutionSource: 'EXPLICIT_USER' | 'GENRE_LANGUAGE_MATCH' | 'GENRE_FAMILY_MATCH' | 'GENERIC_FALLBACK';
  matchReason: string;
}
