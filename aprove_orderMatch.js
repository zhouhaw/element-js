//icSOLV ETH 交易 https://rinkeby.etherscan.io/tx/0x97253cd2d7f6925af53791e72f6cde55f3e95a07b9a2893f71bf7a988055761d
//23,258 ok https://rinkeby.etherscan.io/tx/0x149a69bdcbb92099dbc4bb96d9796880b58e83013222672b029fd94b8c2f1c41

const fs = require('fs')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const hdAddress = require("hd-address")

const config = require('./config.json')
const MintableNonFungibleToken = require('./abi/MintableNonFungibleToken.json')
const WyvernProxyRegistry = require('./abi/WyvernProxyRegistry.json')
const WyvernExchange = require('./abi/WyvernExchange.json')
const WETH = require('./abi/WETH.json')
const AuthenticatedProxy = require('./abi/AuthenticatedProxy.json')

const {WyvernProtocol} = require('wyvern-js')
const {tokens, schemas, encodeSell, encodeBuy} = require('wyvern-schemas')

let mnemonic
try {
    mnemonic = fs.readFileSync('./mnemonic').toString()
} catch (err) {
    mnemonic = hdAddress.mnemonic.getRandomMnemonic();
}

let hd = hdAddress.HD(mnemonic, hdAddress.keyType.mnemonic)
let ethAddr = hd.ETH.getCoinAddressKeyPair(0)
let buyAddr = hd.ETH.getCoinAddressKeyPair(1)
const account = ethAddr.address.toLowerCase();

const buyAccount = buyAddr.address.toLowerCase();


let provider = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
// let provider = "http://127.0.0.1:8545"
let web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(web3Provider);
web3.eth.accounts.wallet.add('0x' + ethAddr.pri);
web3.eth.accounts.wallet.add('0x' + buyAddr.pri);
web3.eth.defaultAccount = account;

let feeRecipient = "0x9F7A946d935c8Efc7A8329C0d894A69bA241345A"
let nullAddr = "0x0000000000000000000000000000000000000000"
let proxyRegistryAddr = WyvernProxyRegistry.networks["4"].address;
const proxyRegistryContract = new web3.eth.Contract(WyvernProxyRegistry.abi, proxyRegistryAddr, {
    from: account,
    gas: 80e4.toString()
})

//WyvernProtocol.getExchangeContractAddress('rinkeby'),
let exchangeAddr = WyvernExchange.networks["4"].address;
const exchangeContract = new web3.eth.Contract(WyvernExchange.abi, exchangeAddr, {
    from: account,
    gas: 80e4.toString()
})

const nftContract = new web3.eth.Contract(MintableNonFungibleToken.abi, config.contract_address, {
    from: account,
    gas: 80e4.toString()
})

const payToken = tokens.rinkeby.canonicalWrappedEther

const rinkebyNFTSchema = schemas.rinkeby.filter(x => x.name === 'TestRinkebyNFT')[0]


