// https://rinkeby.etherscan.io/tx/0x177de3be634fbfe877a756a1d5b7df6e1904f39fe21aa35907c447105572a37f

// const fs = require('fs')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

const abiPath = '../abi/'

const ERC1155Mintable = require(abiPath + 'ERC1155Mintable.json')

const ElementSharedAsset = require(abiPath + 'ElementSharedAsset.json')

const ElementixProxyRegistry = require(abiPath + 'ElementixProxyRegistry.json')
const ElementixExchange = require(abiPath + 'ElementixExchange.json')
const WETH = require(abiPath + 'WETH9Mocked.json')
const ElementixTokenTransferProxy = require(abiPath + 'ElementixTokenTransferProxy.json')
const ExchangeHelper = require(abiPath + 'ExchangeHelper.json')
const AuthenticatedProxy = require(abiPath + 'AuthenticatedProxy.json')
const MakeTokenID = require(abiPath + 'MakeTokenID.json')


const { tokens, schemas, encodeSell, encodeBuy } = require('../lib/schema')


let provider = 'http://39.102.101.142:8545'
// let provider = "http://127.0.0.1:8545"

let web3Provider = new Web3.providers.HttpProvider(provider)
const web3 = new Web3(web3Provider)



// your private keys
web3.eth.accounts.wallet.add('0x078bad8a23809d79c021f84e6c56e900f8082b05e51872e32361ada65a144dea')
web3.eth.accounts.wallet.add('0x59ae5462c42c8b9e4a7c760f4021fdfd1ae551a42ae3a7261ecd21c747bfef89')


const sellAccount = web3.eth.accounts.wallet[0].address
const buyAccount = web3.eth.accounts.wallet[1].address
const account = sellAccount

console.log('sellAccount:%s, buyAccount: %s', sellAccount, buyAccount)

// TODO: 需要修改的参数， tokenId和sellerAccountAddress有关，需要单独计算生成
const networkID = '100'


web3.eth.defaultAccount = account


let feeRecipient = '0x049FE7c378aaF7a7eD1df544aAff7ABa35EE40dB'
let nullAddr = '0x0000000000000000000000000000000000000000'

let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'

let nftAddr = ElementSharedAsset.networks[networkID].address //0x1B083283024F8d6799bfebF79A26cdC683aB0677
const nftContract = new web3.eth.Contract(ElementSharedAsset.abi, nftAddr, {
  from: account,
  gas: 80e4.toString()
})
const ERC1155Type = schemas.private.find(x => x.name === 'ERC1155')

// let tokenId = "1"
//
// let nftAddr = "0x626743a83D7daD4896F08f06dAf4066F1A20bF24"
// const nftContract = new web3.eth.Contract(ERC1155Mintable.abi, nftAddr, {
//   from: account,
//   gas: 80e4.toString()
// })
// const ERC1155Type = schemas.private.find(x => x.name === 'ERC1155')[0]

let proxyRegistryAddr = ElementixProxyRegistry.networks[networkID].address
const proxyRegistryContract = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, {
  from: account,
  gas: 80e4.toString()
})

let exchangeAddr = ElementixExchange.networks[networkID].address
const exchangeContract = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, {
  from: account,
  gas: 80e4.toString()
})


let exchangeHelperAddr = ExchangeHelper.networks[networkID].address
const exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, {
  from: account,
  gas: 80e4.toString()
})
// const payToken = tokens.private.canonicalWrappedEther

let wETHAddr = WETH.networks[networkID].address

let payToken = {
  'address': wETHAddr,
  'decimals': '18'
}

const WETHContract = new web3.eth.Contract(WETH.abi, payToken.address, {
  gas: 80e4.toString()
})


const getOrderHash = async (order) => {
  let orderParamValueArray = orderParamsEncode(order)
  let hash = await exchangeHelper.methods.hashOrder(orderParamValueArray).call()
  return hash
}

function generatePseudoRandomSalt() {
  // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
  // Source: https://mikemcl.github.io/bignumber.js/#random
  const MAX_DIGITS_IN_UNSIGNED_256_INT = 18 // 78
  const randomNumber = BigNumber.random(MAX_DIGITS_IN_UNSIGNED_256_INT)
  const factor = new BigNumber(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1)
  const salt = randomNumber.times(factor).integerValue()
  return salt
}

