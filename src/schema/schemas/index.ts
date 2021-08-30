import { rinkebySchemas } from './rinkeby'
import { privateSchemas } from './private'
import { mainSchemas } from './main'
import { mumbaiSchemas } from './mumbai'
import { polygonSchemas } from './polygon'
import { ElementSchemas } from './common/Element'
import { ERC20Schema } from './common/ERC20'
import { ERC721Schema } from './common/ERC721'
import { ERC1155Schema } from './common/ERC1155'
import { CryptoKittiesSchema } from './common/CryptoKitties'
import { Asset, ElementSchemaName, ExchangeMetadata } from '../../types'
import { AnnotatedFunctionABI } from '../types'

export const schemas = {
  rinkeby: rinkebySchemas,
  private: privateSchemas,
  main: mainSchemas,
  mumbai: mumbaiSchemas,
  polygon: polygonSchemas
}

export function getIsApproveSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI {
  const address = metadata.asset.address
  const tokneId = metadata.asset.id
  const schema = metadata.schema
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let accountApprove = ERC1155Schema.functions.isApprove({ address })
  if (schema === ElementSchemaName.ERC721) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = ERC721Schema.functions.isApprove({ address })
  }

  if (schema === ElementSchemaName.CryptoKitties) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = CryptoKittiesSchema.functions.isApprove({ address, id: tokneId })
  }
  return accountApprove
}

export function getApproveSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI {
  const address = metadata.asset.address
  const tokneId = metadata.asset.id
  const schema = metadata.schema
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let accountApprove = ERC1155Schema.functions.approve({ address })
  if (schema === ElementSchemaName.ERC721) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = ERC721Schema.functions.approve({ address })
  }

  if (schema === ElementSchemaName.CryptoKitties) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = CryptoKittiesSchema.functions.approve({ id: tokneId, address })
  }
  // accountApprove.target = to
  return accountApprove
}

export function getTransferSchemas(asset: Asset): AnnotatedFunctionABI {
  const address = asset.tokenAddress
  const tokneId = asset.tokenId
  const schema = asset.schemaName
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let accountApprove = ERC1155Schema.functions.transfer({ address, id: tokneId })
  if (schema === ElementSchemaName.ERC721) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = ERC721Schema.functions.transfer({ address, id: tokneId })
  }

  if (schema === ElementSchemaName.CryptoKitties) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = CryptoKittiesSchema.functions.transfer({ address, id: tokneId })
  }
  // accountApprove.target = to
  return accountApprove
}

export const common = {
  ElementSchemas,
  ERC20Schema,
  ERC721Schema,
  ERC1155Schema
}
