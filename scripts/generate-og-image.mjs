import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Let's create an elegant dark cinematic SVG with crisp typography and glowing ambient effects
  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#08070D" />
        <stop offset="40%" stop-color="#0D0A18" />
        <stop offset="100%" stop-color="#06050A" />
      </linearGradient>

      <radialGradient id="purple-glow" cx="20%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#9333EA" stop-opacity="0.28" />
        <stop offset="60%" stop-color="#7E22CE" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#08070D" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="cyan-glow" cx="80%" cy="70%" r="55%">
        <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.22" />
        <stop offset="50%" stop-color="#0891B2" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#08070D" stop-opacity="0" />
      </radialGradient>

      <linearGradient id="text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="50%" stop-color="#F3E8FF" />
        <stop offset="100%" stop-color="#E0F2FE" />
      </linearGradient>

      <linearGradient id="tag-border" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#A855F7" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.6" />
      </linearGradient>

      <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#A855F7" stop-opacity="0" />
        <stop offset="30%" stop-color="#A855F7" stop-opacity="0.7" />
        <stop offset="70%" stop-color="#06B6D4" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#06B6D4" stop-opacity="0" />
      </linearGradient>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg-grad)" />

    <!-- Ambient Glows -->
    <rect width="${width}" height="${height}" fill="url(#purple-glow)" />
    <rect width="${width}" height="${height}" fill="url(#cyan-glow)" />

    <!-- Subtle Tech Grid / Wave Points -->
    <g opacity="0.12" stroke="#FFFFFF" stroke-width="1">
      <line x1="100" y1="0" x2="100" y2="${height}" stroke-dasharray="4,8" />
      <line x1="1100" y1="0" x2="1100" y2="${height}" stroke-dasharray="4,8" />
      <line x1="0" y1="530" x2="${width}" y2="530" stroke-dasharray="4,8" />
    </g>

    <!-- Glowing Sound Waveform Bars (Decorative, Minimal) -->
    <g opacity="0.35" transform="translate(100, 390)">
      <rect x="0" y="30" width="3" height="40" rx="1.5" fill="#A855F7" />
      <rect x="10" y="20" width="3" height="60" rx="1.5" fill="#A855F7" />
      <rect x="20" y="10" width="3" height="80" rx="1.5" fill="#C084FC" />
      <rect x="30" y="25" width="3" height="50" rx="1.5" fill="#C084FC" />
      <rect x="40" y="35" width="3" height="30" rx="1.5" fill="#818CF8" />
      <rect x="50" y="15" width="3" height="70" rx="1.5" fill="#818CF8" />
      <rect x="60" y="5" width="3" height="90" rx="1.5" fill="#38BDF8" />
      <rect x="70" y="25" width="3" height="50" rx="1.5" fill="#38BDF8" />
      <rect x="80" y="35" width="3" height="30" rx="1.5" fill="#22D3EE" />
      <rect x="90" y="40" width="3" height="20" rx="1.5" fill="#22D3EE" />
    </g>

    <g opacity="0.35" transform="translate(1000, 390)">
      <rect x="0" y="40" width="3" height="20" rx="1.5" fill="#A855F7" />
      <rect x="10" y="30" width="3" height="40" rx="1.5" fill="#A855F7" />
      <rect x="20" y="15" width="3" height="70" rx="1.5" fill="#C084FC" />
      <rect x="30" y="5" width="3" height="90" rx="1.5" fill="#C084FC" />
      <rect x="40" y="20" width="3" height="60" rx="1.5" fill="#818CF8" />
      <rect x="50" y="30" width="3" height="40" rx="1.5" fill="#818CF8" />
      <rect x="60" y="10" width="3" height="80" rx="1.5" fill="#38BDF8" />
      <rect x="70" y="25" width="3" height="50" rx="1.5" fill="#38BDF8" />
      <rect x="80" y="35" width="3" height="30" rx="1.5" fill="#22D3EE" />
      <rect x="90" y="42" width="3" height="16" rx="1.5" fill="#22D3EE" />
    </g>

    <!-- Top Badge / Pill -->
    <g transform="translate(450, 130)">
      <rect x="0" y="0" width="300" height="38" rx="19" fill="#140F27" stroke="url(#tag-border)" stroke-width="1.5" />
      <circle cx="24" cy="19" r="4" fill="#A855F7" filter="url(#glow)" />
      <text x="40" y="24" fill="#D8B4FE" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="3">AI SONGWRITING STUDIO</text>
    </g>

    <!-- Main Title -->
    <text x="600" y="280" text-anchor="middle" fill="url(#text-grad)" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" letter-spacing="4">
      INTELLIGENT AI SONG WRITER
    </text>

    <!-- Accent Divider Line -->
    <line x1="380" y1="325" x2="820" y2="325" stroke="url(#line-grad)" stroke-width="2.5" />

    <!-- Subtitle -->
    <text x="600" y="380" text-anchor="middle" fill="#A1A1AA" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="400" letter-spacing="1">
      Turn your story into a song.
    </text>

    <!-- Thai Tagline -->
    <text x="600" y="428" text-anchor="middle" fill="#93C5FD" font-family="Kanit, system-ui, -apple-system, sans-serif" font-size="20" font-weight="300" letter-spacing="0.5" opacity="0.9">
      เปลี่ยนเรื่องราว ความรู้สึก และไอเดียของคุณให้กลายเป็นเพลงด้วย AI
    </text>

    <!-- Bottom Footer Brand / Domain -->
    <g transform="translate(600, 555)">
      <text x="0" y="0" text-anchor="middle" fill="#71717A" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="500" letter-spacing="2">
        ai-song-writer.netlify.app
      </text>
    </g>
  </svg>
  `;

  // Check if Base Image exists to subtly blend into background if desired, or render crisp SVG
  const baseImagePath = path.join(process.cwd(), 'src/assets/images/Base Image.png');
  let compositeLayers = [];

  if (fs.existsSync(baseImagePath)) {
    const resizedHero = await sharp(baseImagePath)
      .resize(width, height, { fit: 'cover' })
      .modulate({ brightness: 0.35, saturation: 1.2 })
      .toBuffer();

    // Composite hero background + SVG overlay
    await sharp(resizedHero)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        }
      ])
      .png({ quality: 95 })
      .toFile(path.join(process.cwd(), 'public/og-image.png'));
  } else {
    await sharp(Buffer.from(svgOverlay))
      .png({ quality: 95 })
      .toFile(path.join(process.cwd(), 'public/og-image.png'));
  }

  console.log('og-image.png generated successfully at 1200x630!');
}

generateOgImage().catch(console.error);
