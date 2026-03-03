import { GET_POLL_USER_BY_POLL_QUERY } from '@/services/queries/pollUser';
import { GET_PRIVOTE_USER_QUERY } from '@/services/queries/privoteUser';
import { GET_USER_QUERY } from '@/services/queries/user';
import type { User } from '@/types';
import { padKey, PublicKey, type Keypair } from '@maci-protocol/domainobjs';
import { fetcher } from './fetcher';

export interface ISignedupUserData {
  isRegistered: boolean;
  stateIndex: string | undefined;
}

export interface IJoinedUserData {
  isJoined: boolean;
  voiceCredits: string | undefined;
  pollStateIndex: string | undefined;
}

export const getSignedupUserData = async (url: string, keyPair: Keypair) => {
  try {
    const data: { user: User } = await fetcher([
      url,
      GET_PRIVOTE_USER_QUERY,
      {
        id: `${keyPair?.publicKey.asContractParam().x} ${keyPair?.publicKey.asContractParam().y}`
      }
    ]);

    if (!data.user) {
      throw new Error('User not found');
    }

    if (data.user.accounts.length > 0) {
      return {
        isRegistered: true,
        stateIndex: data.user.accounts[0].id
      };
    }

    throw new Error('User not registered');
  } catch (err) {
    console.error(err);

    return { isRegistered: false, stateIndex: undefined };
  }
};

export const getJoinedUserData = async (url: string, pollAddress: string, keyPair?: Keypair) => {
  try {
    const x = keyPair?.publicKey.asContractParam().x;
    const y = keyPair?.publicKey.asContractParam().y;

    // Registration ID format from handlePollJoined: {pollAddress}-{pubkeyX}-{pubkeyY}
    const registrationId = `${pollAddress}-${x}-${y}`;
    // MACI signup user uses space separator (handleSignUp) and owns the Account with voiceCredits
    const maciUserId = `${x} ${y}`;

    const data: {
      registration: { id: string; createdAt: string } | null;
      user: { id: string; accounts: { id: string; voiceCreditBalance: string }[] } | null;
    } = await fetcher([url, GET_POLL_USER_BY_POLL_QUERY, { registrationId, maciUserId }]);

    if (!data.registration) {
      return { isJoined: false, voiceCredits: 0, pollStateIndex: undefined };
    }

    const accounts = data.user?.accounts ?? [];
    return {
      isJoined: true,
      voiceCredits: accounts[0]?.voiceCreditBalance ?? 0,
      pollStateIndex: accounts[0]?.id
    };
  } catch (err) {
    console.error('getJoinedUserData error:', err);
    return { isJoined: false, voiceCredits: 0, pollStateIndex: undefined };
  }
};

export const getKeys = async (url: string) => {
  const data: { users: { id: string }[] } = await fetcher([url, GET_USER_QUERY, {}]);
  console.log('getKeys: data', data);

  if (!data.users) {
    throw new Error('No users data in response');
  }

  const userKeys = data.users.map(user => {
    // Split the id into x and y coordinates and convert to BigInt
    const [x, y] = user.id.includes(' ') ? user.id.split(' ') : user.id.split('-');
    console.log('userKey: x', x);
    console.log('userKey: y', y);
    return new PublicKey([BigInt(x), BigInt(y)]);
  });

  return [padKey, ...userKeys];
};
