import { gql } from 'graphql-request';

export const GET_ATTESTATIONS_QUERY = gql`
  query Attestations($where: AttestationWhereInput) {
    attestations(where: $where, orderBy: { time: desc }, take: 1) {
      id
      time
    }
  }
`;
