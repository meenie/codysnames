import { GameCard } from './gameCard.types';

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
  card: GameCard.Entity
): GameCard.FlipGameCardRequest => ({
  type: GameCard.ActionTypes.FlipGameCardRequest,
  card,
});

export const flipGameCardComplete = (cardId: string): GameCard.FlipGameCardComplete => ({
  type: GameCard.ActionTypes.FlipGameCardComplete,
  cardId,
});

export const flipGameCardError = (error: Error): GameCard.FlipGameCardError => ({
  type: GameCard.ActionTypes.FlipGameCardError,
  error,
});
