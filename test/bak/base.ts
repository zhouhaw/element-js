import Web3 from 'web3'
import { Contracts, Orders } from '../../src'
import { Network } from '../../src'

export class Base {
  public web3: any
  public contracts: any
  public accounts: any
  public orders: any

  constructor(provider?: string) {
    // let web3 = new Web3('http://39.102.101.142:8555') // net id 8555
    let _web3 = new Web3('http://39.102.101.142:8545') // net id 100
    //0x7335bae9c88c59382621a2fbe08a353a93510f56
    _web3.eth.accounts.wallet.add('0x078bad8a23809d79c021f84e6c56e900f8082b05e51872e32361ada65a144dea')
    //0x28989099df975acf0c6a1db28c4a4805ae5e2fc8
    _web3.eth.accounts.wallet.add('0x59ae5462c42c8b9e4a7c760f4021fdfd1ae551a42ae3a7261ecd21c747bfef89')
    //0xc7711f36b2C13E00821fFD9EC54B04A60AEfbd1b
    _web3.eth.accounts.wallet.add('0x979f020f6f6f71577c09db93ba944c89945f10fade64cfc7eb26137d5816fb76')
    //0x4A8b1005816A31b07B25254a883761BaCf297abc
    _web3.eth.accounts.wallet.add('0xf4a84f75c927741978de9f4d5c38d1ce555c8714d5da66361e59a87eb31f3a34')

    this.accounts = _web3.eth.accounts.wallet

    this.web3 = _web3
  }

  public async init() {
    let networkID: number = await this.web3.eth.net.getId()
    this.contracts = new Contracts(this.web3, { networkName: Network.Private, networkID })
    this.orders = new Orders(this.web3, { networkName: Network.Private, networkID })
  }
}
