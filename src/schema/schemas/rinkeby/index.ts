import { Schema } from '../../types'; 
import { ERC1155Schema } from '../ERC1155';
import { ERC20Schema } from '../ERC20';
import { ERC721Schema } from '../ERC721';
import { testRinkebyNFTSchema } from './testRinkebyNFT';

export const rinkebySchemas: Array<Schema<any>> = [ 
  testRinkebyNFTSchema,
  ERC20Schema,
  ERC721Schema,
  ERC1155Schema
];
