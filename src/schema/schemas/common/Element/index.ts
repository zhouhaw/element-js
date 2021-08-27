import { AbiType, FunctionInputKind, FunctionOutputKind, Schema, StateMutability } from '../../../types'

export interface Exchange {
  account?: string
  accountProxy?: string
  sell?: string
  sellSig?: string
  buy?: string
  buySig?: string
}

const exchangeAddress = ''
const registryAddress = ''
export const ElementSchemas: Required<Pick<Schema<Exchange>, 'functions'>> = {
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: 'orderMatch',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: exchangeAddress,
      inputs: [
        { kind: FunctionInputKind.Data, name: 'buy', type: 'address', value: asset.sell },
        { kind: FunctionInputKind.Data, name: 'buySig', type: 'address', value: asset.sellSig },
        { kind: FunctionInputKind.Data, name: 'sell', type: 'bytes', value: asset.buy },
        { kind: FunctionInputKind.Data, name: 'sellSig', type: 'bytes', value: asset.buySig }
      ],
      outputs: []
    }),
    isApprove: (asset) => ({
      type: AbiType.Function,
      name: 'proxies',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: registryAddress,
      inputs: [{ kind: FunctionInputKind.Owner, name: 'account', type: 'address', value: asset.account }],
      outputs: [{ kind: FunctionOutputKind.Owner, name: 'proxy', type: 'address' }]
    }),
    approve: () => ({
      type: AbiType.Function,
      name: 'registerProxy',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: registryAddress,
      inputs: [],
      outputs: []
    })
  }
}
