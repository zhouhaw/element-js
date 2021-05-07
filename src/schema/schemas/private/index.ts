import { Schema } from '../../types';
import { ERC1155Schema } from '../ERC1155';
import { ERC20Schema } from '../ERC20';
import { ERC721Schema } from '../ERC721';

import { privateElementShardSchema } from './elementShard';
// import { ERC20Schema } from '@utils/orders/schema/schemas/ERC20'

export const privateSchemas: Array<Schema<any>> = [
  privateElementShardSchema,
  ERC20Schema,
  ERC721Schema,
  ERC1155Schema
];
