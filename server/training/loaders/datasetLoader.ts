import {
  TrainingDatasetBundle,
  ThaiLyricKnowledgeEntry,
  GoodLyricExemplar,
  BadLyricExemplar,
  LyricCorrectionPair,
  AvoidanceRuleEntry,
  PersonaProfile,
  GenreLanguageProfile,
  GoldenTestFixture,
  LyricGenreKey,
  SectionType,
} from '../types';
import { THAI_LYRIC_KNOWLEDGE_BASE } from '../datasets/thaiLyricKnowledge';
import { GOOD_EXEMPLARS } from '../datasets/goodExemplars';
import { BAD_EXEMPLARS } from '../datasets/badExemplars';
import { CORRECTION_PAIRS } from '../datasets/correctionPairs';
import { AVOIDANCE_RULES } from '../datasets/avoidanceRules';
import { PERSONA_PROFILES } from '../datasets/personaProfiles';
import { GENRE_LANGUAGE_PROFILES } from '../datasets/genreProfiles';
import { GOLDEN_TEST_FIXTURES } from '../datasets/goldenTestFixtures';

/**
 * DATASET LOADER (ISOLATED KNOWLEDGE ACCESS LAYER)
 * Loads, filters, and exposes training and knowledge datasets without touching active generation pipelines.
 */
class DatasetLoader {
  private bundle: TrainingDatasetBundle;

  constructor() {
    this.bundle = {
      thaiLyricKnowledge: THAI_LYRIC_KNOWLEDGE_BASE,
      goodExemplars: GOOD_EXEMPLARS,
      badExemplars: BAD_EXEMPLARS,
      correctionPairs: CORRECTION_PAIRS,
      avoidanceRules: AVOIDANCE_RULES,
      personaProfiles: PERSONA_PROFILES,
      genreProfiles: GENRE_LANGUAGE_PROFILES,
      goldenTestFixtures: GOLDEN_TEST_FIXTURES,
    };
  }

  /**
   * Retrieves the full in-memory dataset bundle
   */
  public getBundle(): TrainingDatasetBundle {
    return this.bundle;
  }

  /**
   * Good Exemplars filtered by genre and section
   */
  public getGoodExemplars(genre?: LyricGenreKey, section?: SectionType): GoodLyricExemplar[] {
    return this.bundle.goodExemplars.filter((ex) => {
      if (genre && ex.genre !== genre) return false;
      if (section && ex.sectionType !== section) return false;
      return true;
    });
  }

  /**
   * Bad Exemplars filtered by genre or flaw type
   */
  public getBadExemplars(genre?: LyricGenreKey): BadLyricExemplar[] {
    return this.bundle.badExemplars.filter((ex) => {
      if (genre && ex.genre !== genre) return false;
      return true;
    });
  }

  /**
   * Correction pairs filtered by genre or persona
   */
  public getCorrectionPairs(genre?: LyricGenreKey, personaKey?: string): LyricCorrectionPair[] {
    return this.bundle.correctionPairs.filter((pair) => {
      if (genre && pair.context.genre !== genre) return false;
      if (personaKey && pair.context.personaKey !== personaKey) return false;
      return true;
    });
  }

  /**
   * Persona Profile by key
   */
  public getPersonaProfile(personaKey: string): PersonaProfile | undefined {
    return this.bundle.personaProfiles.find((p) => p.personaKey === personaKey);
  }

  /**
   * Genre Profile by key
   */
  public getGenreProfile(genreKey: LyricGenreKey): GenreLanguageProfile | undefined {
    return this.bundle.genreProfiles.find((g) => g.genreKey === genreKey);
  }

  /**
   * Thai Lyric Knowledge entries filtered by domain
   */
  public getLyricKnowledgeByDomain(domain: string): ThaiLyricKnowledgeEntry[] {
    return this.bundle.thaiLyricKnowledge.filter((k) =>
      k.semanticDomains.some((d) => d.toLowerCase().includes(domain.toLowerCase()))
    );
  }

  /**
   * Avoidance rules matching a specific genre
   */
  public getAvoidanceRules(genre?: LyricGenreKey): AvoidanceRuleEntry[] {
    return this.bundle.avoidanceRules.filter((rule) => {
      if (rule.tier === 'HARD_BLOCK') return true;
      if (!genre) return true;
      if (!rule.contextConditions.genres || rule.contextConditions.genres.length === 0) return true;
      return rule.contextConditions.genres.includes(genre);
    });
  }

  /**
   * Golden test fixtures
   */
  public getGoldenTestFixtures(): GoldenTestFixture[] {
    return this.bundle.goldenTestFixtures;
  }
}

export const datasetLoader = new DatasetLoader();
