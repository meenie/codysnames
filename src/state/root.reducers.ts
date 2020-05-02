import { combineReducers } from 'redux';

import { Root } from './root.types';
import player, { playerInitialState } from './player/player.reducer';
import game, { gameInitialState } from './game/game.reducer';
import gameCards, { gameCardsInitialState } from './gameCard/gameCard.reducer';
import gameClues, { gameClueInitialState } from './gameClue/gameClue.reducer';

export const initialState: Root.State = {
  player: playerInitialState,
  game: gameInitialState,
  gameCards: gameCardsInitialState,
  gameClues: gameClueInitialState,
};

export default combineReducers({
  player,
  game,
  gameCards,
  gameClues,
});
