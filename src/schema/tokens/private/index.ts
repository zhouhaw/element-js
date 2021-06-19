import { NetworkTokens } from '../../types'

export const privateTokens: NetworkTokens = {
  canonicalWrappedEther: {
    name: 'Private Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c'
  },
  otherTokens: [
    { name: 'Element Token', symbol: 'ELE', decimals: 18, address: '0xb7dDCF6B64C05D76Adc497AE78AD83ba3883A294' }
  ]
}
