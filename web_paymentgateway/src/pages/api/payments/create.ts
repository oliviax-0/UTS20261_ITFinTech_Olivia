import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // stub: create payment via Xendit
  res.status(200).json({ id: 'pay_123', status: 'created' })
}
