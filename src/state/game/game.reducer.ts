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
  loading: false,
  loaded: false,
  creating: false,
  created: false,
  joining: false,
  joined: false,
  starting: false,
  started: false,
  leaving: false,
  left: false,
  data: blankGame,
  error: false,
  errors: [],
};

const reducer = (state = gameInitialState, action: Game.Actions) => {
  switch (action.type) {
    case Game.ActionTypes.DatabasePushUpdate:
      return produce(state, (draft) => {
        draft.data = action.game;
        draft.loaded = true;
      });

    case Game.ActionTypes.LeaveGameRequest:
      return produce(state, (draft) => {
        draft.leaving = true;
        draft.loaded = false;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.LeaveGameComplete:
      return produce(state, (draft) => {
        draft.leaving = false;
        draft.left = true;
        draft.data = action.game;
      });
    case Game.ActionTypes.StartGameRequest:
      return produce(state, (draft) => {
        draft.starting = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.StartGameComplete:
      return produce(state, (draft) => {
        draft.starting = false;
        draft.started = true;
        draft.loaded = true;
        draft.data = action.game;
      });
    case Game.ActionTypes.CreateGameRequest:
      return produce(state, (draft) => {
        draft.creating = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.CreateGameComplete:
      return produce(state, (draft) => {
        draft.creating = false;
        draft.created = true;
        draft.loaded = true;
        draft.data = action.game;
      });
    case Game.ActionTypes.JoinGameRequest:
      return produce(state, (draft) => {
        draft.joining = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.JoinGameComplete:
      return produce(state, (draft) => {
        draft.joining = false;
        draft.joined = true;
        draft.loaded = true;
        draft.data = action.game;
      });
    case Game.ActionTypes.LoadGameRequest:
      return produce(state, (draft) => {
        draft.loading = true;
        draft.error = false;
        draft.errors = [];
      });
    case Game.ActionTypes.LoadGameComplete:
      return produce(state, (draft) => {
        draft.loading = false;
        draft.loaded = true;
        draft.data = action.game;
      });
    case Game.ActionTypes.CreateGameError:
    case Game.ActionTypes.JoinGameError:
    case Game.ActionTypes.LeaveGameError:
    case Game.ActionTypes.StartGameError:
    case Game.ActionTypes.LoadGameError:
      return produce(state, (draft) => {
        draft.loading = false;
        draft.loaded = false;
        draft.creating = false;
        draft.created = false;
        draft.joining = false;
        draft.joined = false;
        draft.starting = false;
        draft.starting = false;
        draft.leaving = false;
        draft.left = false;
        draft.error = true;
        draft.errors.push(action.error);
        draft.data = blankGame;
      });
    default:
      return state;
  }
};

export default reducer;
