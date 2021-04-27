// https://rinkeby.etherscan.io/tx/0x177de3be634fbfe877a756a1d5b7df6e1904f39fe21aa35907c447105572a37f

const fs = require('fs')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const hdAddress = require("hd-address")

const config = require('../../config.json')
const AssetContractShared = require('../../abi/AssetContractShared.json')
const WyvernProxyRegistry = require('../../abi/WyvernProxyRegistry.json')
const WyvernExchange = require('../../abi/WyvernExchange.json')
const WETH = require('../../abi/WETH.json')

const {WyvernProtocol} = require('wyvern-js')
const {tokens, schemas, encodeSell, encodeBuy} = require('../../../wyvern-schemas/dist')

let provider = "http://39.102.101.142:8545"
let web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(web3Provider);

// your private keys
web3.eth.accounts.wallet.add('c2abb039ab89bd79bc81d4d0648e4672cb4c8737922574a7d1a662c9ea5f2098'); //0x0271d4A9191c8277632fF0494de8faBb364f93D5
web3.eth.accounts.wallet.add('e07356afd1d2e619bfb8fb65cee1cac7ba5cd7130ba8df77c83974c4b1764e57'); //0x049FE7c378aaF7a7eD1df544aAff7ABa35EE40dB


const sellAccount = web3.eth.accounts.wallet[1].address;
const buyAccount = web3.eth.accounts.wallet[0].address;
const account = sellAccount

const networkID = "1337";
const log = console.log

web3.eth.defaultAccount = account;

let feeRecipient = "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b"
let nullAddr = "0x0000000000000000000000000000000000000000"
let proxyRegistryAddr = WyvernProxyRegistry.networks[networkID].address;
const proxyRegistryContract = new web3.eth.Contract(WyvernProxyRegistry.abi, proxyRegistryAddr, {
    from: account,
    gas: 80e4.toString()
})

//WyvernProtocol.getExchangeContractAddress('rinkeby'),
let exchangeAddr = WyvernExchange.networks[networkID].address;
const exchangeContract = new web3.eth.Contract(WyvernExchange.abi, exchangeAddr, {
    from: account,
    gas: 80e4.toString()
})

const payToken = tokens.private.canonicalWrappedEther

const WETHContract = new web3.eth.Contract(WETH, payToken.address, {
    gas: 80e4.toString()
})

// const rinkebyNFTSchema = schemas.rinkeby.filter(x => x.name === 'TestRinkebyNFT')[0]
const ERC1155Type = schemas.private.filter(x => x.name === 'ERC1155')[0]
const ERC20Type = schemas.private.filter(x => x.name === 'ERC20')[0]




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


const createSellOrder = async (tokenAddress, tokenId, quantity, ower, sellPrice) => {
    let asset = ERC1155Type.assetFromFields({
        'ID': tokenId,
        'Quantity': quantity.toString(),
        'Address': tokenAddress.toLowerCase(),
        'Name': ''
    })

    let {target, calldata, replacementPattern} = encodeSell(ERC1155Type, asset, ower) //target,
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
        paymentToken: nullAddr,//payToken.address,
        basePrice: cover(sellPrice, payToken.decimals),
        extra: new BigNumber(0).toString(),
        listingTime: new BigNumber(Math.round(Date.now() / 1000 - 6000)).toString(),
        expirationTime: "0",//new BigNumber(Math.round((Date.now() / 1000) + 86400)).toString(),
        salt: WyvernProtocol.generatePseudoRandomSalt().toString(),
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

    return Object.assign({}, order);
}


const createBuyOrder = async (tokenAddress, tokenId, quantity, ower,  buyPrice) => {
    // let asset = ERC20Type.assetFromFields({
    //     'ID': tokenId,
    //     'Quantity': quantity.toString(),
    //     'Address': tokenAddress.toLowerCase(),
    //     'Name': ''
    // })

    let asset = ERC1155Type.assetFromFields({
        'ID': tokenId,
        'Quantity': quantity.toString(),
        'Address': tokenAddress.toLowerCase(),
        'Name': ''
    })

    let {target, calldata, replacementPattern}  = encodeBuy (ERC1155Type, asset, ower)

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
        paymentToken: nullAddr,//payToken.address,
        basePrice: cover(buyPrice, payToken.decimals),
        extra: new BigNumber(0).toString(),
        listingTime: new BigNumber(Math.round(Date.now() / 1000 -6000)).toString(),
        expirationTime: "0",//new BigNumber(Math.round((Date.now() / 1000) + 86400)).toString(),
        salt: WyvernProtocol.generatePseudoRandomSalt().toString(),
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

   log(`"now  ${now}  listingTime ${listingTime}`)
    // new BigNumber(Math.round(Date.now() / 1000 - 6000))
    return (Number(listingTime) < now) && (Number(expirationTime) == 0 || now < Number(expirationTime));
}

