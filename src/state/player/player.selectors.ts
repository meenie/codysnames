import { Root } from '../root.types';
import { Game } from '../game/game.types';

export const getCurrentPlayerColor = (state: Root.State) => {
  const userId = state.player.data.id;

  if (state.game.data.blue_spymaster.id === userId) {
    return Game.TeamColor.Blue;
  }
  if (state.game.data.red_spymaster.id === userId) {
    return Game.TeamColor.Red;
  }

  if (state.game.data.blue_agents.map((u) => u.id).includes(userId)) {
    return Game.TeamColor.Blue;
  } else {
    return Game.TeamColor.Red;
  }
};

export const getCurrentPlayerType = (state: Root.State) => {
  const userId = state.player.data.id;
  if (
    state.game.data.blue_spymaster.id === userId ||
    state.game.data.red_spymaster.id === userId
  ) {
    return Game.PlayerType.Spymaster;
  }

  return Game.PlayerType.Agent;
};
