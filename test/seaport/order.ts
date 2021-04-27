let {assert} = require('chai')

const Web3 = require("web3");
import {suite, test} from 'mocha';

import {
    RINKEBY_API_KEY,
    MAINNET_PROVIDER_URL,
    RINKEBY_PROVIDER_URL,
    mainApi,
    rinkebyApi,
    apiToTest
} from '../constants'
import {orderToJSON} from '../../src'
import {Network} from '../../src/types'

let ordersJSONFixture = require('../fixtures/orders.json');

import {OpenSeaPort} from '../../src/index'

// let web3Provider = new Web3.providers.HttpProvider(provider);
const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL)
const rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL)

const rinkebyClient = new OpenSeaPort(rinkebyProvider, {
    networkName: Network.Rinkeby,
    apiKey: RINKEBY_API_KEY
})

suite('api', () => {
    test('API has correct base url', () => {
        assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
        assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
    })

})
