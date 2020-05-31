import { all, call, fork, takeEvery, put, select } from 'redux-saga/effects';

import { database, auth } from '../../services/firebase';
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
import { Apollo } from '../apollo/apollo.types';
import { setClient } from '../apollo/apollo.actions';
import { makeApolloClient } from '../../services/apollo';
import { savePlayerData, getPlayerData } from './player.graphql';

const signInAnonymously = () => {
  return new Promise((resolve) => {
    auth.signInAnonymously();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaim = idTokenResult.claims['https://hasura.io/jwt/claims'];
        if (hasuraClaim) {
          resolve({
            token,
            userId: user.uid,
          });
        } else {
          const metadataRef = database.ref('metadata/' + user.uid + '/refreshTime');
          metadataRef.on('value', async (data) => {
            if (!data.val()) return;
            const token = await user.getIdToken(true);
            resolve({
              token,
              userId: user.uid,
            });
          });
        }
      }
    });
  });
};

function* setPlayerData(action: Player.SetPlayerDataRequest) {
  try {
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );
    yield call(savePlayerData, client, action.player);
    yield put(setPlayerDataComplete(action.player));
  } catch (e) {
    yield put(setPlayerDataError(e));
  }
}

function* signInPlayer() {
  try {
    const { token, userId } = yield call(signInAnonymously);

    console.log(token);
    const client = makeApolloClient(token);
    yield put(setClient(client));

    const player: Player.Entity = yield call(getPlayerData, client, userId);
    yield put(signInPlayerComplete(player));
  } catch (error) {
    yield put(signInPlayerError(error));
  }
}

function* joinGame(action: Player.JoinGameRequest) {
  try {
    const player: Player.Entity = yield select((state: Root.State) => state.player.data);
    const newPlayerData = produce(player, (draft) => {
      draft.current_game_id = action.gameId;
    });
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );
    yield call(savePlayerData, client, newPlayerData);
    yield put(joinGameComplete(newPlayerData));
  } catch (e) {
    yield put(joinGameError(e));
  }
}

function* gameCreated(action: Game.CreateGameComplete) {
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  const newPlayerData = produce(player, (draft) => {
    draft.current_game_id = action.game.id;
  });
  const client: Apollo.Entity = yield select((state: Root.State) => state.apollo.client);
  yield call(savePlayerData, client, newPlayerData);
  yield put(setPlayerDataComplete(newPlayerData));
}

function* unsetCurrentGameId(action: Game.LeaveGameComplete) {
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  const newPlayerData = produce(player, (draft) => {
    draft.current_game_id = '';
  });
  const client: Apollo.Entity = yield select((state: Root.State) => state.apollo.client);
  yield call(savePlayerData, client, newPlayerData);
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
