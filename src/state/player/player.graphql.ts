import gql from 'graphql-tag';

import { Apollo } from '../apollo/apollo.types';
import { Player } from './player.types';

export const PLAYER_FIELDS_FRAGMENT = gql`
  fragment player_fields on players {
    id
    name
    current_game_id
  }
`;

export const savePlayerData = async (client: Apollo.Entity, player: Player.Entity) => {
  return client.mutate({
    mutation: gql`
      mutation UpdatePlayer($id: String!, $_set: players_set_input = {}) {
        update_players_by_pk(pk_columns: { id: $id }, _set: $_set) {
          id
        }
      }
    `,
    variables: {
      id: player.id,
      _set: player,
    },
  });
};

export const getPlayerData = async (client: Apollo.Entity, userId: string) => {
  const playerData = await client.query({
    query: gql`
      query GetPlayer($id: String!) {
        players_by_pk(id: $id) {
          ...player_fields
        }
      }
      ${PLAYER_FIELDS_FRAGMENT}
    `,
    variables: {
      id: userId,
    },
  });

  const player = playerData.data.players_by_pk;
  delete player.__typename;

  return player as Player.Entity;
};
