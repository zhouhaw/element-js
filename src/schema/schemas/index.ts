import { rinkebySchemas } from './rinkeby'
import { privateSchemas } from './private'
import { mainSchemas } from './main'
import { mumbaiSchemas } from './mumbai'
import { polygonSchemas } from './polygon'
import { ElementSchemas } from './common/Element'
import { ERC20Schema } from './common/ERC20'
import { ERC721Schema } from './common/ERC721'
import { ERC1155Schema } from './common/ERC1155'

export const schemas = {
  rinkeby: rinkebySchemas,
  private: privateSchemas,
  main: mainSchemas,
  mumbai: mumbaiSchemas,
  polygon: polygonSchemas
}

export const common = {
  ElementSchemas,
  ERC20Schema,
  ERC721Schema,
  ERC1155Schema
}
