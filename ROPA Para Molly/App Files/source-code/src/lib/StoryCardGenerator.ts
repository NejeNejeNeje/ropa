/**
 * StoryCardGenerator — generates a branded 1080×1920 ROPA story card.
 * Uses an offscreen HTMLCanvasElement (browser-only).
 */

interface StoryCardOptions {
    imageUrl: string;
    userName: string;
    caption: string;
    city: string;
    country: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line !== '') {
            ctx.fillText(line.trim(), x, currentY);
            line = word + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
}

export async function generateStoryCard(opts: StoryCardOptions): Promise<File> {
    const W = 1080;
    const H = 1920;
    const PAD = 72;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // ── Background ────────────────────────────────────────────────
    // Try to load the post image; fall back to a dark gradient
    try {
        const img = await loadImage(opts.imageUrl);
        // Fill canvas with image, cover-fit
        const scale = Math.max(W / img.width, H / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
    } catch {
        // Fallback gradient background
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0f0f0f');
        bg.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
    }

    // ── Gradient overlays ─────────────────────────────────────────
    // Top vignette (for logo)
    const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.35);
    topGrad.addColorStop(0, 'rgba(0,0,0,0.75)');
    topGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, H * 0.35);

    // Bottom overlay (for text)
    const botGrad = ctx.createLinearGradient(0, H * 0.5, 0, H);
    botGrad.addColorStop(0, 'rgba(0,0,0,0)');
    botGrad.addColorStop(0.4, 'rgba(0,0,0,0.7)');
    botGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);

    // ── ROPA wordmark (top-left) ───────────────────────────────────
    ctx.font = 'bold 96px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = '#D4AF37'; // ROPA gold
    ctx.fillText('ROPA', PAD, PAD + 80);

    // Tagline under wordmark
    ctx.font = '400 36px system-ui, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Trade Clothes While Traveling', PAD, PAD + 140);

    // ── User info ─────────────────────────────────────────────────
    const textStartY = H * 0.68;

    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(opts.userName, PAD, textStartY);

    ctx.font = '400 40px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(`📍 ${opts.city}, ${opts.country}`, PAD, textStartY + 68);

    // ── Caption ───────────────────────────────────────────────────
    ctx.font = '400 44px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const captionY = textStartY + 160;
    wrapText(ctx, opts.caption, PAD, captionY, W - PAD * 2, 60);

    // ── Footer ────────────────────────────────────────────────────
    ctx.font = '500 34px system-ui, sans-serif';
    ctx.fillStyle = '#D4AF37';
    ctx.fillText('ropa-trade.vercel.app', PAD, H - PAD - 20);

    // ── Export ────────────────────────────────────────────────────
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Canvas export failed')); return; }
            resolve(new File([blob], `ropa-story-${Date.now()}.png`, { type: 'image/png' }));
        }, 'image/png');
    });
}
