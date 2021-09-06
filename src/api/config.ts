//
// export const CHECK_ETH_BALANCE = false

import { Network } from '../../index'

export const CHAIN_ID: { [key: string]: number } = {
  [Network.Private]: 100,
  [Network.Main]: 1,
  [Network.Rinkeby]: 4,
  [Network.Polygon]: 137,
  [Network.Mumbai]: 80001
}

export const CHAIN: { [key: string]: string } = {
  [Network.Private]: 'eth',
  [Network.Main]: 'eth',
  [Network.Rinkeby]: 'eth',
  [Network.Polygon]: 'polygon',
  [Network.Mumbai]: 'polygon'
}

export const API_BASE_URL: {
  [key: string]: {
    api: string
    key: string
    secret: string
  }
} = {
  [Network.Main]: {
    api: 'https://element-api.eossql.com',
    key: 'zQbYj7RhC1VHIBdWU63ki5AJKXloamDT',
    secret: 'UqCMpfGn3VyQEdsjLkzJv9tNlgbKFD7O'
  },
  [Network.Rinkeby]: {
    api: 'https://element-api-test.eossql.com',
    key: 'ysBokbA3gKUzt61DmeHWjTFYZ07CGPQL',
    secret: 'a2PAJXRBChdpGvoyKEz3lLS5Yf1bM0NO'
  },
  [Network.Mumbai]: {
    api: 'https://element-api-test.eossql.com',
    key: 'ysBokbA3gKUzt61DmeHWjTFYZ07CGPQL',
    secret: 'a2PAJXRBChdpGvoyKEz3lLS5Yf1bM0NO'
  },
  [Network.Polygon]: {
    api: 'https://element-api.eossql.com',
    key: 'zQbYj7RhC1VHIBdWU63ki5AJKXloamDT',
    secret: 'UqCMpfGn3VyQEdsjLkzJv9tNlgbKFD7O'
  }
}
