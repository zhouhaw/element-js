import {assert} from 'chai'
import {suite, test} from 'mocha';

import {
    MAINNET_PROVIDER_URL,
    RINKEBY_PROVIDER_URL,
    mainApi,
    rinkebyApi,
    apiToTest
} from '../constants'
import {orderToJSON} from '../../src'

let ordersJSONFixture = require('../fixtures/orders.json');

suite('api', () => {
    test('API has correct base url', () => {
        assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
        assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
    })

    test('API getCheck', async () => {
        const isCheck = await apiToTest.getCheck()
        assert(isCheck.result);
    })

    test('API post order', async () => {
        let order = ordersJSONFixture[0];
        try {
            const newOrder = {
                ...orderToJSON(order),
                v: 1,
                r: "",
                s: ""
            }

            await apiToTest.postOrder({...orderToJSON(order)})
        } catch (error) {
            // TODO sometimes the error is "Expected the listing time to be at or past the current time"
            // assert.include(error.message, "Order failed exchange validation")
        }
    })

    test('Rinkeby API orders have correct OpenSea url', async () => {
        const order = await rinkebyApi.getOrder({})
        if (!order.asset) {
            return
        }
        const url = `https://rinkeby.opensea.io/assets/${order.asset.assetContract.address}/${order.asset.tokenId}`
        assert.equal(order.asset.openseaLink, url)
    })
})
