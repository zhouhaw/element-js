// https://rinkeby.etherscan.io/tx/0x177de3be634fbfe877a756a1d5b7df6e1904f39fe21aa35907c447105572a37f

const fs = require('fs')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const hdAddress = require("hd-address")

const config = require('../../config.json')
const MintableNonFungibleToken = require('../../abi/MintableNonFungibleToken.json')
const WyvernProxyRegistry = require('../../abi/WyvernProxyRegistry.json')
const WyvernExchange = require('../../abi/WyvernExchange.json')
const WETH = require('../../abi/WETH.json')

const {WyvernProtocol} = require('wyvern-js')
const {tokens, schemas, encodeSell,encodeBuy} = require('wyvern-schemas')

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

let feeRecipient = "0xeA199722372dea9DF458dbb56be7721af117a9Bc"
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

const payToken = tokens.rinkeby.canonicalWrappedEther

const WETHContract = new web3.eth.Contract(WETH, payToken.address, {
    gas: 80e4.toString()
})

const rinkebyNFTSchema = schemas.rinkeby.filter(x => x.name === 'TestRinkebyNFT')[0]


const generatePseudoRandomSalt = () => {
    let MAX_DIGITS_IN_UNSIGNED_256_INT = 78
    // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
    // Source: https://mikemcl.github.io/bignumber.js/#random
    const randomNumber = BigNumber.random(MAX_DIGITS_IN_UNSIGNED_256_INT);
    const factor = new BigNumber(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1);
    const salt = randomNumber.times(factor).round();
    return salt;
}

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


const createOrder = async (target1,nft, amount, ower, side) => {
    let {target,calldata, replacementPattern} = encodeSell(rinkebyNFTSchema, nft) //target,
    if(side == "buy"){
        let buyCall = encodeBuy (rinkebyNFTSchema, nft, buyAccount)
        calldata = buyCall.calldata
        replacementPattern = buyCall.replacementPattern
    }
    // [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
    // [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
    // https://rinkeby.etherscan.io/tx/0xb8afeb95abea096aae932cdaf50d55df2eac4b3c94261d6afd985018ed80fb73
    let order = {
        exchange: exchangeAddr,
        maker: ower,
        taker: side == "buy" ? account:nullAddr,
        makerRelayerFee: 250,
        takerRelayerFee: 0,
        makerProtocolFee: 0,
        takerProtocolFee: 0,
        feeMethod: 1, // 拍卖
        feeRecipient: side == "buy" ? nullAddr:feeRecipient.toLowerCase(),
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


const registerProxy = async (contract, account) => {
    let rawTxNew = await contract.methods.registerProxy().send({
        from: account
    })
    console.log('Creating proxy; TX: ' + rawTxNew.rawTransaction)
    let proxy = await proxyRegistryContract.methods.proxies(account).call()
    console.log('Proxy: ' + proxy)
    return proxy
}

const transferNFT = async (contract, account, tokenId, proxy) => {
    let owner = await contract.methods.ownerOf(tokenId).call();
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

let orderApprove = async (buy,sell) =>{
    let buyApproveTx = await exchangeContract.methods.approveOrder_(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt],
        buy.feeMethod,
        buy.side,
        buy.saleKind,
        buy.howToCall,
        buy.calldata,
        buy.replacementPattern,
        buy.staticExtradata,
        true
    ).send({
        from: buy.maker,
        gas: 80e4.toString()
    })

    console.log("buyApproveTx",buyApproveTx.transactionHash)

    let sellApproveTx = await exchangeContract.methods.approveOrder_(
        [sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        sell.feeMethod,
        sell.side,
        sell.saleKind,
        sell.howToCall,
        sell.calldata,
        sell.replacementPattern,
        sell.staticExtradata,
        true
    ).send({
        from: sell.maker,
        gas: 80e4.toString()
    })

    console.log("sellApproveTx",sellApproveTx.transactionHash)
}
let tokenId = "23210"
const go = async () => {
    let buyBal = await WETHContract.methods.balanceOf(buyAccount).call();
    if (Number(buyBal) < 1e17 ) {
        await WETHContract.methods.deposit().send({
            from: buyAccount,
            value: 2e17.toString()
        });
        buyBal = await WETHContract.methods.balanceOf(buyAccount).call();
    }
    console.log('Ethereum sell account:%s buy account:%s %s', account, buyAccount, coverDiv(buyBal, payToken.decimals));
    const balance = await web3.eth.getBalance(account)
    console.log('Balance: ' + balance)
    if (balance === 0) {
        throw new Error('Nonzero balance required!')
    }

    let proxy = await proxyRegistryContract.methods.proxies(account).call()
    console.log('Proxy: ' + proxy)
    if (proxy === nullAddr) {
        proxy = await registerProxy(proxyRegistryContract, account);
    }
    const nfgContract = new web3.eth.Contract(MintableNonFungibleToken.abi, config.contract_address, {
        from: account,
        gas: 80e4.toString()
    })


    let owner = await nfgContract.methods.ownerOf(tokenId).call();
    if (owner != web3.utils.toChecksumAddress(proxy)) {
        await mintNFT(nfgContract, account, tokenId)
        await transferNFT(nfgContract, account, tokenId, proxy)
    }
    let index = 0
    while (true) {
        let mine = await nfgContract.methods.tokenOfOwnerByIndex(proxy, index).call().catch(e => {
            console.log(e.message)
        });
        if (mine == tokenId) {
            console.log('account mine NFT #' + tokenId)
            //Math.round(Math.random() * 10) / 1000
            const sell = await createOrder(proxy,mine, 0.0001, account)
            const buy = await createOrder(proxy,mine, 0.0001, buyAccount, "buy");
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
                console.log("canMatchCheck check",canMatchCheck)
                if(!canMatchCheck) {
                    console.log(buy, sell)
                    return ;
                }
                let canMatch = await exchangeContract.methods.ordersCanMatch_(
                    addrs, uints, feeMethodsSidesKindsHowToCalls, calldataBuy, calldataSell, replacementPatternBuy, replacementPatternSell, staticExtradataBuy, staticExtradataSell
                ).call();
                console.log("canMatch",canMatch)
                 if(!canMatch) {
                     return ;
                 }
                 //
                 // await  orderApprove(buy,sell)


                let vs = [buy.v, sell.v] //2
                let rssMetadata = [buy.r, buy.s, sell.r, sell.s, '0x0000000000000000000000000000000000000000000000000000000000000000'] //5
                let matchTx = await exchangeContract.methods.atomicMatch_(
                    addrs, uints, feeMethodsSidesKindsHowToCalls, calldataBuy, calldataSell, replacementPatternBuy, replacementPatternSell, staticExtradataBuy, staticExtradataSell, vs, rssMetadata
                ).send({
                    value:buy.basePrice,
                    from: buy.maker,
                    gas: 80e4.toString()
                }).catch(e=>{
                    console.log(e.receipt.transactionHash,e.message)
                })
                console.log(matchTx)

            }

            // console.log('Posted order to sell NFT #' + tokenId + ' - order p: ' + calculatePrice)
            break;
        } else {
            console.log('account NFT #' + mine)
            index++
        }
    }
}

(async () => {
    try {
        await go()
    } catch (e) {
        console.log(e)
    }
})()
