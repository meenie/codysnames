import gql from 'graphql-tag';

import { Apollo } from '../apollo/apollo.types';
import { GameCard } from './gameCard.types';

export const CARD_FIELDS_FRAGMENT = gql`
  fragment card_fields on game_cards {
    id
    name
    order
    game_id
    game_card_state_id
    state {
      flipped
      created_at
      game_id
      id
      type
      updated_at
      who_flipped_it
    }
    created_at
    updated_at
  }
`;

export const flipGameCardState = async (
  client: Apollo.Entity,
  gameCardStateId: string
) => {
  return client.mutate({
    mutation: gql`
      mutation UpdateGameCardState($id: uuid!) {
        update_game_card_states_by_pk(pk_columns: { id: $id }, _set: { flipped: true }) {
          id
        }
      }
    `,
    variables: {
      id: gameCardStateId,
    },
  });
};

export const createGameCardsData = async (
  client: Apollo.Entity,
  gameCards: GameCard.NewEntity[]
) => {
  const objects = gameCards.map((card, i) => {
    return {
      name: card.name,
      game_id: card.game_id,
      order: card.order,
      state: {
        data: {
          game_id: card.game_id,
          type: card.state.type,
        },
      },
    };
  }, []);

  return client.mutate({
    mutation: gql`
      mutation BulkCreateGameCards($objects: [game_cards_insert_input!]!) {
        insert_game_cards(objects: $objects) {
          affected_rows
        }
      }
    `,
    variables: {
      objects,
    },
  });
};
