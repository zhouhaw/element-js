### element-js

Order 数据结构
 ```js

{ ​
    maker: address, // 挂单地址 
    taker: address, // 吃单地址  
    side: 0, //Side (buy=0/sell=1)
    saleKind: 0, //{ FixedPrice=0, DutchAuction=1 }
    paymentToken: address, // WETH...
    basePrice:1.2, // 价格元支持小数
    expirationTime: 0, // 过期时间 秒
    extra: 0, //
    expirationTime: 0,  // 订单过期时间
    //-------------- 
    makerRelayerFee: 0,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0, ​
    feeMethod: 0,  // FeeMethod { ProtocolFee = 0, SplitFee=1 }
    feeRecipient:  // Fee接收地址
    target: address, // 资产合约地址
    howToCall: 0,// 如何调用资产合约方法
    calldata: '0x', // target 需要执行的函数方法+ 参数
    replacementPattern: '0x', // calldata 中能替换的数据
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x', ​ ​
    listingTime: 0,
    salt: new BigNumber(0) // 订单唯一值
  }
```