const getOrderHash = async (order) => {
    // let hash = WyvernProtocol.getOrderHashHex(order)
    let orderParm = [
        [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
        [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
        order.feeMethod,
        order.side,
        order.saleKind,
        order.howToCall,
        order.calldata,
        order.replacementPattern,
        order.staticExtradata
    ];
    let hash = await exchangeContract.methods.hashOrder_(...orderParm).call();
    return hash;
}


const validateOrder = async (order) => {
    let orderParm = [
        [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
        [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
        order.feeMethod,
        order.side,
        order.saleKind,
        order.howToCall,
        order.calldata,
        order.replacementPattern,
        order.staticExtradata,
        order.v,
        order.r,
        order.s,
    ];
    let hash = await exchangeContract.methods.validateOrder_(...orderParm).call();
    return hash;
}

let cover = (amount, decimals) => {
    return (new BigNumber(amount)).mul((new BigNumber(10)).pow(decimals)).toString()
}

let coverDiv = (amount, decimals) => {
    return (new BigNumber(amount)).div((new BigNumber(10)).pow(decimals)).toString()
}


const createOrder = async (target1, nft, amount, ower, side) => {
    let {target, calldata, replacementPattern} = encodeSell(rinkebyNFTSchema, nft) //target,
    if (side == "buy") {
        let buyCall = encodeBuy(rinkebyNFTSchema, nft, buyAccount)
        calldata = buyCall.calldata
        replacementPattern = buyCall.replacementPattern
    }
    // [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
    // [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
    // https://rinkeby.etherscan.io/tx/0xb8afeb95abea096aae932cdaf50d55df2eac4b3c94261d6afd985018ed80fb73
    let order = {
        exchange: exchangeAddr,
        maker: ower,
        taker: side == "buy" ? account : nullAddr,
        makerRelayerFee: 250,
        takerRelayerFee: 0,
        makerProtocolFee: 0,
        takerProtocolFee: 0,
        feeMethod: 1, // 拍卖
        feeRecipient: side == "buy" ? nullAddr : feeRecipient.toLowerCase(),
        side: side == "buy" ? 0 : 1,
        saleKind: 0,
        target: target,
        howToCall: 0,
        calldata: calldata,
        replacementPattern: replacementPattern,
        staticTarget: nullAddr,
        staticExtradata: '0x',
        paymentToken: nullAddr,//payToken.address,
        basePrice: cover(amount, payToken.decimals),
        extra: new BigNumber(0).toString(),
        listingTime: new BigNumber(Math.round(Date.now() / 1000)).toString(),
        expirationTime: "0",//new BigNumber(Math.round((Date.now() / 1000) + 86400)).toString(),
        salt: WyvernProtocol.generatePseudoRandomSalt().toString(),
        metadata: {
            schema: 'TestRinkebyNFT',
            asset: '' + nft
        }
    }

    const hash = await getOrderHash(order)
    const signature = await signatureObj(hash, ower)
    order.hash = hash
    order.r = signature.r
    order.s = signature.s
    order.v = signature.v

    return Object.assign({}, order);
}


const registerProxy = async (account) => {
    let contract = proxyRegistryContract;
    let proxy = await contract.methods.proxies(account).call()

    if (proxy === nullAddr) {
        let rawTxNew = await contract.methods.registerProxy().send({
            from: account
        })
        console.log('Creating proxy; TX: ' + rawTxNew.rawTransaction)
        proxy = await contract.methods.proxies(account).call()
        console.log('Proxy: ' + proxy)
    }

    return proxy
}

const transferNFT = async (account, tokenId, proxy) => {
    let contract = nftContract;
    let owner = await contract.methods.ownerOf(tokenId).call();
    if (owner == web3.utils.toChecksumAddress(account)) {
        const txHash = await contract.methods.transfer(proxy, tokenId).send({
            from: account
        })
        owner = await contract.methods.ownerOf(tokenId).call();
        console.log('Transferring NFT #' + tokenId + ' to proxy: ' + txHash.transactionHash)
    }
    return owner;
}
const aproveNFT = async (account, tokenId, proxy) => {
    let contract = nftContract;
    let owner = await contract.methods.ownerOf(tokenId).call();
    if (owner == nullAddr) {
        await mintNFT(account, tokenId)
    }

    let delegateAddr = await contract.methods.getApproved(tokenId).call()
    if (delegateAddr != proxy) {
        await contract.methods.approve(proxy, tokenId).send({gas: 80e4.toString()})
        delegateAddr = await contract.methods.getApproved(tokenId).call();
        console.log(delegateAddr);
    }
    return owner
}

const mintNFT = async (account, tokenId) => {
    let contract = nftContract;
    let foo = await contract.methods.totalSupply().call()
    let numTokensTotal = await contract.methods.numTokensTotal().call();
    let owner = await contract.methods.ownerOf(tokenId).call();
    let bal = await contract.methods.balanceOf(account).call();
    console.log("totalSupply", foo, bal, numTokensTotal.toString(), owner)
    if (owner === nullAddr) {
        let bar = await contract.methods.mint(account, tokenId).send();
        console.log("mintNFT", bar.blockNumber, bar.status, tokenId)
    }
}

const signatureObj = async (message, account) => {
    let messageHash = web3.eth.accounts.hashMessage(message);
    let signature = await web3.eth.sign(message, account);
    const result = signature.substring(2);
    const r = "0x" + result.substring(0, 64);
    const s = "0x" + result.substring(64, 128);
    const v = parseInt(result.substring(128, 130), 16);// The signature is now comprised of r, s, and v.
    // const v = "0x" + result.substring(128, 130)//
    let addr = await web3.eth.accounts.recover(message, signature)
    if (addr.toLowerCase() != account.toLowerCase()) return {}
    return {
        message, messageHash, r, s, v, signature
    }
}
let canSettleOrder = (listingTime, expirationTime) => {
    let now = (new Date().getTime()) / 1000
    return (Number(listingTime) < now) && (Number(expirationTime) == 0 || now < Number(expirationTime));
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

let tokenId = "23210"
let log = console.log;
const go = async () => {
    const balance = await web3.eth.getBalance(account)
    const buyBalance = await web3.eth.getBalance(buyAccount)
    log(' Sell %s Balance %s, \n Buy  %s Balance %s ', account, coverDiv(balance, 18), buyAccount, coverDiv(buyBalance, 18))
    if (balance === 0) {
        throw new Error('Nonzero balance required!')
    }


    if (owner == web3.utils.toChecksumAddress(account) || owner == proxy) {
        console.log('account mine NFT #' + tokenId)
        const sell = await createOrder(owner, tokenId, 0.0001, account)
        const buy = await createOrder(owner, tokenId, 0.0001, buyAccount, "buy");
        let isSellOrder = await validateOrder(sell);
        let isBuyOrder = await validateOrder(buy);
        if (isSellOrder && isBuyOrder) {
            // console.log(buy, sell)
            let addrs = [
                buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken,
                sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken
            ];
            let uints = [
                buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt,
                sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt
            ];
            let feeMethodsSidesKindsHowToCalls = [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall];

            let calldataBuy = buy.calldata
            let calldataSell = sell.calldata

            let replacementPatternBuy = buy.replacementPattern;
            let replacementPatternSell = sell.replacementPattern;

            let staticExtradataBuy = buy.staticExtradata;
            let staticExtradataSell = sell.staticExtradata;

            let calculatePrice = await exchangeContract.methods.calculateMatchPrice_(
                addrs, uints, feeMethodsSidesKindsHowToCalls, calldataBuy, calldataSell, replacementPatternBuy, replacementPatternSell, staticExtradataBuy, staticExtradataSell
            ).call()
            console.log("calculatePrice:", coverDiv(calculatePrice, payToken.decimals))

            let canMatchCheck = orderCanMatch(buy, sell)
            console.log("canMatchCheck check", canMatchCheck)
            if (!canMatchCheck) {
                console.log(buy, sell)
                return;
            }
            let canMatch = await exchangeContract.methods.ordersCanMatch_(
                addrs, uints, feeMethodsSidesKindsHowToCalls, calldataBuy, calldataSell, replacementPatternBuy, replacementPatternSell, staticExtradataBuy, staticExtradataSell
            ).call();
            console.log("canMatch", canMatch)
            if (!canMatch) {
                return;
            }

            let vs = [buy.v, sell.v] //2
            let rssMetadata = [buy.r, buy.s, sell.r, sell.s, '0x0000000000000000000000000000000000000000000000000000000000000000'] //5
            let matchTx = await exchangeContract.methods.atomicMatch_(
                addrs, uints, feeMethodsSidesKindsHowToCalls, calldataBuy, calldataSell, replacementPatternBuy, replacementPatternSell, staticExtradataBuy, staticExtradataSell, vs, rssMetadata
            ).send({
                value: buy.basePrice,
                from: buy.maker,
                gas: 80e4.toString()
            }).catch(e => {
                console.log(e.receipt.transactionHash, e.message)
            })
            console.log(matchTx)
        }

        // console.log('Posted order to sell NFT #' + tokenId + ' - order p: ' + calculatePrice)
    }
}


// 1155 contract 0x5bcfBb0cc48DD3Af0ECC1F8F42beD32Ca1Bd5ab4
// 0xf242432a000000000000000000000000a0df350d2637096571f7a701cbc1c5fde30df76a0000000000000000000000000271d4a9191c8277632ff0494de8fabb364f93d50000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000œ
(async () => {
    try {
        // await go()
        let proxy = await registerProxy(account);
        let owner = await transferNFT(account, tokenId, proxy)
        if (owner == nullAddr) {
            await nftContract.methods.mint(account, tokenId).send();
            owner = await transferNFT(account, tokenId, proxy);
        }

        if (owner == proxy) {
            let target = "0x07a6Dc6E3F1120Ca03658d473D10aEE3aF5f8aBB";
            let calldata = nftContract.methods.transfer(buyAccount, tokenId).encodeABI();

            const proxyContract = new web3.eth.Contract(AuthenticatedProxy.abi, proxy, {
                from: account,
                gas: 80e4.toString()
            })

            let user = await  proxyContract.methods.user().call()

            if(user.toLowerCase() == account){
                let tx = await proxyContract.methods.proxy(target, 0, calldata).send({
                    from: user,
                    gas: 80e4
                })
                // https://rinkeby.etherscan.io/tx/0xeadbbf32ecb4a9d563c5e42a7701b489c1be99301305fa38612a9ec5dfecd7ee
                log(tx)
            }


        } else {

        }

    } catch (e) {
        console.log(e)
    }
})()
