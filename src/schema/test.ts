import { ElementSchemaName, makeBigNumber, Network } from '../../index'
import { getElementAsset, getSchema } from '../utils/makeOrder'
import { encodeDefaultCall, encodeReplacementPattern } from './schemaFunctions'
import { AnnotatedFunctionABI } from './types'
import Web3 from 'web3'
const web3 = new Web3()

try {
  const schema = getSchema(Network.Private, ElementSchemaName.ERC1155)
  const asset = {
    tokenId: '72134322679254813612560192230305857957633912505434515263987832391864007262364',
    // The asset's contract address
    tokenAddress: '0x09656BC39B5162012c595c0797740Dc1B0D62E9D',
    // The Element schema name (e.g. "ERC721") for this asset
    schemaName: ElementSchemaName.ERC1155,
    name: 'ELE', //ipfs://bafkreifgeyagptvljmwgt53uaa4mo4aj3i7oscnzc3672q4y5ux5nalp44
    data: '' //0x697066733a2f2f516d626261416f6a6876774d514137644c69745a4d424e4e3946786153636b673546395346534c756b6d6667416f2f6d2e6a736f6e
  }
  const elementAsset = getElementAsset(schema, asset, makeBigNumber(1))
  const transfer = schema.functions.transfer(elementAsset)
  const callData = encodeDefaultCall(transfer, '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A')
  console.log(callData)
  const pattern = encodeReplacementPattern(transfer)
  console.log(pattern)
} catch (e) {
  console.log('ll', e)
}

export const encodeCallNew = (abi: AnnotatedFunctionABI, parameters: any[]): string => {
  // let methodID = web3.eth.abi.encodeFunctionSignature(abi)
  const callData = web3.eth.abi.encodeFunctionCall(abi, parameters)
  // console.log("methodID",callData)
  return callData

  // case FunctionInputKind.Data:
  //         return input.value == '' ? '0x' : input.value
}
