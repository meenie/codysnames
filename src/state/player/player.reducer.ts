import { Player } from './player.types';
import produce from 'immer';

export const blankPlayer: Player.Entity = {
  id: '',
  name: '',
};

export const playerInitialState: Player.State = {
  loaded: false,
  loading: false,
  data: blankPlayer,
  error: false,
  errors: [],
};

const reducer = (state = playerInitialState, action: Player.Actions) => {
  switch (action.type) {
    case Player.ActionTypes.SetPlayerDataRequest:
    case Player.ActionTypes.SignInPlayerRequest:
      return produce(state, (draft) => {
        draft.loaded = false;
        draft.loading = true;
        draft.error = false;
        draft.errors = [];
      });
    case Player.ActionTypes.SetPlayerDataComplete:
    case Player.ActionTypes.SignInPlayerComplete:
      return produce(state, (draft) => {
        draft.loaded = true;
        draft.loading = false;
        draft.error = false;
        draft.errors = [];
        draft.data = action.player;
      });
    case Player.ActionTypes.SetPlayerDataError:
    case Player.ActionTypes.SignInPlayerError:
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
