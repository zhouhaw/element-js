// To help typescript find the type
// import { Schema } from '../../types';
 
import { rinkebySchemas } from './rinkeby';
import { privateSchemas } from './private';

export const schemas = {
  rinkeby: rinkebySchemas, 
  private: privateSchemas,
};
