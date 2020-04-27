import { Root } from '../root.types';
import { Game } from '../game/game.types';

export const getCurrentPlayerColor = (state: Root.State) => {
  const userId = state.player.data.id;

  if (state.game.data.blueSpymaster.id === userId) {
    return Game.TeamColor.Blue;
  }
  if (state.game.data.redSpymaster.id === userId) {
    return Game.TeamColor.Red;
  }

  if (state.game.data.blueAgents.map((u) => u.id).includes(userId)) {
    return Game.TeamColor.Blue;
  } else {
    return Game.TeamColor.Red;
  }
};

export const getCurrentPlayerType = (state: Root.State) => {
  const userId = state.player.data.id;
  if (
    state.game.data.blueSpymaster.id === userId ||
    state.game.data.redSpymaster.id === userId
  ) {
    return Game.PlayerType.Spymaster;
  }

  return Game.PlayerType.Agent;
};
