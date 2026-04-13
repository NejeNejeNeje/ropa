/**
 * Convert a country name to its flag emoji.
 * Uses a lookup table for common countries, falls back to 🏳️.
 */

const COUNTRY_TO_ISO: Record<string, string> = {
  'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'argentina': 'AR',
  'armenia': 'AM', 'australia': 'AU', 'austria': 'AT', 'azerbaijan': 'AZ',
  'bahamas': 'BS', 'bahrain': 'BH', 'bangladesh': 'BD', 'barbados': 'BB',
  'belarus': 'BY', 'belgium': 'BE', 'belize': 'BZ', 'bolivia': 'BO',
  'bosnia and herzegovina': 'BA', 'brazil': 'BR', 'brunei': 'BN', 'bulgaria': 'BG',
  'cambodia': 'KH', 'cameroon': 'CM', 'canada': 'CA', 'chile': 'CL',
  'china': 'CN', 'colombia': 'CO', 'costa rica': 'CR', 'croatia': 'HR',
  'cuba': 'CU', 'cyprus': 'CY', 'czech republic': 'CZ', 'czechia': 'CZ',
  'denmark': 'DK', 'dominican republic': 'DO', 'ecuador': 'EC', 'egypt': 'EG',
  'el salvador': 'SV', 'estonia': 'EE', 'ethiopia': 'ET', 'fiji': 'FJ',
  'finland': 'FI', 'france': 'FR', 'georgia': 'GE', 'germany': 'DE',
  'ghana': 'GH', 'greece': 'GR', 'guatemala': 'GT', 'haiti': 'HT',
  'honduras': 'HN', 'hong kong': 'HK', 'hungary': 'HU', 'iceland': 'IS',
  'india': 'IN', 'indonesia': 'ID', 'iran': 'IR', 'iraq': 'IQ',
  'ireland': 'IE', 'israel': 'IL', 'italy': 'IT', 'jamaica': 'JM',
  'japan': 'JP', 'jordan': 'JO', 'kazakhstan': 'KZ', 'kenya': 'KE',
  'kuwait': 'KW', 'laos': 'LA', 'latvia': 'LV', 'lebanon': 'LB',
  'libya': 'LY', 'lithuania': 'LT', 'luxembourg': 'LU', 'malaysia': 'MY',
  'maldives': 'MV', 'malta': 'MT', 'mexico': 'MX', 'moldova': 'MD',
  'monaco': 'MC', 'mongolia': 'MN', 'montenegro': 'ME', 'morocco': 'MA',
  'mozambique': 'MZ', 'myanmar': 'MM', 'nepal': 'NP', 'netherlands': 'NL',
  'new zealand': 'NZ', 'nicaragua': 'NI', 'nigeria': 'NG', 'north korea': 'KP',
  'north macedonia': 'MK', 'norway': 'NO', 'oman': 'OM', 'pakistan': 'PK',
  'panama': 'PA', 'paraguay': 'PY', 'peru': 'PE', 'philippines': 'PH',
  'poland': 'PL', 'portugal': 'PT', 'qatar': 'QA', 'romania': 'RO',
  'russia': 'RU', 'rwanda': 'RW', 'saudi arabia': 'SA', 'senegal': 'SN',
  'serbia': 'RS', 'singapore': 'SG', 'slovakia': 'SK', 'slovenia': 'SI',
  'south africa': 'ZA', 'south korea': 'KR', 'spain': 'ES', 'sri lanka': 'LK',
  'sweden': 'SE', 'switzerland': 'CH', 'taiwan': 'TW', 'tanzania': 'TZ',
  'thailand': 'TH', 'trinidad and tobago': 'TT', 'tunisia': 'TN', 'turkey': 'TR',
  'türkiye': 'TR', 'uganda': 'UG', 'ukraine': 'UA', 'united arab emirates': 'AE',
  'uae': 'AE', 'united kingdom': 'GB', 'uk': 'GB', 'united states': 'US',
  'usa': 'US', 'united states of america': 'US', 'uruguay': 'UY',
  'uzbekistan': 'UZ', 'venezuela': 'VE', 'vietnam': 'VN', 'zambia': 'ZM',
  'zimbabwe': 'ZW',
};

function isoToFlag(iso: string): string {
  const codePoints = iso
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export function countryFlag(countryName: string): string {
  const iso = COUNTRY_TO_ISO[countryName.toLowerCase().trim()];
  if (iso) return isoToFlag(iso);
  // Try if the input is already a 2-letter ISO code
  if (/^[A-Za-z]{2}$/.test(countryName.trim())) {
    return isoToFlag(countryName.trim());
  }
  return '🏳️';
}
