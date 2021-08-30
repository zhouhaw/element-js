import { AbiType, FunctionInputKind, FunctionOutputKind, Schema, StateMutability } from '../../../types'

export interface Exchange {
  address: string
  sell?: string
  sellSig?: string
  buy?: string
  buySig?: string
}

const exchangeAddress = ''
export const ElementExchangeSchemas: Required<Pick<Schema<Exchange>, 'functions'>> = {
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: 'orderMatch',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Data, name: 'buy', type: 'address', value: asset.sell },
        { kind: FunctionInputKind.Data, name: 'buySig', type: 'address', value: asset.sellSig },
        { kind: FunctionInputKind.Data, name: 'sell', type: 'bytes', value: asset.buy },
        { kind: FunctionInputKind.Data, name: 'sellSig', type: 'bytes', value: asset.buySig }
      ],
      outputs: []
    })
  }
}
