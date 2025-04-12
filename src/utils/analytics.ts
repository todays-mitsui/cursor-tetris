// GA4のイベント計測用ユーティリティ
export const sendGAEvent = (eventName: string, eventParams: object = {}) => {
  if (typeof window !== 'undefined') {
    gtag('event', eventName, eventParams);
  }
}; 