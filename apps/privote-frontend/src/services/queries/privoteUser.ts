import { gql } from 'graphql-request';

export const GET_PRIVOTE_USER_QUERY = gql`
  query GetPrivoteUser($id: Bytes!) {
    user(id: $id) {
      id
      createdAt
      accounts {
        id
        voiceCreditBalance
        createdAt
      }
    }
  }
`;
