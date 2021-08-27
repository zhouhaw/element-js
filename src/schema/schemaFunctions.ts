// eslint-disable-next-line @typescript-eslint/no-var-requires
// const ethABI = require('@txdev/ethereumjs-abi')
import { ABI as ethABI, elementaryName, encodeSingle, isDynamic } from './ethAbi'

import { AnnotatedFunctionABI, FunctionInput, FunctionInputKind, Schema } from './types'

const failWith = (msg: string): any => {
  throw new Error(msg)
}

const generateDefaultValue = (type: string): any => {
  switch (type) {
    case 'address':
    case 'bytes20':
      /* Null address is sometimes checked in transfer calls. */
      // But we need to use 0x000 because bitwise XOR won't work if there's a 0 in the actual address, since it will be replaced as 1 OR 0 = 1
      return '0x0000000000000000000000000000000000000000'
    case 'bytes32':
      return '0x0000000000000000000000000000000000000000000000000000000000000000'
    case 'bool':
      return false
    case 'int':
    case 'uint':
    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
    case 'uint256':
      return 0
    default:
      throw new Error('Default value not yet implemented for type: ' + type)
  }
}

export const encodeReplacementPattern: ReplacementEncoder = (
  abi,
  replaceKind = FunctionInputKind.Replaceable,
  encodeToBytes = true
): string => {
  const output: Buffer[] = []
  const data: Buffer[] = []
  const dynamicOffset = abi.inputs.reduce((len, { type }) => {
    const match = type.match(/\[(.+)\]$/)
    return len + (match ? parseInt(match[1], 10) * 32 : 32)
  }, 0)
  abi.inputs
    .map(({ kind, type, value }) => ({
      bitmask: kind === replaceKind ? 255 : 0,
      type: elementaryName(type),
      value: value !== undefined ? value : generateDefaultValue(type)
    }))
    .reduce((offset, { bitmask, type, value }) => {
      // The 0xff bytes in the mask select the replacement bytes. All other bytes are 0x00.
      const cur = new Buffer(encodeSingle(type, value).length).fill(bitmask)
      if (isDynamic(type)) {
        if (bitmask) {
          throw new Error('Replacement is not supported for dynamic parameters.')
        }
        output.push(new Buffer(encodeSingle('uint256', dynamicOffset).length))
        data.push(cur)
        return offset + cur.length
      }
      output.push(cur)
      return offset
    }, dynamicOffset)
  // 4 initial bytes of 0x00 for the method hash.
  const methodIdMask = new Buffer(4)
  const mask = Buffer.concat([methodIdMask, Buffer.concat(output.concat(data))])
  return encodeToBytes ? `0x${mask.toString('hex')}` : mask.map((b) => (b ? 1 : 0)).join('')
}

// export const decodeCall = (abi: AnnotatedFunctionABI, values: string): any => {
//   const outputsTypes = abi.outputs.map((i) => i.type)
//   return ethABI.rawDecode(outputsTypes, values)
// }

export const encodeCall = (abi: AnnotatedFunctionABI, parameters: any[]): string => {
  const inputTypes = abi.inputs.map((i) => i.type)
  return (
    '0x' +
    Buffer.concat([ethABI.methodID(abi.name, inputTypes), ethABI.rawEncode(inputTypes, parameters)]).toString('hex')
  )
}

export const encodeParamsCall = (abi: AnnotatedFunctionABI): string => {
  const inputTypes = abi.inputs.map((i) => i.type)
  const parameters = abi.inputs.map((i) => i.value)
  return (
    '0x' +
    Buffer.concat([ethABI.methodID(abi.name, inputTypes), ethABI.rawEncode(inputTypes, parameters)]).toString('hex')
  )
}

export interface CallSpec {
  target: string
  dataToCall: string
  replacementPattern: string
}

export type SellEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec

export const encodeSell: SellEncoder<any> = (schema, asset, address) => {
  const transfer = schema.functions.transfer(asset)
  return {
    target: transfer.target,
    dataToCall: encodeDefaultCall(transfer, address),
    replacementPattern: encodeReplacementPattern(transfer)
  }
}

export type BuyEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec

export const encodeBuy: BuyEncoder<any> = (schema, asset, address) => {
  const transfer = schema.functions.transfer(asset)
  const replaceables = transfer.inputs.filter((i: any) => i.kind === FunctionInputKind.Replaceable)
  const ownerInputs = transfer.inputs.filter((i: any) => i.kind === FunctionInputKind.Owner)

  // Validate
  if (replaceables.length !== 1) {
    failWith('Only 1 input can match transfer destination, but instead ' + replaceables.length + ' did')
  }

  // Compute calldata
  const parameters = transfer.inputs.map((input: any) => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return address
      case FunctionInputKind.Owner:
        return generateDefaultValue(input.type)
      default:
        return input.value.toString()
    }
  })
  const dataToCall = encodeCall(transfer, parameters)

  // Compute replacement pattern
  let replacementPattern = '0x'
  if (ownerInputs.length > 0) {
    replacementPattern = encodeReplacementPattern(transfer, FunctionInputKind.Owner)
  }

  return {
    target: transfer.target,
    dataToCall,
    replacementPattern
  }
}

export type DefaultCallEncoder = (abi: AnnotatedFunctionABI, address: string) => string

export const encodeDefaultCall: DefaultCallEncoder = (abi, address) => {
  const parameters = abi.inputs.map((input) => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return generateDefaultValue(input.type)
      case FunctionInputKind.Owner:
        return address
      case FunctionInputKind.Asset:
      case FunctionInputKind.Count:
      default:
        return input.value
    }
  })
  return encodeCall(abi, parameters)
}

export type ReplacementEncoder = (abi: AnnotatedFunctionABI, kind?: FunctionInputKind) => string
