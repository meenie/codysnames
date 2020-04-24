import firebase from 'firebase';

interface Entity {
  id: string;
}

export const dataFromSnapshot = <T extends Entity>(
  snapshot: firebase.firestore.DocumentSnapshot
): T | undefined => {
  if (!snapshot.exists) return undefined;
  const data = snapshot.data() as T;
  return {
    ...data,
    id: snapshot.id,
  };
};
