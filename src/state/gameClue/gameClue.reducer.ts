import { GameClue } from './gameClue.types';
import produce from 'immer';

export const gameClueInitialState: GameClue.State = {
  loaded: false,
  loading: false,
  error: false,
  errors: [],
  data: [],
};

const reducer = (state = gameClueInitialState, action: GameClue.Actions) => {
  switch (action.type) {
    case GameClue.ActionTypes.DatabasePushUpdate:
      return produce(state, (draft) => {
        draft.loaded = true;
        draft.loading = false;
        draft.error = false;
        draft.errors = [];
        draft.data = action.gameClues;
      });
    default:
      return state;
  }
};

export default reducer;
