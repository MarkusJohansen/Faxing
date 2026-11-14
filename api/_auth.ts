import type { VercelRequest } from '@vercel/node'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const cookie = (req: VercelRequest, name: string) =>
  req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1)

export const faxepaveToken = () => createHmac('sha256', process.env.FAXEPAVE_PASSWORD || '').update('faxepave-session').digest('hex')

/** True when the request carries a valid Faxepave session cookie. Constant-time compare. */
export function isFaxepave(req: VercelRequest): boolean {
  const value = cookie(req, 'faxepave_session')
  if (!value || !process.env.FAXEPAVE_PASSWORD) return false
  const actual = Buffer.from(value)
  const expected = Buffer.from(faxepaveToken())
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export const newToken = () => randomBytes(32).toString('base64url')
// Only the hash is stored, so a leaked database row cannot be replayed as a host.
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
// A device can hold two roles in one room (the host is usually drinking too), so the header
// carries up to two comma-separated tokens.
const MAX_TOKENS = 2
export const requestTokens = (req: VercelRequest): string[] => {
  const value = req.headers['x-faxing-token']
  return typeof value === 'string' ? value.split(',').map(token => token.trim()).filter(Boolean).slice(0, MAX_TOKENS) : []
}
