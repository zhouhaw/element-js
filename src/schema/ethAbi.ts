/* eslint-disable no-useless-escape */
// import utils from 'ethereumjs-util'
// import BN from 'bn.js'

import { zeros, setLengthRight, keccak256, isHexPrefixed, stripHexPrefix, BN } from 'ethereumjs-util'
import { AnnotatedFunctionInput } from './types'

// console.log(zeros, setLengthRight)

interface ABICoder {
  eventID: (name: string, types: Array<any>) => Buffer
  methodID: (name: string, types: Array<any>) => Buffer
  rawEncode: (types: Array<any>, values: Array<any>) => Buffer
  simpleEncode: (method: string) => Buffer
  rawInputsEncode: (inputs: Array<any>) => Buffer
  // rawDecode: (types: Array<any>, values: string) => any
  // simpleDecode: (method: string, data: string) => any
}

// Convert from short to canonical names
// FIXME: optimise or make this nicer?
export function elementaryName(name: string) {
  if (name.startsWith('int[')) {
    return 'int256' + name.slice(3)
  } else if (name === 'int') {
    return 'int256'
  } else if (name.startsWith('uint[')) {
    return 'uint256' + name.slice(4)
  } else if (name === 'uint') {
    return 'uint256'
  } else if (name.startsWith('fixed[')) {
    return 'fixed128x128' + name.slice(5)
  } else if (name === 'fixed') {
    return 'fixed128x128'
  } else if (name.startsWith('ufixed[')) {
    return 'ufixed128x128' + name.slice(6)
  } else if (name === 'ufixed') {
    return 'ufixed128x128'
  }
  return name
}

// Parse N from type<N>
function parseTypeN(type: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return parseInt(/^\D+(\d+)$/.exec(type)[1], 10)
}

// Parse N,M from type<N>x<M>
function parseTypeNxM(type: string) {
  const tmp: any = /^\D+(\d+)x(\d+)$/.exec(type)
  return [parseInt(tmp[1], 10), parseInt(tmp[2], 10)]
}

// Parse N in type[<N>] where "type" can itself be an array type.
function parseTypeArray(type: string) {
  const tmp = type.match(/(.*)\[(.*?)\]$/)
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10)
  }
  return null
}

function parseNumber(arg: any) {
  const type = typeof arg
  if (type === 'string') {
    if (isHexPrefixed(arg)) {
      return new BN(stripHexPrefix(arg), 16)
    } else {
      return new BN(arg, 10)
    }
  } else if (type === 'number') {
    return new BN(arg)
  } else if (arg.toArray) {
    // assume this is a BN for the moment, replace with BN.isBN soon
    return arg
  } else {
    throw new Error('Argument is not a number')
  }
}

// someMethod(bytes,uint)
// someMethod(bytes,uint):(boolean)
function parseSignature(sig: string) {
  const tmp: any = /^(\w+)\((.*)\)$/.exec(sig)

  if (tmp.length !== 3) {
    throw new Error('Invalid method signature')
  }

  const args = /^(.+)\):\((.+)$/.exec(tmp[2])

  if (args !== null && args.length === 3) {
    return {
      method: tmp[1],
      args: args[1].split(','),
      retargs: args[2].split(',')
    }
  } else {
    let params = tmp[2].split(',')
    if (params.length === 1 && params[0] === '') {
      // Special-case (possibly naive) fixup for functions that take no arguments.
      // TODO: special cases are always bad, but this makes the function return
      // match what the calling functions expect
      params = []
    }
    return {
      method: tmp[1],
      args: params
    }
  }
}