const validateOrder = async (order) => {
  let orderParamValueArray = orderParamsEncode(order)
  let orderSigArray = orderSigEncode(order)
  let result = await exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()
  return result
}

let cover = (amount, decimals) => {
  // amount = amount.toString()
  return (new BigNumber(amount)).times((new BigNumber(10)).pow(decimals)).toString()
  // return 10e18.toString()
}

let coverDiv = (amount, decimals) => {
  // amount = amount.toString()
  return (new BigNumber(amount)).div((new BigNumber(10)).pow(decimals)).toString()
}


const createSellOrder = async (tokenAddress, tokenId, quantity, ower, sellPrice) => {
  let asset = ERC1155Type.assetFromFields({
    'ID': tokenId,
    'Quantity': quantity.toString(),
    'Address': tokenAddress.toLowerCase(),
    'Name': '',
    'Data': '' /*'element.market/' + tokenAddress.toString() +'/'+ */
  })

  let { target, dataToCall, replacementPattern } = encodeSell(ERC1155Type, asset, ower) //target,
  let order = {
    exchange: exchangeAddr,
    maker: ower,
    taker: nullAddr,
    makerRelayerFee: 250,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeMethod: 1, // 拍卖
    feeRecipient: feeRecipient.toLowerCase(),
    side: 1,
    saleKind: 0,
    target: target,
    howToCall: 0,
    dataToCall: dataToCall,
    replacementPattern: replacementPattern,
    staticTarget: nullAddr,
    staticExtradata: '0x',
    paymentToken: payToken.address,
    basePrice: cover(sellPrice, payToken.decimals),
    extra: new BigNumber(0).toString(),
    listingTime: new BigNumber(Math.round(Date.now() / 1000 - 6000)).toString(),
    expirationTime: '0',//new BigNumber(Math.round((Date.now() / 1000) + 86400)).toString(),
    salt: generatePseudoRandomSalt().toString(),
    metadata: {
      schema: 'ERC1155',
      asset: asset
    }
  }

  const hash = await getOrderHash(order)
  const signature = await signatureObj(hash, ower)
  order.hash = hash
  order.r = signature.r
  order.s = signature.s
  order.v = signature.v

  return Object.assign({}, order)
}


const createBuyOrder = async (tokenAddress, tokenId, quantity, ower, buyPrice) => {
  let asset = ERC1155Type.assetFromFields({
    'ID': tokenId,
    'Quantity': quantity.toString(),
    'Address': tokenAddress.toLowerCase(),
    'Name': '',
    'Data': ''/*'element.market/' + tokenAddress.toString() + '/'+*/
  })


  let { target, dataToCall, replacementPattern } = encodeBuy(ERC1155Type, asset, ower)

  let order = {
    exchange: exchangeAddr,
    maker: ower,
    taker: sellAccount,
    makerRelayerFee: 250,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeMethod: 1, // 拍卖
    feeRecipient: nullAddr,
    side: 0,
    saleKind: 0,
    target: target,
    howToCall: 0,
    dataToCall: dataToCall,
    replacementPattern: replacementPattern,
    staticTarget: nullAddr,
    staticExtradata: '0x',
    paymentToken: payToken.address,
    basePrice: cover(buyPrice, payToken.decimals),
    extra: new BigNumber(0).toString(),
    listingTime: new BigNumber(Math.round(Date.now() / 1000 - 6000)).toString(),
    expirationTime: '0',//new BigNumber(Math.round((Date.now() / 1000) + 86400)).toString(),
    salt: generatePseudoRandomSalt().toString(),
    metadata: {
      schema: 'ERC1155',
      asset: asset
    }
  }

  const hash = await getOrderHash(order)
  const signature = await signatureObj(hash, ower)
  order.hash = hash
  order.r = signature.r
  order.s = signature.s
  order.v = signature.v

  return Object.assign({}, order)
}


const registerProxy = async (account) => {

  let proxy = await proxyRegistryContract.methods.proxies(account).call()


  if (proxy != nullAddr) {
    console.log('Proxy: ' + account + ':' + proxy)
    return
  }

  let rawTxNew = await proxyRegistryContract.methods.registerProxy().send({
    from: account
  })
  console.log('Creating proxy; TX: ' + rawTxNew.transactionHash)
  proxy = await proxyRegistryContract.methods.proxies(account).call()
  console.log('Proxy: ' + account + ':' + proxy)
  return proxy
}

