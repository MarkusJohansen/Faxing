import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac, timingSafeEqual } from 'node:crypto'

const secret = () => process.env.FAXEPAVE_PASSWORD || ''
const tokenFor = (value: string) => createHmac('sha256', secret()).update(value).digest('hex')
const validToken = (value: string | undefined) => {
  if (!value || !secret()) return false
  const expected = tokenFor('faxepave-session')
  const actual = Buffer.from(value)
  const target = Buffer.from(expected)
  return actual.length === target.length && timingSafeEqual(actual, target)
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const cookies = req.headers.cookie?.split(';').map(value => value.trim()) ?? []
  const session = cookies.find(value => value.startsWith('faxepave_session='))?.split('=')[1]
  if (req.method === 'POST') {
    if (typeof req.body?.password !== 'string' || !secret() || req.body.password !== secret()) return res.status(401).json({ error: 'Forkert password.' })
    res.setHeader('Set-Cookie', `faxepave_session=${tokenFor('faxepave-session')}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`)
    return res.status(200).json({ authenticated: true })
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'faxepave_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
    return res.status(204).end()
  }
  if (req.method === 'GET') return res.status(200).json({ authenticated: validToken(session) })
  return res.status(405).json({ error: 'Method not allowed' })
}

export { validToken }
