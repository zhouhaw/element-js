// 获得ElementAssetStore tokenid对应的URI
export const getElementAssetURI = async (contract: any, tokenId: string) => {
  const overURI = await contract.elementSharedAsset.methods._getOverrideURI(tokenId).call()
  const URI = await contract.elementSharedAsset.methods.uri(tokenId).call()
  return { overURI, URI }
}
