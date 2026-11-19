import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createConsentPreferences,
  persistConsentPreferences,
  readConsentPreferences,
} from './consent';
import { persistCampaignAttribution } from './attribution';
import { updateAnalyticsConsent } from './analytics';
import type { ConsentPreferences, OptionalConsent } from './types';

interface ConsentContextValue {
  consent: ConsentPreferences | null;
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (preferences: OptionalConsent) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(readConsentPreferences);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    updateAnalyticsConsent(consent);
    persistCampaignAttribution(consent?.analytics === true);
  }, [consent]);

  const savePreferences = useCallback((preferences: OptionalConsent) => {
    const saved = createConsentPreferences(preferences);
    persistConsentPreferences(saved);
    updateAnalyticsConsent(saved);
    persistCampaignAttribution(saved.analytics);
    setConsent(saved);
    setPreferencesOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      preferencesOpen,
      acceptAll: () => savePreferences({ analytics: true, marketing: true }),
      rejectOptional: () => savePreferences({ analytics: false, marketing: false }),
      savePreferences,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [consent, preferencesOpen, savePreferences]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export const useAnalyticsConsent = (): ConsentContextValue => {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useAnalyticsConsent must be used within ConsentProvider.');
  return context;
};
