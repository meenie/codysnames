import { Action } from 'redux';
export namespace Store {
  export interface Card {
    id: string;
    name: string;
  }

  export interface Player {
    id: string;
    name: string;
    currentGameId?: string;
  }

  export interface GameCard {
    id: string;
    flipped: boolean;
    gameId: string;
    name: string;
    order: number;
    player: PlayerType;
    type: CardType;
    siblingId: string;
  }

  export interface Game {
    id: string;
    status: Status;
    turn: TeamColor;
    doubleAgent: TeamColor;
    blueSpymaster: Player;
    redSpymaster: Player;
    blueAgents: Player[];
    redAgents: Player[];
    whoWon?: TeamColor;
  }

  export enum CardType {
    BlueTeam = 'BLUE_TEAM',
    RedTeam = 'RED_TEAM',
    Bystander = 'BYSTANDER',
    Assassin = 'ASSASSIN',
    Unkown = 'UNKNOWN',
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

  export interface LoadingState {
    cards: boolean;
    game: boolean;
    playerName: boolean;
    leavingGame: boolean;
    startingGame: boolean;
  }

  export interface ApplicationState {
    loading: LoadingState;
    game: Game;
    gameCards: GameCard[];
    player: Player;
  }

  export interface CreateGameRequest extends Action {
    type: 'createGameRequest';
  }

  export interface CreateGameSuccess extends Action {
    type: 'createGameSuccess';
    gameId: string;
  }

  export interface CreateGameError extends Action {
    type: 'createGameError';
    error: Error;
  }

  export interface CreateGameCardsRequest extends Action {
    type: 'createGameCardsRequest';
  }

  export interface CreateGameCardsSuccess extends Action {
    type: 'createGameCardsSuccess';
  }

  export interface CreateGameCardsError extends Action {
    type: 'createGameCardsError';
    error: Error;
  }

  export interface JoinGameRequest extends Action {
    type: 'joinGameRequest';
  }

  export interface JoinGameSuccess extends Action {
    type: 'joinGameSuccess';
    gameId: string;
  }

  export interface JoinGameError extends Action {
    type: 'joinGameError';
    error: Error;
  }

  export interface JoinGameCardsRequest extends Action {
    type: 'joinGameCardsRequest';
  }

  export interface JoinGameCardsSuccess extends Action {
    type: 'joinGameCardsSuccess';
  }

  export interface JoinGameCardsError extends Action {
    type: 'joinGameCardsError';
    error: Error;
  }

  export interface SetPlayerNameRequest extends Action {
    type: 'setPlayerNameRequest';
  }

  export interface SetPlayerNameSuccess extends Action {
    type: 'setPlayerNameSuccess';
    name: string;
  }

  export interface SetPlayerNameError extends Action {
    type: 'setPlayerNameError';
    error: Error;
  }

  export interface SetGameData extends Action {
    type: 'setGameData';
    game: Game;
  }

  export interface SetGameCardsData extends Action {
    type: 'setGameCardsData';
    gameCards: GameCard[];
  }

  export interface SetUserId extends Action {
    type: 'setUserId';
    userId: string;
  }

  export interface SetPlayerData extends Action {
    type: 'setPlayerData';
    player: Player;
  }

  export interface PromotePlayerToSpymaster extends Action {
    type: 'promotePlayerToSpymaster';
    player: Player;
  }

  export interface LeaveGameRequest extends Action {
    type: 'leaveGameRequest';
  }
  export interface LeaveGameSuccess extends Action {
    type: 'leaveGameSuccess';
  }

  export interface StartGameRequest extends Action {
    type: 'startGameRequest';
  }
  export interface StartGameSuccess extends Action {
    type: 'startGameSuccess';
  }

  export interface GameOver extends Action {
    type: 'gameOver';
    whoWon: TeamColor;
  }

  export type ApplicationAction =
    | CreateGameRequest
    | CreateGameSuccess
    | CreateGameError
    | CreateGameCardsRequest
    | CreateGameCardsSuccess
    | CreateGameCardsError
    | JoinGameRequest
    | JoinGameSuccess
    | JoinGameError
    | JoinGameCardsRequest
    | JoinGameCardsSuccess
    | JoinGameCardsError
    | SetPlayerNameRequest
    | SetPlayerNameSuccess
    | SetPlayerNameError
    | SetUserId
    | SetPlayerData
    | PromotePlayerToSpymaster
    | SetGameData
    | SetGameCardsData
    | LeaveGameSuccess
    | LeaveGameRequest
    | StartGameRequest
    | StartGameSuccess
    | GameOver;
}