const signatureObj = async (message, account) => {
  let messageHash = web3.eth.accounts.hashMessage(message)
  let signature = await web3.eth.sign(message, account)
  const result = signature.substring(2)
  const r = '0x' + result.substring(0, 64)
  const s = '0x' + result.substring(64, 128)
  const v = parseInt(result.substring(128, 130), 16)// The signature is now comprised of r, s, and v.
  // const v = "0x" + result.substring(128, 130)//
  let addr = await web3.eth.accounts.recover(message, signature)
  if (addr.toLowerCase() != account.toLowerCase()) return {}
  return {
    message, messageHash, r, s, v, signature
  }
}
let canSettleOrder = (listingTime, expirationTime) => {
  let now = (new Date().getTime()) / 1000
  return (Number(listingTime) < now) && (Number(expirationTime) == 0 || now < Number(expirationTime))
}

let orderCanMatch = (buy, sell) => {
  return (buy.side == 0 && sell.side == 1) &&
    /* Must use same fee method. */
    (buy.feeMethod == sell.feeMethod) &&
    /* Must use same payment token. */
    (buy.paymentToken == sell.paymentToken) &&
    /* Must match maker/taker addresses. */
    (sell.taker == nullAddr || sell.taker == buy.maker) &&
    (buy.taker == nullAddr || buy.taker == sell.maker) &&
    /* One must be maker and the other must be taker (no bool XOR in Solidity). */
    ((sell.feeRecipient == nullAddr && buy.feeRecipient != nullAddr) || (sell.feeRecipient != nullAddr && buy.feeRecipient == nullAddr)) &&
    /* Must match target. */
    (buy.target == sell.target) &&
    /* Must match howToCall. */
    (buy.howToCall == sell.howToCall) &&
    /* Buy-side order must be settleable. */
    canSettleOrder(buy.listingTime, buy.expirationTime) &&
    /* Sell-side order must be settleable. */
    canSettleOrder(sell.listingTime, sell.expirationTime)
}

let orderApprove = async (buy, sell) => {
  let buyApproveTx = await exchangeContract.methods.approveOrder(
    orderParamsEncode(buy),
    true
  ).send({
    from: buy.maker,
    gas: 80e4.toString()
  })

  console.log('buyApproveTx', buyApproveTx.transactionHash)

  let sellApproveTx = await exchangeContract.methods.approveOrder(
    orderParamsEncode(sell),
    true
  ).send({
    from: sell.maker,
    gas: 80e4.toString()
  })
  console.log('sellApproveTx', sellApproveTx.transactionHash)
}

var sleep = function(time) {
  var startTime = new Date().getTime() + parseInt(time, 10)
  while (new Date().getTime() < startTime) {
  }
}


// element
let tokenAmount = 1

