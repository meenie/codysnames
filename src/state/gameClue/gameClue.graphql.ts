import gql from 'graphql-tag';

import { Apollo } from '../apollo/apollo.types';
import { GameClue } from './gameClue.types';

export const CLUE_FIELDS_FRAGMENT = gql`
  fragment clue_fields on game_clues {
    id
    color
    clue
    game_id
    number_of_guesses
    updated_at
    created_at
  }
`;

export const setGameClue = async (
  client: Apollo.Entity,
  gameClue: Omit<GameClue.Entity, 'id'>
) => {
  const result = await client.mutate<{ insert_game_clues_one: GameClue.Entity }>({
    mutation: gql`
      mutation CreateGameClue($object: game_clues_insert_input!) {
        insert_game_clues_one(object: $object) {
          ...clue_fields
        }
      }
      ${CLUE_FIELDS_FRAGMENT}
    `,
    variables: {
      object: gameClue,
    },
  });

  if (result.data) {
    return result.data.insert_game_clues_one;
  }
};
