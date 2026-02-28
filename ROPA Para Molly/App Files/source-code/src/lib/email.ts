/**
 * ROPA — Transactional Email Service (optional-wired)
 *
 * Activated automatically when RESEND_API_KEY is present in env vars.
 * Without the key, emails are logged to console (dev mode) — zero crash risk.
 *
 * Molly setup: add RESEND_API_KEY + EMAIL_FROM in Vercel → emails flow.
 */

// ─── Core Sender ────────────────────────────────────────────

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[EMAIL] (dry-run) To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'ROPA <noreply@ropa.trade>',
                to,
                subject,
                html,
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`[EMAIL] Send failed (${res.status}): ${body}`);
        }
    } catch (err) {
        console.error('[EMAIL] Send error:', err);
    }
}

// ─── Branded Wrapper ────────────────────────────────────────

function wrap(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#13131a;border-radius:16px;border:1px solid rgba(200,168,107,0.15);overflow:hidden;">
  <!-- Header -->
  <tr><td style="padding:32px 40px 16px;text-align:center;">
    <div style="font-size:28px;font-weight:800;color:#c8a86b;letter-spacing:1px;">ROPA</div>
    <div style="font-size:12px;color:#6b7280;margin-top:4px;">Trade clothes while traveling</div>
  </td></tr>
  <!-- Content -->
  <tr><td style="padding:16px 40px 32px;color:#e5e7eb;font-size:15px;line-height:1.6;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
    <div style="font-size:11px;color:#4b5563;">
      © ${new Date().getFullYear()} ROPA · Trade clothes while traveling<br>
      <a href="${process.env.AUTH_URL || 'https://ropa-trade.vercel.app'}" style="color:#c8a86b;text-decoration:none;">ropa-trade.vercel.app</a>
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`.trim();
}

function button(text: string, url: string): string {
    return `<a href="${url}" style="display:inline-block;padding:14px 28px;background:#c8a86b;color:#000;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;margin:16px 0;">${text}</a>`;
}

// ─── Email Templates ────────────────────────────────────────

export const emailTemplates = {
    welcome(name: string, loginUrl: string): { subject: string; html: string } {
        return {
            subject: 'Welcome to ROPA! 🎒',
            html: wrap(`
                <h2 style="color:#fff;margin:0 0 12px;">Welcome aboard, ${name}!</h2>
                <p>Your ROPA account is ready. You've earned <strong style="color:#c8a86b;">50 karma points</strong> just for signing up.</p>
                <p>Start swiping through listings from travelers worldwide, make offers, and trade clothes wherever you go.</p>
                <div style="text-align:center;">${button('Start Swiping →', loginUrl)}</div>
                <p style="color:#9ca3af;font-size:13px;">Happy swapping! 🌍</p>
            `),
        };
    },

    passwordReset(resetUrl: string): { subject: string; html: string } {
        return {
            subject: 'Reset your ROPA password',
            html: wrap(`
                <h2 style="color:#fff;margin:0 0 12px;">Reset Your Password</h2>
                <p>Click the button below to reset your ROPA password. This link expires in <strong>1 hour</strong>.</p>
                <div style="text-align:center;">${button('Reset Password', resetUrl)}</div>
                <p style="color:#9ca3af;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
            `),
        };
    },

    offerReceived(sellerName: string, buyerName: string, listingTitle: string, amount: number, currency: string, offersUrl: string): { subject: string; html: string } {
        return {
            subject: `New offer on "${listingTitle}" 💰`,
            html: wrap(`
                <h2 style="color:#fff;margin:0 0 12px;">New Offer Received!</h2>
                <p>Hey ${sellerName}, <strong>${buyerName}</strong> just made an offer on your listing:</p>
                <div style="background:#1a1a24;border-radius:10px;padding:16px 20px;margin:16px 0;border-left:3px solid #c8a86b;">
                    <div style="font-size:16px;font-weight:700;color:#fff;">${listingTitle}</div>
                    <div style="font-size:20px;font-weight:800;color:#c8a86b;margin-top:8px;">${currency} ${amount}</div>
                </div>
                <p>You can accept, counter, or decline from your offers dashboard.</p>
                <div style="text-align:center;">${button('View Offers →', offersUrl)}</div>
            `),
        };
    },

    offerAccepted(buyerName: string, listingTitle: string, amount: number, currency: string, matchesUrl: string): { subject: string; html: string } {
        return {
            subject: `Your offer on "${listingTitle}" was accepted! 🎉`,
            html: wrap(`
                <h2 style="color:#fff;margin:0 0 12px;">Offer Accepted!</h2>
                <p>Great news, ${buyerName}! Your offer of <strong style="color:#c8a86b;">${currency} ${amount}</strong> on <strong>${listingTitle}</strong> has been accepted.</p>
                <p>Head to your matches to coordinate the swap.</p>
                <div style="text-align:center;">${button('View Match →', matchesUrl)}</div>
            `),
        };
    },

    offerCountered(buyerName: string, listingTitle: string, counterAmount: number, currency: string, offersUrl: string): { subject: string; html: string } {
        return {
            subject: `Counter-offer on "${listingTitle}" 🔄`,
            html: wrap(`
                <h2 style="color:#fff;margin:0 0 12px;">Counter-Offer Received</h2>
                <p>Hey ${buyerName}, the seller countered your offer on <strong>${listingTitle}</strong> with:</p>
                <div style="background:#1a1a24;border-radius:10px;padding:16px 20px;margin:16px 0;border-left:3px solid #c8a86b;">
                    <div style="font-size:20px;font-weight:800;color:#c8a86b;">${currency} ${counterAmount}</div>
                </div>
                <p>You can accept or decline the counter-offer.</p>
                <div style="text-align:center;">${button('View Offer →', offersUrl)}</div>
            `),
        };
    },

    offerDeclined(buyerName: string, listingTitle: string, offersUrl: string): { subject: string; html: string } {
        return {
            subject: `Update on "${listingTitle}"`,
            html: wrap(`
                <h2 style="color:#fff;margin:0 0 12px;">Offer Update</h2>
                <p>Hey ${buyerName}, unfortunately your offer on <strong>${listingTitle}</strong> was not accepted this time.</p>
                <p>Don't worry — there are plenty more listings to discover! Keep swiping and you'll find your perfect swap.</p>
                <div style="text-align:center;">${button('Browse Listings →', offersUrl)}</div>
            `),
        };
    },

    escrowReleased(userName: string, listingTitle: string, amount: number, currency: string): { subject: string; html: string } {
        return {
            subject: `Swap complete — "${listingTitle}" ✅`,
            html: wrap(`
                <h2 style="color:#fff;margin:0 0 12px;">Swap Complete!</h2>
                <p>Congratulations ${userName}! Both parties confirmed delivery for <strong>${listingTitle}</strong>.</p>
                <div style="background:#1a1a24;border-radius:10px;padding:16px 20px;margin:16px 0;border-left:3px solid #22c55e;">
                    <div style="font-size:14px;color:#9ca3af;">Escrow Released</div>
                    <div style="font-size:20px;font-weight:800;color:#22c55e;margin-top:4px;">${currency} ${amount}</div>
                </div>
                <p>You both earned karma points for this swap. Thanks for being part of the ROPA community! 🌍</p>
            `),
        };
    },
};
