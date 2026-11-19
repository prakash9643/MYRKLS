import type { ConsentPreferences, OptionalConsent } from './types';

export const CONSENT_STORAGE_KEY = 'myrkls_privacy_consent_v1';
export const CONSENT_VERSION = 1 as const;

export const createConsentPreferences = (
  preferences: OptionalConsent,
  now = new Date()
): ConsentPreferences => ({
  necessary: true,
  analytics: preferences.analytics,
  marketing: preferences.marketing,
  updatedAt: now.toISOString(),
  version: CONSENT_VERSION,
});

export const parseConsentPreferences = (value: unknown): ConsentPreferences | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.version !== CONSENT_VERSION ||
    typeof candidate.analytics !== 'boolean' ||
    typeof candidate.marketing !== 'boolean' ||
    typeof candidate.updatedAt !== 'string' ||
    !Number.isFinite(Date.parse(candidate.updatedAt))
  ) {
    return null;
  }
  return {
    necessary: true,
    analytics: candidate.analytics,
    marketing: candidate.marketing,
    updatedAt: candidate.updatedAt,
    version: CONSENT_VERSION,
  };
};

export const readConsentPreferences = (): ConsentPreferences | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    return parseConsentPreferences(JSON.parse(stored) as unknown);
  } catch {
    return null;
  }
};

export const persistConsentPreferences = (preferences: ConsentPreferences): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    return;
  }
};
