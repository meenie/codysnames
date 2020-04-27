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
    SetPlayerDataRequest = 'Player: Request to save player data',
    SetPlayerDataComplete = 'Player: Successfully saved player data',
    SetPlayerDataError = 'Player: Error reported from saving player data',
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

  export interface SetPlayerDataRequest extends Action {
    type: ActionTypes.SetPlayerDataRequest;
    player: Entity;
  }

  export interface SetPlayerDataComplete extends Action {
    type: ActionTypes.SetPlayerDataComplete;
    player: Entity;
  }

  export interface SetPlayerDataError extends Action {
    type: ActionTypes.SetPlayerDataError;
    error: Error;
  }

  export type Actions =
    | SignInPlayerRequest
    | SignInPlayerError
    | SignInPlayerComplete
    | SetPlayerDataRequest
    | SetPlayerDataComplete
    | SetPlayerDataError;
}
