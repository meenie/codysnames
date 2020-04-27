import { Player } from './player/player.types';
import { Game } from './game/game.types';
import { GameCard } from './gameCard/gameCard.types';

export namespace Root {
  export interface State {
    player: Player.State;
    game: Game.State;
    gameCards: GameCard.State;
  }
}
