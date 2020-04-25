import { Store } from './types';

export const getCurrentPlayerColor = (state: Store.ApplicationState) => {
  const userId = state.player.id;

  if (state.game.blueSpymaster.id === userId) {
    return Store.TeamColor.Blue;
  }
  if (state.game.redSpymaster.id === userId) {
    return Store.TeamColor.Red;
  }

  if (state.game.blueAgents.map((u) => u.id).includes(userId)) {
    return Store.TeamColor.Blue;
  } else {
    return Store.TeamColor.Red;
  }
};

export const getCurrentPlayerType = (state: Store.ApplicationState) => {
  const userId = state.player.id;
  if (state.game.blueSpymaster.id === userId || state.game.redSpymaster.id === userId) {
    return Store.PlayerType.Spymaster;
  }

  return Store.PlayerType.Agent;
};

export const getGameCardsWithState = (
  state: Store.ApplicationState
): Store.GameCardWithState[] => {
  const gameCardStateMap = state.gameCardStateMap;
  return state.gameCards.map((card) => ({
    ...card,
    state: gameCardStateMap[card.id] || {
      id: card.id,
      flipped: false,
      type: Store.CardType.Unkown,
      gameId: card.gameId,
    },
  }));
};
