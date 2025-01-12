import express from 'express';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import { createClientPolicy, fetchAllUnassignedPolicies, fetchAllAssignedPolicies, countAllAssignedPolicies, fetchClientPolicy, assignClientPolicy, uploadAssignClientPolicyMedia, sendCombinedQuotation, exportCsv, importCsv } from '../controllers/clientPolicy.controller.js';

const router = express.Router();

// create
router.post('/createClientPolicy', createClientPolicy);
// read
router.get('/fetchClientPolicy', fetchClientPolicy);
router.get('/fetchAllUnassigned', auth, fetchAllUnassignedPolicies);
router.get('/fetchAllAssigned', auth, fetchAllAssignedPolicies);
router.get('/countAllAssigned', auth, countAllAssignedPolicies);
// update
router.post('/assignClientPolicy', auth, assignClientPolicy);
router.post('/uploadAssignClientPolicyMedia', upload.any('files'), uploadAssignClientPolicyMedia);
router.put('/sendCombinedQuotation', auth, sendCombinedQuotation);
router.get('/exportCsv', auth, exportCsv);
router.post('/importCsv', auth, upload.single('file'), importCsv);
// router.post('/addAvailableCompany', auth, addAvailableCompanyPolicies);

export default router;