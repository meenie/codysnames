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
    JoinGameRequest = 'Player: Request to join game',
    JoinGameComplete = 'Player: Successfully joined game',
    JoinGameError = 'Player: Error reported from joining game',
    SetPlayerDataRequest = 'Player: Request to save player data',
    SetPlayerDataComplete = 'Player: Successfully saved player data',
    SetPlayerDataError = 'Player: Error reported from saving player data',
  }

  export interface SignInPlayerRequest extends Action {
    type: ActionTypes.SignInPlayerRequest;
  }

  export interface SignInPlayerComplete extends Action {
    type: ActionTypes.SignInPlayerComplete;
    player: Entity;
  }

  export interface SignInPlayerError extends Action {
    type: ActionTypes.SignInPlayerError;
    error: Error;
  }

  export interface JoinGameRequest extends Action {
    type: ActionTypes.JoinGameRequest;
    gameId: string;
  }

  export interface JoinGameComplete extends Action {
    type: ActionTypes.JoinGameComplete;
    player: Entity;
  }

  export interface JoinGameError extends Action {
    type: ActionTypes.JoinGameError;
    error: Error;
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
    | SignInPlayerComplete
    | SignInPlayerError
    | JoinGameRequest
    | JoinGameComplete
    | JoinGameError
    | SetPlayerDataRequest
    | SetPlayerDataComplete
    | SetPlayerDataError;
}
