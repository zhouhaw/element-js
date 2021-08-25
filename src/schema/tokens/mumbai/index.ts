import { NetworkTokens } from '../../types'

export const mumbaiTokens: NetworkTokens = {
  canonicalWrappedEther: {
    name: 'Mumbai Canonical Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
  },
  otherTokens: [
    { name: 'Mumbai WETH', symbol: 'WETH', decimals: 18, address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa' },
    { name: 'Mumbai DAI', symbol: 'DAI', decimals: 18, address: '0xb224913CE3851b0a0d7C0FB461eEF40f2e31ddb8' }
  ]
}
