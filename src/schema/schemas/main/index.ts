import { Schema } from '../../types'
import { ContractRoleSchema } from '../common/ContractRole/index'
import { ERC1155Schema } from '../common/ERC1155'
import { ERC20Schema } from '../common/ERC20'
import { ERC721Schema } from '../common/ERC721'

import { CryptoKittiesSchema } from './CryptoKitties/index'
import { CryptoPunksSchema } from './CryptoPunks/index'
import { EnjinItemSchema } from './EnjinItem'
import { ENSNameSchema } from './ENSName/index'
import { ENSShortNameAuctionSchema } from './ENSShortNameAuction/index'
import { OwnableContractSchema } from './OwnableContract/index'

export const mainSchemas: Array<Schema<any>> = [
  CryptoKittiesSchema,
  CryptoPunksSchema,
  ENSNameSchema,
  ENSShortNameAuctionSchema,
  OwnableContractSchema,
  ERC20Schema,
  ERC721Schema,
  ERC1155Schema,
  EnjinItemSchema,
  ContractRoleSchema
]
