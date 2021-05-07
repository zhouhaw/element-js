import {
  NetworkTokens,
} from '../../types';

export const rinkebyTokens: NetworkTokens = {
  canonicalWrappedEther: {name: 'Rinkeby Canonical Wrapped Ether', symbol: 'WETH', decimals: 18, address: '0x92893ed51e36243d30bd51f805a7ec3b83fd938c'},
  otherTokens: [
    {name: 'Rinkeby Test Token', symbol: 'TST', decimals: 18, address: '0xb7dDCF6B64C05D76Adc497AE78AD83ba3883A294'},
    {name: 'Decentraland - Chainbreakers', symbol: 'MANA', decimals: 18, address: '0x0f8528c53fecb54b7005525a3e797e261a51b88e'},
  ],
};
