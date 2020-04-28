import { Action } from 'redux';
import { Player } from '../player/player.types';

export namespace GameCard {
  export interface State {
    loaded: boolean;
    loading: boolean;
    error: boolean;
    errors: Error[];
    data: Entity;
  }

  export interface Entity {
    cards: GameCardEntity[];
    cardStates: GameCardStateEntity[];
  }

  export interface GameCardEntity {
    id: string;
    gameId: string;
    name: string;
    order: number;
  }

  export interface GameCardStateEntity {
    id: string;
    flipped: boolean;
    whoFlippedIt?: Player.Entity;
    gameId: string;
    type: CardType;
  }

  export interface GameCardEntityWithStateEntity extends GameCardEntity {
    state: GameCardStateEntity;
  }

  export enum CardType {
    BlueTeam = 'BLUE_TEAM',
    RedTeam = 'RED_TEAM',
    Bystander = 'BYSTANDER',
    Assassin = 'ASSASSIN',
    Unkown = 'UNKNOWN',
  }

  export enum ActionTypes {
    DatabasePushGameCardUpdate = 'GameCard: Update game card data from real-time database push',
    DatabasePushGameCardStateUpdate = 'GameCard: Update game card state data from real-time database push',
    UnloadGameCards = 'GameCard: Remove the current game cards from the store',
    CreateGameCardsRequest = 'GameCard: Request to create game cards',
    CreateGameCardsComplete = 'GameCard: Successfully created game cards',
    CreateGameCardsError = 'GameCard: Error reported from creating game cards',
    FlipGameCardRequest = 'GameCard: Request to flip a game card',
    FlipGameCardComplete = 'GameCard: Successfully flipped a game card',
    FlipGameCardError = 'GameCard: Error rported from flipping game card',
  }

  export interface DatabasePushGameCardUpdate extends Action {
    type: ActionTypes.DatabasePushGameCardUpdate;
    gameCards: GameCardEntity[];
  }

  export interface DatabasePushGameCardStateUpdate extends Action {
    type: ActionTypes.DatabasePushGameCardStateUpdate;
    gameCardStates: GameCardStateEntity[];
  }

  export interface UnloadGameCards extends Action {
    type: ActionTypes.UnloadGameCards;
  }

  export interface CreateGameCardsRequest extends Action {
    type: ActionTypes.CreateGameCardsRequest;
  }

  export interface CreateGameCardsComplete extends Action {
    type: ActionTypes.CreateGameCardsComplete;
  }

  export interface CreateGameCardsError extends Action {
    type: ActionTypes.CreateGameCardsError;
    error: Error;
  }

  export interface FlipGameCardRequest extends Action {
    type: ActionTypes.FlipGameCardRequest;
    cardState: GameCard.GameCardStateEntity;
  }

  export interface FlipGameCardComplete extends Action {
    type: ActionTypes.FlipGameCardComplete;
    gameCardId: string;
  }

  export interface FlipGameCardError extends Action {
    type: ActionTypes.FlipGameCardError;
    error: Error;
  }

  export type Actions =
    | DatabasePushGameCardUpdate
    | DatabasePushGameCardStateUpdate
    | UnloadGameCards
    | CreateGameCardsRequest
    | CreateGameCardsComplete
    | CreateGameCardsError
    | FlipGameCardRequest
    | FlipGameCardComplete
    | FlipGameCardError;
}
