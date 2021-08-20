"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementError = exports.ErrorCodes = void 0;
// 10 开头 用户+合约 授权错误
// 11 开头 资产，各类资产余额，授权，ID错误
// 12 开头 订单约束条件
// 20 开头 合约执行错误 rpc 网络请求错
// 40 开头 是MetaMask的拒绝 异常
exports.ErrorCodes = [
    {
        code: 'INVALID_ARGUMENT',
        message: 'Smart contract error'
    },
    {
        code: '1000',
        message: 'SDK'
    },
    {
        code: '1001',
        message: 'Account no registration'
    },
    {
        code: '1002',
        message: 'Account authProxy without authorization exchangeProxyRegistryAddr '
    },
    {
        code: '1101',
        message: 'TokenTransferProxy allowAmount equel 0 '
    },
    {
        code: '1102',
        message: 'ERC1155TransferProxy NFTs isApprovedForAll is false '
    },
    {
        code: '1103',
        message: '{{assetType}} balanceOf equal 0 !'
    },
    {
        code: '1104',
        message: 'Insufficient {{assetType}} balance'
        // messageCN：'{{assetType}}币种余额为0'
    },
    {
        code: '1106',
        message: 'ERC721TransferProxy NFTs getApproved is false '
    },
    {
        code: '1108',
        message: '{{schemaName}} NFTs isApproved is false {{tokenId}} '
    },
    {
        code: '1201',
        message: 'Order: buy.basePrice to be greater than sell.basePrice!'
    },
    {
        code: '1202',
        message: 'Order can match false'
    },
    {
        code: '1203',
        message: 'Order validateOrder false '
    },
    {
        code: '1204',
        message: 'Buy order payment Token cannot be ETH '
    },
    {
        code: '1205',
        message: 'Order parameter false '
    },
    {
        code: '1206',
        message: '{{assetType}} asset does not support '
    },
    {
        code: '1207',
        message: '{{orderSide}} Order cancelledOrFinalized false '
    },
    {
        code: '1208',
        message: 'CheckDataToCall {{part}} error '
    },
    {
        code: '1209',
        message: '{{assetType}} asset address {{address}} not support  '
    },
    {
        code: '1211',
        message: 'The ElementShareAsset Order URI does not match the URI returned in Order Version '
    },
    {
        code: '1212',
        message: 'The ElementShareAsset TokenID cannot be traded for the time being '
    },
    {
        code: '2001',
        message: '{{funcName}} RPC send request error {{stack}}'
    },
    {
        code: '2002',
        message: '{{funcName}} RPC call request error {{stack}}'
    },
    {
        code: '2003',
        message: '{{funcName}} RPC web3 request error {{stack}}'
    },
    {
        code: '4001',
        message: 'MetaMask Error '
    }
];
function render(template, context) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return template.replace(/\{\{(.*?)\}\}/g, function (match, key) { return context[key.trim()]; });
}
// const template = "{{name   }}很厉name害，才{{age   }}岁";
// const context = { name: "jawil", age: "15" };
// console.log(render(template, context));
var ElementError = /** @class */ (function (_super) {
    __extends(ElementError, _super);
    function ElementError(err) {
        var _this = this;
        var _err = exports.ErrorCodes.find(function (val) { return val.code == err.code; });
        if (Number(_err === null || _err === void 0 ? void 0 : _err.code) > 1000) {
            var message = err.context && (_err === null || _err === void 0 ? void 0 : _err.message) ? render(_err.message, err.context) : _err === null || _err === void 0 ? void 0 : _err.message;
            _this = _super.call(this, message) || this;
        }
        else {
            if ((_err === null || _err === void 0 ? void 0 : _err.code) == '1000') {
                var message = err.message || '';
                _this = _super.call(this, message + '-' + (_err === null || _err === void 0 ? void 0 : _err.message)) || this;
            }
            else {
                _this = _super.call(this, 'undefined code!') || this;
            }
        }
        _this.code = err.code.toString();
        _this.data = err.data;
        _this.context = err.context;
        return _this;
    }
    return ElementError;
}(Error));
exports.ElementError = ElementError;
//
// try {
//   throw new ElementError({ code: '2003', context: { funcName: 'funcName', stack: 'funcName stack' } })
// } catch (e) {
//   console.log('ll', e)
// }
