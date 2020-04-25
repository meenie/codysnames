import flow from 'lodash/flow';
import { map, filter } from 'lodash/fp';
import { useEffect } from 'react';
import firebase from 'firebase';

import { dataFromSnapshot } from '../helpers/firebase';

interface Entity {
  id: string;
}

interface FirebaseHookHandlers {
  subscribe?: () => void;
  error?: (error: Error) => void;
  unsubscribe?: () => void;
}

interface CollectionHandlers<T extends Entity> extends FirebaseHookHandlers {
  data: (data: T[]) => void;
}

export const useCollection = <T extends Entity>(
  query: () => firebase.firestore.Query,
  handlers: CollectionHandlers<T>,
  deps: any[]
) => {
  useEffect(() => {
    handlers.subscribe && handlers.subscribe();
    const unsubscribeFromQuery = query().onSnapshot(
      (snapshot) => {
        const docs = flow(
          () => snapshot.docs,
          map(dataFromSnapshot),
          filter<T>((d) => !!d)
        )();
        handlers.data(docs);
      },
      (error) => {
        handlers.error && handlers.error(error);
      }
    );
    return () => {
      handlers.unsubscribe && handlers.unsubscribe();
      unsubscribeFromQuery();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};
