import type { VercelRequest, VercelResponse } from '@vercel/node'
import { faxepaveToken, isFaxepave } from './_auth'

const secret = () => process.env.FAXEPAVE_PASSWORD || ''

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    if (typeof req.body?.password !== 'string' || !secret() || req.body.password !== secret()) return res.status(401).json({ error: 'Forkert password.' })
    res.setHeader('Set-Cookie', `faxepave_session=${faxepaveToken()}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`)
    return res.status(200).json({ authenticated: true })
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'faxepave_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
    return res.status(204).end()
  }
  if (req.method === 'GET') return res.status(200).json({ authenticated: isFaxepave(req) })
  return res.status(405).json({ error: 'Method not allowed' })
}
