import express from 'express';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import { createQuotation } from '../controllers/quotation.controller.js';

const router = express.Router();

// create
router.post('/create', createQuotation);
// router.post('/uploadMedia', auth, upload.any("files"), uploadSipMedia);
// read
// router.get('/fetchAllData', auth, fetchAllUnassignedSipsData);
// delete ?

export default router;