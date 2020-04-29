import { all, call, fork, takeEvery, put, select } from 'redux-saga/effects';

import { db, auth } from '../../services/firebase';
import { Player } from './player.types';
import { Root } from '../root.types';
import {
  signInPlayerComplete,
  signInPlayerError,
  setPlayerDataError,
  setPlayerDataComplete,
  joinGameComplete,
  joinGameError,
} from './player.actions';
import { Game } from '../game/game.types';
import produce from 'immer';

const signInAnonymously = async () => {
  const credential = await auth.signInAnonymously();

  return credential.user && credential.user.uid;
};

const savePlayerData = async (player: Player.Entity) => {
  const playerRef = db.collection('players').doc(player.id);

  return playerRef.update(player);
};

const getPlayerData = async (userId: string) => {
  const playerRef = db.collection('players').doc(userId);
  const playerSnapshot = await playerRef.get();
  let playerData = playerSnapshot.data() as Player.Entity;

  if (!playerData) {
    playerData = {
      id: userId,
      name: '',
      currentGameId: '',
    };

    await playerRef.set(playerData);
  }

  return playerData;
};

function* setPlayerData(action: Player.SetPlayerDataRequest) {
  try {
    yield call(savePlayerData, action.player);
    yield put(setPlayerDataComplete(action.player));
  } catch (e) {
    yield put(setPlayerDataError(e));
  }
}

function* signInPlayer() {
  try {
    const userId = yield call(signInAnonymously);
    const player: Player.Entity = yield call(getPlayerData, userId);
    yield put(signInPlayerComplete(player));
  } catch (error) {
    yield put(signInPlayerError(error));
  }
}

function* joinGame(action: Player.JoinGameRequest) {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);
    const newPlayerData = produce(player, (draft) => {
      draft.currentGameId = action.gameId;
    });
    yield call(savePlayerData, newPlayerData);
    yield put(joinGameComplete(newPlayerData));
  } catch (e) {
    yield put(joinGameError(e));
  }
}

function* gameCreated(action: Game.CreateGameComplete) {
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  const newPlayerData = produce(player, (draft) => {
    draft.currentGameId = action.game.id;
  });
  yield call(savePlayerData, newPlayerData);
  yield put(setPlayerDataComplete(newPlayerData));
}

function* unsetCurrentGameId(action: Game.LeaveGameComplete) {
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  const newPlayerData = produce(player, (draft) => {
    draft.currentGameId = '';
  });
  yield call(savePlayerData, newPlayerData);
  yield put(setPlayerDataComplete(newPlayerData));
}

function* setPlayerDataListener() {
  yield takeEvery(Player.ActionTypes.SetPlayerDataRequest, setPlayerData);
}

function* joinGameListener() {
  yield takeEvery([ Player.ActionTypes.JoinGameRequest ], joinGame);
}

function* gameCreatedListener() {
  yield takeEvery([ Game.ActionTypes.CreateGameComplete ], gameCreated);
}

function* unsetCurrentGameIdListener() {
  yield takeEvery([ Game.ActionTypes.LeaveGameComplete ], unsetCurrentGameId);
}

function* signInPlayerListener() {
  yield takeEvery(Player.ActionTypes.SignInPlayerRequest, signInPlayer);
}

export function* playerSaga() {
  yield all([
    fork(setPlayerDataListener),
    fork(signInPlayerListener),
    fork(joinGameListener),
    fork(gameCreatedListener),
    fork(unsetCurrentGameIdListener),
  ]);
}
