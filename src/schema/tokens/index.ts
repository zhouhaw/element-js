// To help typescript find the type 

import { mainTokens } from './main'
import { rinkebyTokens } from './rinkeby'
import { privateTokens } from './private'

export const tokens = {
  rinkeby: rinkebyTokens,
  main: mainTokens,
  private: privateTokens
}
