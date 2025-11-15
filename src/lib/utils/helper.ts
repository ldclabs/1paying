import { Principal } from '@dfinity/principal'
import { isAddress } from '@solana/kit'

const locale = new Intl.Locale(globalThis?.navigator.language || 'en')

export function pruneCanister(canisterId: string, long?: boolean) {
  if (long ?? globalThis.innerWidth >= 640) return canisterId
  return canisterId.slice(0, 7) + '...' + canisterId.slice(-5)
}

export function pruneAddress(id: string, long?: boolean): string {
  if (long ?? globalThis.innerWidth >= 640) {
    return id.length > 27 ? id.slice(0, 13) + '...' + id.slice(-11) : id
  }
  return id.length > 15 ? id.slice(0, 7) + '...' + id.slice(-5) : id
}

export function pruneText(text: string, max: number): string {
  const _max = max >= 13 ? max : 13
  if (text.length <= _max) return text
  return text.slice(0, _max - 8) + '...' + text.slice(-5)
}

export function validateAddress(chain: string, address: string): boolean {
  switch (chain) {
    case 'ICP':
      try {
        Principal.fromText(address)
        return true
      } catch (_) {}
      return false
    case 'SOL':
      return isAddress(address)
    default:
      return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
}

const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
  dateStyle: 'medium',
  timeStyle: 'short'
})

export function formatDateTime(timestamp: number): string {
  try {
    return dateTimeFormatter.format(timestamp)
  } catch (error) {
    return new Date(timestamp).toLocaleString()
  }
}

export function formatTimeout(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return '—'
  }
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function formatTimeAgo(timestamp: number) {
  const delta = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.max(Math.round(delta / (60 * 1000)), 1)
  if (minutes > 60 * 24 * 2) {
    const days = Math.round(minutes / (60 * 24))
    return `${days} days ago`
  } else if (minutes > 60) {
    const hours = Math.round(minutes / 60)
    return `${hours} hours ago`
  }
  return `${minutes} minutes ago`
}

export function toUint8Array(
  data: Uint8Array | number[],
  property?: string
): Uint8Array {
  if (!(data instanceof Uint8Array)) {
    data = new Uint8Array(data)
  }

  if (property) {
    Object.defineProperty(data, 'property', {
      enumerable: false,
      value: undefined
    })
  }
  return data
}
