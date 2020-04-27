import { GameCard } from './gameCard.types';

export const setGameCardsData = (
  gameCards: GameCard.GameCardEntity[]
): GameCard.SetGameCardsData => ({
  type: GameCard.ActionTypes.SetGameCardsData,
  gameCards,
});

export const setGameCardStatesData = (
  gameCardStates: GameCard.GameCardStateEntity[]
): GameCard.SetGameCardStatesData => ({
  type: GameCard.ActionTypes.SetGameCardStatesData,
  gameCardStates,
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
