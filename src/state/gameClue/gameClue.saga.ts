import { all, call, fork, takeEvery, put, select } from 'redux-saga/effects';
import { Apollo } from '../apollo/apollo.types';

import { GameClue } from './gameClue.types';
import { createGameClueComplete, createGameClueError } from './gameClue.actions';
import { Root } from '../root.types';
import { setGameClue } from './gameClue.graphql';

function* createGameClue(action: GameClue.CreateClueRequest) {
  try {
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );
    const gameClueData: GameClue.Entity = yield call(
      setGameClue,
      client,
      action.gameClue
    );
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
