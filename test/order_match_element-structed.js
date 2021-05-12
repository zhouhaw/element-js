// https://rinkeby.etherscan.io/tx/0x177de3be634fbfe877a756a1d5b7df6e1904f39fe21aa35907c447105572a37f

// import { ElementSchemaName, Network } from '../src'

const fs = require('fs')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')

const abiPath = '../abi/'
const ElementSharedAsset = require(abiPath + 'ElementSharedAsset.json')
const ElementixProxyRegistry = require(abiPath + 'ElementixProxyRegistry.json')
const ElementixExchange = require(abiPath + 'ElementixExchange.json')
const WETH = require(abiPath + 'WETH9Mocked.json')
const ElementixTokenTransferProxy = require(abiPath + 'ElementixTokenTransferProxy.json')
const ExchangeHelper = require(abiPath + 'ExchangeHelper.json')
const AuthenticatedProxy = require(abiPath + 'AuthenticatedProxy.json')
const MakeTokenID = require(abiPath + 'MakeTokenID.json')

const { getSchemaList, encodeSell, ElementSchemaName, Network, encodeBuy } = require('../lib/index')

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
const networkID = '100' //"1619790064667";
let tokenId = '52110910509117159886520023034677676808462086871028572901793699250075210874881'

web3.eth.defaultAccount = account

let feeRecipient = '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b'
let nullAddr = '0x0000000000000000000000000000000000000000'
let proxyRegistryAddr = ElementixProxyRegistry.networks[networkID].address
const proxyRegistryContract = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, {
  from: account,
  gas: (80e4).toString()
})

let exchangeAddr = ElementixExchange.networks[networkID].address
const exchangeContract = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, {
  from: account,
  gas: (80e4).toString()
})

let exchangeHelperAddr = ExchangeHelper.networks[networkID].address
const exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, {
  from: account,
  gas: (80e4).toString()
})
// const payToken = tokens.private.canonicalWrappedEther

let wETHAddr = WETH.networks[networkID].address
let payToken = {
  address: wETHAddr,
  decimals: '18'
}

const WETHContract = new web3.eth.Contract(WETH.abi, payToken.address, {
  gas: (80e4).toString()
})

const ERC1155Type = getSchemaList(Network.Private, ElementSchemaName.ERC1155)[0] //schemas.private.filter((x) => x.name === 'ERC1155')[0]
// const ERC20Type = schemas.private.filter((x) => x.name === 'ERC20')[0]

function generatePseudoRandomSalt() {
  // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
  // Source: https://mikemcl.github.io/bignumber.js/#random
  let MAX_DIGITS_IN_UNSIGNED_256_INT = 78
  const randomNumber = BigNumber.random(MAX_DIGITS_IN_UNSIGNED_256_INT)
  const factor = new BigNumber(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1)
  const salt = randomNumber.times(factor).integerValue()
  return salt
}

const getOrderHash = async (order) => {
  let orderParamValueArray = orderParamsEncode(order)
  let hash = await exchangeHelper.methods.hashOrder(orderParamValueArray).call()
  return hash
}

const validateOrder = async (order) => {
  let orderParamValueArray = orderParamsEncode(order)
  let orderSigArray = orderSigEncode(order)
  let result = await exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()
  return result
}

let cover = (amount, decimals) => {
  return new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toString()
}

let coverDiv = (amount, decimals) => {
  return new BigNumber(amount).div(new BigNumber(10).pow(decimals)).toString()
}

const createSellOrder = async (tokenAddress, tokenId, quantity, ower, sellPrice) => {
  let asset = ERC1155Type.assetFromFields({
    ID: tokenId,
    Quantity: quantity.toString(),
    Address: tokenAddress.toLowerCase(),
    Name: '',
    Data: '' /*'element.market/' + tokenAddress.toString() +'/'+ */
  })

  let { target, dataToCall, replacementPattern } = encodeSell(ERC1155Type, asset, ower) //target,
  let calldata = dataToCall
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
    calldata: calldata,
    replacementPattern: replacementPattern,
    staticTarget: nullAddr,
    staticExtradata: '0x',
    paymentToken: nullAddr, //payToken.address,
    basePrice: cover(sellPrice, payToken.decimals),
    extra: new BigNumber(0).toString(),
    listingTime: new BigNumber(Math.round(Date.now() / 1000 - 6000)).toString(),
    expirationTime: '0', //new BigNumber(Math.round((Date.now() / 1000) + 86400)).toString(),
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
    ID: tokenId,
    Quantity: quantity.toString(),
    Address: tokenAddress.toLowerCase(),
    Name: '',
    Data: '' /*'element.market/' + tokenAddress.toString() + '/'+*/
  })

  let { target, dataToCall, replacementPattern } = encodeBuy(ERC1155Type, asset, ower)
  let calldata = dataToCall
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
    calldata: calldata,
    replacementPattern: replacementPattern,
    staticTarget: nullAddr,
    staticExtradata: '0x',
    paymentToken: nullAddr, //payToken.address,
    basePrice: cover(buyPrice, payToken.decimals),
    extra: new BigNumber(0).toString(),
    listingTime: new BigNumber(Math.round(Date.now() / 1000 - 6000)).toString(),
    expirationTime: '0', //new BigNumber(Math.round((Date.now() / 1000) + 86400)).toString(),
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

