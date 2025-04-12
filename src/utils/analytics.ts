// GA4のイベント計測用ユーティリティ
export const sendAnalyticsEvent = (
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) => {
  // @ts-expect-error gtag is loaded globally
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventParams);
  }
}; 