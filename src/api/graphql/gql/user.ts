import { gql } from 'graphql-request'

export const getNonce = gql`
  query GetNonce($address: Address!, $chain: Chain!, $chainId: ChainId!) {
    user(identity: { address: $address, blockChain: { chain: $chain, chainId: $chainId } }) {
      nonce
    }
  }
`

export const loginAuth = gql`
  mutation LoginAuth($identity: IdentityInput!, $message: String!, $signature: String!) {
    auth {
      login(input: { identity: $identity, message: $message, signature: $signature }) {
        token
      }
    }
  }
`

export const userAssetsList = gql`
  query UserAssetsList($before: String, $after: String, $first: Int, $last: Int, $identity: IdentityInput!) {
    accountAssets(before: $before, after: $after, first: $first, last: $last, identity: $identity) {
      totalCount
      edges {
        cursor
        node {
          asset {
            chain
            chainId
            contractAddress
            tokenId
            imagePreviewUrl
            imageThumbnailUrl
            name
            animationUrl
            tradeSummary {
              lastSale {
                lastSalePrice
                lastSaleToken
                lastSaleQuantity
                lastSaleTokenContract {
                  id
                  name
                  address
                  icon
                  accuracy
                }
              }
              bestBid {
                bestBidToken
                bestBidPrice
                bestBidOrderQuantity
                bestBidTokenContract {
                  id
                  name
                  address
                  icon
                  accuracy
                }
              }
              bestAsk {
                bestAskToken
                bestAskPrice
                bestAskExpirationDate
                bestAskOrderType
                bestAskOrderQuantity
                bestAskTokenContract {
                  id
                  name
                  address
                  icon
                  accuracy
                }
              }
            }
            ownedQuantity
            collection {
              name
              isVerified
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasPreviousPage
        hasNextPage
        startCursor
      }
    }
  }
`

export const accountOrders = gql`
  query AccountOrders(
    $before: String
    $after: String
    $first: Int
    $last: Int
    $identity: IdentityInput!
    $orderType: Int
  ) {
    accountOrders(
      before: $before
      after: $after
      first: $first
      last: $last
      identity: $identity
      orderType: $orderType
    ) {
      totalCount
      edges {
        cursor
        node {
          id
          chain
          chainId
          createdDate
          closingDate
          expirationTime
          listingTime
          orderHash
          metadata {
            asset {
              id
              address
              quantity
              data
            }
            schema
          }
          exchange
          maker
          taker
          makerRelayerFee
          takerRelayerFee
          makerProtocolFee
          takerProtocolFee
          feeRecipient
          feeMethod
          side
          saleKind
          target
          howToCall
          dataToCall
          replacementPattern
          staticTarget
          staticExtradata
          paymentToken
          basePrice
          englishAuctionReservePrice
          extra
          quantity
          salt
          v
          r
          s
          approvedOnChain
          cancelled
          finalized
          markedInvalid
          priceBase
          priceCNY
          priceUSD
          price
          makerAccount {
            identity {
              address
              blockChain {
                chain
                chainId
              }
            }
            user {
              address
              chain
              chainId
              profileImageUrl
              userName
            }
            info {
              profileImageUrl
              userName
            }
          }
          takerAccount {
            identity {
              address
              blockChain {
                chain
                chainId
              }
            }
            user {
              address
              chain
              chainId
              profileImageUrl
              userName
            }
            info {
              profileImageUrl
              userName
            }
          }
          asset {
            imagePreviewUrl
            name
            chain
            chainId
            contractAddress
            tokenId
          }
          paymentTokenContract {
            accuracy
            icon
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`
