import { gql } from 'graphql-request';

export const GET_USER_QUERY = gql`
  query {
    users(orderBy: createdAt, orderDirection: asc) {
      id
    }
  }
`;
