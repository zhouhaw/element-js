import { NetworkTokens } from '../../types'

export const privateTokens: NetworkTokens = {
  canonicalWrappedEther: {
    name: 'Private Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c'
  },
  otherTokens: [
    { name: 'Private Wrapped Ether', symbol: 'WETH', decimals: 18, address: '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c'},
    { name: 'Private USDC', symbol: 'USDC', decimals: 18, address: '0xDf5506B6da814541b139801AA88f4E877A854E5c'},
    { name: 'Private DAI', symbol: 'DAI', decimals: 18, address: '0xC8a01243f0ED3B9B46599cF62C1649F9d8566101'}
  ]
}
