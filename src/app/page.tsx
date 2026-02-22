import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

const CITIES = [
  'Paris', 'Barcelona', 'Lisbon', 'Bangkok', 'Tokyo', 'Berlin',
  'Bali', 'Mexico City', 'Sydney', 'Seoul', 'Milan', 'Marrakech',
  'Amsterdam', 'Medellín', 'Queenstown', 'Chiang Mai', 'Porto', 'Cape Town',
];

const STEPS = [
  {
    num: '01',
    title: 'List Your Clothes',
    desc: 'Snap a photo, set your terms — free, fixed price, or negotiable. Your wardrobe becomes a global marketplace.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Swipe & Match',
    desc: "Browse nearby listings with a swipe-to-match interface. Right to like, left to pass. When you both swipe right — it's a match!",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Meet & Swap',
    desc: 'Chat, plan a meetup at a Drop Zone, and exchange. Earn karma, build trust, and make a new travel friend.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: 'Location-Aware',
    desc: 'See what\'s available wherever you are. Moving cities? Your listings follow you.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: 'Swap Circles',
    desc: 'Join community swap events at hostels and cafés. Meet, mingle, and trade in person.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    title: 'Karma System',
    desc: 'Build trust through trades, reviews, and community engagement. Higher karma = more visibility.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: 'Drop Zones',
    desc: 'Partner hostels and cafés with physical swap shelves. Browse, grab, and go.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'TravelSwap Exchange',
    desc: 'Post what you need, offer what you have. Our algorithm finds bilateral matches automatically.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    title: 'Zero Waste',
    desc: 'Every swap keeps clothes out of landfills. Travel lighter, live greener, look better.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  {
    quote: "Swapped my denim jacket for a silk blouse at a Paris hostel. ROPA made it feel like magic — matched in seconds!",
    name: 'Maya Chen',
    location: 'Paris, France',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Maya',
    tier: 'gold',
  },
  {
    quote: "As a minimalist packer, ROPA is essential. I refresh my wardrobe at every stop without buying new.",
    name: 'Kai Tanaka',
    location: 'Tokyo, Japan',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kai',
    tier: 'gold',
  },
  {
    quote: "Found an artisan Oaxacan dress through TravelSwap Exchange. The bilateral matching is genius.",
    name: 'Sofía Rivera',
    location: 'Mexico City, Mexico',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia',
    tier: 'gold',
  },
];

export default function LandingPage() {
  return (
    <main className={styles.landing}>
      {/* ─── Navbar ─── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navBrand}>
            <Image src="/ropa-logo.png" alt="ROPA" width={36} height={36} style={{ borderRadius: '50%' }} />
            <span className={styles.navBrandText}>ROPA</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#community" className={styles.navLink}>Community</a>
          </div>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.navLogin}>Log In</Link>
            <Link href="/login" className={styles.navSignup}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          <Image
            src="/hero-bg.png"
            alt="Travelers swapping clothes"
            fill
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Sustainable Travel Fashion
          </div>

          <h1 className={styles.headline}>
            Your Wardrobe<br />
            <span className={styles.headlineGradient}>Travels With You</span>
          </h1>

          <p className={styles.subtitle}>
            Swap, sell, and discover clothes from fellow travelers worldwide.
            Lighten your luggage, refresh your style, and make friends along the way.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/feed" className={styles.ctaPrimary}>
              Start Swiping
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <a href="#how-it-works" className={styles.ctaSecondary}>
              See How It Works
            </a>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>12K+</span>
              <span className={styles.heroStatLabel}>Active Travelers</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>45K+</span>
              <span className={styles.heroStatLabel}>Successful Swaps</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>89</span>
              <span className={styles.heroStatLabel}>Countries</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── City Ticker ─── */}
      <section className={styles.ticker}>
        <div className={styles.tickerLabel}>Active in</div>
        <div className={styles.tickerTrack}>
          <div className={styles.tickerSlide}>
            {[...CITIES, ...CITIES].map((city, i) => (
              <span key={`${city}-${i}`} className={styles.tickerCity}>
                <span className={styles.tickerDot} />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Simple Process</span>
          <h2 className={styles.sectionTitle}>How ROPA Works</h2>
          <p className={styles.sectionSub}>Three steps to a lighter bag and a fresher look.</p>
        </div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <div key={step.num} className={styles.step}>
              <div className={styles.stepIconWrap}>
                <span className={styles.stepNum}>{step.num}</span>
                {step.icon}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Platform Features</span>
          <h2 className={styles.sectionTitle}>Built for Travelers,<br />By Travelers</h2>
          <p className={styles.sectionSub}>Every feature designed around the nomadic lifestyle.</p>
        </div>

        <div className={styles.featureGrid}>
          {FEATURES.map((feat) => (
            <div key={feat.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feat.icon}</div>
              <h3 className={styles.featureTitle}>{feat.title}</h3>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section id="community" className={styles.social}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Community</span>
          <h2 className={styles.sectionTitle}>Loved by Travelers<br />Around the World</h2>
        </div>

        <div className={styles.testimonialGrid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>★★★★★</div>
              <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.testimonialAuthor}>
                <Image src={t.avatar} alt={t.name} width={40} height={40} className={styles.testimonialAvatar} />
                <div>
                  <span className={styles.testimonialName}>{t.name}</span>
                  <span className={styles.testimonialLocation}>{t.location}</span>
                </div>
                <span className={styles.testimonialBadge}>{t.tier}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Marketplace</span>
          <h2 className={styles.sectionTitle}>Every Style, Every Size</h2>
        </div>
        <div className={styles.categoryGrid}>
          {[
            { emoji: '👕', label: 'Tops' },
            { emoji: '👖', label: 'Bottoms' },
            { emoji: '👗', label: 'Dresses' },
            { emoji: '🧥', label: 'Outerwear' },
            { emoji: '👟', label: 'Shoes' },
            { emoji: '🎒', label: 'Accessories' },
            { emoji: '🩱', label: 'Swimwear' },
            { emoji: '🏃', label: 'Activewear' },
          ].map((cat) => (
            <Link href="/feed" key={cat.label} className={styles.categoryCard}>
              <span className={styles.categoryEmoji}>{cat.emoji}</span>
              <span className={styles.categoryLabel}>{cat.label}</span>
            </Link>
          ))}
        </div>
        <div className={styles.sizeRow}>
          {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <span key={size} className={styles.sizeBadge}>{size}</span>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className={styles.bottomCta}>
        <div className={styles.bottomCtaGlow} />
        <div className={styles.bottomCtaContent}>
          <h2 className={styles.bottomCtaTitle}>
            Ready to Travel Light?
          </h2>
          <p className={styles.bottomCtaDesc}>
            Join 12,000+ travelers who swap instead of shop. Your next favorite
            outfit is already in someone else&apos;s backpack.
          </p>
          <div className={styles.bottomCtaActions}>
            <Link href="/login" className={styles.ctaPrimary}>
              Create Free Account
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <Link href="/feed" className={styles.ctaSecondary}>
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image src="/ropa-logo.png" alt="ROPA" width={28} height={28} style={{ borderRadius: '50%' }} />
            <span>ROPA</span>
          </div>
          <p className={styles.footerCopy}>
            © 2026 ROPA. Sustainable travel fashion, one swap at a time.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/login">Login</Link>
            <Link href="/feed">Feed</Link>
            <Link href="/explore">Explore</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
