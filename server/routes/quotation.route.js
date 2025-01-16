import express from 'express';
import auth from '../middleware/auth.middleware.js';
import { createQuotation, sendQuotation } from '../controllers/quotation.controller.js';

const router = express.Router();

// create
router.post('/create', createQuotation);
router.get('/send', auth, sendQuotation);

export default router;