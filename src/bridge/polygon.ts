import { MaticPOSClient } from '@maticnetwork/maticjs'
const parentProvider = 'https://goerli.infura.io/v3/393758f6317645be8a1ee94a874e12d9'
const maticProvider = 'https://rpc-mumbai.matic.today'

const maticPOSClient = new MaticPOSClient({
  network: 'testnet',
  version: 'mumbai',
  parentProvider,
  maticProvider
})
