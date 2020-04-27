import { Action } from 'redux';

export namespace Player {
  export interface State {
    loaded: boolean;
    loading: boolean;
    error: boolean;
    errors: Error[];
    data: Entity;
  }

  export interface Entity {
    id: string;
    name: string;
    currentGameId?: string;
  }

  export enum ActionTypes {
    SignInPlayerRequest = 'Player: Request to sign in a player',
    SignInPlayerComplete = 'Player: Successfully signed in player',
    SignInPlayerError = 'Player: Error reported from signing in player',
    SetPlayerData = 'Player: Set player data on state',
  }

  export interface SignInPlayerRequest extends Action {
    type: ActionTypes.SignInPlayerRequest;
  }

  export interface SignInPlayerError extends Action {
    type: ActionTypes.SignInPlayerError;
    error: Error;
  }

  export interface SignInPlayerComplete extends Action {
    type: ActionTypes.SignInPlayerComplete;
    player: Entity;
  }

  export interface SetPlayerData extends Action {
    type: ActionTypes.SetPlayerData;
    player: Entity;
  }

  export type Actions =
    | SignInPlayerRequest
    | SignInPlayerError
    | SignInPlayerComplete
    | SetPlayerData;
}
