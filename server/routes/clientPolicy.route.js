import express from 'express';
import { createClientPolicy, fecthAllUnassignedPolicies, fecthAllAssignedPolicies, countAllAssignedPolicies, addAvailableCompanyPolicies, fetchClientPolicy, assignClientPolicy, uploadClientPolicyMedia } from '../controllers/clientPolicy.controller.js';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';

const router = express.Router();

// create
router.post('/createClientPolicy', createClientPolicy);
// read
router.get('/fetchClientPolicy', fetchClientPolicy);
router.get('/fecthAllUnassigned', auth, fecthAllUnassignedPolicies);
router.get('/fecthAllAssigned', auth, fecthAllAssignedPolicies);
router.get('/countAllAssigned', auth, countAllAssignedPolicies);
// update
router.post('/assignClientPolicy', auth, assignClientPolicy);
router.post('/uploadClientPolicyMedia', upload.any('files'), uploadClientPolicyMedia);
router.post('/addAvailableCompany', auth, addAvailableCompanyPolicies);

export default router;