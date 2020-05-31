import { all, call, fork, takeEvery, put, select } from 'redux-saga/effects';
import shuffle from 'lodash/shuffle';

import { GameCard } from './gameCard.types';
import { Game } from '../game/game.types';
import { getRandomNames } from '../../helpers/names_list';
import {
  createGameCardsComplete,
  flipGameCardComplete,
  createGameCardsError,
  unloadGameCards,
} from './gameCard.actions';
import { Root } from '../root.types';
import { getCurrentPlayerColor } from '../player/player.selectors';
import { Player } from '../player/player.types';
import { getGameData } from '../game/game.graphql';
import { Apollo } from '../apollo/apollo.types';
import { createGameCardsData, flipGameCardState } from './gameCard.graphql';

const generateCardTypeMap = (whoIsStarting: GameCard.CardType) => {
  const cardTypeMap = [
    ...Array(8).fill(GameCard.CardType.BlueTeam),
    ...Array(8).fill(GameCard.CardType.RedTeam),
    ...Array(7).fill(GameCard.CardType.Bystander),
    GameCard.CardType.Assassin,
    whoIsStarting,
  ];

  return shuffle(cardTypeMap);
};

function* createGameCards(action: Game.StartGameComplete) {
  try {
    const client: Apollo.Entity = yield select(
      (state: Root.State) => state.apollo.client
    );
    const cardNames: string[] = yield call(getRandomNames);
    const firstCardType =
      action.whoIsFirst === Game.TeamColor.Blue
        ? GameCard.CardType.BlueTeam
        : GameCard.CardType.RedTeam;
    const cardTypeMap = yield call(generateCardTypeMap, firstCardType);

    const gameCards = cardNames.map((name, i) => {
      return {
        name,
        order: i,
        game_id: action.game.id,
        state: {
          type: cardTypeMap[i],
          game_id: action.game.id,
        },
      };
    }) as GameCard.NewEntity[];

    yield call(createGameCardsData, client, gameCards);
    yield put(createGameCardsComplete());
  } catch (e) {
    yield put(createGameCardsError(e));
  }
}

function* unloadCards() {
  yield put(unloadGameCards());
}

function* flipGameCard(action: GameCard.FlipGameCardRequest) {
  const gameId: string = yield select((state: Root.State) => state.game.data.id);
  const client: Apollo.Entity = yield select((state: Root.State) => state.apollo.client);
  const gameData: Game.Entity = yield call(getGameData, client, gameId);
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  const currentPlayerColor: Game.TeamColor = yield select(getCurrentPlayerColor);
  const currentTurn = gameData.turn;

  if (
    player.id === gameData.blue_spymaster.id || // Spymasters can't flip cards!
    player.id === gameData.red_spymaster.id || // Spymasters can't flip cards!
    currentTurn !== currentPlayerColor || // This isn't your team, man. You can't flip a card!
    gameData.status === Game.Status.Over || // Game over, man! Game over!
    gameData.number_of_guesses === -1 // Spymaster has not provided a clue, yet.
  ) {
    return;
  }

  yield call(flipGameCardState, client, action.card.state.id);
  yield put(flipGameCardComplete(action.card.id));
}

function* createGameCardsListener() {
  yield takeEvery([ Game.ActionTypes.StartGameComplete ], createGameCards);
}

function* flipGameCardListener() {
  yield takeEvery([ GameCard.ActionTypes.FlipGameCardRequest ], flipGameCard);
}

function* clearCardsListener() {
  yield takeEvery([ Game.ActionTypes.LeaveGameComplete ], unloadCards);
}

export function* gameCardSaga() {
  yield all([
    fork(createGameCardsListener),
    fork(flipGameCardListener),
    fork(clearCardsListener),
  ]);
}
