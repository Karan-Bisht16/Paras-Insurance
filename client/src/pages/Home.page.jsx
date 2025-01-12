import { useContext, useEffect } from 'react';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
import { SnackBarContext } from '../contexts/SnackBar.context';
// importing components
import Hero from '../components/subcomponents/Hero';
import Testimonials from '../components/subcomponents/Testimonials';
import ServicesGrid from '../components/subcomponents/ServicesGrid';
import InsuranceServices from '../components/subcomponents/InsuranceServices';
import AdminPanel from '../components/AdminPanel';
import Footer from '../components/Footer';

const Home = () => {
    const { isLoggedIn, condenseClientInfo } = useContext(ClientContext);
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);

    if (
        isLoggedIn &&
        (
            condenseClientInfo.role?.toLowerCase() === 'superadmin' ||
            condenseClientInfo.role?.toLowerCase() === 'admin'
        ) && condenseClientInfo.loginAccess
    ) return <AdminPanel />;

    useEffect(() => {
        if (isLoggedIn && !condenseClientInfo?.loginAccess) {
            setSnackbarState(true);
            setSnackbarValue({ message: 'Login access for admin denied', status: 'error' });
        }
    }, []);

    return (
        <div>
            <div className='flex flex-col'>
                <main className='flex-1 pt-12'>
                    <Hero />
                    <ServicesGrid />
                    <InsuranceServices />
                    <Testimonials />
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default Home;