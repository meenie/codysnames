import { useEffect } from "react";
import firebase from "firebase";

import { dataFromSnapshot } from "../helpers/firebase";

interface Entity {
  id: string;
}

interface FirebaseHookHandlers {
  subscribe?: () => void;
  error?: (error: Error) => void;
  unsubscribe?: () => void;
}

interface DocHandlers<T extends Entity> extends FirebaseHookHandlers {
  data: (data: T | undefined) => void;
}

export const useDoc = <T extends Entity>(
  getDocReference: () => firebase.firestore.DocumentReference,
  handlers: DocHandlers<T>,
  deps?: any
) => {
  useEffect(() => {
    handlers.subscribe && handlers.subscribe();
    const unsubscribeFromDoc = getDocReference().onSnapshot(
      (snapshot) => handlers.data(dataFromSnapshot(snapshot)),
      (error) => handlers.error && handlers.error(error)
    );
    return () => {
      handlers.unsubscribe && handlers.unsubscribe();
      unsubscribeFromDoc();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};
