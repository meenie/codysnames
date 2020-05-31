import { Action } from 'redux';
import { Player } from '../player/player.types';

export namespace GameCard {
  export interface Entity {
    id: string;
    game_id: string;
    game_card_state_id: string;
    name: string;
    order: number;
    state: GameCardStateEntity;
  }

  export interface NewEntity extends Omit<Entity, 'id' | 'state' | 'game_card_state_id'> {
    state: NewGameCardStateEntity;
  }

  export interface GameCardStateEntity {
    id: string;
    flipped: boolean;
    who_flipped_it?: Player.Entity;
    game_id: string;
    type: CardType;
  }

  export type NewGameCardStateEntity = Omit<GameCardStateEntity, 'id'>;

  export enum CardType {
    BlueTeam = 'blue',
    RedTeam = 'red',
    Bystander = 'bystander',
    Assassin = 'assassin',
    Unkown = 'unkown',
  }

  export enum ActionTypes {
    CreateGameCardsRequest = 'GameCard: Request to create game cards',
    CreateGameCardsComplete = 'GameCard: Successfully created game cards',
    CreateGameCardsError = 'GameCard: Error reported from creating game cards',
    FlipGameCardRequest = 'GameCard: Request to flip a game card',
    FlipGameCardComplete = 'GameCard: Successfully flipped a game card',
    FlipGameCardError = 'GameCard: Error rported from flipping game card',
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
    card: GameCard.Entity;
  }

  export interface FlipGameCardComplete extends Action {
    type: ActionTypes.FlipGameCardComplete;
    cardId: string;
  }

  export interface FlipGameCardError extends Action {
    type: ActionTypes.FlipGameCardError;
    error: Error;
  }

  export type Actions =
    | CreateGameCardsRequest
    | CreateGameCardsComplete
    | CreateGameCardsError
    | FlipGameCardRequest
    | FlipGameCardComplete
    | FlipGameCardError;
}
