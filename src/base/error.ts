/**
 * To simplify typifying ABIs
 */
export interface CustomError {
  name?: string
  data?: any
  code: string
  message?: string
  context?: {
    [key: string]: any
  }
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
    message: 'SDK error'
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
    message: '{{assetType}} balanceOf equal 0 !'
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
    message: '{{assetType}} does not support '
  },
  {
    code: '1207',
    message: '{{orderSide}} Order cancelledOrFinalized false '
  },
  {
    code: '1208',
    message: 'CheckDataToCall.dataToCall error '
  },
  {
    code: '1209',
    message: 'CheckDataToCall.target error '
  },
  {
    code: '1210',
    message: 'CheckDataToCall.replacementPattern error '
  },
  {
    code: '1211', // ElementShareAsset order uri 和 order version 中返回的 uri 不一致
    message: 'The ElementShareAsset Order URI does not match the URI returned in Order Version '
  },
  {
    code: '1212', // ElementShareAsset  tokenId 的暂时无法交易
    message: 'ElementShareAsset TokenID cannot be traded for the time being '
  },
  {
    code: '2001',
    message: '{{funcName}} RPC request error '
  },
  {
    code: '4001',
    message: 'MetaMask Error '
  }
]

function render(template: string, context: Object) {
  // @ts-ignore
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key.trim()])
}

// const template = "{{name   }}很厉name害，才{{age   }}岁";
// const context = { name: "jawil", age: "15" };
// console.log(render(template, context));

export class ElementError extends Error {
  public code: string
  public data: any

  constructor(err: CustomError) {
    let _err: CustomError | undefined = ErrorCodes.find((val) => val.code == err.code)

    if (Number(_err?.code) > 1000) {
      let message = err.context && _err?.message ? render(_err.message, err.context) : err.message
      super(message)
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
//   throw new ElementError({ code: '4001' })
// } catch (e) {
//   console.log('ll', e)
// }
