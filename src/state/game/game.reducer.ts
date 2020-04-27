import produce from 'immer';

import { Game } from './game.types';
import { blankPlayer } from '../player/player.reducer';

export const blankGame: Game.Entity = {
  id: '',
  status: Game.Status.Open,
  turn: Game.TeamColor.Blue,
  doubleAgent: Game.TeamColor.Blue,
  blueSpymaster: blankPlayer,
  redSpymaster: blankPlayer,
  blueAgents: [],
  redAgents: [],
};

export const gameInitialState: Game.State = {
  loaded: false,
  loading: false,
  data: blankGame,
  error: false,
  errors: [],
};

const reducer = (state = gameInitialState, action: Game.Actions) => {
  switch (action.type) {
    case Game.ActionTypes.SetGameData:
      return produce(state, (draft) => {
        draft.data = action.game;
      });
    case Game.ActionTypes.CreateGameRequest:
    case Game.ActionTypes.JoinGameRequest:
      return produce(state, (draft) => {
        draft.loaded = false;
        draft.loading = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.CreateGameComplete:
    case Game.ActionTypes.JoinGameComplete:
      return produce(state, (draft) => {
        // The Firestore subscription takes care
        // of updating the store game data
        draft.loaded = true;
        draft.loading = false;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.CreateGameError:
    case Game.ActionTypes.JoinGameError:
      return produce(state, (draft) => {
        draft.loaded = false;
        draft.loading = false;
        draft.error = true;
        draft.errors.push(action.error);
      });
    default:
      return state;
  }
};

export default reducer;
