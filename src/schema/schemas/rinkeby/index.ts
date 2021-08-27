import { Schema } from '../../types'
import { ERC1155Schema } from '../common/ERC1155'
import { ERC20Schema } from '../common/ERC20'
import { ERC721Schema } from '../common/ERC721'
import { testRinkebyNFTSchema } from './testRinkebyNFT'
import { CryptoKittiesSchema } from './CryptoKitties'

export const rinkebySchemas: Array<Schema<any>> = [
  testRinkebyNFTSchema,
  CryptoKittiesSchema,
  ERC20Schema,
  ERC721Schema,
  ERC1155Schema
]
