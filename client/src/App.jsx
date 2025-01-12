import { useContext } from 'react';
import {
    BrowserRouter as Router,
    Routes, Route,
} from 'react-router-dom';
import { tailChase } from 'ldrs';
// importing pages
import Home from './pages/Home.page';
import AboutUs from './pages/AboutUs.page';
import ContactUs from './pages/ContactUs.page';
import Authentication from './pages/Authentication.page';
import InsuranceForm from './pages/InsuranceForm.page';
import GeneralInsurance from './pages/GeneralInsurance.page';
import SIP from './pages/SIP.page';
import ClientProfile from './pages/ClientProfile.page';
import ClientPolicies from './pages/ClientPolicies.page';
import FileViewer from './pages/FileViewer.page';
import ResetPassword from './pages/ResetPassword.page';
import PageNotFound from './pages/PageNotFound.page';
import CompanyForm from './pages/CompanyForm.page';
// importing utils
import useFetchClient from './utils/useFetchClient';
import GuestRoute from './utils/GuestRoute';
// importing contexts
import { SnackBarContext } from './contexts/SnackBar.context';
import { ConfirmationDialogContext } from './contexts/ConfirmationDialog.context';
// importing components
import Header from './components/Header';
import Footer from './components/Footer';
import SnackBar from './components/subcomponents/SnackBar';
import ConfirmationDialog from './components/subcomponents/ConfirmationDialog';
import ProtectedRoute from './utils/ProtectedRoute';

const App = () => {
    const { loading, condenseClientInfo } = useFetchClient();
    tailChase.register();

    const { snackbarValue, snackbarState, handleSnackbarState } = useContext(SnackBarContext);
    const { dialog, dialogValue, closeDialog, linearProgressBar, handleDialog } = useContext(ConfirmationDialogContext)

    if (loading) {
        return (
            <div className='h-screen flex items-center justify-center'>
                <l-tail-chase size='40' speed='1.75' color='#111827' />
            </div>
        );
    }

    return (
        <Router>
            <Header />
            <Routes>
                <Route
                    path='/' exact
                    element={<Home />}
                />
                <Route
                    path='/aboutUs'
                    element={<div><AboutUs /><Footer /></div>}
                />
                <Route
                    path='/contactUs'
                    element={<div><ContactUs /><Footer /></div>}
                />
                <Route
                    path='/auth'
                    element={<GuestRoute Component={Authentication} user={condenseClientInfo} />}
                />
                <Route
                    path='/insuranceForm'
                    element={<div><InsuranceForm /><Footer /></div>}
                />
                <Route
                    path='/sip'
                    element={<div><SIP /><Footer /></div>}
                />
                <Route
                    path='/generalInsurance'
                    element={<div><GeneralInsurance /><Footer /></div>}
                />
                <Route
                    path='/profile/:id'
                    element={<ProtectedRoute Component={ClientProfile} user={condenseClientInfo} />}
                />
                <Route
                    path='/policies/:id'
                    element={<ProtectedRoute Component={ClientPolicies} user={condenseClientInfo} />}
                />
                <Route
                    path='/uploads/:filePath'
                    element={<ProtectedRoute Component={FileViewer} user={condenseClientInfo} />}
                />
                <Route
                    path='/resetPassword/:resetToken'
                    element={<div><ResetPassword /><Footer /></div>}
                />
                <Route
                    path='/companyForm/:clientId/:clientPolicyId/:companyId'
                    element={<div><CompanyForm /><Footer /></div>}
                />
                <Route
                    path="*"
                    element={<div><PageNotFound /><Footer /></div>} />
            </Routes>
            <SnackBar
                openSnackbar={snackbarState} handleClose={handleSnackbarState} timeOut={5000}
                message={snackbarValue.message} type={snackbarValue.status}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
            />
            <SnackBar
                openSnackbar={snackbarState} handleClose={handleSnackbarState} timeOut={2500}
                message={snackbarValue.message} type={snackbarValue.status}
                vertical='top' horizontal='left'
                sx={{ display: { xs: 'flex', sm: 'none' } }}
            />
            <ConfirmationDialog dialog={dialog} closeDialog={closeDialog} handleDialog={handleDialog} linearProgressBar={linearProgressBar} dialogValue={dialogValue} />
        </Router>
    );
}

export default App;
