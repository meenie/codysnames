import { Player } from './player/player.types';
import { Game } from './game/game.types';
import { Apollo } from './apollo/apollo.types';

export namespace Root {
  export interface State {
    player: Player.State;
    game: Game.State;
    apollo: Apollo.State;
  }
}