// Encodes a single item (can be dynamic array)
// @returns: Buffer
export function encodeSingle(type: any, arg: any): Buffer {
  let size, num, ret, i

  if (type === 'address') {
    return encodeSingle('uint160', parseNumber(arg))
  } else if (type === 'bool') {
    return encodeSingle('uint8', arg ? 1 : 0)
  } else if (type === 'string') {
    return encodeSingle('bytes', Buffer.from(arg, 'utf8'))
  } else if (isArray(type)) {
    // this part handles fixed-length ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    if (typeof arg.length === 'undefined') {
      throw new Error('Not an array?')
    }
    size = parseTypeArray(type)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (size !== 'dynamic' && size !== 0 && arg.length > size) {
      throw new Error('Elements exceed array size: ' + size)
    }
    ret = []
    type = type.slice(0, type.lastIndexOf('['))
    if (typeof arg === 'string') {
      arg = JSON.parse(arg)
    }
    for (i in arg) {
      ret.push(encodeSingle(type, arg[i]))
    }
    if (size === 'dynamic') {
      const length = encodeSingle('uint256', arg.length)
      ret.unshift(length)
    }
    return Buffer.concat(ret)
  } else if (type === 'bytes') {
    arg = Buffer.from(arg)

    ret = Buffer.concat([encodeSingle('uint256', arg.length), arg])

    if (arg.length % 32 !== 0) {
      ret = Buffer.concat([ret, zeros(32 - (arg.length % 32))])
    }

    return ret
  } else if (type.startsWith('bytes')) {
    size = parseTypeN(type)
    if (size < 1 || size > 32) {
      throw new Error('Invalid bytes<N> width: ' + size)
    }

    return setLengthRight(arg, 32)
  } else if (type.startsWith('uint')) {
    size = parseTypeN(type)
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid uint<N> width: ' + size)
    }

    num = parseNumber(arg)
    if (num.bitLength() > size) {
      throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength())
    }

    if (num < 0) {
      throw new Error('Supplied uint is negative')
    }

    return num.toArrayLike(Buffer, 'be', 32)
  } else if (type.startsWith('int')) {
    size = parseTypeN(type)
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid int<N> width: ' + size)
    }

    num = parseNumber(arg)
    if (num.bitLength() > size) {
      throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength())
    }

    return num.toTwos(256).toArrayLike(Buffer, 'be', 32)
  } else if (type.startsWith('ufixed')) {
    size = parseTypeNxM(type)

    num = parseNumber(arg)

    if (num < 0) {
      throw new Error('Supplied ufixed is negative')
    }

    return encodeSingle('uint256', num.mul(new BN(2).pow(new BN(size[1]))))
  } else if (type.startsWith('fixed')) {
    size = parseTypeNxM(type)

    return encodeSingle('int256', parseNumber(arg).mul(new BN(2).pow(new BN(size[1]))))
  }

  throw new Error('Unsupported or invalid type: ' + type)
}

// Decodes a single item (can be dynamic array)
// @returns: array
// FIXME: this method will need a lot of attention at checking limits and validation
function decodeSingle(parsedType: any, data: Buffer, offset: any): Array<any> | string | any {
  if (typeof parsedType === 'string') {
    parsedType = parseType(parsedType)
  }
  let size, num, ret, i

  if (parsedType.name === 'address') {
    return decodeSingle(parsedType.rawType, data, offset).toArrayLike(Buffer, 'be', 20).toString('hex')
  } else if (parsedType.name === 'bool') {
    return decodeSingle(parsedType.rawType, data, offset).toString() === new BN(1).toString()
  } else if (parsedType.name === 'string') {
    const bytes = decodeSingle(parsedType.rawType, data, offset)
    return Buffer.from(bytes, 'utf8').toString()
  } else if (parsedType.isArray) {
    // this part handles fixed-length arrays ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    ret = []
    size = parsedType.size

    if (parsedType.size === 'dynamic') {
      offset = decodeSingle('uint256', data, offset).toNumber()
      size = decodeSingle('uint256', data, offset).toNumber()
      offset = offset + 32
    }
    for (i = 0; i < size; i++) {
      const decoded = decodeSingle(parsedType.subArray, data, offset)
      ret.push(decoded)
      offset += parsedType.subArray.memoryUsage
    }
    return ret
  } else if (parsedType.name === 'bytes') {
    offset = decodeSingle('uint256', data, offset).toNumber()
    size = decodeSingle('uint256', data, offset).toNumber()
    return data.slice(offset + 32, offset + 32 + size)
  } else if (parsedType.name.startsWith('bytes')) {
    return data.slice(offset, offset + parsedType.size)
  } else if (parsedType.name.startsWith('uint')) {
    num = new BN(data.slice(offset, offset + 32), 16, 'be')
    if (num.bitLength() > parsedType.size) {
      throw new Error('Decoded int exceeds width: ' + parsedType.size + ' vs ' + num.bitLength())
    }
    return num
  } else if (parsedType.name.startsWith('int')) {
    num = new BN(data.slice(offset, offset + 32), 16, 'be').fromTwos(256)
    if (num.bitLength() > parsedType.size) {
      throw new Error('Decoded uint exceeds width: ' + parsedType.size + ' vs ' + num.bitLength())
    }

    return num
  } else if (parsedType.name.startsWith('ufixed')) {
    size = new BN(2).pow(new BN(parsedType.size[1]))
    num = decodeSingle('uint256', data, offset)
    if (!num.mod(size).isZero()) {
      throw new Error('Decimals not supported yet')
    }
    return num.div(size)
  } else if (parsedType.name.startsWith('fixed')) {
    size = new BN(2).pow(new BN(parsedType.size[1]))
    num = decodeSingle('int256', data, offset)
    if (!num.mod(size).isZero()) {
      throw new Error('Decimals not supported yet')
    }
    return num.div(size)
  }
  throw new Error('Unsupported or invalid type: ' + parsedType.name)
}

