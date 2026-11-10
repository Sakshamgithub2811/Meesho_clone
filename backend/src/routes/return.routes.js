import { Router } from 'express';
import { submitReturnRequest } from '../controllers/order.controller.js';

const router = Router();

// Customer Return Submission endpoint: POST /api/v1/returns
router.post('/', submitReturnRequest);
router.post('/request', submitReturnRequest);

export default router;
