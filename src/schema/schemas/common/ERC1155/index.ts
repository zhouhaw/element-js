import { FunctionInputKind, FunctionOutputKind, Schema, StateMutability, AbiType } from '../../../types'

export interface SemiFungibleTradeType {
  id: string
  address: string
  quantity: string
  data: string
}

export const ERC1155Schema: Schema<SemiFungibleTradeType> = {
  version: 1,
  deploymentBlock: 0, // Not indexed (for now; need asset-specific indexing strategy)
  name: 'ERC1155',
  description: 'Items conforming to the ERC1155 spec, using transferFrom.',
  thumbnail: 'https://www.element.market/build/logo-header-c7b8d686.svg',
  website: 'https://github.com/ethereum/eips/issues/1155',
  fields: [
    { name: 'ID', type: 'uint256', description: 'Asset Token ID' },
    { name: 'Address', type: 'address', description: 'Asset Contract Address' },
    { name: 'Quantity', type: 'uint256', description: 'Quantity to transfer' },
    { name: 'Data', type: 'bytes', description: 'Data to transfer' }
  ],
  assetFromFields: (fields: any) => ({
    id: fields.ID,
    address: fields.Address,
    quantity: fields.Quantity,
    data: fields.Data
  }),
  assetToFields: (asset: any) => ({
    ID: asset.id,
    Address: asset.address,
    Quantity: asset.quantity,
    Data: asset.data
  }),
  formatter: async (asset: any) => {
    return {
      title: 'ERC1155 Asset: Token ID ' + asset.id + ' at ' + asset.address,
      description: 'Trading ' + asset.quantity.toString(),
      url: '',
      thumbnail: '',
      properties: []
    }
  },
  functions: {
    transfer: (asset: any) => ({
      type: AbiType.Function,
      name: 'safeTransferFrom',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Owner, name: '_from', type: 'address' },
        { kind: FunctionInputKind.Replaceable, name: '_to', type: 'address' },
        { kind: FunctionInputKind.Asset, name: '_id', type: 'uint256', value: asset.id },
        { kind: FunctionInputKind.Count, name: '_value', type: 'uint256', value: asset.quantity },
        { kind: FunctionInputKind.Data, name: '_data', type: 'bytes', value: asset.data }
      ],
      outputs: []
    }),
    countOf: (asset: any) => ({
      type: AbiType.Function,
      name: 'balanceOf',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Owner, name: '_owner', type: 'address' },
        { kind: FunctionInputKind.Asset, name: '_id', type: 'uint256', value: asset.id }
      ],
      outputs: [{ kind: FunctionOutputKind.Count, name: 'balance', type: 'uint' }],
      assetFromOutputs: (outputs: any) => outputs.balance
    }),
    isApprove: (asset) => ({
      type: AbiType.Function,
      name: 'isApprovedForAll',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Owner, name: '_owner', type: 'address' },
        { kind: FunctionInputKind.Replaceable, name: '_operator', type: 'address' }
      ],
      outputs: [{ kind: FunctionOutputKind.Owner, name: 'owner', type: 'bool' }]
    }),
    approve: (asset) => ({
      type: AbiType.Function,
      name: 'setApprovalForAll',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Owner, name: '_operator', type: 'address' },
        { kind: FunctionInputKind.Replaceable, name: 'isoperator', type: 'bool' }
      ],
      outputs: []
    }),
    assetsOfOwnerByIndex: []
  },
  events: {
    transfer: []
  },
  hash: (asset: any) => asset.address + '-' + asset.id
}
