const origin = globalThis.location?.origin || ''

export const APP_VERSION = '0.1.0'
export const IS_LOCAL = false // origin.includes('localhost') || origin.includes('127.0.0.1')
export const ENV = IS_LOCAL ? 'local' : 'ic'

export const INTERNET_IDENTITY_CANISTER_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai' // ic & local
export const SIGNIN_CANISTER_ID = 'ny3i7-miaaa-aaaap-an5mq-cai'
export const TXS_ENDPOINT = 'https://txs.1pay.ing'
export const ANDA_X402_CANISTER_ID = 'ogkpr-lyaaa-aaaap-an5fq-cai'