let orderCanMatch = (buy, sell) => {
    log(`buy listingTime ${buy.listingTime} sell.listingTime ${sell.listingTime}`)
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

var sleep = function(time) {
    var startTime = new Date().getTime() + parseInt(time, 10);
    while(new Date().getTime() < startTime) {}
};

// element
let tokenId = "18362072697069652631478480550453521973937839679621955723103441268684227608577"
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
    const balance = await web3.eth.getBalance(buyAccount)
    console.log('buyer ETH Balance: ' + balance)
    if (balance === 0) {
        throw new Error('Nonzero balance required!')
    }

    const nfgContract = new web3.eth.Contract(AssetContractShared.abi, AssetContractShared.networks[networkID].address, {
        from: account,
        gas: 80e4.toString()
    })

    let sellerNFTbalance = await nfgContract.methods.balanceOf(account, tokenId).call();
    if (sellerNFTbalance == '0') {
        throw new Error('seller account balance <1 !')
    } else {
        console.log('seller account %s has nft %s amount %s', account, tokenId, sellerNFTbalance)
    }

    const sell = await createSellOrder(AssetContractShared.networks[networkID].address, tokenId,  1, account, 0.001)
    const buy = await createBuyOrder(AssetContractShared.networks[networkID].address, tokenId, 1, buyAccount, 0.001 )

    let isSellOrder = await validateOrder(sell);
    let isBuyOrder = await validateOrder(buy);

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
        // console.log(buy, sell)
        return ;
    }

    console.log("-----------------------------------------")
    console.log(addrs);
    console.log(uints);
    console.log(feeMethodsSidesKindsHowToCalls);
    console.log(calldataBuy);
    console.log(calldataSell);
    console.log(replacementPatternBuy);
    console.log(replacementPatternSell);
    console.log(staticExtradataBuy);
    console.log(staticExtradataSell);

    let vs = [buy.v, sell.v] //2
    let rssMetadata = [buy.r, buy.s, sell.r, sell.s, '0x0000000000000000000000000000000000000000000000000000000000000000'] //5
    console.log(vs);
    console.log(rssMetadata);
    console.log("-----------------------------------------")

    let canMatch = await exchangeContract.methods.ordersCanMatch_(
        addrs, uints, feeMethodsSidesKindsHowToCalls, calldataBuy, calldataSell, replacementPatternBuy, replacementPatternSell, staticExtradataBuy, staticExtradataSell
    ).call();
    console.log("canMatch",canMatch)
     if(!canMatch) {
        return;
     }

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



let encodeTransferFrom = () => {

    let transferABI = {
        "constant": false,
        "inputs": [
        {
            "internalType": "address",
            "name": "_from",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "_to",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "_id",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        },
        {
            "internalType": "bytes",
            "name": "_data",
            "type": "bytes"
        }
    ],
        "name": "safeTransferFrom",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }

    // private
    let calldata = web3.eth.abi.encodeFunctionCall(transferABI, ["0x7335Bae9c88c59382621A2FBE08A353a93510F56","0x28989099Df975aCF0c6a1DB28c4A4805aE5e2FC8","52110910509117159886520023034677676808462086871028572901793699248975699247105",1,[]]);

    // rinkeby
    // let calldata = web3.eth.abi.encodeFunctionCall(transferABI, ["0x2E9D15d024187477F85Ac7cD7154aD8556EDb8E2","0x28989099Df975aCF0c6a1DB28c4A4805aE5e2FC8","21083936572143952259379966356809914931402068805802815454518490521123296378881",1,[]]);

    console.log(calldata)

}

let encodeMakeID = () => {
    let makeIDABI = {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_creator",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_index",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_supply",
                    "type": "uint256"
                }
            ],
            "name": "makeID",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    let calldata = web3.eth.abi.encodeFunctionCall(makeIDABI, ["0x7335Bae9c88c59382621A2FBE08A353a93510F56",6,2]);
    console.log(calldata)

}

let encodeSetURI = () => {
    let uriABI =  {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_uri",
                    "type": "string"
                }
            ],
            "name": "setURI",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    let calldata = web3.eth.abi.encodeFunctionCall(uriABI, ["52110910509117159886520023034677676808462086871028572901793699248975699247105", "element.io"]);
    console.log(calldata)
}

let encodeTransferFromWETH = () => {
    let wETHABI = 	{
            "inputs": [
                {
                    "internalType": "address",
                    "name": "src",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "dst",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    let calldata = web3.eth.abi.encodeFunctionCall(wETHABI, ["0x7335Bae9c88c59382621A2FBE08A353a93510F56", "0x28989099Df975aCF0c6a1DB28c4A4805aE5e2FC8", "500000000000000000"]);
    console.log(calldata)
}


(async () => {
    try {
        await go()
    } catch (e) {
        console.log(e)
    }
})()

