import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Dices,
  MessageSquareText,
  Music2,
  HeartHandshake,
  Globe,
  Sliders,
  Check,
  CheckCircle2,
  Loader2,
  X,
  Gauge,
  Mic,
  Plus,
  Settings,
  Youtube,
  Link2,
  Trash2,
  AlertCircle,
  Info,
  Edit3,
  Compass,
  Lightbulb,
  Eye,
  Target,
  Layers,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import {
  SongInput,
  Genre,
  Mood,
  Language,
  WordTone,
  LanguageStyle,
  PointOfView,
  RhymeStyle,
  DeepCreativeAnalysis,
} from '../../types/songwriting';
import { getRandomStory, expandIdea, analyzeReference, resolveYouTubeReference } from '../../services/songwriting';
import { extractYouTubeVideoId, getCanonicalYouTubeUrl } from '../../utils/youtubeUtils';
import { deriveCreativeDirection } from '../../utils/creativeDirection';

const cleanText = (val: any): string | null => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (
    !str ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'undefined' ||
    str === 'NaN' ||
    str === '[object Object]'
  ) {
    return null;
  }
  return str;
};

const cleanArray = (val: any): string[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map(cleanText)
    .filter((item): item is string => item !== null && item.length > 0);
};

interface Step02Props {
  input: SongInput;
  onChange: (updated: Partial<SongInput>) => void;
  onNext: () => void;
  hasApiKey: boolean;
}

const GENRE_OPTIONS: Genre[] = [
  'Pop',
  'R&B',
  'Hip-Hop',
  'Rock',
  'Ballad',
  'EDM',
  'Indie',
  'Jazz',
  'Folk',
  'Lo-fi',
  'City Pop',
  'ลูกทุ่ง',
  'เพื่อชีวิต',
  'Bossa Nova',
  'Synthwave',
  'Acoustic',
];

const MOOD_OPTIONS: Mood[] = [
  'มีความสุข',
  'เศร้า',
  'คิดถึง',
  'หวังดี',
  'โรแมนติก',
  'อบอุ่น',
  'โดดเดี่ยว',
  'สนุก',
  'คลั่งรัก',
  'เท่',
  'เหงา',
  'ปลดปล่อย',
];

const LANGUAGE_OPTIONS: Language[] = [
  'ไทย',
  'English',
  'Japanese',
  'Korean',
  'Chinese',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Italian',
  'Custom',
];

const WORD_TONE_OPTIONS: WordTone[] = [
  'เป็นธรรมชาติ เข้าใจง่าย',
  'สละสลวย',
  'กวี',
  'ดิบ',
  'ร่วมสมัย',
  'เป็นกันเอง',
  'เข้มข้น',
];

const LANGUAGE_STYLE_OPTIONS: LanguageStyle[] = [
  'ตรงไปตรงมา',
  'เล่าเรื่อง',
  'ใช้ภาพเปรียบเทียบ',
  'กวี',
  'Modern conversational',
  'Storytelling',
];

const POV_OPTIONS: { value: PointOfView; label: string }[] = [
  { value: 'auto', label: 'ให้ AI เลือกให้เหมาะกับเรื่อง (วิเคราะห์ตามความเหมาะสม)' },
  { value: 'first-person', label: 'บุคคลที่ 1 – ฉัน / เรา (ผู้เล่าอยู่ในเหตุการณ์โดยตรง)' },
  { value: 'second-person', label: 'บุคคลที่ 2 – เธอ / คุณ (ผู้เล่าพูดกับอีกคนโดยตรง)' },
  { value: 'third-person', label: 'บุคคลที่ 3 – เขา / เธอ (ผู้เล่ามองตัวละครจากภายนอก)' },
  { value: 'mixed', label: 'สลับมุมมอง (เปลี่ยน POV ระหว่างเพลงตามความเหมาะสม)' },
];

const RHYME_OPTIONS: RhymeStyle[] = [
  'ให้ AI เลือกให้เหมาะสม',
  'สัมผัสธรรมชาติ',
  'สัมผัสชัดเจน',
  'สัมผัสท้าย',
  'สัมผัสภายใน',
  'เน้น flow / cadence',
];

const TEMPO_PRESETS = [
  { label: 'ช้ามาก (50–65 BPM)', defaultBpm: 58 },
  { label: 'ช้า (65–80 BPM)', defaultBpm: 72 },
  { label: 'ปานกลาง (80–100 BPM)', defaultBpm: 90 },
  { label: 'เดินจังหวะ (100–115 BPM)', defaultBpm: 108 },
  { label: 'เร็ว (115–130 BPM)', defaultBpm: 122 },
  { label: 'เร็วมาก (130–160 BPM)', defaultBpm: 145 },
];

const RHYTHM_PRESETS = [
  'มีชีวิตชีวา',
  'บัลลาด',
  'สนุกสนาน',
  'หนักหน่วง',
  'มีจังหวะโดดเด่น',
  'สบาย ๆ',
];

const VOCAL_OPTIONS = [
  'ชาย',
  'หญิง',
  'คู่ชาย–หญิง',
  'กลุ่ม / ประสานเสียง',
  'ไม่มีเสียงร้อง',
  'กำหนดเอง',
];

