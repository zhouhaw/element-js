
import { BigNumber, } from './constants'


export function toBaseUnitAmount(amount: BigNumber, decimals: number): BigNumber {
  const unit = new BigNumber(10).pow(decimals)
  return amount.times(unit).integerValue()
}

export function makeBigNumber(arg: number | string | BigNumber): BigNumber {
  // Zero sometimes returned as 0x from contracts
  if (arg === '0x') {
    arg = 0
  }
  // fix "new BigNumber() number type has more than 15 significant digits"
  arg = arg.toString()
  return new BigNumber(arg)
}

