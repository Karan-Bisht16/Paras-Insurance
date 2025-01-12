import express from 'express';
import auth from '../middleware/auth.middleware.js';
import { addCompanyPolicy, createCompany, deleteCompany, removeCompanyPolicy, fetchAllCompanies, editCompany } from '../controllers/company.controller.js';

const router = express.Router();

// create
router.post('/create', auth, createCompany);
// read
router.get('/fetchAll', auth, fetchAllCompanies);
// update
router.put('/edit', auth, editCompany);
// delete
router.delete('/delete', auth, deleteCompany);
// misc
router.post('/addPolicy', auth, addCompanyPolicy);
router.delete('/removePolicy', auth, removeCompanyPolicy);

export default router;