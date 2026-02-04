import { VercelRequest, VercelResponse } from '@vercel/node';
import { searchHandler } from '../src/handler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await searchHandler(req, res);
}
