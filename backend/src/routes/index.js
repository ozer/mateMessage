import { Router } from 'express';
import auth from './auth';

const router = new Router();

router.get('/check', (_,res) => {
  return res.json('OK').status(200);
});

router.use('/auth', auth);

export default router;