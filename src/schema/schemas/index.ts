import { rinkebySchemas } from './rinkeby'
import { privateSchemas } from './private'
import { mainSchemas } from './main'
import { mumbaiSchemas } from './mumbai'
import { polygonSchemas } from './polygon'

export const schemas = {
  rinkeby: rinkebySchemas,
  private: privateSchemas,
  main: mainSchemas,
  mumbai: mumbaiSchemas,
  polygon: polygonSchemas
}
