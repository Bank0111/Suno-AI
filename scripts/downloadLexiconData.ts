/**
 * scripts/downloadLexiconData.ts
 *
 * PURPOSE:
 * server/lexicon/data/languages/<lang>/vocabulary.json (and vocabulary.validated.json)
 * are too large to commit to Git (GitHub's 100MB per-file limit — the Spanish
 * file alone was 325MB). They are listed in .gitignore, so on a fresh clone
 * (like Render's build environment) these files simply don't exist.
 *
 * lexiconEngine.ts silently returns an empty vocabulary array when the file
 * is missing (no crash, no error — just 0 words for all 14 languages). This
 * script runs BEFORE every build to download the pre-packaged data from a
 * GitHub Release asset and restore it into place, so Render always has the
 * full multi-language lexicon data available at runtime.
 *
 * Safe to run repeatedly: if the target folder already has the data
 * (e.g. local dev machine), it skips the download entirely.
 */

import { existsSync, mkdirSync, createWriteStream, rmSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import AdmZip from 'adm-zip';

const RELEASE_ZIP_URL =
  'https://github.com/Bank0111/Suno-AI/releases/download/lexicon-data-v1/lexicon-languages-data.zip';

const TARGET_DIR = path.resolve('server/lexicon/data/languages');
const TMP_ZIP_PATH = path.resolve('.lexicon-data-download.zip');

// A quick heuristic marker file check: if Thai vocabulary already exists,
// assume the full dataset is present (this is the case on local dev machines
// where the data was never removed) and skip the download.
const MARKER_FILE = path.join(TARGET_DIR, 'th', 'vocabulary.json');

async function downloadFile(url: string, destPath: string): Promise<void> {
  console.log(`[LexiconDataDownload] Fetching: ${url}`);

  const response = await fetch(url, { redirect: 'follow' });

  if (!response.ok || !response.body) {
    throw new Error(
      `[LexiconDataDownload] Failed to download lexicon data. HTTP ${response.status} ${response.statusText}`
    );
  }

  const fileStream = createWriteStream(destPath);
  // @ts-ignore - Node's fetch Response.body is a web ReadableStream; pipeline
  // accepts it via Readable.fromWeb in Node 18+, but most Node 18/20 runtimes
  // also support piping a web stream directly through pipeline with the
  // Readable.fromWeb adapter.
  const { Readable } = await import('node:stream');
  // @ts-ignore
  const nodeReadable = Readable.fromWeb(response.body);
  await pipeline(nodeReadable, fileStream);

  console.log('[LexiconDataDownload] Download complete.');
}

async function main() {
  if (existsSync(MARKER_FILE)) {
    console.log(
      '[LexiconDataDownload] Lexicon vocabulary data already present locally. Skipping download.'
    );
    return;
  }

  console.log(
    '[LexiconDataDownload] Lexicon vocabulary data not found (expected on a fresh clone / CI / Render build). Downloading from GitHub Release...'
  );

  mkdirSync(TARGET_DIR, { recursive: true });

  try {
    await downloadFile(RELEASE_ZIP_URL, TMP_ZIP_PATH);

    console.log('[LexiconDataDownload] Extracting archive...');
    const zip = new AdmZip(TMP_ZIP_PATH);
    zip.extractAllTo(TARGET_DIR, /* overwrite */ true);

    console.log(
      `[LexiconDataDownload] Extraction complete. Lexicon data restored to ${TARGET_DIR}`
    );
  } catch (err: any) {
    console.error(
      `[LexiconDataDownload] ERROR: Could not download/extract lexicon data: ${err?.message || err}`
    );
    console.error(
      '[LexiconDataDownload] Build will continue, but vocabulary lists for all languages will be EMPTY at runtime.'
    );
    // Do NOT throw — allow the build to continue even if this step fails,
    // since the site can still run (with empty vocabulary as a soft-degraded
    // fallback) rather than failing the entire deploy.
  } finally {
    if (existsSync(TMP_ZIP_PATH)) {
      rmSync(TMP_ZIP_PATH, { force: true });
    }
  }
}

main();
