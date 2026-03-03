import { gql } from 'graphql-request';

export const GET_POLL_USER_QUERY = gql`
  query GetPollUser($id: Bytes!) {
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

export const GET_POLL_USER_BY_POLL_QUERY = gql`
  query GetPollUserData($registrationId: ID!, $maciUserId: ID!) {
    registration(id: $registrationId) {
      id
      createdAt
    }
    user(id: $maciUserId) {
      id
      accounts {
        id
        voiceCreditBalance
      }
    }
  }
`;
