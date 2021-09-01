import { AbiType, ExchangeSchema, FunctionInputKind, FunctionOutputKind, Schema, StateMutability } from '../../../types'

export interface Registry {
  address: string
}

export const ElementRegistrySchemas: Required<Pick<Schema<Registry>, 'address' | 'functions'>> = {
  address: '',
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: 'registerProxy',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [],
      outputs: []
    }),
    isApprove: (asset) => ({
      type: AbiType.Function,
      name: 'proxies',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: asset.address,
      inputs: [{ kind: FunctionInputKind.Owner, name: 'account', type: 'address' }],
      outputs: [{ kind: FunctionOutputKind.Other, name: 'proxy', type: 'address' }]
    })
  }
}
