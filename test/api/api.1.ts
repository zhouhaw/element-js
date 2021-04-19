import {assert} from 'chai'
// import * as Web3 from 'web3'

// let web = new Web3("http://127.0.0.1:8545");
// console.log(Web3)

import {
    suite,
    test,
    skip,
} from 'mocha-typescript'

import {
    mainApi,
    rinkebyApi
} from '../constants'
//
//
suite('api', () => {

    test('API has correct base url', () => {
        assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
        assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
    })


})
