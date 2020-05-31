import gql from 'graphql-tag';
import produce from 'immer';

import { Apollo } from '../apollo/apollo.types';
import { Game } from './game.types';
import { blankPlayer } from '../player/player.reducer';
import { CLUE_FIELDS_FRAGMENT } from '../gameClue/gameClue.graphql';
import { CARD_FIELDS_FRAGMENT } from '../gameCard/gameCard.graphql';
import { PLAYER_FIELDS_FRAGMENT } from '../player/player.graphql';

export const GAMES_PLAYERS_FIELDS_FRAGMENT = gql`
  fragment games_players_fields on games_players {
    game_id
    player_id
    color
    is_spymaster
  }
`;
export const GAME_FIELDS_FRAGMENT = gql`
  fragment game_fields on games {
    id
    clue
    number_of_guesses
    turn
    status
    who_won
    red_has_extra_guess
    blue_has_extra_guess
    double_agent
    red_spymaster
    blue_spymaster
    blue_agents {
      ...player_fields
    }
    red_agents {
      ...player_fields
    }
    cards(order_by: { order: asc }) {
      ...card_fields
    }
    clues(order_by: { created_at: asc }) {
      ...clue_fields
    }
  }

  ${PLAYER_FIELDS_FRAGMENT}
  ${CARD_FIELDS_FRAGMENT}
  ${CLUE_FIELDS_FRAGMENT}
`;

export const getGameData = async (client: Apollo.Entity, gameId: string) => {
  const result = await client.query({
    query: gql`
      query GetGame($id: String!) {
        games_by_pk(id: $id) {
          ...game_fields
        }
      }
      ${GAME_FIELDS_FRAGMENT}
    `,
    variables: {
      id: gameId.toUpperCase(),
    },
    fetchPolicy: 'network-only',
  });

  const game = result.data.games_by_pk;
  delete game.__typename;

  if (!game.red_spymaster) {
    game.red_spymaster = blankPlayer;
  }

  if (!game.blue_spymaster) {
    game.blue_spymaster = blankPlayer;
  }

  return game as Game.Entity;
};

export const createGameData = async (client: Apollo.Entity, playerId: string) => {
  const result = await client.mutate<{ insert_games_one: Game.Entity }>({
    mutation: gql`
      mutation CreateGame($player_id: String, $color: player_colors_enum) {
        insert_games_one(object: {games_players: {data: {
          color: $color
          is_spymaster: true
          player_id: $player_id
        }}}) {
          ...game_fields
        }
      }
      ${GAME_FIELDS_FRAGMENT}
    `,
    variables: {
      player_id: playerId,
      color: Game.TeamColor.Blue,
    },
  });

  if (result.data) {
    const game = result.data.insert_games_one;
    game.red_spymaster = blankPlayer;

    return game;
  } else {
    return null;
  }
};

export const setGameData = async (client: Apollo.Entity, game: Game.Entity) => {
  const newGameData = produce(game, (draft) => {
    delete draft.blue_agents;
    delete draft.red_agents;
    delete draft.blue_spymaster;
    delete draft.red_spymaster;
    delete draft.created_at;
    delete draft.updated_at;
    delete draft.cards;
    delete draft.clues;
  });

  return client.mutate({
    mutation: gql`
      mutation UpdateGame($id: String!, $_set: games_set_input = {}) {
        update_games_by_pk(pk_columns: { id: $id }, _set: $_set) {
          id
        }
      }
    `,
    variables: {
      id: game.id,
      _set: newGameData,
    },
  });
};

export const getGamesPlayersData = async (client: Apollo.Entity, gameId: string) => {
  const result = await client.query<{ games_players: Game.GamesPlayers[] }>({
    query: gql`
      query GetGamesPlayersData($gameId: String) {
        games_players(where: { game_id: { _eq: $gameId } }) {
          ...games_players_fields
        }
      }

      ${GAMES_PLAYERS_FIELDS_FRAGMENT}
    `,
    variables: {
      gameId,
    },
  });

  return result.data.games_players;
};

export const deleteGamesPlayersData = async (
  client: Apollo.Entity,
  playerId: string,
  gameId: string
) => {
  return client.mutate({
    mutation: gql`
      mutation DeleteGamesPlayerData($playerId: String!, $gameId: String!) {
        delete_games_players_by_pk(game_id: $gameId, player_id: $playerId) {
          game_id
          player_id
        }
      }
    `,
    variables: {
      playerId,
      gameId,
    },
  });
};

export const setGamesPlayersData = async (
  client: Apollo.Entity,
  playerId: string,
  gameId: string,
  color: Game.TeamColor,
  is_spymaster: boolean
) => {
  return client.mutate({
    mutation: gql`
      mutation SetGamesPlayersData(
        $playerId: String
        $gameId: String
        $color: player_colors_enum
        $is_spymaster: Boolean
      ) {
        insert_games_players_one(
          object: {
            color: $color
            game_id: $gameId
            is_spymaster: $is_spymaster
            player_id: $playerId
          }
          on_conflict: {
            constraint: games_players_game_id_player_id_key
            update_columns: [color, is_spymaster]
          }
        ) {
          game_id
          player_id
          color
          is_spymaster
        }
      }
    `,
    variables: {
      playerId,
      gameId,
      color,
      is_spymaster,
    },
  });
};