const postOrder = async (order) => {
  order['dataToCall'] = order['calldata']
  order['quantity'] = '1'
  order['makerReferrerFee'] = '0'
  order['makerRelayerFee'] = order['makerRelayerFee'] + ''
  order['takerRelayerFee'] = order['takerRelayerFee'] + ''
  order['makerProtocolFee'] = order['makerProtocolFee'] + ''
  order['takerProtocolFee'] = order['takerProtocolFee'] + ''

  const request = require('request')
  request.post({ url: 'http://39.96.19.41:8001/v1/orders/post', json: order }, function (error, response, body) {
    if (error != null) {
      console.error('error:', error) // Print the error if one occurred
      return
    } else {
      console.log('post--> statusCode:', response && response.statusCode) // Print the response status code if a response was received
      console.log('body:', body) // Print the HTML for the Google homepage.
    }
  })
}

const registerProxy = async (account) => {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy != nullAddr) {
    return
  }

  let rawTxNew = await proxyRegistryContract.methods.registerProxy().send({
    from: account
  })
  console.log('Creating proxy; TX: ' + rawTxNew.transactionHash)
  proxy = await proxyRegistryContract.methods.proxies(account).call()
  console.log('Proxy: ' + proxy)
  return proxy
}

const transferNFT = async (contract, account, tokenId, proxy) => {
  let owner = await contract.methods.ownerOf(tokenId).call()
  if (owner == web3.utils.toChecksumAddress(account)) {
    const txHash = await contract.methods.transfer(proxy, tokenId).send({
      from: account
    })
    console.log('Transferring NFT #' + tokenId + ' to proxy: ' + txHash.transactionHash)
  } else {
    console.log('Transferring NFT error: account not owner')
  }
}

const mintNFT = async (contract, account, tokenId) => {
  let foo = await contract.methods.totalSupply().call()
  let numTokensTotal = await contract.methods.numTokensTotal().call()
  let owner = await contract.methods.ownerOf(tokenId).call()
  let bal = await contract.methods.balanceOf(account).call()
  console.log('totalSupply', foo, bal, numTokensTotal.toString(), owner)
  if (owner === nullAddr) {
    let bar = await contract.methods.mint(account, tokenId).send()
    console.log('mintNFT', bar.blockNumber, bar.status, tokenId)
  }
}

const signatureObj = async (message, account) => {
  let messageHash = web3.eth.accounts.hashMessage(message)
  let signature = await web3.eth.sign(message, account)
  const result = signature.substring(2)
  const r = '0x' + result.substring(0, 64)
  const s = '0x' + result.substring(64, 128)
  const v = parseInt(result.substring(128, 130), 16) // The signature is now comprised of r, s, and v.
  // const v = "0x" + result.substring(128, 130)//
  let addr = await web3.eth.accounts.recover(message, signature)
  if (addr.toLowerCase() != account.toLowerCase()) return {}
  return {
    message,
    messageHash,
    r,
    s,
    v,
    signature
  }
}
let canSettleOrder = (listingTime, expirationTime) => {
  let now = new Date().getTime() / 1000
  return Number(listingTime) < now && (Number(expirationTime) == 0 || now < Number(expirationTime))
}

let orderCanMatch = (buy, sell) => {
  return (
    buy.side == 0 &&
    sell.side == 1 &&
    /* Must use same fee method. */
    buy.feeMethod == sell.feeMethod &&
    /* Must use same payment token. */
    buy.paymentToken == sell.paymentToken &&
    /* Must match maker/taker addresses. */
    (sell.taker == nullAddr || sell.taker == buy.maker) &&
    (buy.taker == nullAddr || buy.taker == sell.maker) &&
    /* One must be maker and the other must be taker (no bool XOR in Solidity). */
    ((sell.feeRecipient == nullAddr && buy.feeRecipient != nullAddr) ||
      (sell.feeRecipient != nullAddr && buy.feeRecipient == nullAddr)) &&
    /* Must match target. */
    buy.target == sell.target &&
    /* Must match howToCall. */
    buy.howToCall == sell.howToCall &&
    /* Buy-side order must be settleable. */
    canSettleOrder(buy.listingTime, buy.expirationTime) &&
    /* Sell-side order must be settleable. */
    canSettleOrder(sell.listingTime, sell.expirationTime)
  )
}

