import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

const app = express();
const PORT = 8080;

// Middleware setup
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
}
app.use(cors(corsOptions));

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(methodOverride('_method'));

import connection from './database.js';
connection();

import clientRoutes from './routes/client.route.js';
app.use('/client', clientRoutes);
import policyRoutes from './routes/policy.route.js';
app.use('/policy', policyRoutes);
import employeeRoutes from './routes/employee.route.js';
app.use('/employee', employeeRoutes);
import companyRoutes from './routes/company.route.js';
app.use('/company', companyRoutes);
import clientPolicyRoutes from './routes/clientPolicy.route.js';
app.use('/clientPolicy', clientPolicyRoutes);
import sipRoutes from './routes/sip.route.js';
app.use('/sip', sipRoutes);
import generalInsuranceRoutes from './routes/generalInsurance.route.js';
app.use('/generalInsurance', generalInsuranceRoutes);
import quotationRoutes from './routes/quotation.route.js';
app.use('/quotation', quotationRoutes);

app.get('/', (req, res) => {
    res.send('Working!');
});

app.listen(PORT, () => {
    console.log(`Server working on PORT ${PORT}.`);
});