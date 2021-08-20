import Web3 from 'web3'

import { Schema } from '../../types'

export interface ENSName {
  nodeHash: string
  nameHash: string
  name: string
}

export const namehash = (name: string) => {
  let node: string | null = '0000000000000000000000000000000000000000000000000000000000000000'
  if (name !== '') {
    const labels = name.split('.')
    for (let i = labels.length - 1; i >= 0; i--) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { substr } = Web3.utils.sha3(labels[i])
      node = Web3.utils.sha3(node + substr(2))
    }
  }
  return '0x' + node
}

export const nodehash = (name: string) => {
  const label = name.split('.')[0]
  if (label) {
    return Web3.utils.sha3(label)
  } else {
    return ''
  }
}

export const ENSNameBaseSchema: Required<
  Pick<Schema<ENSName>, 'fields' | 'assetFromFields' | 'checkAsset' | 'hash'>
> = {
  fields: [
    { name: 'Name', type: 'string', description: 'ENS Name' },
    {
      name: 'NodeHash',
      type: 'bytes32',
      description: 'ENS Node Hash',
      readOnly: true
    },
    {
      name: 'NameHash',
      type: 'bytes32',
      description: 'ENS Name Hash',
      readOnly: true
    }
  ],
  assetFromFields: (fields: any): any => ({
    id: fields.ID,
    address: fields.Address,
    name: fields.Name,
    nodeHash: nodehash(fields.Name),
    nameHash: namehash(fields.Name)
  }),
  checkAsset: (asset: ENSName) => {
    return asset.name ? namehash(asset.name) === asset.nameHash && nodehash(asset.name) === asset.nodeHash : true
  },
  hash: ({ nodeHash }) => nodeHash
}