// Parse the given type
// @returns: {} containing the type itself, memory usage and (including size and subArray if applicable)
function parseType(type: any) {
  let size: any
  let ret: any
  if (isArray(type)) {
    size = parseTypeArray(type)
    let subArray = type.slice(0, type.lastIndexOf('['))
    subArray = parseType(subArray)
    ret = {
      isArray: true,
      name: type,
      size: size,
      memoryUsage: size === 'dynamic' ? 32 : subArray.memoryUsage * size,
      subArray: subArray
    }
    return ret
  } else {
    let rawType
    switch (type) {
      case 'address':
        rawType = 'uint160'
        break
      case 'bool':
        rawType = 'uint8'
        break
      case 'string':
        rawType = 'bytes'
        break
    }
    ret = {
      rawType: rawType,
      name: type,
      memoryUsage: 32
    }

    if ((type.startsWith('bytes') && type !== 'bytes') || type.startsWith('uint') || type.startsWith('int')) {
      ret.size = parseTypeN(type)
    } else if (type.startsWith('ufixed') || type.startsWith('fixed')) {
      ret.size = parseTypeNxM(type)
    }

    if (type.startsWith('bytes') && type !== 'bytes' && (ret.size < 1 || ret.size > 32)) {
      throw new Error('Invalid bytes<N> width: ' + ret.size)
    }
    if ((type.startsWith('uint') || type.startsWith('int')) && (ret.size % 8 || ret.size < 8 || ret.size > 256)) {
      throw new Error('Invalid int/uint<N> width: ' + ret.size)
    }
    return ret
  }
}

// Is a type dynamic?
export function isDynamic(type: string) {
  // FIXME: handle all types? I don't think anything is missing now
  return type === 'string' || type === 'bytes' || parseTypeArray(type) === 'dynamic'
}

// Is a type an array?
function isArray(type: any) {
  return type.lastIndexOf(']') === type.length - 1
}

export const ABI = <ABICoder>{}

ABI.eventID = function (name, types) {
  // FIXME: use node.js util.format?
  const sig = name + '(' + types.map(elementaryName).join(',') + ')'
  return keccak256(Buffer.from(sig))
}

ABI.methodID = function (name, types) {
  return ABI.eventID(name, types).slice(0, 4)
}

// Encode a method/event with arguments
// @types an array of string type names
// @args  an array of the appropriate values
ABI.rawEncode = function (types, values): Buffer {
  const output = []
  const data = []

  let headLength = 0

  types.forEach(function (type) {
    if (isArray(type)) {
      const size: any = parseTypeArray(type)

      if (size !== 'dynamic') {
        headLength += 32 * size
      } else {
        headLength += 32
      }
    } else {
      headLength += 32
    }
  })

  for (let i = 0; i < types.length; i++) {
    const type = elementaryName(types[i])
    const value = values[i]
    const cur = encodeSingle(type, value)

    // Use the head/tail method for storing dynamic data
    if (isDynamic(type)) {
      output.push(encodeSingle('uint256', headLength))
      data.push(cur)
      headLength += cur.length
    } else {
      output.push(cur)
    }
  }

  return Buffer.concat(output.concat(data))
}

ABI.rawInputsEncode = function (inputs: Array<AnnotatedFunctionInput>): Buffer {
  let types: Array<any> = []
  let values: Array<any> = []
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (input.type === 'tuple') {
      types = [...types, ...(input.components?.map((val) => val.type) as any)]
      values = [...values, ...input.value]
    } else {
      types.push(input.type)
      values.push(input.value)
    }
  }
  return this.rawEncode(types, values)
}

// ABI.rawDecode = function (types, data): any {
//   const ret = []
//   const _data = Buffer.from(data)
//   let offset = 0
//   for (let i = 0; i < types.length; i++) {
//     const type = elementaryName(types[i])
//     const parsed = parseType(type)
//     const decoded = decodeSingle(parsed, _data, offset)
//     offset += parsed.memoryUsage
//     ret.push(decoded)
//   }
//   return ret
// }

// ABI.simpleDecode = function (method: string, data: string) {
//   const sig = parseSignature(method)
//
//   // FIXME: validate/convert arguments
//   if (!sig.retargs) {
//     throw new Error('No return values in method')
//   }
//
//   return ABI.rawDecode(sig.retargs, data)
// }
