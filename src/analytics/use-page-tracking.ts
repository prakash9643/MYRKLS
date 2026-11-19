import { useEffect, useRef } from 'react';
import { captureCampaignAttribution } from './attribution';
import { trackPageView } from './analytics';
import { useAnalyticsConsent } from './ConsentProvider';
import type { CampaignAttribution } from './types';

const campaignQuery = (campaign: CampaignAttribution): string => {
  const params = new URLSearchParams();
  const keys: Array<keyof CampaignAttribution> = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];
  for (const key of keys) {
    const value = campaign[key];
    if (value) params.set(key, value);
  }
  return params.toString();
};

export const usePageTracking = (view: string, notFound: boolean): void => {
  const { consent } = useAnalyticsConsent();
  const lastTrackedRef = useRef('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const campaign = consent?.analytics ? captureCampaignAttribution(url.search) : {};
    const routeKey = `${url.pathname}${url.search}${url.hash}|${view}|${notFound}`;
    if (!consent?.analytics && !consent?.marketing) {
      lastTrackedRef.current = '';
      return;
    }
    if (lastTrackedRef.current === routeKey) return;

    const timer = window.setTimeout(() => {
      const utmQuery = campaignQuery(campaign);
      if (trackPageView(
        document.title,
        `${url.origin}${url.pathname}${utmQuery ? `?${utmQuery}` : ''}`,
        `${url.pathname}${utmQuery ? `?${utmQuery}` : ''}`,
        campaign
      )) {
        lastTrackedRef.current = routeKey;
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [consent?.analytics, consent?.marketing, notFound, view]);
};