const go = async () => {
  // 买家ERC20或ETH余额
  const balance = await web3.eth.getBalance(buyAccount)
  console.log('buyer ETH Balance: ' + balance)
  if (balance === 0) {
    throw new Error('Nonzero balance required!')
  }


  // 检查买/卖家NFT余额
  let sellerNFTbalance = await nftContract.methods.balanceOf(sellAccount, tokenId).call()
  if (sellerNFTbalance == '0') {
    throw new Error('seller account balance <1 !')
  } else {
    console.log('seller account %s has nft %s amount %s', sellAccount, tokenId, sellerNFTbalance)
  }
  let buyerNFTbalance = await nftContract.methods.balanceOf(buyAccount, tokenId).call()
  console.log('buyer account %s has nft %s amount %s', buyAccount, tokenId, buyerNFTbalance)

  // 创建sell/buy订单
  const sell = await createSellOrder(nftAddr, tokenId, tokenAmount, account, 0.2)
  const buy = await createBuyOrder(nftAddr, tokenId, tokenAmount, buyAccount, 0.2)

  // 验证订单
  let sellPass = await validateOrder(sell)
  let buyPass = await validateOrder(buy)
  if (sellPass == true && buyPass == true) {
    console.log('valid order ok.....')
  } else {
    console.log('valid order failed!!!!!')
    return
  }

  let buyOrderParamArray = orderParamsEncode(buy)
  let buyOrderSigArray = orderSigEncode(buy)

  let sellOrderParamArray = orderParamsEncode(sell)
  let sellOrderSigArray = orderSigEncode(sell)

  let calculatePrice = await exchangeHelper.methods.calculateMatchPrice(buyOrderParamArray, sellOrderParamArray).call()
  console.log('calculatePrice:', coverDiv(calculatePrice, payToken.decimals))

  let canMatchCheck = orderCanMatch(buy, sell)
  console.log('canMatchCheck check', canMatchCheck)
  if (!canMatchCheck) {
    // console.log(buy, sell)
    return
  }

  let canMatch = await exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call()
  console.log('canMatch', canMatch)
  if (!canMatch) {
    return
  }

  console.log("test buyOrderParamArray",buyOrderParamArray);
  // console.log(buyOrderSigArray);
  //
  console.log("tset sellOrderParamArray",sellOrderParamArray);
  // console.log(sellOrderSigArray);

  let matchTx = await exchangeContract.methods.orderMatch(
    buyOrderParamArray,
    buyOrderSigArray,
    sellOrderParamArray,
    sellOrderSigArray,
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ).send({
    value: buy.paymentToken != nullAddr ? 0 : buy.basePrice,
    from: buy.maker,
    gas: 80e4.toString()
  }).catch(e => {
    console.log(e.receipt, e.message)
  })
  console.log('orderMatch', matchTx.status)

  // 检查买、卖方token余额
  sellerNFTbalance = await nftContract.methods.balanceOf(sellAccount, tokenId).call()
  console.log('seller account %s has nft %s amount %s', sellAccount, tokenId, sellerNFTbalance)

  buyerNFTbalance = await nftContract.methods.balanceOf(buyAccount, tokenId).call()
  console.log('buyer account %s has nft %s amount %s', buyAccount, tokenId, buyerNFTbalance)
}

let makeTokenIdForOwner = async (account, index, supply) => {
  const exchangeContract = new web3.eth.Contract(MakeTokenID.abi, MakeTokenID.networks[networkID].address, {
    from: account,
    gas: 80e4.toString()
  })

  await exchangeContract.methods.makeID(account, index, supply).send()
  let newID = await exchangeContract.methods.newID().call()
  console.log('make id %s for owner %s', newID, account)
}

let encodeTransferFrom = async (account) => {

  let transferABI = {
    'constant': false,
    'inputs': [
      {
        'internalType': 'address',
        'name': '_from',
        'type': 'address'
      },
      {
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      },
      {
        'internalType': 'uint256',
        'name': '_amount',
        'type': 'uint256'
      },
      {
        'internalType': 'bytes',
        'name': '_data',
        'type': 'bytes'
      }
    ],
    'name': 'safeTransferFrom',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }

  // private
  let dataToCall = web3.eth.abi.encodeFunctionCall(transferABI,
    [
      '0x180BbD8601D56d6b654ec352A4A73b54917d9f3c',
      '0xEd32e2c154De6963eA520CBBB76C414a411eb604',
      tokenId,
      1,
      tokenId
    ]
  )

  console.log(dataToCall)


  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  console.log('Proxy: ' + proxy)

  const AuthenticatedProxyContract = new web3.eth.Contract(AuthenticatedProxy.abi, proxy, {
    from: account,
    gas: 80e4.toString()
  })

  const nftContract = new web3.eth.Contract(ElementSharedAsset.abi, ElementSharedAsset.networks[networkID].address, {
    from: account,
    gas: 80e4.toString()
  })

  let nftAmount = await nftContract.methods.balanceOf(account, tokenId).call()
  console.log('account %s have nft amount=%s', account, nftAmount)

  if (nftAmount == '0') {
    return
  }

  let destAddr = ElementSharedAsset.networks[networkID].address
  let proxyAssetRun = await AuthenticatedProxyContract.methods.proxyAssert(destAddr, 0, dataToCall).send({
    value: 0,
    from: account,
    gas: 80e4.toString()
  }).catch(e => {
    console.log(e.receipt, e.message)
  })

  console.log(proxyAssetRun)
}


