/**
 * To simplify typifying ABIs
 */
export interface CustomError {
  name?: string
  data?: any
  code: string
  message?: string
}

export type ElementErrorCodes = Array<Readonly<CustomError>>

// 10 开头 用户+合约 授权错误
// 11 开头 资产，各类资产余额，授权，ID错误
// 12 开头 订单约束条件
// 20 开头 合约执行错误 rpc 网络请求错
// 40 开头 是MetaMask的拒绝 异常
export const ErrorCodes: ElementErrorCodes = [
  {
    code: 'INVALID_ARGUMENT',
    message: 'Smart contract error'
  },
  {
    code: '0',
    message: ''
  },
  {
    code: '1000',
    message: 'Custom information'
  },
  {
    code: '1001',
    message: 'Account no registration'
  },
  {
    code: '1002',
    message: 'Account authProxy without authorization exchangeProxyRegistryAddr '
  },
  {
    code: '1101',
    message: 'TokenTransferProxy allowAmount equel 0 '
  },
  {
    code: '1102',
    message: 'ERC1155TransferProxy NFTs isApprovedForAll is false '
  },
  {
    code: '1103',
    message: 'ElementSharedAsset balanceOf equal 0 !'
  },
  {
    code: '1104',
    message: 'ERC20 balance balance equal 0 !'
  },
  {
    code: '1105',
    message: 'ETH balance equel 0 '
  },
  {
    code: '1106',
    message: 'ERC721TransferProxy NFTs getApproved is false '
  },
  {
    code: '1201',
    message: 'Order: buy.basePrice to be greater than sell.basePrice!'
  },
  {
    code: '1202',
    message: 'Order can match false'
  },
  {
    code: '1203',
    message: 'Order validateOrder false '
  },
  {
    code: '1204',
    message: 'Buy order payment Token cannot be ETH '
  },
  {
    code: '1205',
    message: 'Order parameter false '
  },
  {
    code: '1206',
    message: 'Sell Order cancelledOrFinalized false '
  },
  {
    code: '1207',
    message: 'Buy Order cancelledOrFinalized false '
  },
  {
    code: '2001',
    message: 'rpc requset error '
  },
  {
    code: '4001',
    message: 'MetaMask Error '
  }
]

export class ElementError extends Error {
  public code: string
  public data: any
  constructor(err: CustomError) {
    let _err: CustomError | undefined = ErrorCodes.find((val) => val.code == err.code)

    if (Number(_err?.code) > 1000) {
      let _type = _err?.code.toString().charAt(0)
      let message = err.message || ''
      switch (_type) {
        case '2':
          super(message + '-' + _err?.message)
          break
        case '4':
          super(message)
          break
        default:
          super(_err?.message || 'sucess')
          break
      }
    } else {
      if (_err?.code == '1000') {
        let message = err.message || ''
        super(message + '-' + _err?.message)
      } else {
        super('undefined code!')
      }
    }
    this.code = err.code.toString()
    this.data = err.data
  }
}

// try {
//   throw new ElementError({ code: '1', data: 2 })
// } catch (e) {
//   console.log('ll', e)
// }
