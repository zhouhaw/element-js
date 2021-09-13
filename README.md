### element-js
### v3.0.0更新
1 增加Account对象抽象
 账户检查，账户注册，Nft资产查询授权，Token资产查询授权进行授权。
 增加私钥导入方式。

2 增加了ElementOrder对象封装
将前端 Order Helper的业务逻辑封装到SDK让页面代码更加简单明确。
对应前端业务支持6种创建订单方式。
增加用户 业务token请求。
增加 orders 通过api直接获取。


3 修改节点的交互方式。
原因：Polygon 网络在metamask 钱包增加后默认是不预估gas费用。 如需支持该练需要对发送请求进行改造。
改造方式，将原来的web3封装完成的请求发送拆封为
1 通过schame 和参数生产 calldata。
2 获取预估的gaslimt
3 获取当前的nonce值
4 gas price 从  https://www.gasnow.org/api/v3/gas/price 获取 fast

通过 web3多sendTransaction的方法执行交易。

4 单独抽象合约对象。 扩展schame 作用。


下一步：
清理代码，清理ABI文件

tsc && git tag v3.0.0 && git push --tag
### fork 节点
```
module.exports = {
  apps : [
    {
       name: "element-order-serve",
       script: "./element-order-serve/index.js"
    },{
    name: "ganache-rinkeby",
    script: "/usr/local/node/bin/ganache-cli",
    error_file:"./logs/node-err.log",
    out_file: "./logs/node-out.log",
    args:`-h 0.0.0.0 -p 8555 --fork https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161 \
      -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
      --deterministic --gasPrice 5e9 --gasLimit 800e4 -e 10000 --networkId 1337 --db ./ganache`
  }]
};
```