let orderApprove = async (buy, sell) => {
  let buyApproveTx = await exchangeContract.methods.approveOrder(orderParamsEncode(buy), true).send({
    from: buy.maker,
    gas: (80e4).toString()
  })

  console.log('buyApproveTx', buyApproveTx.transactionHash)

  let sellApproveTx = await exchangeContract.methods.approveOrder(orderParamsEncode(sell), true).send({
    from: sell.maker,
    gas: (80e4).toString()
  })
  console.log('sellApproveTx', sellApproveTx.transactionHash)
}

var sleep = function (time) {
  var startTime = new Date().getTime() + parseInt(time, 10)
  while (new Date().getTime() < startTime) {}
}

// element
let tokenAmount = 1

const orderProcessFlow = async () => {
  // 买家ERC20或ETH余额
  const balance = await web3.eth.getBalance(buyAccount)
  console.log('buyer ETH Balance: ' + balance)
  if (balance === 0) {
    throw new Error('Nonzero balance required!')
  }
  const nftContract = new web3.eth.Contract(ElementSharedAsset.abi, ElementSharedAsset.networks[networkID].address, {
    from: account,
    gas: (80e4).toString()
  })

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
  const sell = await createSellOrder(
    ElementSharedAsset.networks[networkID].address,
    tokenId,
    tokenAmount,
    account,
    0.002
  )
  // await postOrder(sell)
  const buy = await createBuyOrder(
    ElementSharedAsset.networks[networkID].address,
    tokenId,
    tokenAmount,
    buyAccount,
    0.002
  )
  // await postOrder(buy)

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

  // // 取消买订单
  // let matchTx = await exchangeContract.methods.cancelOrder(
  //     buyOrderParamArray,
  //     buyOrderSigArray
  // ).send({
  //     from: buy.maker,
  //     gas: 80e4.toString()
  // }).catch(e=>{
  //     console.log(e.receipt, e.message)
  // })
  // console.log("cancel buy order")
  //
  // // 取消卖订单
  // matchTx = await exchangeContract.methods.cancelOrder(
  //     sellOrderParamArray,
  //     sellOrderSigArray,
  // ).send({
  //     from: sell.maker,
  //     gas: 80e4.toString()
  // }).catch(e=>{
  //     console.log(e.receipt, e.message)
  // })
  // console.log("cancel sell order")
  //
  // return;

  console.log('old buyOrderParamArray', buyOrderParamArray)

  console.log('old sellOrderParamArray', sellOrderParamArray)
  // ------------------ 订单撮合 -------------------------
  matchTx = await exchangeContract.methods
    .orderMatch(
      buyOrderParamArray,
      buyOrderSigArray,
      sellOrderParamArray,
      sellOrderSigArray,
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    )
    .send({
      value: buy.paymentToken != nullAddr ? 0 : buy.basePrice,
      from: buy.maker,
      gas: (80e4).toString()
    })
    .catch((e) => {
      console.log('orderMatch ERR: ', e.receipt, e.message)
      return
    })
  console.log('orderMatch OK: ', matchTx.status)
  // console.log(matchTx)

  // 检查买、卖方token余额
  sellerNFTbalance = await nftContract.methods.balanceOf(sellAccount, tokenId).call()
  console.log('seller account %s has nft %s amount %s', sellAccount, tokenId, sellerNFTbalance)

  buyerNFTbalance = await nftContract.methods.balanceOf(buyAccount, tokenId).call()
  console.log('buyer account %s has nft %s amount %s', buyAccount, tokenId, buyerNFTbalance)
}

let makeTokenIdForOwner = async (account, index, supply) => {
  const exchangeContract = new web3.eth.Contract(MakeTokenID.abi, MakeTokenID.networks[networkID].address, {
    from: account,
    gas: (80e4).toString()
  })

  await exchangeContract.methods.makeID(account, index, supply).send()
  let newID = await exchangeContract.methods.newID().call()
  console.log('make id %s for owner %s', newID, account)
}

let encodeTransferFrom = async (account) => {
  let transferABI = {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_from',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes'
      }
    ],
    name: 'safeTransferFrom',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }

  // private
  let calldata = web3.eth.abi.encodeFunctionCall(transferABI, [
    '0x180BbD8601D56d6b654ec352A4A73b54917d9f3c',
    '0xEd32e2c154De6963eA520CBBB76C414a411eb604',
    tokenId,
    1,
    tokenId
  ])

  console.log(calldata)

  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  console.log('Proxy: ' + proxy)

  const AuthenticatedProxyContract = new web3.eth.Contract(AuthenticatedProxy.abi, proxy, {
    from: account,
    gas: (80e4).toString()
  })

  const nftContract = new web3.eth.Contract(ElementSharedAsset.abi, ElementSharedAsset.networks[networkID].address, {
    from: account,
    gas: (80e4).toString()
  })

  let nftAmount = await nftContract.methods.balanceOf(account, tokenId).call()
  console.log('account %s have nft amount=%s', account, nftAmount)

  if (nftAmount == '0') {
    return
  }

  let destAddr = ElementSharedAsset.networks[networkID].address
  let proxyAssetRun = await AuthenticatedProxyContract.methods
    .proxyAssert(destAddr, 0, calldata)
    .send({
      value: 0,
      from: account,
      gas: (80e4).toString()
    })
    .catch((e) => {
      console.log(e.receipt, e.message)
    })

  console.log(proxyAssetRun)
}

