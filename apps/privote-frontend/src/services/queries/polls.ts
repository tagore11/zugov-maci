import { gql } from 'graphql-request';

export const GET_POLLS_QUERY = gql`
  query GetPolls(
    $first: Int!
    $skip: Int!
    $where: Poll_filter
    $orderBy: Poll_orderBy
    $orderDirection: OrderDirection
  ) {
    polls(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
      id
      pollId
      name
      startDate
      endDate
      voteOptions
      options
      optionInfo
      policyType
      metadata
      owner
      mode
      duration
      totalSignups
      numMessages
      createdAt
      updatedAt
      maci {
        id
      }
    }
  }
`;

export const GET_POLL_QUERY = gql`
  query GetPoll($id: Bytes!) {
    poll(id: $id) {
      id
      pollId
      name
      startDate
      endDate
      voteOptions
      options
      optionInfo
      policyType
      metadata
      owner
      mode
      duration
      totalSignups
      numMessages
      createdAt
      updatedAt
      maci {
        id
      }
    }
  }
`;
