import { combineReducers } from 'redux';

import { Root } from './root.types';
import player, { playerInitialState } from './player/player.reducer';
import game, { gameInitialState } from './game/game.reducer';
import gameCards, { gameCardsInitialState } from './gameCard/gameCard.reducer';
import gameClues, { gameClueInitialState } from './gameClue/gameClue.reducer';
import apollo, { apolloInitialState } from './apollo/apollo.reducer';

export const initialState: Root.State = {
  player: playerInitialState,
  game: gameInitialState,
  gameCards: gameCardsInitialState,
  gameClues: gameClueInitialState,
  apollo: apolloInitialState,
};

export default combineReducers({
  player,
  game,
  gameCards,
  gameClues,
  apollo,
});
