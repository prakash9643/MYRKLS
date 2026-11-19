import type { AnalyticsDataLayerEntry } from './types';

export const getDataLayer = (target: Window = window): AnalyticsDataLayerEntry[] => {
  if (!target.dataLayer) target.dataLayer = [];
  return target.dataLayer;
};

export const pushDataLayerEntry = (
  entry: AnalyticsDataLayerEntry,
  target: Window = window
): void => {
  getDataLayer(target).push(entry);
};
