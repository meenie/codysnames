import { all, call, fork, takeEvery, put, select } from 'redux-saga/effects';
import { Apollo } from '../apollo/apollo.types';
import gql from 'graphql-tag';

import { GameClue } from './gameClue.types';
import { createGameClueComplete, createGameClueError } from './gameClue.actions';
import { Root } from '../root.types';

const setGameClue = async (
  client: Apollo.Entity,
  gameClue: Omit<GameClue.Entity, 'id'>
) => {
  const result = await client.mutate<{ insert_game_clues_one: GameClue.Entity }>({
    mutation: gql`
      mutation CreateGameClue($object: game_clues_insert_input!) {
        insert_game_clues_one(object: $object) {
          id
          color
          clue
          game_id
          number_of_guesses
          updated_at
          created_at
        }
      }
    `,
    variables: {
      object: gameClue,
    },
  });

  if (result.data) {
    return result.data.insert_game_clues_one;
  }
};

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
