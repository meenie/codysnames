import { Root } from '../root.types';
import { GameCard } from './gameCard.types';

export const getGameCardsWithState = (
  state: Root.State
): GameCard.GameCardEntityWithStateEntity[] => {
  const gameCardStates = state.gameCards.data.cardStates;
  return state.gameCards.data.cards.map((card) => {
    const state = gameCardStates.find((cardState) => cardState.id === card.id);
    return {
      ...card,
      state: state || {
        id: card.id,
        flipped: false,
        type: GameCard.CardType.Unkown,
        gameId: card.gameId,
      },
    };
  });
};
