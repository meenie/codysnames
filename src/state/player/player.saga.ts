import { all, call, fork, takeEvery, put, select } from 'redux-saga/effects';

import { db, auth, analytics } from '../../services/firebase';
import { Player } from './player.types';
import { Root } from '../root.types';
import { signInPlayerComplete, signInPlayerError } from './player.actions';
import { Game } from '../game/game.types';
import produce from 'immer';

const signInAnonymously = async () => {
  const credential = await auth.signInAnonymously();
  const user = credential.user;
  if (user) {
    analytics.logEvent('login', { method: 'anonymous' });
    analytics.setUserId(user.uid);
  }

  return user && user.uid;
};

const setPlayerData = async (player: Player.Entity) => {
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

function* signInPlayer() {
  try {
    const userId = yield call(signInAnonymously);
    const player: Player.Entity = yield call(getPlayerData, userId);
    yield put(signInPlayerComplete(player));
  } catch (error) {
    yield put(signInPlayerError(error));
  }
}

function* persistCurrentGameId(action: Game.JoinGameComplete | Game.CreateGameComplete) {
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  yield call(
    setPlayerData,
    produce(player, (draft) => {
      draft.currentGameId = action.gameId;
    })
  );
}

function* unsetCurrentGameId(action: Game.LeaveGameComplete) {
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  yield call(
    setPlayerData,
    produce(player, (draft) => {
      draft.currentGameId = '';
    })
  );
}

function* persistCurrentGameIdListener() {
  yield takeEvery(
    [ Game.ActionTypes.JoinGameComplete, Game.ActionTypes.CreateGameComplete ],
    persistCurrentGameId
  );
}

function* unsetCurrentGameIdListener() {
  yield takeEvery([ Game.ActionTypes.LeaveGameComplete ], unsetCurrentGameId);
}

function* signInPlayerListener() {
  yield takeEvery(Player.ActionTypes.SignInPlayerRequest, signInPlayer);
}

export function* playerSaga() {
  yield all([
    fork(signInPlayerListener),
    fork(persistCurrentGameIdListener),
    fork(unsetCurrentGameIdListener),
  ]);
}
