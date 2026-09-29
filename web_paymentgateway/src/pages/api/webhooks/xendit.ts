import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // stub: handle Xendit webhook events
  res.status(200).json({ received: true })
}
