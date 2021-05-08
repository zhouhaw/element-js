import Web3 from 'web3'
import { Contracts, Orders } from '../src/index'
import { Network } from '../src'

export class Base {
  public web3: any
  public contracts: any
  public accounts: any
  public orders: any

  constructor(provider?: string) {
    // let web3 = new Web3('http://39.102.101.142:8555') // net id 8555
    let _web3 = new Web3('http://39.102.101.142:8545') // net id 100
    _web3.eth.accounts.wallet.add('0x078bad8a23809d79c021f84e6c56e900f8082b05e51872e32361ada65a144dea')
    _web3.eth.accounts.wallet.add('0x59ae5462c42c8b9e4a7c760f4021fdfd1ae551a42ae3a7261ecd21c747bfef89')
    this.accounts = _web3.eth.accounts.wallet
    _web3.eth.defaultAccount = _web3.eth.accounts.wallet[0].address
    this.web3 = _web3
  }

  public async init() {
    let networkID: number = await this.web3.eth.net.getId()
    this.contracts = new Contracts(this.web3, { networkName: Network.Private, networkID })
    this.orders = new Orders(this.web3, { networkName: Network.Private, networkID })
  }
}
