import { AbiType, FunctionInputKind, FunctionOutputKind, Schema, StateMutability } from '../../../types'

export interface FungibleTradeType {
  address: string
  account: string
  quantity: string
}

export const ERC20Schema: Schema<FungibleTradeType> = {
  version: 1,
  deploymentBlock: 0, // Not indexed (for now; need asset-specific indexing strategy)
  name: 'ERC20',
  description: 'Items conforming to the ERC20 spec, using transferFrom.',
  thumbnail: 'https://www.element.market/build/logo-header-c7b8d686.svg',
  website: 'https://github.com/ethereum/eips/issues/20',
  fields: [
    { name: 'Address', type: 'address', description: 'Asset Contract Address' },
    { name: 'Account', type: 'address', description: 'Account Address' },
    { name: 'Quantity', type: 'uint256', description: 'Quantity to transfer' }
  ],
  assetFromFields: (fields: any) => ({
    address: fields.Address,
    account: fields.Account,
    quantity: fields.Quantity
  }),
  assetToFields: (asset) => ({
    Address: asset.address,
    Account: asset.account,
    Quantity: asset.quantity
  }),
  formatter: async (asset) => {
    return {
      title: 'ERC20 Asset at ' + asset.address,
      description: 'Trading ' + asset.quantity.toString(),
      url: '',
      thumbnail: '',
      properties: []
    }
  },
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: 'transferFrom',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Owner, name: '_from', type: 'address' },
        { kind: FunctionInputKind.Replaceable, name: '_to', type: 'address' },
        { kind: FunctionInputKind.Count, name: '_value', type: 'uint256', value: asset.quantity }
      ],
      outputs: []
    }),
    isApprove: (asset) => ({
      type: AbiType.Function,
      name: 'allowance',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Owner, name: 'owner', type: 'address' },
        { kind: FunctionInputKind.Replaceable, name: 'spender', type: 'address' }
      ],
      outputs: [{ kind: FunctionOutputKind.Count, name: 'balance', type: 'uint256' }]
    }),
    approve: (asset) => ({
      type: AbiType.Function,
      name: 'approve',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Replaceable, name: 'to', type: 'address' },
        { kind: FunctionInputKind.Asset, name: 'amount', type: 'uint256', value: asset.quantity }
      ],
      outputs: []
    }),
    countOf: (asset) => ({
      type: AbiType.Function,
      name: 'balanceOf',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: asset.address,
      inputs: [{ kind: FunctionInputKind.Owner, name: 'owner', type: 'address' }],
      outputs: [{ kind: FunctionOutputKind.Count, name: 'balance', type: 'uint256' }],
      assetFromOutputs: (outputs: any) => outputs.balance
    }),
    assetsOfOwnerByIndex: []
  },
  events: {
    transfer: []
  },
  hash: (asset) => asset.address
}
