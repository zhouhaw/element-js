import { rinkebySchemas } from './rinkeby'
import { privateSchemas } from './private'
import { mainSchemas } from './main'
import { mumbaiSchemas } from './mumbai'
import { polygonSchemas } from './polygon'
import { ElementRegistrySchemas } from './common/Element/registry'
import { ElementExchangeSchemas } from './common/Element/exchange'
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

export const common = {
  ElementRegistrySchemas,
  ElementExchangeSchemas,
  ERC20Schema,
  ERC721Schema,
  ERC1155Schema
}

export function getBalanceSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI {
  const address = metadata.asset.address
  const tokneId = metadata.asset.id
  const schema = metadata.schema
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let accountApprove = ERC1155Schema.functions.countOf({ address, id: tokneId })
  if (schema === ElementSchemaName.ERC721) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = ERC721Schema.functions.ownerOf({ address })
  }

  if (schema === ElementSchemaName.CryptoKitties) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountApprove = CryptoKittiesSchema.functions.ownerOf({ address, id: tokneId })
  }
  return accountApprove
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

export function getTransferSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI {
  // const address = asset.tokenAddress
  // const tokneId = asset.tokenId
  // const schema = asset.schemaName

  const address = metadata.asset.address
  let data = '0x'
  let quantity
  if ('quantity' in metadata.asset) {
    quantity = metadata.asset.quantity
  }

  if ('data' in metadata.asset) {
    data = metadata.asset.data || data
  }
  const tokneId = metadata.asset.id
  const schema = metadata.schema

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let accountApprove = ERC1155Schema.functions.transfer({ address, id: tokneId, quantity, data })

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

  if (schema === ElementSchemaName.ERC1155) {
    if (!data) {
      // accountApprove.inputs = accountApprove.inputs.filter((val) => val.name != '_data')
    }
  }
  // accountApprove.target = to
  return accountApprove
}