const CheckSenderOfAuthenticatedProxy = async (account) => {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  console.log('Proxy: ' + proxy)

  const AuthenticatedProxyContract = new web3.eth.Contract(AuthenticatedProxy.abi, proxy, {
    from: account,
    gas: (80e4).toString()
  })

  let _proxyRegistryAddr = await AuthenticatedProxyContract.methods.registry().call()
  const _proxyRegistryContract = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, {
    from: account,
    gas: (80e4).toString()
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
      value: (2e18).toString()
    })
    buyBal = await WETHContract.methods.balanceOf(buyAccount).call()
  }
  console.log('buyAccount %s WETH balance %s', buyAccount, buyBal)

  let sellBal = await WETHContract.methods.balanceOf(sellAccount).call()
  if (Number(sellBal) < 1e18) {
    await WETHContract.methods.deposit().send({
      from: sellAccount,
      value: (2e18).toString()
    })
    sellBal = await WETHContract.methods.balanceOf(sellAccount).call()
  }
  console.log('sellAccount %s WETH balance %s', sellAccount, sellBal)
}

const approveTokenTransferProxy = async (account) => {
  let exchangeAddr = ElementixExchange.networks[networkID].address
  const exchangeContract = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, {
    from: account,
    gas: (80e4).toString()
  })

  let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()

  let approveResult = await WETHContract.methods.approve(tokenTransferProxyAddr, (100e18).toString()).send({
    from: account
  })

  console.log('approveTokenTransferProxy: %s', approveResult)
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
    'calldata',
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

const orderVadTest = async () => {
  let order = {
    exchange: '0x15cBa90488B2A398aB7A2DA56f7aFc3c8987535C',
    maker: '0x04f7944C63483F86F7523Aec1c1dd516bBBB76CF',
    taker: '0x0000000000000000000000000000000000000000',
    makerRelayerFee: 250,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeMethod: 1,
    feeRecipient: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
    side: 1,
    saleKind: 0,
    target: '0x15747cf353271a5288d640d075a6d3670dccc481',
    howToCall: 0,
    calldata:
      '0xf242432a00000000000000000000000004f7944c63483f86f7523aec1c1dd516bbbb76cf0000000000000000000000000000000000000000000000000000000000000000df0490b7aa670994cd8deb6ad1c8b71932454b6d000000000000010000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x92842561a5AB70bC9C8de525b91D3a82d1459807',
    basePrice: '2000000000000000',
    extra: '0',
    listingTime: '1619856497',
    expirationTime: '0',
    salt: '4337998997762099556270189188684721649559234756842006258850787401760267658081',
    metadata: {
      schema: 'ERC1155',
      asset: {
        id: '100873831425417172796821470474744747465349791964556394886292914461569892483073',
        address: '0x15747cf353271a5288d640d075a6d3670dccc481',
        quantity: '1',
        data: ''
      }
    },
    hash: '0x06654314093f6d8634bbebb18d850e194273111fe1fb0050318ad9c76a7b87fd',
    r: '0x36a059142afb8408a92b710dd507d0fad1b88a7c8c66d1391e8e7c5513a47964',
    s: '0x1006dee260b2df4c9dfe644777c71a0dd7cc3b239afddc532dca6969d755c080',
    v: 27
  }
  let orderParamValueArray = orderParamsEncode(order)
  let orderSigArray = orderSigEncode(order)

  let result = await exchangeHelper.methods.hashOrder(orderParamValueArray).call()
  console.log('orderHash:', result)

  return result
}

;(async () => {
  try {
    // //创新新tokenId
    // makeTokenIdForOwner(sellAccount,2,1)
    // await orderVadTest()
    // return

    // 仅需对新账号进行一次注册Proxy
    // await registerProxy(buyAccount)
    // await registerProxy(sellAccount)

    await checkAccountBalance(buyAccount, sellAccount)

    // 仅需对新账号进行一次approve
    // await approveTokenTransferProxy(buyAccount)
    // await approveTokenTransferProxy(sellAccount)

    // 主流程
    await orderProcessFlow()

    await checkAccountBalance(buyAccount, sellAccount)
  } catch (e) {
    console.log(e)
  }
})()
