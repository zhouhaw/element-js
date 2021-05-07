 

import {
  EventInputKind,
  FunctionInputKind,
  FunctionOutputKind,
  Schema,
  AbiType,
  StateMutability,
} from '../../../types';

export type ElementShardType = {
  id: string
  address: string
  quantity: string
};

export const privateElementShardSchema: Schema<ElementShardType> = {
  version: 1,
  deploymentBlock: 0,
  name: 'ElementShardType',
  description: 'Element ERC1155 non-fungible token for Element Exchange testing',
  thumbnail: 'https://cointelegraph.com/storage/uploads/view/f88e17e41f607dc0aef238230dd40cc6.png',
  website: 'https://element.market',
  fields: [
    { name: 'ID', type: 'uint256', description: 'Asset Token ID' },
    { name: 'Address', type: 'address', description: 'Asset Contract Address' },
    { name: 'Quantity', type: 'uint256', description: 'Quantity to transfer' }
  ],
  assetFromFields: (fields: any) => ({
    id: fields.ID,
    quantity: fields.Quantity,
    address: fields.Address
  }),
  assetToFields: (asset:any) => ({
    ID: asset.id,
    Address: asset.address,
    Quantity: asset.quantity
  }),
  formatter:
    async asset => {
      return {
        thumbnail: 'https://cointelegraph.com/storage/uploads/view/f88e17e41f607dc0aef238230dd40cc6.png',
        title: 'ElementShard #' + asset,
        description: 'Element ERC1155 NFT!',
        url: 'https://www.element.market',
        properties: [],
      };
  },
  functions: {
    transfer: (asset:any) => ({
      type: AbiType.Function,
      name: 'safeTransferFrom',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: '0x1B083283024F8d6799bfebF79A26cdC683aB0677',
      inputs: [
        {kind: FunctionInputKind.Owner, name: '_from', type: 'address'},
        {kind: FunctionInputKind.Replaceable, name: '_to', type: 'address'},
        {kind: FunctionInputKind.Asset, name: '_id', type: 'uint256', value: asset.id},
        {kind: FunctionInputKind.Count, name: '_amount', type: 'uint256',value: asset.quantity},
        {kind: FunctionInputKind.Data, name: '_data', type: 'bytes', value: ''},
      ],
      outputs: [],
    }),
    ownerOf: (asset:any) => ({
      type: AbiType.Function,
      name: 'ownerOf',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: '0x1B083283024F8d6799bfebF79A26cdC683aB0677',
      inputs: [
        {kind: FunctionInputKind.Asset, name: '_tokenId', type: 'uint256', value: asset.id},
      ],
      outputs: [
        {kind: FunctionOutputKind.Owner, name: '_owner', type: 'address'},
      ],
    }),
    assetsOfOwnerByIndex: [],
  },
  events: {
    transfer: [{
      type: AbiType.Event,
      name: 'Transfer',
      target: '0x1B083283024F8d6799bfebF79A26cdC683aB0677',
      anonymous: false,
      inputs: [
        {kind: EventInputKind.Source, indexed: true, name: '_from', type: 'address'},
        {kind: EventInputKind.Destination, indexed: true, name: '_to', type: 'address'},
        {kind: EventInputKind.Asset, indexed: false, name: '_tokenId', type: 'uint256'},
      ],
      assetFromInputs: async (inputs: any) => inputs._tokenId.toString(),
    }],
  },
  hash: a => a,
};
