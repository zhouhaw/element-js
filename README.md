### element-js

 let ERC1155Mintable = '0x626743a83D7daD4896F08f06dAf4066F1A20bF24'
 
Order 数据结构
 
tsc && git tag v2.5.2 && git push --tag
fork 节点
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
