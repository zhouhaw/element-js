import fetch from 'isomorphic-unfetch'

import { EventInputKind, FunctionInputKind, FunctionOutputKind, Schema, StateMutability, AbiType } from '../../../types'

// export type CryptoKittiesType = string

export interface CryptoKittiesType {
  id: string,
  address:string
}

export const CryptoKittiesSchema: Schema<CryptoKittiesType> = {
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
  assetFromFields: (fields: any) => ({id:fields.ID,address:fields.Address}),
  assetToFields: (asset) => ({ ID: asset.id }),
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
      name: 'transfer',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address, //'0x16baf0de678e52367adc69fd067e5edd1d33e3bf'
      inputs: [
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
      target:asset.address, //'0x16baf0de678e52367adc69fd067e5edd1d33e3bf'
      inputs: [{ kind: FunctionInputKind.Asset, name: '_tokenId', type: 'uint256', value: asset.id }],
      outputs: [{ kind: FunctionOutputKind.Owner, name: 'owner', type: 'address' }]
    }),
    assetsOfOwnerByIndex: []
  },
  events: {
    transfer: [
      {
        type: AbiType.Event,
        name: 'Transfer',
        target: '0x16baf0de678e52367adc69fd067e5edd1d33e3bf',
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
