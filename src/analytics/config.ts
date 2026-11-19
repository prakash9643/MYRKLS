export interface AnalyticsEnvironment {
  MODE?: string;
  PROD?: boolean;
  VITE_ANALYTICS_ENABLED?: string;
  VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT?: string;
  VITE_GTM_ID?: string;
  VITE_META_PIXEL_ID?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  gtmId: string | null;
  metaPixelId: string | null;
  environment: string;
}

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const META_PIXEL_ID_PATTERN = /^\d{5,20}$/;

export const readAnalyticsConfig = (
  environment: AnalyticsEnvironment = {
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    VITE_ANALYTICS_ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED,
    VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT:
      import.meta.env.VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT,
    VITE_GTM_ID: import.meta.env.VITE_GTM_ID,
    VITE_META_PIXEL_ID: import.meta.env.VITE_META_PIXEL_ID,
  }
): AnalyticsConfig => {
  const development = environment.MODE === 'development' || environment.PROD === false;
  const enabled = development
    ? environment.VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT === 'true'
    : environment.VITE_ANALYTICS_ENABLED === 'true';
  const gtmId = environment.VITE_GTM_ID?.trim() || '';
  const metaPixelId = environment.VITE_META_PIXEL_ID?.trim() || '';

  return {
    enabled,
    gtmId: GTM_ID_PATTERN.test(gtmId) ? gtmId : null,
    metaPixelId: META_PIXEL_ID_PATTERN.test(metaPixelId) ? metaPixelId : null,
    environment: environment.MODE?.trim() || 'unknown',
  };
};
