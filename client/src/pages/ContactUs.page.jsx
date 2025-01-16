import { useContext, useState } from 'react';
import { CircularProgress, TextField } from '@mui/material';
import { Phone, Mail, Facebook, Twitter } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// importing api end-points
import { requestCallbackViaWebsite, findClient, login, register } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
import { SnackBarContext } from '../contexts/SnackBar.context';
// importing assets
import imgContactUs from '../assets/img-contactUs.svg';
import RegisterModal from '../components/subcomponents/RegisterModal';

const ContactForm = () => {
    const navigate = useNavigate();
    const { isLoggedIn, setIsLoggedIn, condenseClientInfo, setCondenseClientInfo } = useContext(ClientContext);
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);

    const [regiserModalError, setRegisterModalError] = useState('');
    const [formData, setFormData] = useState({
        firstName: condenseClientInfo?.firstName || '',
        lastName: condenseClientInfo?.lastName || '',
        email: condenseClientInfo?.email || '',
        phone: condenseClientInfo?.phone || '',
        message: ''
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [loginOrRegister, setLoginOrRegister] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            if (isLoggedIn) {
                await requestCallbackViaWebsite(formData);
                navigate('/', { state: { status: 'success', message: 'Callback requested', time: new Date().getTime() } })
            } else {
                try {
                    const { data } = await findClient({ email: formData.email, phone: formData.phone });
                    setEmailOrPhone(data);
                    setLoginOrRegister('Login');
                } catch (error) {
                    const { status } = error;
                    if (status === 404) setLoginOrRegister('Register');
                }
                setShowRegisterModal(true);
            }
        } catch (error) {
            setSnackbarValue({ message: error?.response?.data.message, status: 'error' });
            setSnackbarState(true);
        }
        setSubmitting(false);
    }

    const handleLogin = async (password) => {
        try {
            setRegisterModalError('');

            if (loginOrRegister === 'Login') {
                const { data } = await login({ emailOrPhone, password });
                await setCondenseClientInfo(data);
                await setIsLoggedIn(true);
                await setShowRegisterModal(false);

                setSubmitting(true);
                await requestCallbackViaWebsite(formData);

            } else if (loginOrRegister === 'Register') {
                const { data } = await register({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    password
                });
                await setCondenseClientInfo(data);
                await setIsLoggedIn(true);
                await setShowRegisterModal(false);

                setSubmitting(true);
                await requestCallbackViaWebsite(formData);
            }

            navigate('/', { state: { status: 'success', message: 'Policy added to your account per your interest!', time: new Date().getTime() } })
        } catch (error) {
            setRegisterModalError(error?.response?.data?.message);
        }
        setSubmitting(false);
    }

    return (
        <div className="min-h-[90vh] relative bg-white overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[#111827]"></div>
                <div
                    className="absolute inset-0 bg-white"
                    style={{ clipPath: 'polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)' }}
                />
            </div>

            {submitting &&
                <div className='fixed inset-0 !z-[1000] bg-black/10 flex justify-center items-center'>
                    <CircularProgress />
                </div>
            }
            <div className="relative">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="bg-white rounded-lg shadow-xl p-8 relative">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h1 className='text-3xl text-left font-semibold'>
                                    Get In Touch
                                </h1>
                                <p className="text-gray-600 mb-8">We are here for you! How can we help?</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className='grid grid-cols-2 gap-4'>
                                        <TextField
                                            type="text" label='First Name' name="firstName" placeholder="Enter your first name" required
                                            value={formData.firstName} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                        />
                                        <TextField
                                            type="text" label='Last Name' name="lastName" placeholder="Enter your last name" required
                                            value={formData.lastName} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <TextField
                                            type="email" label='Email' name="email" placeholder="Enter your email" required
                                            value={formData.email} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <TextField
                                            type="tel" label='Phone (excluding +91)' name="phone" placeholder="Enter your phone" required
                                            value={formData.phone} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            name="message" placeholder="Go ahead, we are listening..." rows={4} required
                                            value={formData.message} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#111827] text-white py-3 rounded-lg hover:bg-gray-800 transition duration-300"
                                    >Submit
                                    </button>
                                </form>

                            </div>

                            <div className="relative flex flex-col items-center justify-center">
                                <img
                                    src={imgContactUs}
                                    alt="Contact illustration"
                                    className="w-[60%] mb-8"
                                />
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4 text-gray-600">
                                        <Phone className="text-[#111827]" />
                                        <span>+91-9876543210</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-gray-600">
                                        <Mail className="text-[#111827]" />
                                        <span>support@parasfinancials.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-[#111827] rounded-l-lg p-2 space-y-4">
                        <a href="https://www.facebook.com" target='_blank' className="block text-white hover:text-gray-300">
                            <Facebook />
                        </a>
                        <a href="https://www.twitter.com" target='_blank' className="block text-white hover:text-gray-300">
                            <Twitter />
                        </a>
                    </div>
                </div>
            </div>
            <RegisterModal
                loginOrRegister={loginOrRegister}
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSubmit={handleLogin}
                error={regiserModalError}
            />
        </div>
    )
}

export default ContactForm;