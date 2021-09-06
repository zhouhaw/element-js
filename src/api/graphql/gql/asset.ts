import { gql } from 'graphql-request'

export const exploreAssetsList = gql`
  query exploreAssetsList(
    $before: String
    $after: String
    $first: Int
    $last: Int
    $querystring: String
    $categorySlugs: [String!]
    $collectionSlugs: [String!]
    $sortBy: SearchSortBy
    $sortAscending: Boolean
    $toggles: [SearchToggle!]
    $ownerAddress: Address
    $creatorAddress: Address
    $blockChains: [BlockChainInput!]
    $paymentTokens: [String!]
    $priceFilter: PriceFilterInput
  ) {
    search(
      before: $before
      after: $after
      first: $first
      last: $last
      search: {
        querystring: $querystring
        categorySlugs: $categorySlugs
        collectionSlugs: $collectionSlugs
        sortBy: $sortBy
        sortAscending: $sortAscending
        toggles: $toggles
        ownerAddress: $ownerAddress
        creatorAddress: $creatorAddress
        blockChains: $blockChains
        paymentTokens: $paymentTokens
        priceFilter: $priceFilter
      }
    ) {
      totalCount
      edges {
        cursor
        node {
          asset {
            chain
            chainId
            contractAddress
            tokenId
            name
            imagePreviewUrl
            imageThumbnailUrl
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
            collection {
              name
              isVerified
            }
            isFavorite
            favoriteQuantity
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

export const assetsDetail = gql`
  query assetsDetail($blockChain: BlockChainInput!, $contractAddress: Address!, $tokenId: String!) {
    asset(identity: { blockChain: $blockChain, contractAddress: $contractAddress, tokenId: $tokenId }) {
      id
      chain
      chainId
      contractAddress
      tokenId
      tokenType
      creatorAddress
      collectionId
      name
      description
      imageAttrs
      animationAttrs
      imageUrl
      imagePreviewUrl
      imageThumbnailUrl
      animationUrl
      externalUrls
      unlockContentEnable
      ownedQuantity
      ownershipCount
      quantity
      properties {
        key
        value
        traitCount
        traitTotal
        traitSupply
      }
      levels {
        key
        value
        max
      }
      stats {
        key
        value
        max
      }
      supply
      tradeSummary {
        lastSale {
          lastSaleDate
          lastSalePriceBase
          lastSalePriceUSD
          lastSalePrice
          lastSaleToken
          lastSaleQuantity
          lastSaleTokenContract {
            id
            name
            address
            icon
            decimal
            symbol
          }
        }
        bestBid {
          bestBidPrice
          bestBidToken
          bestBidPriceBase
          bestBidPriceUSD
          bestBidPriceCNY
          bestBidCreatedDate
          bestBidOrderString
          bestBidOrderQuantity
          bestBidTokenContract {
            id
            name
            address
            icon
            decimal
            symbol
          }
        }
        bestAsk {
          bestAskSaleKind
          bestAskPrice
          bestAskToken
          bestAskPriceBase
          bestAskPriceUSD
          bestAskListingDate
          bestAskExpirationDate
          bestAskPriceCNY
          bestAskCreatedDate
          bestAskOrderString
          bestAskOrderType
          bestAskOrderQuantity
          bestAskTokenContract {
            id
            name
            address
            icon
            decimal
            symbol
          }
        }
      }
      assetOwners(first: 1) {
        edges {
          cursor
          node {
            chain
            chainId
            owner
            balance
            account {
              identity {
                address
                blockChain {
                  chain
                  chainId
                }
              }
              user {
                id
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
          }
        }
      }
      creator {
        identity {
          address
          blockChain {
            chain
            chainId
          }
        }
        user {
          id
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
      paymentTokens {
        id
        name
        address
        icon
        symbol
        chain
        chainId
        decimal
      }
      collection {
        id
        name
        slug
        description
        bannerImageUrl
        featuredImageUrl
        externalUrl
        weiboUrl
        twitterUrl
        instagramUrl
        mediumUrl
        telegramUrl
        discordUrl
        facebookUrl
        paymentTokens {
          id
          name
          icon
          symbol
          chain
          chainId
          decimal
          address
        }
        isVerified
        royalty
      }
      uri
      isFavorite
      favoriteQuantity
    }
  }
`
