import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from "cookie-parser";
import methodOverride from 'method-override';

const app = express();
const PORT = 8080;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(methodOverride('_method'));

import connection from './database.js';
connection();

const corsOptions = {
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
}
app.use(cors(corsOptions));

import clientRoutes from './routes/client.route.js';
app.use('/client', clientRoutes);
import policyRoutes from './routes/policy.route.js';
app.use('/policy', policyRoutes);
import employeeRoutes from './routes/employee.route.js';
app.use('/employee', employeeRoutes);
import companyRoutes from './routes/company.route.js';
app.use('/company', companyRoutes);
import assignedPolicyRoutes from './routes/assignedPolicy.route.js';
app.use('/assignedPolicy', assignedPolicyRoutes);

app.get('/', (req, res) => {
    res.send('Working!');
});

app.listen(PORT, () => {
    console.log(`Server working on PORT ${PORT}.`);
});