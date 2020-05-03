import { all, call, fork, takeEvery, put } from 'redux-saga/effects';

import { db } from '../../services/firebase';
import { GameClue } from './gameClue.types';
import { createGameClueComplete, createGameClueError } from './gameClue.actions';

const persistGameClue = async (gameClue: Omit<GameClue.Entity, 'id'>) => {
  const gameClueRef = db.collection('gameClues').doc();

  await gameClueRef.set({
    ...gameClue,
    createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
  });
  return {
    ...gameClue,
    id: gameClueRef.id,
  };
};

function* createGameClue(action: GameClue.CreateClueRequest) {
  try {
    const gameClueData: GameClue.Entity = yield call(persistGameClue, action.gameClue);
    yield put(createGameClueComplete(gameClueData));
  } catch (e) {
    yield put(createGameClueError(e));
  }
}

function* createGameClueListener() {
  yield takeEvery(GameClue.ActionTypes.CreateClueRequest, createGameClue);
}

export function* gameClueSaga() {
  yield all([ fork(createGameClueListener) ]);
}