export const Step02StoryDirection: React.FC<Step02Props> = ({
  input,
  onChange,
  onNext,
  hasApiKey,
}) => {
  const [randomLoading, setRandomLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState<DeepCreativeAnalysis | null>(null);
  const [showSectionBlueprintView, setShowSectionBlueprintView] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showCustomBpmInput, setShowCustomBpmInput] = useState(false);
  const [customRhythmText, setCustomRhythmText] = useState('');
  const [isAddingRhythm, setIsAddingRhythm] = useState(false);

  const [customGenreInputText, setCustomGenreInputText] = useState('');
  const [customMoodInputText, setCustomMoodInputText] = useState('');

  const [youtubeUrlInput, setYoutubeUrlInput] = useState(
    input.reference?.sourceType === 'youtube' ? input.reference.source : ''
  );
  const [songTextInput, setSongTextInput] = useState(
    input.reference?.sourceType === 'text'
      ? input.reference.source
      : input.reference?.title
      ? `${input.reference.title}${input.reference.artist ? ` - ${input.reference.artist}` : ''}`
      : ''
  );
  const [resolvedMeta, setResolvedMeta] = useState<{
    verified: boolean;
    videoId?: string;
    canonicalUrl?: string;
    title?: string;
    channel?: string;
    artist?: string;
    thumbnailUrl?: string;
  } | null>(null);
  const [isResolvingYouTube, setIsResolvingYouTube] = useState(false);
  const [analyzingRef, setAnalyzingRef] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);

  const [userOverrideGenre, setUserOverrideGenre] = useState('');
  const [userOverrideVocal, setUserOverrideVocal] = useState('');
  const [userOverrideInstr, setUserOverrideInstr] = useState('');
  const [userOverrideTempo, setUserOverrideTempo] = useState('');
  const [showUserOverrideForm, setShowUserOverrideForm] = useState(false);

  useEffect(() => {
    if (input.reference?.userOverrides) {
      if (input.reference.userOverrides.genre !== undefined) setUserOverrideGenre(input.reference.userOverrides.genre);
      if (input.reference.userOverrides.vocal !== undefined) setUserOverrideVocal(input.reference.userOverrides.vocal);
      if (input.reference.userOverrides.instrumentation !== undefined) setUserOverrideInstr(input.reference.userOverrides.instrumentation);
      if (input.reference.userOverrides.tempo !== undefined) setUserOverrideTempo(input.reference.userOverrides.tempo);
    }
  }, [input.reference]);

  const handleSaveUserOverrides = () => {
    if (!input.reference) return;
    const cleanG = cleanText(userOverrideGenre);
    const cleanV = cleanText(userOverrideVocal);
    const cleanI = cleanText(userOverrideInstr);
    const cleanT = cleanText(userOverrideTempo);

    const existingAnalysis = input.reference.analysis || {};
    const updatedAnalysis = {
      ...existingAnalysis,
      ...(cleanG ? { genre: [cleanG] } : {}),
      ...(cleanV ? { vocal: cleanV } : {}),
      ...(cleanI ? { instrumentation: [cleanI] } : {}),
      ...(cleanT ? { tempo: cleanT } : {}),
    };

    const updatedRef = {
      ...input.reference,
      userOverrides: {
        genre: cleanG || undefined,
        vocal: cleanV || undefined,
        instrumentation: cleanI || undefined,
        tempo: cleanT || undefined,
      },
      analysis: updatedAnalysis,
      analysisVerified: true,
    };

    const creativeDir = deriveCreativeDirection({
      ...input,
      reference: updatedRef,
    });

    onChange({
      reference: {
        ...updatedRef,
        creativeDirection: updatedRef.applied ? creativeDir : undefined,
      },
    });
  };

  // Auto-resolve YouTube metadata when youtubeUrlInput changes
  const handleResolveYouTube = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setResolvedMeta(null);
      return;
    }
    const videoId = extractYouTubeVideoId(trimmed);
    if (!videoId) {
      setResolvedMeta({ verified: false });
      setRefError('ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด');
      return;
    }

    setIsResolvingYouTube(true);
    try {
      const res = await resolveYouTubeReference({ youtubeUrl: trimmed });
      if (res.verified && res.title) {
        setResolvedMeta({
          verified: true,
          videoId: res.videoId,
          canonicalUrl: res.canonicalUrl,
          title: res.title,
          channel: res.channel || res.artist,
          artist: res.artist || res.channel,
          thumbnailUrl: res.thumbnailUrl,
        });
        setRefError(null);
      } else {
        setResolvedMeta({ verified: false });
        setRefError('ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด');
      }
    } catch {
      setResolvedMeta({ verified: false });
      setRefError('ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด');
    } finally {
      setIsResolvingYouTube(false);
    }
  };

  const customGenreItems = Array.from(
    new Set([
      ...input.genres.filter((g) => !(GENRE_OPTIONS as readonly string[]).includes(g)),
      ...(input.customGenre ? input.customGenre.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );

  const customMoodItems = Array.from(
    new Set([
      ...input.moods.filter((m) => !(MOOD_OPTIONS as readonly string[]).includes(m)),
      ...(input.customMood ? input.customMood.split(',').map((s) => s.trim()).filter(Boolean) : []),
    ])
  );

  const handleAddCustomGenre = (val?: string) => {
    const raw = val !== undefined ? val : customGenreInputText;
    const trimmed = raw.trim();
    if (!trimmed) return;

    if ((GENRE_OPTIONS as readonly string[]).includes(trimmed)) {
      if (!input.genres.includes(trimmed)) {
        onChange({ genres: [...input.genres, trimmed] });
      }
      setCustomGenreInputText('');
      return;
    }

    const updatedCustomList = Array.from(new Set([...customGenreItems, trimmed]));
    const updatedGenres = Array.from(new Set([...input.genres, trimmed]));

    onChange({
      genres: updatedGenres,
      customGenre: updatedCustomList.join(', '),
    });
    setCustomGenreInputText('');
  };

  const toggleCustomGenre = (cg: string) => {
    const exists = input.genres.includes(cg);
    const updatedGenres = exists
      ? input.genres.filter((g) => g !== cg)
      : [...input.genres, cg];
    onChange({ genres: updatedGenres });
  };

  const handleRemoveCustomGenre = (cg: string) => {
    const updatedGenres = input.genres.filter((g) => g !== cg);
    const remainingCustom = customGenreItems.filter((g) => g !== cg);
    onChange({
      genres: updatedGenres,
      customGenre: remainingCustom.join(', '),
    });
  };

  const handleAddCustomMood = (val?: string) => {
    const raw = val !== undefined ? val : customMoodInputText;
    const trimmed = raw.trim();
    if (!trimmed) return;

    if ((MOOD_OPTIONS as readonly string[]).includes(trimmed)) {
      if (!input.moods.includes(trimmed)) {
        onChange({ moods: [...input.moods, trimmed] });
      }
      setCustomMoodInputText('');
      return;
    }

    const updatedCustomList = Array.from(new Set([...customMoodItems, trimmed]));
    const updatedMoods = Array.from(new Set([...input.moods, trimmed]));

    onChange({
      moods: updatedMoods,
      customMood: updatedCustomList.join(', '),
    });
    setCustomMoodInputText('');
  };

  const toggleCustomMood = (cm: string) => {
    const exists = input.moods.includes(cm);
    const updatedMoods = exists
      ? input.moods.filter((m) => m !== cm)
      : [...input.moods, cm];
    onChange({ moods: updatedMoods });
  };

  const handleRemoveCustomMood = (cm: string) => {
    const updatedMoods = input.moods.filter((m) => m !== cm);
    const remainingCustom = customMoodItems.filter((m) => m !== cm);
    onChange({
      moods: updatedMoods,
      customMood: remainingCustom.join(', '),
    });
  };

  const handleAnalyzeRef = async () => {
    if (!youtubeUrlInput.trim() && !songTextInput.trim()) {
      setRefError('โปรดใส่ลิงก์ YouTube หรือพิมพ์ชื่อเพลง/ศิลปินก่อนกดวิเคราะห์');
      return;
    }

    setAnalyzingRef(true);
    setRefError(null);

    try {
      let currentResolved = resolvedMeta;
      const cleanYt = youtubeUrlInput.trim();

      // If YouTube URL is provided but not yet resolved, attempt to resolve first
      if (cleanYt && (!currentResolved || (!currentResolved.verified && !currentResolved.title))) {
        const videoId = extractYouTubeVideoId(cleanYt);
        if (videoId) {
          try {
            const resMeta = await resolveYouTubeReference({ youtubeUrl: cleanYt });
            if (resMeta.verified && resMeta.title) {
              currentResolved = {
                verified: true,
                videoId: resMeta.videoId,
                canonicalUrl: resMeta.canonicalUrl,
                title: resMeta.title,
                channel: resMeta.channel || resMeta.artist,
                artist: resMeta.artist || resMeta.channel,
                thumbnailUrl: resMeta.thumbnailUrl,
              };
              setResolvedMeta(currentResolved);
            } else {
              currentResolved = { verified: false };
              setResolvedMeta(currentResolved);
            }
          } catch {
            currentResolved = { verified: false };
            setResolvedMeta(currentResolved);
          }
        } else {
          currentResolved = { verified: false };
          setResolvedMeta(currentResolved);
        }
      }

      // Check Identity: must have confirmedTitle from resolved YouTube or songTextInput
      const hasConfirmedTitle = (currentResolved && currentResolved.verified && currentResolved.title) || songTextInput.trim();
      if (!hasConfirmedTitle) {
        setRefError('ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด');
        setAnalyzingRef(false);
        return;
      }

      const videoId = cleanYt ? extractYouTubeVideoId(cleanYt) : null;
      const canonicalUrl = currentResolved?.canonicalUrl || (videoId ? getCanonicalYouTubeUrl(videoId) : undefined);

      const res = await analyzeReference({
        youtubeUrl: currentResolved?.verified ? canonicalUrl : undefined,
        songText: songTextInput.trim() || undefined,
      });

      if (!res || !res.analysis || res.warningMessage?.includes('ไม่สามารถยืนยันข้อมูล')) {
        setRefError(res?.warningMessage || 'ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด');
        return;
      }

      onChange({ reference: { ...res, applied: false } });
    } catch (err: any) {
      setRefError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์เพลงอ้างอิง');
    } finally {
      setAnalyzingRef(false);
    }
  };

  const handleApplyRef = () => {
    if (input.reference) {
      const updatedRef = {
        ...input.reference,
        applied: true,
      };
      
      const explicit = input.userExplicitSelections || {};

      // Compute creative direction with applied reference
      const creativeDir = deriveCreativeDirection({
        ...input,
        reference: updatedRef,
      });

      const updatedInput: Partial<SongInput> = {
        reference: {
          ...updatedRef,
          creativeDirection: creativeDir,
        },
        creativeDirection: creativeDir,
      };

      // 1. Genre: apply if not explicitly chosen by user and reference provided genre
      if (!explicit.genre && creativeDir.genre?.source === 'reference' && Array.isArray(creativeDir.genre.value) && creativeDir.genre.value.length > 0) {
        updatedInput.genres = creativeDir.genre.value;
      }

      // 2. Mood: apply if not explicitly chosen by user and reference provided mood
      if (!explicit.mood && creativeDir.mood?.source === 'reference' && Array.isArray(creativeDir.mood.value) && creativeDir.mood.value.length > 0) {
        updatedInput.moods = creativeDir.mood.value;
      }

      // 3. Tempo & BPM: apply if not explicitly set by user and reference provided tempo/bpm
      if (!explicit.tempo && creativeDir.tempo?.source === 'reference' && typeof creativeDir.tempo.value === 'string') {
        updatedInput.tempo = creativeDir.tempo.value;
      }
      if (!explicit.bpm && creativeDir.bpm?.source === 'reference' && creativeDir.bpm.value) {
        updatedInput.bpm = Number(creativeDir.bpm.value);
      }

      // 4. Rhythm: apply if not explicitly set by user and reference provided rhythm
      if (!explicit.rhythm && creativeDir.rhythm?.source === 'reference') {
        const val = creativeDir.rhythm.value;
        updatedInput.rhythmCharacteristics = Array.isArray(val) ? val : [String(val)];
      }

      // 5. Vocal: apply if not explicitly set by user and reference provided vocal
      if (!explicit.vocal && creativeDir.vocal?.source === 'reference' && typeof creativeDir.vocal.value === 'string') {
        updatedInput.vocalType = creativeDir.vocal.value;
      }

      // 6. Structure: apply if not explicitly modified by user
      if (!explicit.structure) {
        const sectionsList = creativeDir.suggestedStructure?.sections ||
          (Array.isArray(creativeDir.structure?.value) ? creativeDir.structure.value : null);
        if (sectionsList && sectionsList.length > 0) {
          updatedInput.structure = sectionsList;
        }
      }

      // 7. Rhyme Style: apply if not explicitly set by user and reference provided rhyme
      if (!explicit.rhymeStyle && creativeDir.rhymeStyle?.source === 'reference' && typeof creativeDir.rhymeStyle.value === 'string') {
        updatedInput.rhymeStyle = creativeDir.rhymeStyle.value as any;
      }

      // 8. Language Style: apply if not explicitly set by user and reference provided language style
      if (!explicit.languageStyle && creativeDir.languageStyle?.source === 'reference' && typeof creativeDir.languageStyle.value === 'string') {
        updatedInput.languageStyle = creativeDir.languageStyle.value as any;
      }

      onChange(updatedInput);
    }
  };

  const handleClearRef = () => {
    setYoutubeUrlInput('');
    setSongTextInput('');
    setResolvedMeta(null);
    setRefError(null);
    const updatedInput: Partial<SongInput> = { reference: undefined };
    // If structure is not user explicit, recalculate auto structure from story/genre
    if (!input.userExplicitSelections?.structure) {
      const autoCreativeDir = deriveCreativeDirection({ ...input, reference: undefined });
      if (autoCreativeDir.structure?.value) {
        const sectionsList = Array.isArray(autoCreativeDir.structure.value)
          ? autoCreativeDir.structure.value
          : (autoCreativeDir.suggestedStructure?.sections || [autoCreativeDir.structure.value]);
        if (sectionsList.length > 0) {
          updatedInput.structure = sectionsList;
        }
      }
    }
    onChange(updatedInput);
  };

  const currentRhythms = input.rhythmCharacteristics || ['มีชีวิตชีวา'];

  const handleSelectTempo = (preset: { label: string; defaultBpm: number }) => {
    const updatedUserExplicit = { ...(input.userExplicitSelections || {}), tempo: true, bpm: true };
    const updatedInput: Partial<SongInput> = {
      tempo: preset.label,
      bpm: preset.defaultBpm,
      userExplicitSelections: updatedUserExplicit,
    };
    if (input.reference?.applied) {
      updatedInput.reference = {
        ...input.reference,
        creativeDirection: deriveCreativeDirection({ ...input, ...updatedInput }),
      };
    }
    onChange(updatedInput);
    setShowCustomBpmInput(false);
  };

  const handleCustomBpmChange = (newBpm: number) => {
    const updatedUserExplicit = { ...(input.userExplicitSelections || {}), tempo: true, bpm: true };
    const updatedInput: Partial<SongInput> = {
      bpm: newBpm,
      tempo: `กำหนดเอง (${newBpm} BPM)`,
      userExplicitSelections: updatedUserExplicit,
    };
    if (input.reference?.applied) {
      updatedInput.reference = {
        ...input.reference,
        creativeDirection: deriveCreativeDirection({ ...input, ...updatedInput }),
      };
    }
    onChange(updatedInput);
  };

  const toggleRhythm = (rhythm: string) => {
    const exists = currentRhythms.includes(rhythm);
    const updated = exists
      ? currentRhythms.filter((r) => r !== rhythm)
      : [...currentRhythms, rhythm];
    const updatedUserExplicit = { ...(input.userExplicitSelections || {}), rhythm: true };
    const updatedInput: Partial<SongInput> = {
      rhythmCharacteristics: updated,
      userExplicitSelections: updatedUserExplicit,
    };
    if (input.reference?.applied) {
      updatedInput.reference = {
        ...input.reference,
        creativeDirection: deriveCreativeDirection({ ...input, ...updatedInput }),
      };
    }
    onChange(updatedInput);
  };

  const handleAddCustomRhythm = () => {
    const trimmed = customRhythmText.trim();
    if (trimmed && !currentRhythms.includes(trimmed)) {
      const updatedUserExplicit = { ...(input.userExplicitSelections || {}), rhythm: true };
      const updatedInput: Partial<SongInput> = {
        rhythmCharacteristics: [...currentRhythms, trimmed],
        userExplicitSelections: updatedUserExplicit,
      };
      if (input.reference?.applied) {
        updatedInput.reference = {
          ...input.reference,
          creativeDirection: deriveCreativeDirection({ ...input, ...updatedInput }),
        };
      }
      onChange(updatedInput);
      setCustomRhythmText('');
      setIsAddingRhythm(false);
    }
  };

  const handleRemoveRhythm = (rhythmToRemove: string) => {
    const updated = currentRhythms.filter((r) => r !== rhythmToRemove);
    const updatedUserExplicit = { ...(input.userExplicitSelections || {}), rhythm: true };
    const updatedInput: Partial<SongInput> = {
      rhythmCharacteristics: updated,
      userExplicitSelections: updatedUserExplicit,
    };
    if (input.reference?.applied) {
      updatedInput.reference = {
        ...input.reference,
        creativeDirection: deriveCreativeDirection({ ...input, ...updatedInput }),
      };
    }
    onChange(updatedInput);
  };

  // Toggle Genre
  const toggleGenre = (genre: string) => {
    const exists = input.genres.includes(genre);
    const updated = exists
      ? input.genres.filter((g) => g !== genre)
      : [...input.genres, genre];
    const updatedUserExplicit = { ...(input.userExplicitSelections || {}), genre: true };
    const updatedInput: Partial<SongInput> = {
      genres: updated,
      userExplicitSelections: updatedUserExplicit,
    };
    if (input.reference?.applied) {
      updatedInput.reference = {
        ...input.reference,
        creativeDirection: deriveCreativeDirection({ ...input, ...updatedInput }),
      };
    }
    onChange(updatedInput);
  };

  // Toggle Mood
  const toggleMood = (mood: string) => {
    const exists = input.moods.includes(mood);
    const updated = exists
      ? input.moods.filter((m) => m !== mood)
      : [...input.moods, mood];
    const updatedUserExplicit = { ...(input.userExplicitSelections || {}), mood: true };
    const updatedInput: Partial<SongInput> = {
      moods: updated,
      userExplicitSelections: updatedUserExplicit,
    };
    if (input.reference?.applied) {
      updatedInput.reference = {
        ...input.reference,
        creativeDirection: deriveCreativeDirection({ ...input, ...updatedInput }),
      };
    }
    onChange(updatedInput);
  };

  // Random story
  const handleRandomStory = async () => {
    if (!hasApiKey) {
      setErrorMsg('กรุณาเชื่อมต่อ Gemini API Key ในขั้นตอน 01 ก่อน');
      return;
    }
    setRandomLoading(true);
    setErrorMsg(null);
    try {
      const story = await getRandomStory(input.language, input.customLanguage);
      onChange({ story });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate random story');
    } finally {
      setRandomLoading(false);
    }
  };

  // Expand idea with Deep Creative Story Analysis Engine
  const handleExpandIdea = async () => {
    if (!input.story.trim()) {
      setErrorMsg('กรุณาพิมพ์เรื่องราวเริ่มต้นก่อนกดขยายไอเดีย');
      return;
    }
    if (!hasApiKey) {
      setErrorMsg('กรุณาเชื่อมต่อ Gemini API Key ในขั้นตอน 01 ก่อน');
      return;
    }
    setExpandLoading(true);
    setErrorMsg(null);
    try {
      const res = await expandIdea(input);
      setExpandedPreview(res.expandedIdea);
      setExpandedAnalysis(res.creativeAnalysis || null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to expand and analyze idea');
    } finally {
      setExpandLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-hero-fade">
      {/* Title */}
      <div className="border-b border-white/10 pb-5">
        <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
          STEP 02
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
          02 เรื่องราวและทิศทางเพลง
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          บอก AI ว่าคุณอยากเล่าอะไร และกำหนดทิศทางของเพลง
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STORY TEXTAREA */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-purple-400" />
            Prompt / เรื่องราวที่อยากเล่า
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomStory}
              disabled={randomLoading}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-purple-300 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {randomLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Dices className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span>🎲 สุ่มเรื่องราวทั้งหมด</span>
            </button>

            <button
              type="button"
              onClick={handleExpandIdea}
              disabled={expandLoading || !input.story.trim()}
              className="px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-xs text-cyan-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {expandLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>✨ ช่วยขยายไอเดียนี้</span>
            </button>
          </div>
        </div>

        <textarea
          rows={5}
          value={input.story}
          onChange={(e) => onChange({ story: e.target.value })}
          placeholder="เช่น เรื่องของคนสองคนที่รักกันแต่ต้องจากกันเพราะทางเดินชีวิตต่างกัน แม้เวลาจะผ่านไปนานเท่าไหร่ แต่เมื่อได้ฟังเพลงเดิม รอยยิ้มและแผลในใจยังชัดเจนเสมอ..."
          className="w-full bg-[#12101A] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all leading-relaxed font-kanit"
        />

        <p className="text-xs text-zinc-500">
          ยิ่งให้รายละเอียด เช่น ตัวละคร ฉาก อารมณ์ จุดเปลี่ยน เนื้อเพลงจะยิ่งมีมิติ
        </p>
      </div>

      {/* Active Deep Creative Blueprint Card (when creativeAnalysis is already saved in input) */}
      {input.creativeAnalysis && !expandedPreview && (
        <div className="p-5 rounded-2xl bg-[#130F24] border border-cyan-500/30 shadow-lg space-y-4 animate-hero-fade">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>พิมพ์เขียวเชิงสร้างสรรค์ (Deep Creative Blueprint)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Active & Ready
                  </span>
                </h4>
                <p className="text-xs text-zinc-400">
                  ระบบจะใช้พิมพ์เขียวนี้กำกับการเขียนเนื้อเพลงและพัฒนาการทางอารมณ์ใน Step ถัดไป
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSectionBlueprintView(!showSectionBlueprintView)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>{showSectionBlueprintView ? 'ซ่อนพิมพ์เขียวรายท่อน' : 'ดูพิมพ์เขียวรายท่อน'}</span>
                {showSectionBlueprintView ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => onChange({ creativeAnalysis: undefined })}
                className="px-2.5 py-1.5 rounded-lg hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 transition-all text-xs flex items-center gap-1"
                title="ล้างพิมพ์เขียวเพื่อกลับสู่โหมด Story ปกติ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างพิมพ์เขียว</span>
              </button>
            </div>
          </div>

          {/* Core Message Callout */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-cyan-300">แก่นแท้ของเพลง (Core Message):</span>
              <p className="text-sm text-white mt-0.5 font-medium leading-relaxed font-kanit">
                "{input.creativeAnalysis.coreMessage}"
              </p>
            </div>
          </div>

          {/* Key Motifs & Imagery chips */}
          <div className="flex flex-wrap gap-4 pt-1 text-xs">
            {input.creativeAnalysis.centralHookIdea && (
              <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/30 border border-amber-500/20 px-3 py-1 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Hook: <strong>{input.creativeAnalysis.centralHookIdea}</strong></span>
              </div>
            )}
            {input.creativeAnalysis.keyMotifs && input.creativeAnalysis.keyMotifs.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                  Motifs:
                </span>
                {input.creativeAnalysis.keyMotifs.map((motif, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-200 border border-purple-500/30">
                    {motif}
                  </span>
                ))}
              </div>
            )}
            {input.creativeAnalysis.imageryAnchors && input.creativeAnalysis.imageryAnchors.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Imagery:
                </span>
                {input.creativeAnalysis.imageryAnchors.slice(0, 4).map((anchor, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-200 border border-emerald-500/30">
                    {anchor}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section Blueprint guidance */}
          {showSectionBlueprintView && input.creativeAnalysis.sectionBlueprint && (
            <div className="pt-2 space-y-2 border-t border-white/10 animate-hero-fade">
              <h5 className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Section-by-Section Storytelling Blueprint:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {input.creativeAnalysis.sectionBlueprint.map((sb, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-semibold text-cyan-300 font-mono">[{sb.section}]</span>
                    <p className="text-zinc-300 font-kanit text-[11px] leading-relaxed">{sb.guidance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Idea & Deep Creative Analysis Preview Card */}
      {expandedPreview && (
        <div className="p-6 rounded-2xl bg-[#110D20] border border-purple-500/40 shadow-2xl space-y-5 animate-hero-fade">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                  Deep Creative Story Analysis & Song Concept
                </h4>
                <p className="text-xs text-zinc-400">
                  วิเคราะห์ค้นหาแก่นของเพลง สัญลักษณ์ และพิมพ์เขียวทางอารมณ์ก่อนเริ่มประพันธ์
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setExpandedPreview(null);
                setExpandedAnalysis(null);
              }}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Message if available */}
          {expandedAnalysis?.coreMessage && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/30 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  แก่นแท้ของเพลง (Core Message)
                </span>
                <p className="text-base font-semibold text-white mt-1 leading-snug font-kanit">
                  "{expandedAnalysis.coreMessage}"
                </p>
              </div>
            </div>
          )}

          {/* Expanded Narrative Story */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5 text-purple-400" />
              เรื่องราวและคอนเซปต์เพลงที่ขยายมิติแล้ว (Expanded Premise):
            </span>
            <p className="text-sm text-zinc-200 leading-relaxed font-kanit bg-[#08070D]/80 p-4 rounded-xl border border-white/10 whitespace-pre-wrap">
              {expandedPreview}
            </p>
          </div>

          {/* Detailed Analysis Breakdown Grid */}
          {expandedAnalysis && (
            <div className="space-y-4 pt-1 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {expandedAnalysis.emotionalArc && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                      เส้นทางอารมณ์ (Emotional Arc):
                    </span>
                    <p className="text-zinc-300 font-kanit leading-relaxed">{expandedAnalysis.emotionalArc}</p>
                  </div>
                )}
                {expandedAnalysis.primaryConflict && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      ปมความขัดแย้งหลัก (Primary Conflict):
                    </span>
                    <p className="text-zinc-300 font-kanit leading-relaxed">{expandedAnalysis.primaryConflict}</p>
                  </div>
                )}
                {expandedAnalysis.characterMotivation && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      แรงจูงใจตัวละคร (Motivation):
                    </span>
                    <p className="text-zinc-300 font-kanit leading-relaxed">{expandedAnalysis.characterMotivation}</p>
                  </div>
                )}
                {expandedAnalysis.povLogic && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      ตรรกะมุมมอง (POV Logic):
                    </span>
                    <p className="text-zinc-300 font-kanit leading-relaxed">{expandedAnalysis.povLogic}</p>
                  </div>
                )}
              </div>

              {/* Central Hook & Motifs / Imagery */}
              <div className="space-y-3">
                {expandedAnalysis.centralHookIdea && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center gap-2.5 text-xs">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-amber-300">Central Hook Idea: </span>
                      <span className="text-zinc-200 font-medium font-kanit">{expandedAnalysis.centralHookIdea}</span>
                    </div>
                  </div>
                )}

                {/* Chips for Motifs and Imagery */}
                <div className="flex flex-wrap gap-4 text-xs">
                  {expandedAnalysis.keyMotifs && expandedAnalysis.keyMotifs.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-zinc-400 font-medium flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                        สัญลักษณ์หลัก (Key Motifs):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {expandedAnalysis.keyMotifs.map((motif, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-950/50 text-purple-200 border border-purple-500/30">
                            {motif}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {expandedAnalysis.imageryAnchors && expandedAnalysis.imageryAnchors.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-zinc-400 font-medium flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ภาพและรายละเอียดเฉพาะ (Imagery Anchors):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {expandedAnalysis.imageryAnchors.map((anchor, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-200 border border-emerald-500/30">
                            {anchor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Blueprint list */}
                {expandedAnalysis.sectionBlueprint && expandedAnalysis.sectionBlueprint.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      พิมพ์เขียวการเล่าแต่ละท่อน (Section Blueprint):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {expandedAnalysis.sectionBlueprint.map((sb, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="font-semibold text-cyan-300 font-mono text-[11px]">[{sb.section}]</span>
                          <p className="text-zinc-300 font-kanit text-[11px] mt-0.5 leading-relaxed">{sb.guidance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setExpandedPreview(null);
                setExpandedAnalysis(null);
              }}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({
                  story: expandedPreview,
                  creativeAnalysis: expandedAnalysis || undefined,
                });
                setExpandedPreview(null);
                setExpandedAnalysis(null);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Use This Concept & Blueprint (นำคอนเซปต์และพิมพ์เขียวนี้ไปใช้)</span>
            </button>
          </div>
        </div>
      )}

      {/* INSPIRATION & REFERENCES */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              INSPIRATION & REFERENCES
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              วิเคราะห์เพลงอ้างอิงเพื่อกำหนดทิศทางเพลงของคุณ
            </p>
          </div>
          {input.reference && (
            <button
              type="button"
              onClick={handleClearRef}
              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs text-rose-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>ลบเพลงอ้างอิง</span>
            </button>
          )}
        </div>

        {refError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{refError}</span>
            <button onClick={() => setRefError(null)} className="text-zinc-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input 1: YouTube Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-red-400" />
                ลิงก์ YouTube
              </span>
              {isResolvingYouTube && (
                <span className="text-[10px] text-purple-300 flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  กำลังตรวจสอบ...
                </span>
              )}
            </label>
            <input
              id="reference-youtube-url-input"
              type="text"
              value={youtubeUrlInput}
              onChange={(e) => {
                const val = e.target.value;
                setYoutubeUrlInput(val);
                if (!val.trim()) {
                  setResolvedMeta(null);
                } else if (extractYouTubeVideoId(val.trim())) {
                  handleResolveYouTube(val);
                }
              }}
              onBlur={() => {
                if (youtubeUrlInput.trim()) {
                  handleResolveYouTube(youtubeUrlInput);
                }
              }}
              placeholder="วางลิงก์เพลงจาก YouTube (เช่น https://www.youtube.com/watch?v=...)"
              className="w-full bg-[#12101A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-all font-mono"
            />
          </div>

          {/* Input 2: Song Title / Artist */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-purple-400" />
              ชื่อเพลง / ศิลปิน
            </label>
            <input
              id="reference-song-text-input"
              type="text"
              value={songTextInput}
              onChange={(e) => setSongTextInput(e.target.value)}
              placeholder="เช่น ชื่อเพลง - ศิลปิน"
              className="w-full bg-[#12101A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all font-kanit"
            />
          </div>
        </div>

        {/* Reference Verification Status Card (STRICT VERIFIED REFERENCE ONLY) */}
        {resolvedMeta && (
          resolvedMeta.verified && resolvedMeta.title ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs space-y-1.5 animate-hero-fade">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ✓ ยืนยันเพลงแล้ว
                </span>
                {resolvedMeta.canonicalUrl && (
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    Canonical URL
                  </span>
                )}
              </div>
              <div className="pl-5.5 space-y-0.5">
                <div className="text-zinc-100 font-semibold text-sm">
                  {resolvedMeta.title}
                </div>
                {(resolvedMeta.channel || resolvedMeta.artist) && (
                  <div className="text-zinc-400 text-xs">
                    {resolvedMeta.channel || resolvedMeta.artist}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-2 animate-hero-fade">
              <div className="flex items-center justify-between text-amber-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  ⚠ ไม่สามารถยืนยันเพลงนี้ได้
                </span>
              </div>
              <div className="text-zinc-300 text-xs pl-5.5">
                ไม่สามารถยืนยันข้อมูลของวิดีโอนี้ได้ จึงไม่วิเคราะห์เพื่อป้องกันข้อมูลผิด
              </div>
              <div className="pl-5.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const songInputEl = document.getElementById('reference-song-text-input');
                    if (songInputEl) songInputEl.focus();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs cursor-pointer transition-all"
                >
                  กรอกชื่อเพลง / ศิลปินเอง
                </button>
              </div>
            </div>
          )
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAnalyzeRef}
            disabled={analyzingRef || (!youtubeUrlInput.trim() && !songTextInput.trim())}
            className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-xs font-medium text-purple-200 hover:text-white transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {analyzingRef ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                <span>กำลังวิเคราะห์เพลงอ้างอิง...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>วิเคราะห์เพลง</span>
              </>
            )}
          </button>
        </div>

        {/* Analyzed Reference Result Profile */}
        {input.reference && (input.reference.analysis || input.reference.title) && (
          <div className="mt-3 p-4 rounded-xl bg-[#12101A] border border-purple-500/20 space-y-3.5 animate-hero-fade">
            {/* Guidance Profile Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Guidance Profile (แนวทางจากเพลงอ้างอิง)
              </span>
              <div className="flex items-center gap-2">
                {input.reference.identityVerified && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                    ✓ Identity Verified
                  </span>
                )}
                <span className="text-[10px] text-zinc-500 uppercase font-mono">
                  {input.reference.sourceType === 'youtube' ? 'YouTube Ref' : 'Text Ref'}
                </span>
              </div>
            </div>

            {/* Identity Info Card */}
            {(cleanText(input.reference.title) || cleanText(input.reference.artist) || cleanText(input.reference.channel)) && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-semibold text-zinc-100 truncate">
                    {cleanText(input.reference.title) || 'เพลงอ้างอิงที่ระบุ'}
                  </div>
                  {(cleanText(input.reference.artist) || cleanText(input.reference.channel)) && (
                    <div className="text-xs text-zinc-400 truncate">
                      {cleanText(input.reference.artist) || cleanText(input.reference.channel)}
                    </div>
                  )}
                </div>
                {cleanText(input.reference.canonicalUrl) && (
                  <a
                    href={input.reference.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline font-mono shrink-0"
                  >
                    ดูต้นฉบับ
                  </a>
                )}
              </div>
            )}

            {/* Analysis Verification Status Notice */}
            {input.reference.analysisVerified || input.reference.sourceProvenance === 'youtube_media' ? (
              <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs flex items-center justify-between gap-3 text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">✓ วิเคราะห์จากเพลงจริง (Audio / Video Analyzed)</span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                  YouTube Media
                </span>
              </div>
            ) : input.reference.mediaAnalysisStatus === 'unavailable' || input.reference.confidence === 'inferred' ? (
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-xs">
                    <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>ระบุตัวตนเพลงได้แล้ว (วิเคราะห์จากบริบททางดนตรี)</span>
                  </div>
                  <span className="text-[10px] bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-medium">
                    {input.reference.sourceType === 'youtube' ? 'YouTube Metadata' : 'User Reference'}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed pl-5">
                  หากต้องการระบุ BPM, ลักษณะเสียงร้อง หรือเครื่องดนตรีเฉพาะ สามารถกรอกเพิ่มเติมในส่วน User-Provided Details ด้านล่าง
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs flex items-center gap-2 text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>⚠ ไม่สามารถวิเคราะห์เสียงจากวิดีโอนี้ได้ สามารถระบุข้อมูลเพิ่มเติมได้ในส่วน User-Provided Details</span>
              </div>
            )}

            {input.reference.warningMessage && cleanText(input.reference.warningMessage) && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{cleanText(input.reference.warningMessage)}</span>
              </div>
            )}

            {/* Musical Characteristics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Reference Genre */}
              {(() => {
                const genres = input.reference.userOverrides?.genre
                  ? [input.reference.userOverrides.genre]
                  : cleanArray(input.reference.analysis?.genre);
                const isMediaVerified = input.reference.analysisVerified || input.reference.sourceProvenance === 'youtube_media';
                return (
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[10px]">Reference Genre:</span>
                      {input.reference.userOverrides?.genre ? (
                        <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          ระบุโดยผู้ใช้
                        </span>
                      ) : isMediaVerified ? (
                        <span className="text-[9px] text-emerald-400/90 font-medium">✓ Verified Media</span>
                      ) : (
                        <span className="text-[9px] text-purple-400/80">Inferred</span>
                      )}
                    </div>
                    <div className="text-zinc-200 font-medium">
                      {genres.length > 0 ? genres.join(', ') : 'ไม่สามารถระบุได้จากข้อมูลที่เข้าถึง'}
                    </div>
                  </div>
                );
              })()}

              {/* Reference Mood */}
              {(() => {
                const moods = cleanArray(input.reference.analysis?.mood);
                const isMediaVerified = input.reference.analysisVerified || input.reference.sourceProvenance === 'youtube_media';
                return (
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[10px]">Reference Mood:</span>
                      {isMediaVerified ? (
                        <span className="text-[9px] text-emerald-400/90 font-medium">✓ Verified Media</span>
                      ) : (
                        <span className="text-[9px] text-purple-400/80">Inferred</span>
                      )}
                    </div>
                    <div className="text-zinc-200 font-medium">
                      {moods.length > 0 ? moods.join(', ') : 'ไม่สามารถระบุได้จากข้อมูลที่เข้าถึง'}
                    </div>
                  </div>
                );
              })()}

              {/* Reference Tempo */}
              {(() => {
                const userTempo = cleanText(input.reference.userOverrides?.tempo);
                const inferredTempo = cleanText(input.reference.analysis?.tempo);
                const isMediaVerified = input.reference.analysisVerified || input.reference.sourceProvenance === 'youtube_media';
                return (
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[10px]">Reference Tempo / BPM:</span>
                      {userTempo ? (
                        <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          ระบุโดยผู้ใช้
                        </span>
                      ) : isMediaVerified ? (
                        <span className="text-[9px] text-emerald-400/90 font-medium">✓ Verified Audio</span>
                      ) : (
                        <span className="text-[9px] text-zinc-500">Unverified Audio</span>
                      )}
                    </div>
                    <div className={userTempo ? "text-emerald-200 font-medium" : (isMediaVerified ? "text-emerald-200 font-medium" : "text-zinc-300 font-medium")}>
                      {userTempo || inferredTempo || 'ไม่สามารถระบุได้จากข้อมูลที่เข้าถึง'}
                    </div>
                  </div>
                );
              })()}

              {/* Reference Vocal */}
              {(() => {
                const userVocal = cleanText(input.reference.userOverrides?.vocal);
                const inferredVocal = cleanText(input.reference.analysis?.vocal);
                const isMediaVerified = input.reference.analysisVerified || input.reference.sourceProvenance === 'youtube_media';
                return (
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[10px]">Reference Vocal:</span>
                      {userVocal ? (
                        <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          ระบุโดยผู้ใช้
                        </span>
                      ) : isMediaVerified ? (
                        <span className="text-[9px] text-emerald-400/90 font-medium">✓ Verified Audio</span>
                      ) : (
                        <span className="text-[9px] text-zinc-500">Unverified Audio</span>
                      )}
                    </div>
                    <div className={userVocal ? "text-emerald-200 font-medium" : (isMediaVerified ? "text-emerald-200 font-medium" : "text-zinc-300 font-medium")}>
                      {userVocal || inferredVocal || 'ไม่สามารถระบุได้จากข้อมูลที่เข้าถึง'}
                    </div>
                  </div>
                );
              })()}

              {/* Reference Instrumentation */}
              {(() => {
                const userInstr = cleanText(input.reference.userOverrides?.instrumentation);
                const inferredInstr = cleanArray(input.reference.analysis?.instrumentation);
                const isMediaVerified = input.reference.analysisVerified || input.reference.sourceProvenance === 'youtube_media';
                return (
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 col-span-1 sm:col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[10px]">Instrumentation:</span>
                      {userInstr ? (
                        <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          ระบุโดยผู้ใช้
                        </span>
                      ) : isMediaVerified ? (
                        <span className="text-[9px] text-emerald-400/90 font-medium">✓ Verified Sound Palette</span>
                      ) : (
                        <span className="text-[9px] text-zinc-500">Inferred Context</span>
                      )}
                    </div>
                    <div className={userInstr ? "text-emerald-200 font-medium" : "text-zinc-300 font-medium"}>
                      {userInstr || (inferredInstr.length > 0 ? inferredInstr.join(', ') : 'ไม่สามารถระบุได้จากข้อมูลที่เข้าถึง')}
                    </div>
                  </div>
                );
              })()}

              {/* Overall Direction */}
              {cleanText(input.reference.analysis?.overallDirection) && (
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 col-span-1 sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[10px]">Overall Direction / Inspiration:</span>
                    <span className="text-[9px] text-purple-400/80">Reference DNA</span>
                  </div>
                  <div className="text-purple-200 font-medium">
                    {cleanText(input.reference.analysis?.overallDirection)}
                  </div>
                </div>
              )}
            </div>

            {/* USER MANUAL INPUT: USER-PROVIDED REFERENCE DETAILS */}
            <div className="p-3.5 rounded-xl bg-purple-950/15 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowUserOverrideForm(!showUserOverrideForm)}
                  className="text-xs font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>ข้อมูลอ้างอิงที่ระบุเพิ่มเติมโดยผู้ใช้ (USER-PROVIDED REFERENCE DETAILS)</span>
                  <span className="text-[10px] text-purple-400 font-normal">
                    {showUserOverrideForm ? '▲ ซ่อน' : '▼ แก้ไข/ระบุเพิ่ม'}
                  </span>
                </button>
              </div>

              {showUserOverrideForm && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-hero-fade">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        แนวเพลง / สไตล์ (Genre / Style)
                      </label>
                      <input
                        type="text"
                        value={userOverrideGenre}
                        onChange={(e) => setUserOverrideGenre(e.target.value)}
                        placeholder="เช่น Thai R&B, Neo Soul"
                        className="w-full bg-[#12101A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        ลักษณะเสียงร้อง (Vocal Character)
                      </label>
                      <input
                        type="text"
                        value={userOverrideVocal}
                        onChange={(e) => setUserOverrideVocal(e.target.value)}
                        placeholder="เช่น เสียงชาย นุ่ม ทุ้ม มีลูกเอื้อน R&B"
                        className="w-full bg-[#12101A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        เครื่องดนตรีหลัก (Instrumentation)
                      </label>
                      <input
                        type="text"
                        value={userOverrideInstr}
                        onChange={(e) => setUserOverrideInstr(e.target.value)}
                        placeholder="เช่น Rhodes Piano, Soft Drums, Bass"
                        className="w-full bg-[#12101A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        ความเร็ว / จังหวะ (Tempo / BPM)
                      </label>
                      <input
                        type="text"
                        value={userOverrideTempo}
                        onChange={(e) => setUserOverrideTempo(e.target.value)}
                        placeholder="เช่น ช้าปานกลาง (78 BPM)"
                        className="w-full bg-[#12101A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveUserOverrides}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-purple-300" />
                      <span>บันทึกข้อมูลอ้างอิงเพิ่มเติม</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action & Status */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {input.reference.applied ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs space-y-1.5 w-full">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Reference Active: {cleanText(input.reference.title) || cleanText(input.reference.source)}
                          {(cleanText(input.reference.artist) || cleanText(input.reference.channel)) ? ` (${cleanText(input.reference.artist) || cleanText(input.reference.channel)})` : ''}
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/40">
                        Creative Direction Applied
                      </span>
                    </div>

                    {/* Applied Attributes List */}
                    <div className="pt-1 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      <div className="bg-black/40 px-2 py-1 rounded border border-emerald-500/20">
                        <span className="text-zinc-400 text-[10px] block">Genre:</span>
                        <span className="text-emerald-200 font-medium truncate block">
                          {input.genres?.join(', ') || 'Auto'}
                        </span>
                      </div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-emerald-500/20">
                        <span className="text-zinc-400 text-[10px] block">Mood:</span>
                        <span className="text-emerald-200 font-medium truncate block">
                          {input.moods?.join(', ') || 'Auto'}
                        </span>
                      </div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-emerald-500/20">
                        <span className="text-zinc-400 text-[10px] block">Tempo / BPM:</span>
                        <span className="text-emerald-200 font-medium truncate block">
                          {input.tempo || (input.bpm ? `${input.bpm} BPM` : 'Auto')}
                        </span>
                      </div>
                      <div className="bg-black/40 px-2 py-1 rounded border border-emerald-500/20">
                        <span className="text-zinc-400 text-[10px] block">Structure:</span>
                        <span className="text-emerald-200 font-medium truncate block" title={input.structure?.join(' -> ')}>
                          {input.structure ? `${input.structure.length} Sections` : 'Auto'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400">
                    กดปุ่ม "นำไปใช้กับเพลง" เพื่อนำผลวิเคราะห์ทั้งหมดไปใช้เป็น Creative Direction
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyRef}
                  className={
                    input.reference.applied
                      ? "px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-xs font-medium text-emerald-300 flex items-center gap-1.5 cursor-default shrink-0"
                      : "px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/40 text-xs font-medium text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  }
                >
                  {input.reference.applied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>✓ นำไปใช้เป็น Creative Direction แล้ว</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span>✨ นำไปใช้กับเพลง</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GENRE */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <Music2 className="w-4 h-4 text-purple-400" />
          แนวเพลง (เลือกได้หลายอัน)
        </label>

        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => {
            const isSelected = input.genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                    : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                {g}
              </button>
            );
          })}

          {customGenreItems.map((cg) => {
            const isSelected = input.genres.includes(cg);
            return (
              <div
                key={`custom-g-${cg}`}
                onClick={() => toggleCustomGenre(cg)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                    : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                <span>{cg}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCustomGenre(cg);
                  }}
                  className="text-zinc-400 hover:text-rose-400 transition-colors ml-0.5 p-0.5 rounded-full"
                  title="ลบออก"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <input
            type="text"
            value={customGenreInputText}
            onChange={(e) => setCustomGenreInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomGenre();
              }
            }}
            onBlur={() => handleAddCustomGenre()}
            placeholder="หรือพิมพ์แนวเพลงเพิ่มเติม (เช่น Synthpop, Hyperpop, Thai Dream Pop)... แล้วกด Enter"
            className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* MOOD */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-purple-400" />
          อารมณ์เพลง (เลือกได้หลายอัน)
        </label>

        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = input.moods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMood(m)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                    : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                {m}
              </button>
            );
          })}

          {customMoodItems.map((cm) => {
            const isSelected = input.moods.includes(cm);
            return (
              <div
                key={`custom-m-${cm}`}
                onClick={() => toggleCustomMood(cm)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                    : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                <span>{cm}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCustomMood(cm);
                  }}
                  className="text-zinc-400 hover:text-rose-400 transition-colors ml-0.5 p-0.5 rounded-full"
                  title="ลบออก"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <input
            type="text"
            value={customMoodInputText}
            onChange={(e) => setCustomMoodInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomMood();
              }
            }}
            onBlur={() => handleAddCustomMood()}
            placeholder="พิมพ์อารมณ์เพลงเพิ่มเติม (เช่น คิดถึงแบบอบอุ่นปนเหงา)... แล้วกด Enter"
            className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          ภาษาของเนื้อเพลง
        </label>

        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = input.language === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onChange({ language: lang })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>

        {input.language === 'Custom' && (
          <div className="pt-2">
            <input
              type="text"
              value={input.customLanguage || ''}
              onChange={(e) => onChange({ customLanguage: e.target.value })}
              placeholder="ระบุภาษา เช่น คำเมือง (Northern Thai), ภาษาอีสาน..."
              className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>

      {/* TONE & STYLE (2 Clean Dropdowns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Word Tone */}
        <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            โทนคำ (Word Tone)
          </label>
          <select
            value={input.wordTone}
            onChange={(e) => onChange({ wordTone: e.target.value as WordTone })}
            className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-kanit"
          >
            {WORD_TONE_OPTIONS.map((tone) => (
              <option key={tone} value={tone} className="bg-[#0D0B14] text-white">
                {tone}
              </option>
            ))}
          </select>
        </div>

        {/* Language Style */}
        <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            วิธีใช้ภาษา (Language Style)
          </label>
          <select
            value={input.languageStyle}
            onChange={(e) =>
              onChange({ languageStyle: e.target.value as LanguageStyle })
            }
            className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-kanit"
          >
            {LANGUAGE_STYLE_OPTIONS.map((style) => (
              <option key={style} value={style} className="bg-[#0D0B14] text-white">
                {style}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* POV (มุมมองการเล่าเรื่อง) */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            มุมมองการเล่าเรื่อง (POV)
          </label>
          <span className="text-[11px] text-zinc-400">
            เลือกว่าผู้เล่าจะเล่าเรื่องจากมุมมองใด
          </span>
        </div>
        <select
          value={input.pointOfView || 'auto'}
          onChange={(e) =>
            onChange({ pointOfView: e.target.value as PointOfView })
          }
          className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-kanit"
        >
          {POV_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0D0B14] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* RHYME */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          รูปแบบสัมผัส (Rhyme Style)
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {RHYME_OPTIONS.map((rhyme) => {
            const isSelected = input.rhymeStyle === rhyme;
            return (
              <button
                key={rhyme}
                type="button"
                onClick={() => onChange({ rhymeStyle: rhyme })}
                className={`p-3 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/50 border-purple-500 text-purple-200'
                    : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {rhyme}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. TEMPO & RHYTHM (จังหวะ / ความเร็วเพลง) */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-white/5 pb-3">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-400" />
            จังหวะ / ความเร็วเพลง
          </label>
        </div>

        {/* ความเร็วเพลง (Tempo) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-medium text-zinc-300">
              ความเร็วเพลง (เลือกได้ 1 ค่า)
            </span>
            <button
              type="button"
              onClick={() => setShowCustomBpmInput(!showCustomBpmInput)}
              className={`px-3 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 border cursor-pointer ${
                showCustomBpmInput
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>⚙ กำหนด BPM เอง</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPO_PRESETS.map((preset) => {
              const isSelected =
                !showCustomBpmInput &&
                (input.tempo === preset.label || input.bpm === preset.defaultBpm);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectTempo(preset)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/50 border-purple-500 text-purple-200'
                      : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom BPM Input Field */}
          {showCustomBpmInput && (
            <div className="p-4 rounded-xl bg-[#12101A] border border-purple-500/30 space-y-2 animate-hero-fade">
              <label className="text-xs font-medium text-purple-300 flex items-center gap-2">
                <span>กำหนดค่า BPM เอง (Beats Per Minute)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={40}
                  max={240}
                  value={input.bpm || 90}
                  onChange={(e) => handleCustomBpmChange(Number(e.target.value))}
                  className="w-32 bg-[#08070D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <span className="text-xs text-zinc-400">
                  BPM (เช่น 96 = จังหวะปานกลาง, 128 = EDM / Dance)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ลักษณะจังหวะ (Rhythm Characteristics) */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-medium text-zinc-300">
              ลักษณะจังหวะ (เลือกได้หลายค่า)
            </span>
            {!isAddingRhythm && (
              <button
                type="button"
                onClick={() => setIsAddingRhythm(true)}
                className="px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ เพิ่ม</span>
              </button>
            )}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {/* Preset Chips */}
            {RHYTHM_PRESETS.map((item) => {
              const isSelected = currentRhythms.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleRhythm(item)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                      : 'bg-[#12101A] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                  {item}
                </button>
              );
            })}

            {/* User-added Custom Chips */}
            {currentRhythms
              .filter((r) => !RHYTHM_PRESETS.includes(r))
              .map((customItem) => (
                <span
                  key={customItem}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border bg-purple-600/30 border-purple-500 text-purple-200 flex items-center gap-1.5"
                >
                  <span>{customItem}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRhythm(customItem)}
                    className="text-purple-300 hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>

          {/* Add Custom Rhythm Input */}
          {isAddingRhythm && (
            <div className="flex items-center gap-2 pt-2 animate-hero-fade">
              <input
                type="text"
                value={customRhythmText}
                onChange={(e) => setCustomRhythmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRhythm();
                  }
                }}
                placeholder="ระบุลักษณะจังหวะ เช่น ฟังก์กี้, กรู๊ฟแน่นๆ, อคูสติกเบาๆ..."
                className="flex-1 bg-[#12101A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomRhythm}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                เพิ่ม
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingRhythm(false);
                  setCustomRhythmText('');
                }}
                className="px-3 py-2 text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. VOCAL TYPE (เสียงร้อง) */}
      <div className="bg-[#0D0B14] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-purple-400" />
          เสียงร้อง
        </label>

        <select
          value={input.vocalType || 'หญิง'}
          onChange={(e) => onChange({ vocalType: e.target.value })}
          className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-kanit cursor-pointer"
        >
          {VOCAL_OPTIONS.map((vocal) => (
            <option key={vocal} value={vocal} className="bg-[#0D0B14] text-white">
              {vocal}
            </option>
          ))}
        </select>

        {input.vocalType === 'กำหนดเอง' && (
          <div className="space-y-2 pt-1 animate-hero-fade">
            <label className="text-xs font-medium text-zinc-300">
              รายละเอียดเสียงร้อง
            </label>
            <input
              type="text"
              value={input.vocalCustomDescription || ''}
              onChange={(e) =>
                onChange({ vocalCustomDescription: e.target.value })
              }
              placeholder="เช่น เสียงหญิงนุ่ม ๆ, เสียงชายทุ้มอบอุ่น, ร้องแบบ soulful..."
              className="w-full bg-[#12101A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>

      {/* Next Step Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-xl shadow-purple-950/40 transition-all flex items-center gap-2"
        >
          <span>ไปขั้นตอน 03 โครงสร้างเพลง</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
