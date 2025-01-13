import express from 'express';
import auth from '../middleware/auth.middleware.js';
import { createCallback, fetchAllCallback } from '../controllers/callback.controller.js';

const router = express.Router();

// create LATER: Add auth
router.post('/create', createCallback);
// read
router.get('/fetchAll', auth, fetchAllCallback);

export default router;