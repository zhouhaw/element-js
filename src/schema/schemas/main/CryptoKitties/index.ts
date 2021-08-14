import fetch from 'isomorphic-unfetch'

import { EventInputKind, FunctionInputKind, FunctionOutputKind, Schema, StateMutability, AbiType } from '../../../types'

export interface CryptoKittiesType {
  id: string
  address: string
}

const assetAddress = '0x06012c8cf97bead5deae237070f9587f8e7a266d'
export const CryptoKittiesSchema: Schema<CryptoKittiesType> = {
  address: assetAddress,
  version: 1,
  deploymentBlock: 4605167,
  name: 'CryptoKitties',
  description: 'The virtual kitties that started the craze.',
  thumbnail: 'https://www.cryptokitties.co/images/kitty-eth.svg',
  website: 'https://cryptokitties.co',
  fields: [
    { name: 'ID', type: 'uint256', description: 'CryptoKitty number.' },
    { name: 'Address', type: 'address', description: 'Asset Contract Address' }
  ],
  assetFromFields: (fields: any) => ({ id: fields.ID, address: fields.Address }),
  assetToFields: (asset) => ({
    ID: asset.id,
    Address: assetAddress
  }),
  formatter: async (asset) => {
    const response: any = await fetch(`https://api.cryptokitties.co/kitties/${asset.id}`).catch((err) => {
      if (err.response && (err.response.status === 404 || err.response.status === 400)) {
        return null
      } else {
        throw err
      }
    })
    if (response === null) {
      return {
        thumbnail: 'https://www.cryptokitties.co/images/kitty-eth.svg',
        title: 'CryptoKitty #' + asset.id,
        description: '',
        url: 'https://www.cryptokitties.co/kitty/' + asset.id,
        properties: []
      }
    } else {
      const data = response.data
      const attrs = data.enhanced_cattributes || data.cattributes || []
      return {
        thumbnail: data.image_url_cdn,
        title: 'CryptoKitty #' + asset.id,
        description: data.bio,
        url: 'https://www.cryptokitties.co/kitty/' + asset.id,
        properties: attrs.map((c: any) => ({
          key: c.type,
          kind: 'string',
          value: c.description
        }))
      }
    }
  },
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: 'transferFrom',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: assetAddress,
      inputs: [
        { kind: FunctionInputKind.Owner, name: '_from', type: 'address' },
        { kind: FunctionInputKind.Replaceable, name: '_to', type: 'address' },
        { kind: FunctionInputKind.Asset, name: '_tokenId', type: 'uint256', value: asset.id }
      ],
      outputs: []
    }),
    ownerOf: (asset) => ({
      type: AbiType.Function,
      name: 'ownerOf',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: assetAddress,
      inputs: [{ kind: FunctionInputKind.Asset, name: 'tokenId', type: 'uint256', value: asset.id }],
      outputs: [{ kind: FunctionOutputKind.Owner, name: 'owner', type: 'address' }]
    }),
    isApprove: (asset) => ({
      type: AbiType.Function,
      name: 'kittyIndexToApproved',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: assetAddress,
      inputs: [{ kind: FunctionInputKind.Asset, name: '_tokenId', type: 'uint256', value: asset.id }],
      outputs: [{ kind: FunctionOutputKind.Owner, name: 'owner', type: 'address' }]
    }),
    approve: (asset, to) => ({
      type: AbiType.Function,
      name: 'approve',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: assetAddress,
      inputs: [
        { kind: FunctionInputKind.Owner, name: 'to', type: 'address', value: to },
        { kind: FunctionInputKind.Asset, name: 'tokenId', type: 'uint256', value: asset.id }
      ],
      outputs: []
    }),
    ownerTransfer:(asset,to)=>({
      type: AbiType.Function,
      name: 'transfer',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: assetAddress,
      inputs: [
        { kind: FunctionInputKind.Owner, name: 'to', type: 'address', value: to },
        { kind: FunctionInputKind.Asset, name: 'tokenId', type: 'uint256', value: asset.id }
      ],
      outputs: []
    }),
    assetsOfOwnerByIndex: []
  },
  events: {
    transfer: [
      {
        type: AbiType.Event,
        name: 'Transfer',
        target: assetAddress,
        anonymous: false,
        inputs: [
          { kind: EventInputKind.Source, indexed: false, name: 'from', type: 'address' },
          { kind: EventInputKind.Destination, indexed: false, name: 'to', type: 'address' },
          { kind: EventInputKind.Asset, indexed: false, name: 'tokenId', type: 'uint256' }
        ],
        assetFromInputs: async (inputs: any) => inputs.tokenId
      }
    ]
  },
  hash: (a) => a
}
