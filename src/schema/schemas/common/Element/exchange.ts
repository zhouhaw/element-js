import { AbiType, FunctionInputKind, ExchangeSchema, StateMutability } from '../../../types'

export interface Exchange {
  address: string
  sell?: Array<any>
  sellSig?: Array<any>
  buy?: Array<any>
  buySig?: Array<any>
  metadata?: string
}
const orderCancelInputs = {
  inputs: [
    {
      components: [
        {
          internalType: 'address',
          name: 'exchange',
          type: 'address'
        },
        {
          internalType: 'address',
          name: 'maker',
          type: 'address'
        },
        {
          internalType: 'address',
          name: 'taker',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'makerRelayerFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'takerRelayerFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'makerProtocolFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'takerProtocolFee',
          type: 'uint256'
        },
        {
          internalType: 'address',
          name: 'feeRecipient',
          type: 'address'
        },
        {
          internalType: 'enum DataType.FeeMethod',
          name: 'feeMethod',
          type: 'uint8'
        },
        {
          internalType: 'enum SaleKindInterface.Side',
          name: 'side',
          type: 'uint8'
        },
        {
          internalType: 'enum SaleKindInterface.SaleKind',
          name: 'saleKind',
          type: 'uint8'
        },
        {
          internalType: 'address',
          name: 'target',
          type: 'address'
        },
        {
          internalType: 'enum DataType.HowToCall',
          name: 'howToCall',
          type: 'uint8'
        },
        {
          internalType: 'bytes',
          name: 'dataToCall',
          type: 'bytes'
        },
        {
          internalType: 'bytes',
          name: 'replacementPattern',
          type: 'bytes'
        },
        {
          internalType: 'address',
          name: 'staticTarget',
          type: 'address'
        },
        {
          internalType: 'bytes',
          name: 'staticExtradata',
          type: 'bytes'
        },
        {
          internalType: 'address',
          name: 'paymentToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'basePrice',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'extra',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'listingTime',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'expirationTime',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'salt',
          type: 'uint256'
        }
      ],
      internalType: 'struct DataType.Order',
      name: 'order',
      type: 'tuple'
    },
    {
      components: [
        {
          internalType: 'uint8',
          name: 'v',
          type: 'uint8'
        },
        {
          internalType: 'bytes32',
          name: 'r',
          type: 'bytes32'
        },
        {
          internalType: 'bytes32',
          name: 's',
          type: 'bytes32'
        }
      ],
      internalType: 'struct DataType.Sig',
      name: 'sig',
      type: 'tuple'
    }
  ],
  name: 'cancelOrder',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function'
}
const orderMatchInputs = {
  inputs: [
    {
      components: [
        {
          internalType: 'address',
          name: 'exchange',
          type: 'address'
        },
        {
          internalType: 'address',
          name: 'maker',
          type: 'address'
        },
        {
          internalType: 'address',
          name: 'taker',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'makerRelayerFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'takerRelayerFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'makerProtocolFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'takerProtocolFee',
          type: 'uint256'
        },
        {
          internalType: 'address',
          name: 'feeRecipient',
          type: 'address'
        },
        {
          internalType: 'enum DataType.FeeMethod',
          name: 'feeMethod',
          type: 'uint8'
        },
        {
          internalType: 'enum SaleKindInterface.Side',
          name: 'side',
          type: 'uint8'
        },
        {
          internalType: 'enum SaleKindInterface.SaleKind',
          name: 'saleKind',
          type: 'uint8'
        },
        {
          internalType: 'address',
          name: 'target',
          type: 'address'
        },
        {
          internalType: 'enum DataType.HowToCall',
          name: 'howToCall',
          type: 'uint8'
        },
        {
          internalType: 'bytes',
          name: 'dataToCall',
          type: 'bytes'
        },
        {
          internalType: 'bytes',
          name: 'replacementPattern',
          type: 'bytes'
        },
        {
          internalType: 'address',
          name: 'staticTarget',
          type: 'address'
        },
        {
          internalType: 'bytes',
          name: 'staticExtradata',
          type: 'bytes'
        },
        {
          internalType: 'address',
          name: 'paymentToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'basePrice',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'extra',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'listingTime',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'expirationTime',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'salt',
          type: 'uint256'
        }
      ],
      internalType: 'struct DataType.Order',
      name: 'buy',
      type: 'tuple'
    },
    {
      components: [
        {
          internalType: 'uint8',
          name: 'v',
          type: 'uint8'
        },
        {
          internalType: 'bytes32',
          name: 'r',
          type: 'bytes32'
        },
        {
          internalType: 'bytes32',
          name: 's',
          type: 'bytes32'
        }
      ],
      internalType: 'struct DataType.Sig',
      name: 'buySig',
      type: 'tuple'
    },
    {
      components: [
        {
          internalType: 'address',
          name: 'exchange',
          type: 'address'
        },
        {
          internalType: 'address',
          name: 'maker',
          type: 'address'
        },
        {
          internalType: 'address',
          name: 'taker',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'makerRelayerFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'takerRelayerFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'makerProtocolFee',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'takerProtocolFee',
          type: 'uint256'
        },
        {
          internalType: 'address',
          name: 'feeRecipient',
          type: 'address'
        },
        {
          internalType: 'enum DataType.FeeMethod',
          name: 'feeMethod',
          type: 'uint8'
        },
        {
          internalType: 'enum SaleKindInterface.Side',
          name: 'side',
          type: 'uint8'
        },
        {
          internalType: 'enum SaleKindInterface.SaleKind',
          name: 'saleKind',
          type: 'uint8'
        },
        {
          internalType: 'address',
          name: 'target',
          type: 'address'
        },
        {
          internalType: 'enum DataType.HowToCall',
          name: 'howToCall',
          type: 'uint8'
        },
        {
          internalType: 'bytes',
          name: 'dataToCall',
          type: 'bytes'
        },
        {
          internalType: 'bytes',
          name: 'replacementPattern',
          type: 'bytes'
        },
        {
          internalType: 'address',
          name: 'staticTarget',
          type: 'address'
        },
        {
          internalType: 'bytes',
          name: 'staticExtradata',
          type: 'bytes'
        },
        {
          internalType: 'address',
          name: 'paymentToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'basePrice',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'extra',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'listingTime',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'expirationTime',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'salt',
          type: 'uint256'
        }
      ],
      internalType: 'struct DataType.Order',
      name: 'sell',
      type: 'tuple'
    },
    {
      components: [
        {
          internalType: 'uint8',
          name: 'v',
          type: 'uint8'
        },
        {
          internalType: 'bytes32',
          name: 'r',
          type: 'bytes32'
        },
        {
          internalType: 'bytes32',
          name: 's',
          type: 'bytes32'
        }
      ],
      internalType: 'struct DataType.Sig',
      name: 'sellSig',
      type: 'tuple'
    },
    {
      internalType: 'bytes32',
      name: 'metadata',
      type: 'bytes32'
    }
  ],
  name: 'orderMatch',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function'
}
export const ElementExchangeSchemas: Required<Pick<ExchangeSchema<Exchange>, 'functions'>> = {
  functions: {
    orderMatch: (asset) => ({
      type: AbiType.Function,
      name: 'orderMatch',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        {
          kind: FunctionInputKind.Data,
          components: orderMatchInputs.inputs[0].components,
          name: orderMatchInputs.inputs[0].name,
          type: 'tuple'
        },
        {
          kind: FunctionInputKind.Data,
          components: orderMatchInputs.inputs[1].components,
          name: orderMatchInputs.inputs[1].name,
          type: 'tuple'
        },
        {
          kind: FunctionInputKind.Data,
          components: orderMatchInputs.inputs[2].components,
          name: orderMatchInputs.inputs[2].name,
          type: 'tuple'
        },
        {
          kind: FunctionInputKind.Data,
          components: orderMatchInputs.inputs[3].components,
          name: orderMatchInputs.inputs[3].name,
          type: 'tuple'
        },
        { kind: FunctionInputKind.Data, name: 'metadata', type: 'bytes32' }
      ],
      outputs: []
    }),
    orderCancel: (asset) => ({
      type: AbiType.Function,
      name: 'cancelOrder',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        {
          kind: FunctionInputKind.Data,
          components: orderCancelInputs.inputs[0].components,
          name: orderCancelInputs.inputs[0].name,
          type: 'tuple'
        },
        {
          kind: FunctionInputKind.Data,
          components: orderCancelInputs.inputs[1].components,
          name: orderCancelInputs.inputs[1].name,
          type: 'tuple'
        }
      ],
      outputs: []
    })
  }
}
