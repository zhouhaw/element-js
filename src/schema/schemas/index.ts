// To help typescript find the type
// import { Schema } from '../../types';
 
import { rinkebySchemas } from './rinkeby';
import { privateSchemas } from './private';
import { mainSchemas } from './main';

export const schemas = {
  rinkeby: rinkebySchemas, 
  private: privateSchemas,
  main: mainSchemas,
};
