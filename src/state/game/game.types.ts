import { Action } from 'redux';
import { Player } from '../player/player.types';
import { GameCard } from '../gameCard/gameCard.types';
import { GameClue } from '../gameClue/gameClue.types';

export namespace Game {
  export interface State {
    loading: boolean;
    loaded: boolean;
    creating: boolean;
    created: boolean;
    leaving: boolean;
    left: boolean;
    starting: boolean;
    started: boolean;
    joining: boolean;
    joined: boolean;
    flippingCard: boolean;
    error: boolean;
    errors: Error[];
    data: Entity;
  }

  export interface Entity {
    id: string;
    status: Status;
    turn: TeamColor;
    double_agent: TeamColor;
    blue_spymaster: Player.Entity;
    red_spymaster: Player.Entity;
    blue_agents: Player.Entity[];
    red_agents: Player.Entity[];
    blue_has_extra_guess: boolean;
    red_has_extra_guess: boolean;
    number_of_guesses: number;
    who_won?: TeamColor;
    clue?: string;
    created_at: Date;
    updated_at: Date;
    cards: GameCard.Entity[];
    clues: GameClue.Entity[];
  }

  export interface GamesPlayers {
    game_id: string;
    player_id: string;
    color: TeamColor;
    is_spymaster: boolean;
  }

  export enum Status {
    Open = 'open',
    InSession = 'in_session',
    Over = 'over',
  }

  export enum TeamColor {
    Blue = 'blue',
    Red = 'red',
  }

  export enum PlayerType {
    Spymaster = 'spymaster',
    Agent = 'agent',
  }

  export enum ActionTypes {
    DatabasePushUpdate = 'Game: Update game data from real-time database push',
    CreateGameRequest = 'Game: Request to create game',
    CreateGameComplete = 'Game: Successfully created game',
    CreateGameError = 'Game: Error reported from creating game',
    LoadGameRequest = 'Game: Request to load game',
    LoadGameComplete = 'Game: Successfully loaded game',
    LoadGameError = 'Game: Error reported from loading game',
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
    GameStateUpdated = 'Game: State of game updated',
    FlipCardRequest = 'Game: Request to flip card',
    FlipCardComplete = 'Game: Successfully flipped card',
  }

  export interface DatabasePushUpdate extends Action {
    type: ActionTypes.DatabasePushUpdate;
    game: Entity;
  }

  export interface CreateGameRequest extends Action {
    type: ActionTypes.CreateGameRequest;
  }

  export interface CreateGameComplete extends Action {
    type: ActionTypes.CreateGameComplete;
    game: Entity;
  }

  export interface CreateGameError extends Action {
    type: ActionTypes.CreateGameError;
    error: Error;
  }

  export interface LoadGameRequest extends Action {
    type: ActionTypes.LoadGameRequest;
    gameId: string;
  }

  export interface LoadGameComplete extends Action {
    type: ActionTypes.LoadGameComplete;
    game: Entity;
  }

  export interface LoadGameError extends Action {
    type: ActionTypes.LoadGameError;
    error: Error;
  }

  export interface JoinGameRequest extends Action {
    type: ActionTypes.JoinGameRequest;
    gameId: string;
  }

  export interface JoinGameComplete extends Action {
    type: ActionTypes.JoinGameComplete;
    game: Entity;
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
    game: Entity;
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
    game: Entity;
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

  export interface GameStateUpdated extends Action {
    type: ActionTypes.GameStateUpdated;
    game: Entity;
  }

  export interface FlipCardRequest extends Action {
    type: ActionTypes.FlipCardRequest;
  }

  export interface FlipCardComplete extends Action {
    type: ActionTypes.FlipCardComplete;
  }

  export type Actions =
    | DatabasePushUpdate
    | CreateGameRequest
    | CreateGameComplete
    | CreateGameError
    | LoadGameRequest
    | LoadGameComplete
    | LoadGameError
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
    | EndTurnError
    | GameStateUpdated
    | FlipCardRequest
    | FlipCardComplete;
}
