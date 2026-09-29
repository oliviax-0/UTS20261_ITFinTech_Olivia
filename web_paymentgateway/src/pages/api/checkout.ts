import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // stub: create a checkout session or return cart details
  res.status(200).json({ ok: true })
}
