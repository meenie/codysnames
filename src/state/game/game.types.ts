import { Action } from 'redux';
import { Player } from '../player/player.types';

export namespace Game {
  export interface State {
    loaded: boolean;
    loading: boolean;
    error: boolean;
    errors: Error[];
    data: Entity;
  }

  export interface Entity {
    id: string;
    status: Status;
    turn: TeamColor;
    doubleAgent: TeamColor;
    blueSpymaster: Player.Entity;
    redSpymaster: Player.Entity;
    blueAgents: Player.Entity[];
    redAgents: Player.Entity[];
    whoWon?: TeamColor;
  }

  export enum Status {
    Open = 'OPEN',
    InSession = 'IN_SESSION',
    Over = 'OVER',
  }

  export enum TeamColor {
    Blue = 'BLUE',
    Red = 'RED',
  }

  export enum PlayerType {
    Spymaster = 'SPYMASTER',
    Agent = 'AGENT',
  }

  export enum ActionTypes {
    SetGameData = 'Game: Set game data on state',
    CreateGameRequest = 'Game: Request to create game',
    CreateGameComplete = 'Game: Successfully created game',
    CreateGameError = 'Game: Error reported from creating game',
    JoinGameRequest = 'Game: Request to join game',
    JoinGameComplete = 'Game: Successfully joined game',
    JoinGameError = 'Game: Error reported from joining game',
    StartGameRequest = 'Game: Request to start game',
    StartGameComplete = 'Game: Successfully started game',
    StartGameError = 'Game: Error reported from starting game',
    LeaveGameRequest = 'Game: Request to leave game',
    LeaveGameComplete = 'Game: Successfully left game',
    LeaveGameError = 'Game: Error reported from leaving game',
    SwitchTeamsRequest = 'Game: Request to switch teams',
    SwitchTeamsComplete = 'Game: Successfully switched game',
    SwitchTeamsError = 'Game: Error reported from switching game',
    PromoteToSpymasterRequest = 'Game: Request to promote to spymaster',
    PromoteToSpymasterComplete = 'Game: Successfully promoted to spymaster',
    PromoteToSpymasterError = 'Game: Error reported from promoting to spymaster',
    EndTurnRequest = 'Game: Request to end turn',
    EndTurnComplete = 'Game: Successfully ended turn',
    EndTurnError = 'Game: Error reported from ending turn',
  }

  export interface SetGameData extends Action {
    type: ActionTypes.SetGameData;
    game: Entity;
  }

  export interface CreateGameRequest extends Action {
    type: ActionTypes.CreateGameRequest;
  }

  export interface CreateGameComplete extends Action {
    type: ActionTypes.CreateGameComplete;
    gameId: string;
  }

  export interface CreateGameError extends Action {
    type: ActionTypes.CreateGameError;
    error: Error;
  }

  export interface JoinGameRequest extends Action {
    type: ActionTypes.JoinGameRequest;
    gameId: string;
  }

  export interface JoinGameComplete extends Action {
    type: ActionTypes.JoinGameComplete;
    gameId: string;
  }

  export interface JoinGameError extends Action {
    type: ActionTypes.JoinGameError;
    error: Error;
  }

  export interface StartGameRequest extends Action {
    type: ActionTypes.StartGameRequest;
    gameId: string;
  }

  export interface StartGameComplete extends Action {
    type: ActionTypes.StartGameComplete;
    gameId: string;
    whoIsFirst: TeamColor;
  }

  export interface StartGameError extends Action {
    type: ActionTypes.StartGameError;
    error: Error;
  }

  export interface LeaveGameRequest extends Action {
    type: ActionTypes.LeaveGameRequest;
    gameId: string;
  }

  export interface LeaveGameComplete extends Action {
    type: ActionTypes.LeaveGameComplete;
    gameId: string;
  }

  export interface LeaveGameError extends Action {
    type: ActionTypes.LeaveGameError;
    error: Error;
  }

  export interface SwitchTeamsRequest extends Action {
    type: ActionTypes.SwitchTeamsRequest;
  }

  export interface SwitchTeamsComplete extends Action {
    type: ActionTypes.SwitchTeamsComplete;
  }

  export interface SwitchTeamsError extends Action {
    type: ActionTypes.SwitchTeamsError;
    error: Error;
  }

  export interface PromoteToSpymasterRequest extends Action {
    type: ActionTypes.PromoteToSpymasterRequest;
    player: Player.Entity;
  }

  export interface PromoteToSpymasterComplete extends Action {
    type: ActionTypes.PromoteToSpymasterComplete;
  }

  export interface PromoteToSpymasterError extends Action {
    type: ActionTypes.PromoteToSpymasterError;
    error: Error;
  }

  export interface EndTurnRequest extends Action {
    type: ActionTypes.EndTurnRequest;
  }

  export interface EndTurnComplete extends Action {
    type: ActionTypes.EndTurnComplete;
  }

  export interface EndTurnError extends Action {
    type: ActionTypes.EndTurnError;
    error: Error;
  }

  export type Actions =
    | SetGameData
    | CreateGameRequest
    | CreateGameComplete
    | CreateGameError
    | JoinGameRequest
    | JoinGameComplete
    | JoinGameError
    | StartGameRequest
    | StartGameComplete
    | StartGameError
    | LeaveGameRequest
    | LeaveGameComplete
    | LeaveGameError
    | SwitchTeamsRequest
    | SwitchTeamsComplete
    | SwitchTeamsError
    | PromoteToSpymasterRequest
    | PromoteToSpymasterComplete
    | PromoteToSpymasterError
    | EndTurnRequest
    | EndTurnComplete
    | EndTurnError;
}
