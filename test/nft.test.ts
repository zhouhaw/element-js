import Web3 from 'web3'

const abiPath = '../abi/'
const ElementSharedAsset = require(`${abiPath}ElementSharedAsset.json`)

const MakeTokenID = require(`${abiPath}MakeTokenID.json`)

// let web3 = new Web3('http://39.102.101.142:8555') // net id 8555
const web3 = new Web3('http://39.102.101.142:8545') // net id 100

// const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const makeTokenIdForOwner = async (contract: any, account: string, index: number, supply: number): Promise<any> => {
    await contract.methods.makeID(account, index, supply).send()
    return contract.methods.newID().call()
  }


;(async () => {
  try {
    // tokenId:'72134322679254813612560192230305857957633912505434515263987832381968402612225',
    //   tokenAddress: '0x1B083283024F8d6799bfebF79A26cdC683aB0677'

    //'100873831425417172796821470474744747465349791964556394886292914461569892483073'


    // your private keys
    web3.eth.accounts.wallet.add(
      '0x078bad8a23809d79c021f84e6c56e900f8082b05e51872e32361ada65a144dea'
    )
    web3.eth.accounts.wallet.add(
      '0x59ae5462c42c8b9e4a7c760f4021fdfd1ae551a42ae3a7261ecd21c747bfef89'
    )

    const sellAccount = web3.eth.accounts.wallet[0].address
    const buyAccount = web3.eth.accounts.wallet[1].address


    console.log('sellAccount:%s, buyAccount: %s', sellAccount, buyAccount)

    web3.eth.defaultAccount = buyAccount

    const networkID: number = await web3.eth.net.getId()

    const idContract = new web3.eth.Contract(MakeTokenID.abi, MakeTokenID.networks[networkID].address, {
      from:buyAccount,
      gas: 80e4
    })

    // let tokenId = await makeTokenIdForOwner(idContract, sellAccount, 1, 1)
    let tokenId = "52110910509117159886520023034677676808462086871028572901793699248975699247105"


    let assetAddr = ElementSharedAsset.networks[networkID].address
    const nftContract = new web3.eth.Contract(ElementSharedAsset.abi, assetAddr, {
      from: sellAccount,
      gas: 80e4
    })


    let exists = await nftContract.methods.exists(tokenId).call()
    let creator = await nftContract.methods.creator(tokenId).call()

    console.log(exists, creator, sellAccount)
    if (creator != sellAccount) {
      return
    }

    // 检查买/卖家NFT余额
    let sellerNFTbalance = await nftContract.methods.balanceOf(buyAccount, tokenId).call()
    if (sellerNFTbalance == '0') {
      throw new Error('seller account balance <1 !')
    } else {
      console.log('seller account %s has nft %s amount %s', sellAccount, tokenId, sellerNFTbalance)
    }
    let buyerNFTbalance = await nftContract.methods.balanceOf(buyAccount, tokenId).call()
    console.log('buyer account %s has nft %s amount %s', buyAccount, tokenId, buyerNFTbalance)


    // await go()
  } catch (error) {
    console.log(error)
  }
})()

