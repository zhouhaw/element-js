// To help typescript find the type

import { mainTokens } from './main'
import { rinkebyTokens } from './rinkeby'
import { privateTokens } from './private'
import { mumbaiTokens } from './mumbai'
import { polygonTokens } from './polygon'

export const tokens = {
  rinkeby: rinkebyTokens,
  main: mainTokens,
  private: privateTokens,
  mumbai: mumbaiTokens,
  polygon: polygonTokens
}
