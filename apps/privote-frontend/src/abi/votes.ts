const votesAbi = [
  {
    type: 'function',
    name: 'getPastTotalSupply',
    inputs: [{ name: 'timepoint', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getPastVotes',
    inputs: [
      { name: 'account', type: 'address', internalType: 'address' },
      { name: 'timepoint', type: 'uint256', internalType: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  }
] as const;

export default votesAbi;
