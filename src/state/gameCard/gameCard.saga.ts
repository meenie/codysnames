import { all, call, fork, takeEvery, put, select } from 'redux-saga/effects';
import shuffle from 'lodash/shuffle';

import { db } from '../../services/firebase';
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
import { getGameData } from '../game/game.saga';

export const getGameCardStateData = async (gameCardId: string) => {
  const gameCardStateRef = db.collection('gameCardState').doc(gameCardId);
  const gameCaardStateSnapshot = await gameCardStateRef.get();
  return gameCaardStateSnapshot.data() as GameCard.GameCardStateEntity;
};

export const getGameCards = async (gameId: string) => {
  const gameCardsRef = db
    .collection('gameCards')
    .where('gameId', '==', gameId)
    .orderBy('order', 'asc');
  const gameCardsQuerySnapshot = await gameCardsRef.get();
  return gameCardsQuerySnapshot.docs.map((doc) => doc.data() as GameCard.GameCardEntity);
};

export const getGameCardStates = async (gameId: string, forSpymaster = false) => {
  let gameCardStateQuery = db.collection('gameCardState').where('gameId', '==', gameId);

  if (!forSpymaster) {
    gameCardStateQuery = gameCardStateQuery.where('flipped', '==', true);
  }

  const gameCardStateQuerySnapshot = await gameCardStateQuery.get();
  return gameCardStateQuerySnapshot.docs.map(
    (doc) => doc.data() as GameCard.GameCardStateEntity
  );
};

const setGameCardStateData = async (gameCardState: any) => {
  const gameCardStateRef = db.collection('gameCardState').doc(gameCardState.id);
  return await gameCardStateRef.update(gameCardState);
};

const setGameCardsData = async (gameCards: GameCard.Entity) => {
  const batch = db.batch();
  gameCards.cards.forEach((card, i) => {
    const gameCardRef = db.collection('gameCards').doc();
    const gameCardStateRef = db.collection('gameCardState').doc(gameCardRef.id);
    const gameCardData = {
      ...card,
      id: gameCardRef.id,
    };
    const gameCardStateData = {
      ...gameCards.cardStates[i],
      id: gameCardRef.id,
    };
    batch.set(gameCardRef, gameCardData);
    batch.set(gameCardStateRef, gameCardStateData);
  });

  await batch.commit();
};

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
    const cardNames: string[] = yield call(getRandomNames);
    const firstCardType =
      action.whoIsFirst === Game.TeamColor.Blue
        ? GameCard.CardType.BlueTeam
        : GameCard.CardType.RedTeam;
    const cardTypeMap = yield call(generateCardTypeMap, firstCardType);

    const gameCards = cardNames.reduce(
      (acc, name, i) => {
        acc.cards.push({
          id: '',
          gameId: action.game.id,
          name,
          order: i,
        });

        acc.cardStates.push({
          id: '',
          type: cardTypeMap[i],
          gameId: action.game.id,
          flipped: false,
        });

        return acc;
      },
      { cards: [], cardStates: [] } as GameCard.Entity
    );

    yield call(setGameCardsData, gameCards);
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
  const gameData: Game.Entity = yield call(getGameData, gameId);
  const player: Player.Entity = yield select((state: Root.State) => state.player.data);
  const currentPlayerColor: Game.TeamColor = yield select(getCurrentPlayerColor);
  const currentTurn = gameData.turn;
  const cardState = action.cardState;

  if (
    player.id === gameData.blueSpymaster.id || // Spymasters can't flip cards!
    player.id === gameData.redSpymaster.id || // Spymasters can't flip cards!
    currentTurn !== currentPlayerColor || // This isn't your team, man. You can't flip a card!
    gameData.status === Game.Status.Over // Game over, man! Game over!
  ) {
    return;
  }

  yield call(setGameCardStateData, {
    id: cardState.id,
    flipped: true,
    whoFlippedIt: player,
  });

  yield put(flipGameCardComplete(cardState.id));
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
