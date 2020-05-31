import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { query } from 'graphqurl';

admin.initializeApp(functions.config().firebase);

export const processSignUp = functions.auth.user().onCreate(async (user) => {
  const customClaims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': [ 'user' ],
      'x-hasura-user-id': user.uid,
    },
  };
  try {
    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    await query({
      query: `
        mutation UpsertPlayer($id: String!) {
          insert_players(
            objects: { id: $id }
          ) {
            affected_rows
          }
        }
      `,
      endpoint: `https://${functions.config().hasura.host}/v1/graphql`,
      headers: {
        'x-hasura-admin-secret': functions.config().hasura.secret,
      },
      variables: {
        id: user.uid,
      },
    });

    const metadataRef = admin.database().ref('metadata/' + user.uid);
    return metadataRef.set({ refreshTime: new Date().getTime() });
  } catch (error) {
    console.log(error);
  }
});