const CheckSenderOfAuthenticatedProxy = async (account) => {

  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  console.log('Proxy: ' + proxy)

  const AuthenticatedProxyContract = new web3.eth.Contract(AuthenticatedProxy.abi, proxy, {
    from: account,
    gas: 80e4.toString()
  })

  let _proxyRegistryAddr = await AuthenticatedProxyContract.methods.registry().call()
  const _proxyRegistryContract = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, {
    from: account,
    gas: 80e4.toString()
  })

  let exchangeInclude = await _proxyRegistryContract.methods.contracts(exchangeAddr).call()
  console.log('exchangeAddr:%s has include = %s in %s ', exchangeAddr, exchangeInclude, _proxyRegistryAddr)

  return exchangeInclude
}


const checkAccountBalance = async (buyAccount, sellAccount, mint) => {
  let buyBal = await WETHContract.methods.balanceOf(buyAccount).call()
  if (Number(buyBal) < 1e18) {
    await WETHContract.methods.deposit().send({
      from: buyAccount,
      value: 2e18.toString()
    })
    buyBal = await WETHContract.methods.balanceOf(buyAccount).call()
  }
  console.log('buyAccount %s WETH balance %s', buyAccount, buyBal)

  let sellBal = await WETHContract.methods.balanceOf(sellAccount).call()
  if (Number(sellBal) < 1e18) {
    await WETHContract.methods.deposit().send({
      from: sellAccount,
      value: 2e18.toString()
    })
    sellBal = await WETHContract.methods.balanceOf(sellAccount).call()
  }
  console.log('sellAccount %s WETH balance %s', sellAccount, sellBal)
}


const approveTokenTransferProxy = async (account) => {

  let exchangeAddr = ElementixExchange.networks[networkID].address
  const exchangeContract = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, {
    from: account,
    gas: 80e4.toString()
  })

  let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()


  const amount = await WETHContract.methods.allowance(account, tokenTransferProxyAddr).call()
  if (Number(amount) <= 100e18) {
    let approveResult = await WETHContract.methods.approve(tokenTransferProxyAddr, 101e18.toString()).send({
      from: account
    })

    console.log('approveTokenTransferProxy: %s', approveResult)
  }
}

const approveNftsTransferProxy = async (nftsContract, account, tokenID) => {

  let operator = await proxyRegistryContract.methods.proxies(account).call()

  let isApprove = await nftsContract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    await nftsContract.methods.setApprovalForAll(operator, true).send({ from: account })

    console.log('change isApprove: %s', isApprove)

    isApprove = await nftsContract.methods.isApprovedForAll(account, operator).call()
  }

  return isApprove
}


const orderParamsEncode = (order) => {
  let orderParamKeys = [
    'exchange',
    'maker',
    'taker',
    'makerRelayerFee',
    'takerRelayerFee',
    'makerProtocolFee',
    'takerProtocolFee',
    'feeRecipient',
    'feeMethod',
    'side',
    'saleKind',
    'target',
    'howToCall',
    'dataToCall',
    'replacementPattern',
    'staticTarget',
    'staticExtradata',
    'paymentToken',
    'basePrice',
    'extra',
    'listingTime',
    'expirationTime',
    'salt'
  ]
  let orerParamValueArray = []
  for (var key of orderParamKeys) {
    orerParamValueArray.push(order[key])
  }
  return orerParamValueArray
}
const orderSigEncode = (order) => {
  let orderSigKeys = ['v', 'r', 's']
  let orderSigValueArray = []
  for (var key of orderSigKeys) {
    orderSigValueArray.push(order[key])
  }
  return orderSigValueArray
}

(async () => {
  try {
    // 创新新tokenId
    // makeTokenIdForOwner(sellAccount,1,1)

    let contractProxy = await CheckSenderOfAuthenticatedProxy(buyAccount)
    if (!contractProxy) {
      console.log('contractProxy', contractProxy)
      return
    }

    await registerProxy(buyAccount)
    await registerProxy(sellAccount)

    if(payToken.address != nullAddr){
      await checkAccountBalance(buyAccount, sellAccount)

      await approveTokenTransferProxy(buyAccount)
      await approveTokenTransferProxy(sellAccount)

    }

    await approveNftsTransferProxy(nftContract, buyAccount, tokenId)
    await go()
    if(payToken.address != nullAddr) {
      await checkAccountBalance(buyAccount, sellAccount)
    }

  } catch (e) {
    console.log(e)
  }
})()

