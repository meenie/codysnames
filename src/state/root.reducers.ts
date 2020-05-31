import { combineReducers } from 'redux';

import { Root } from './root.types';
import player, { playerInitialState } from './player/player.reducer';
import game, { gameInitialState } from './game/game.reducer';
import apollo, { apolloInitialState } from './apollo/apollo.reducer';

export const initialState: Root.State = {
  player: playerInitialState,
  game: gameInitialState,
  apollo: apolloInitialState,
};

export default combineReducers({
  player,
  game,
  apollo,
});
