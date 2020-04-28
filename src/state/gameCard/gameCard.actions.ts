import { GameCard } from './gameCard.types';

export const databasePushGameCardUpdate = (
  gameCards: GameCard.GameCardEntity[]
): GameCard.DatabasePushGameCardUpdate => ({
  type: GameCard.ActionTypes.DatabasePushGameCardUpdate,
  gameCards,
});

export const databasePushGameCardStateUpdate = (
  gameCardStates: GameCard.GameCardStateEntity[]
): GameCard.DatabasePushGameCardStateUpdate => ({
  type: GameCard.ActionTypes.DatabasePushGameCardStateUpdate,
  gameCardStates,
});

export const unloadGameCards = () => ({
  type: GameCard.ActionTypes.UnloadGameCards,
});

export const createGameCardsRequest = (): GameCard.CreateGameCardsRequest => ({
  type: GameCard.ActionTypes.CreateGameCardsRequest,
});

export const createGameCardsComplete = (): GameCard.CreateGameCardsComplete => ({
  type: GameCard.ActionTypes.CreateGameCardsComplete,
});

export const createGameCardsError = (error: Error): GameCard.CreateGameCardsError => ({
  type: GameCard.ActionTypes.CreateGameCardsError,
  error,
});

export const flipGameCardRequest = (
  cardState: GameCard.GameCardStateEntity
): GameCard.FlipGameCardRequest => ({
  type: GameCard.ActionTypes.FlipGameCardRequest,
  cardState,
});

export const flipGameCardComplete = (
  gameCardId: string
): GameCard.FlipGameCardComplete => ({
  type: GameCard.ActionTypes.FlipGameCardComplete,
  gameCardId,
});

export const flipGameCardError = (error: Error): GameCard.FlipGameCardError => ({
  type: GameCard.ActionTypes.FlipGameCardError,
  error,
});
