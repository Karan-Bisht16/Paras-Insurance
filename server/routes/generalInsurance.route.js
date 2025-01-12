import express from 'express';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import { assignGeneralInsurance, createGeneralInsurance, fetchAllAssignedGeneralInsurances, fetchAllUnassignedGeneralInsurances, fetchGeneralInsurances, uploadAssignGeneralInsuranceMedia, uploadGeneralInsuranceMedia } from '../controllers/generalInsurance.controller.js';

const router = express.Router();

// create
router.post('/create', auth, createGeneralInsurance);
router.post('/uploadMedia', auth, upload.any("files"), uploadGeneralInsuranceMedia);
// read
router.get('/fetchGeneralInsurances', auth, fetchGeneralInsurances);
router.get('/fetchAllUnassigned', auth, fetchAllUnassignedGeneralInsurances);
router.get('/fetchAllAssigned', auth, fetchAllAssignedGeneralInsurances);
// update
router.post('/assignGeneralInsurance', auth, assignGeneralInsurance);
router.post('/uploadAssignGeneralInsuranceMedia', upload.any('files'), uploadAssignGeneralInsuranceMedia);

export default router;