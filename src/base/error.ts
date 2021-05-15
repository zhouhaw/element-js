/**
 * To simplify typifying ABIs
 */
export interface CustomError {
  name?: string
  data?: any
  code: number
  message?: string
}

export type ElementErrorCodes = Array<Readonly<CustomError>>

// 10 开头 用户+合约 授权错误
// 11 开头 资产，各类资产余额，授权，ID错误
// 12 开头 订单约束条件
// 20 开头 合约执行错误 rpc 网络请求错
export const ErrorCodes: ElementErrorCodes = [
  {
    code: 0,
    message: ''
  },
  {
    code: 1001,
    message: 'Account no registration'
  },
  {
    code: 1002,
    message: 'Account authProxy without authorization exchangeProxyRegistryAddr '
  },
  {
    code: 1101,
    message: 'TokenTransferProxy allowAmount equel 0 '
  },
  {
    code: 1102,
    message: 'ERC1155TransferProxy NFTs isApprovedForAll is false '
  },
  {
    code: 1103,
    message: 'ElementSharedAsset balanceOf equal 0 !'
  },
  {
    code: 1104,
    message: 'ERC20 balance balance equal 0 !'
  },
  {
    code: 1105,
    message: 'ETH balance equel 0 '
  },
  {
    code: 1201,
    message: 'Order: buy.basePrice to be greater than sell.basePrice!'
  },
  {
    code: 1202,
    message: 'Order can match false'
  },
  {
    code: 1203,
    message: 'Order validateOrder false '
  },
  {
    code: 2001,
    message: 'rpc requset error '
  }
]

export class ElementError extends Error {
  public code: number
  constructor(err: CustomError) {
    let _err: CustomError | undefined = ErrorCodes.find((val) => val.code == err.code)
    if (_err) {
      let _type = _err.code.toString().charAt(0)
      if (_type == '2') {
        let message = err.message || ''
        super(message + '-' + _err.message)
      } else {
        super(_err.message || 'sucess')
      }
    } else {
      super('undefined code!')
    }
    this.code = err.code
  }
}

// try {
//   throw new ElementError({ code: 1 })
// } catch (e) {
//   console.log('ll', e.code)
// }
