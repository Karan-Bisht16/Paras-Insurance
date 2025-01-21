import express from 'express';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import { createClientPolicy, fetchAllUnassignedPolicies, fetchAllAssignedPolicies, countAllAssignedPolicies, fetchClientPolicyForCompany, assignClientPolicy, uploadAssignClientPolicyMedia, sendCombinedQuotation, exportCsv, importCsv, uploadExisitingClientPolicy, uploadExisitingClientPolicyMedia, uploadClientPolicyMedia, updateClientPolicy, uploadUpdateClientPolicyMedia, fetchClientPolicy, updateExisitingClientPolicy, uploadUpdateExistingClientPolicyMedia } from '../controllers/clientPolicy.controller.js';

const router = express.Router();

// create
router.post('/createClientPolicy', createClientPolicy);
router.post('/uploadClientPolicyMedia', upload.any('files'), uploadClientPolicyMedia);
router.post('/uploadExisitingClientPolicyMedia', auth, upload.any('file'), uploadExisitingClientPolicyMedia);
router.post('/uploadExisitingClientPolicy', auth, uploadExisitingClientPolicy);
// read
router.get('/fetchClientPolicy', fetchClientPolicy);
router.get('/fetchClientPolicyForCompany', fetchClientPolicyForCompany);
router.get('/fetchAllUnassigned', auth, fetchAllUnassignedPolicies);
router.get('/fetchAllAssigned', auth, fetchAllAssignedPolicies);
router.get('/countAllAssigned', auth, countAllAssignedPolicies);
// update
router.post('/updateClientPolicy', auth, updateClientPolicy);
router.post('/uploadUpdateClientPolicyMedia', auth, upload.any('files'), uploadUpdateClientPolicyMedia);
router.post('/updateExisitingClientPolicy', auth, updateExisitingClientPolicy);
router.post('/uploadUpdateExistingClientPolicyMedia', auth, upload.any('files'), uploadUpdateExistingClientPolicyMedia);
router.post('/assignClientPolicy', auth, assignClientPolicy);
router.post('/uploadAssignClientPolicyMedia', upload.any('files'), uploadAssignClientPolicyMedia);
// misc
router.put('/sendCombinedQuotation', auth, sendCombinedQuotation);
router.get('/exportCsv', auth, exportCsv);
router.post('/importCsv', auth, upload.single('file'), importCsv);
// router.post('/addAvailableCompany', auth, addAvailableCompanyPolicies);

export default router;