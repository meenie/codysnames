import firebase from 'firebase/app';

// We are loading Firebase from the dynamic reserved URLS
// but we still want the typed libraries.  Webpack is smart
// enough not to actually bundle firebase.
declare global {
  interface Window {
    firebase: {
      auth: () => firebase.auth.Auth;
      firestore: () => firebase.firestore.Firestore;
      analytics: () => firebase.analytics.Analytics;
    };
  }
}

export const auth = window.firebase.auth();
export const db = window.firebase.firestore();
export const analytics = window.firebase.analytics();
