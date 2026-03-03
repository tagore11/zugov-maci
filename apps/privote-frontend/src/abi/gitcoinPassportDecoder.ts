const gitcoinPassportDecoderAbi = [
  {
    type: 'function',
    name: 'getScore',
    inputs: [{ name: 'user', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  }
] as const;

export default gitcoinPassportDecoderAbi;
