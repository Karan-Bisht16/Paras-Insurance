import express from 'express';
import auth from '../middleware/auth.middleware.js';
import { addEmployee, createEmployee, removeEmployeeAccess, fetchAllEmployees, editEmployee } from '../controllers/employee.controller.js';

const router = express.Router();

// create
router.post('/create', auth, createEmployee);
router.post('/add', auth, addEmployee);
// read
router.get('/fetchAll', auth, fetchAllEmployees);
// update
router.put('/edit', auth, editEmployee);
router.delete('/removeAccess', auth, removeEmployeeAccess);

export default router;