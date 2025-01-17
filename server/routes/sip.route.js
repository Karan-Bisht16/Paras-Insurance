import express from 'express';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import { assignSip, createSip, fetchAllAssignedSips, fetchAllUnassignedSips, fetchSips, updateSip, uploadAssignSipMedia, uploadSipMedia } from '../controllers/sip.controller.js';

const router = express.Router();

// create
router.post('/create', auth, createSip);
router.post('/uploadMedia', auth, upload.any("files"), uploadSipMedia);
// read
router.get('/fetchSips', auth, fetchSips);
router.get('/fetchAllUnassigned', auth, fetchAllUnassignedSips);
router.get('/fetchAllAssigned', auth, fetchAllAssignedSips);
// update
router.post('/updateSip', auth, updateSip);
router.post('/assignSip', auth, assignSip);
router.post('/uploadAssignSipMedia', upload.any('files'), uploadAssignSipMedia);

export default router;