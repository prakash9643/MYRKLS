import type { CampaignAttribution } from './types';

const STORAGE_KEY = 'myrkls_campaign_attribution_v1';
const CAMPAIGN_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;
const UNSAFE_VALUE_PATTERN = /(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?\d[\d\s().-]{7,}\d)/i;
let firstTouch: CampaignAttribution = {};

const cleanValue = (value: string | null): string | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 100);
  if (!normalized || UNSAFE_VALUE_PATTERN.test(normalized)) return undefined;
  return normalized;
};

const readStoredAttribution = (): CampaignAttribution => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const safe: CampaignAttribution = {};
    for (const key of CAMPAIGN_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        const cleaned = cleanValue(value);
        if (cleaned) safe[key] = cleaned;
      }
    }
    return safe;
  } catch {
    return {};
  }
};

export const captureCampaignAttribution = (search: string): CampaignAttribution => {
  const params = new URLSearchParams(search);
  const incoming: CampaignAttribution = {};
  for (const key of CAMPAIGN_KEYS) {
    const value = cleanValue(params.get(key));
    if (value) incoming[key] = value;
  }

  if (Object.keys(firstTouch).length === 0) firstTouch = readStoredAttribution();
  if (Object.keys(firstTouch).length === 0 && Object.keys(incoming).length > 0) {
    firstTouch = incoming;
  }
  return { ...firstTouch };
};

export const getCampaignAttribution = (): CampaignAttribution => ({ ...firstTouch });

export const persistCampaignAttribution = (analyticsConsent: boolean): void => {
  if (typeof window === 'undefined') return;
  if (!analyticsConsent) {
    firstTouch = {};
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
    return;
  }
  if (Object.keys(firstTouch).length === 0) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(firstTouch));
  } catch {
    return;
  }
};

export const resetCampaignAttributionForTests = (): void => {
  firstTouch = {};
};
