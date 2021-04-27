import {PartialReadonlyContractAbi} from '../types'
import {AnnotatedFunctionABI} from 'wyvern-js/lib/types'

interface EventParameter {
    name: string;
    type: string;
    indexed: boolean;
}


enum AbiType {
    Function = 'function',
    Constructor = 'constructor',
    Event = 'event',
    Fallback = 'fallback',
}

interface EventAbi {
    type: AbiType.Event;
    name: string;
    inputs: EventParameter[];
    anonymous: boolean;
}

export const getMethod = (abi: PartialReadonlyContractAbi, name: string): AnnotatedFunctionABI => {
    const methodAbi = abi.find(x => x.type == 'function' && x.name == name)
    if (!methodAbi) {
        throw new Error(`ABI ${name} not found`)
    }
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return methodAbi as AnnotatedFunctionABI
}

export const event = (abi: PartialReadonlyContractAbi, name: string): EventAbi => {
    const eventAbi = abi.find(x => x.type == 'event' && x.name == name)
    if (!eventAbi) {
        throw new Error(`ABI ${name} not found`)
    }
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return eventAbi as EventAbi
}

export const DECENTRALAND_AUCTION_CONFIG = {
    '1': '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d',
}
//
export { ERC20 } from './ERC20'
// export { ERC721 } from './abi/ERC721v3'
export { ERC1155 } from './ERC1155'
export { StaticCheckTxOrigin } from './StaticCheckTxOrigin'
export { StaticCheckCheezeWizards } from './StaticCheckCheezeWizards'
export { StaticCheckDecentralandEstates } from './StaticCheckDecentralandEstates'
export {CheezeWizardsBasicTournament} from './CheezeWizardsBasicTournament'
export { DecentralandEstates } from './DecentralandEstates'
// export { CanonicalWETH } from './abi/CanonicalWETH'
// export { WrappedNFT } from './abi/WrappedNFT'
// export { WrappedNFTFactory } from './abi/WrappedNFTFactory'
// export { WrappedNFTLiquidationProxy } from './abi/WrappedNFTLiquidationProxy'
// export { UniswapFactory } from './abi/UniswapFactory'
// export { UniswapExchange } from './abi/UniswapExchange'
