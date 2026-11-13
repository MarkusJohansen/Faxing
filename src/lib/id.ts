/**
 * A fresh v4 UUID.
 *
 * `crypto.randomUUID()` exists only in a secure context (HTTPS or localhost). Served over
 * plain HTTP from a LAN address, which is how a laptop serves the operator's phone, it is
 * undefined and enlisting the first contestant threw, blanking the screen. That failure is
 * what the fallback catches. `crypto.getRandomValues()` works in every context.
 */
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // RFC 4122 variant
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
