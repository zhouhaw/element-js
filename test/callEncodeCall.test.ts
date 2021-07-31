import { Orders, Network, ElementSchemaName, makeBigNumber, encodeCall } from '../src'
import Web3 from 'web3'
import { getElementAsset, getSchema } from '../src/utils/makeOrder'
;(async () => {
  // http://39.102.101.142:8545
  // https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  // https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  let web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
  const web3 = new Web3(web3Provider)
  //0xeA199722372dea9DF458dbb56be7721af117a9Bc
  // let account1 = web3.eth.accounts.wallet.add('53ce7e01dd100f3c71e10d9618c043139f336eb79a0562e034441b83a5e6db63')

  try {
    const schema = getSchema(Network.Rinkeby, ElementSchemaName.CryptoKitties)
    const asset = {
      tokenId: '1',
      tokenAddress: '0x1530272CE6E4589F5c09151a7C9a118a58D70E09',
      schemaName: ElementSchemaName.CryptoKitties
    }
    const elementAsset = getElementAsset(schema, asset)
    // @ts-ignore
    const isApprove = schema.functions.ownerOf(elementAsset)
    const callData = encodeCall(isApprove, [1])

    // web3.eth.defaultAccount = account1.address.toLowerCase()
    let res = await web3.eth.call({
      to: schema.address, // contract address
      data: callData
    })

    let params = web3.eth.abi.decodeParameters(isApprove.outputs, res)
    console.log(res, '\n', params)
  } catch (e) {
    console.log(e)
  }
})()
