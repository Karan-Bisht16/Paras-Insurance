import {
    BrowserRouter as Router,
    Routes, Route
} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home.page';
import Authentication from './pages/Authentication.page';
import InsuranceForm from './pages/InsuranceForm.page';
import ClientProfile from './pages/ClientProfile.page';
import ResetPassword from './pages/ResetPassword.page';
import { tailChase } from 'ldrs';
import useFetchClient from './utils/useFetchClient';

const App = () => {
    const { loading } = useFetchClient();
    tailChase.register();

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
                <Route exact path='/' element={<Home />} />
                <Route path='/auth' element={<Authentication />} />
                <Route path='/insurance-form/:id' element={<InsuranceForm />}></Route>
                <Route path='/profile/:id' element={<ClientProfile />}></Route>
                <Route path='/resetPassword/:resetToken' element={<ResetPassword />}></Route>
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
