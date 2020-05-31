import { Action } from 'redux';
import { Game } from '../game/game.types';

export namespace GameClue {
  export interface Entity {
    id: string;
    game_id: string;
    clue: string;
    number_of_guesses: number;
    color: Game.TeamColor;
  }

  export enum ActionTypes {
    CreateClueRequest = 'GameClue: Request to create clue',
    CreateClueComplete = 'GameClue: Successfully created clue',
    CreateClueError = 'GameClue: Error reported from creating clue',
  }

  export interface CreateClueRequest extends Action {
    type: ActionTypes.CreateClueRequest;
    gameClue: Omit<Entity, 'id'>;
  }

  export interface CreateClueComplete extends Action {
    type: ActionTypes.CreateClueComplete;
    gameClue: Entity;
  }

  export interface CreateClueError extends Action {
    type: ActionTypes.CreateClueError;
    error: Error;
  }

  export type Actions = CreateClueRequest | CreateClueComplete | CreateClueError;
}
