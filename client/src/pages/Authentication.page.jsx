import { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// importing api end-points
import { register, login, forgotPassword } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
// importing components
import ForgotPasswordModal from '../components/subcomponents/ForgotPasswordModal';
import Footer from '../components/Footer';

const Authentication = () => {
    const navigate = useNavigate();
    const { setIsLoggedIn, setCondenseClientInfo } = useContext(ClientContext);

    const firstNameField = useRef(null);
    const lastNameField = useRef(null);
    const emailField = useRef(null);
    const phoneField = useRef(null);
    const passwordField = useRef(null);
    const confirmPasswordField = useRef(null);
    const emailOrPhoneField = useRef(null);

    const [isRegister, setIsRegister] = useState(false);
    const handleIsRegister = () => {
        setIsRegister(prevIsRegister => {
            return !prevIsRegister;
        });
    }

    const [authData, setAuthData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        emailOrPhone: '',
    });
    const handleAuthDataChange = (event) => {
        const { name, value } = event.target;
        setAuthData(prevAuthData => {
            return { ...prevAuthData, [name]: value };
        });
    }

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(false);
    const handleError = (error) => {
        console.error(error);
        if (error.code === 'ERR_NETWORK') {
            setError('Server is down. Please try again later.');
        } else {
            setError(error?.response?.data?.message);
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isRegister) {
            if (authData.firstName.trim() === '') {
                firstNameField.current.focus();
                return false;
            }
            if (authData.email.trim() === '') {
                emailField.current.focus();
                return false;
            }
            if (authData.phone.trim() === '') {
                phoneField.current.focus();
                return false;
            }
            if (authData.confirmPassword.trim() === '') {
                confirmPasswordField.current.focus();
                return false;
            } else if (authData.confirmPassword.trim() !== authData.password.trim()) {
                confirmPasswordField.current.focus();
                setError('Password do not match.')
                return false;
            }
        } else {
            if (authData.emailOrPhone.trim() === '') {
                emailOrPhoneField.current.focus();
                return false;
            }
        }
        if (authData.password.trim() === '') {
            passwordField.current.focus();
            return false;
        }
        if (isRegister) {
            try {
                const { data } = await register(authData);
                setCondenseClientInfo(data);
                setIsLoggedIn(true);
                navigate('/', { state: { status: 'success', message: 'Registered successfully!', time: new Date().getTime() } });
            } catch (error) {
                handleError(error);
            }
        } else {
            try {
                const { data } = await login(authData);
                setCondenseClientInfo(data);
                setIsLoggedIn(true);
                navigate('/', { state: { status: 'success', message: 'Login successful!', time: new Date().getTime() } });
            } catch (error) {
                handleError(error);
            }
        }
    }

    const [showForgotPasswordModal, setForgotPasswordModal] = useState(false);
    const [modalFieldIsDisabled, setModalFieldIsDisabled] = useState(false);
    const [modalText, setModalText] = useState('');
    const [showLinearProgress, setShowLinearProgress] = useState(false);
    const handleForgotPassword = async (email) => {
        try {
            setModalText('');
            setShowLinearProgress(true);
            const { data } = await forgotPassword({ email });
            setShowLinearProgress(false);
            setModalText(data?.message);
            setModalFieldIsDisabled(false);
        } catch (error) {
            handleError(error);
        }
    }

    return (
        <div>
            <div className={`bg-gray-100 flex flex-col justify-center py-4 sm:px-6 lg:px-8 ${!isRegister && 'md:py-24'}`}>
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[#111827]"></div>
                    <div
                        className="absolute inset-0 bg-white"
                        style={{ clipPath: 'polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)' }}
                    />
                </div>
                <div className='relative'>
                    <h1 className='font-bold text-3xl text-center text-white'>{isRegister ? 'Register' : 'Login'}</h1>
                    <div className='mt-4 sm:mx-auto sm:w-full sm:max-w-md bg-white rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                        <div className='bg-white pt-8 pb-12 px-4 shadow sm:rounded-lg sm:px-10'>
                            {isRegister && (
                                <form className='space-y-4' onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor='firstName' className='block text-sm font-medium text-gray-700'>
                                            First Name<span className='text-red-600'>*</span>
                                        </label>
                                        <div className='mt-1'>
                                            <input
                                                id='firstName' name='firstName' type='text' ref={firstNameField} placeholder='Enter your first name' required
                                                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                value={authData.firstName} onChange={handleAuthDataChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor='lastName' className='block text-sm font-medium text-gray-700'>
                                            Last Name
                                        </label>
                                        <div className='mt-1'>
                                            <input
                                                id='lastName' name='lastName' type='text' placeholder='Enter your last name' ref={lastNameField}
                                                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                value={authData.lastName} onChange={handleAuthDataChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                                            Email<span className='text-red-600'>*</span>
                                        </label>
                                        <div className='mt-1'>
                                            <input
                                                id='email' name='email' type='email' ref={emailField} placeholder='Enter your email' required
                                                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                value={authData.email} onChange={handleAuthDataChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                                            Phone number<span className='text-red-600'>*</span>
                                        </label>
                                        <div className='mt-1'>
                                            <input
                                                id='phone' name='phone' type='tel' pattern='[0-9]{10}' placeholder='Enter your phone number' ref={phoneField} required
                                                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                value={authData.phone} onChange={handleAuthDataChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                            Create Password<span className='text-red-600'>*</span>
                                        </label>
                                        <div className='mt-1 relative'>
                                            <input
                                                id='password' name='password' type={showPassword ? 'text' : 'password'} ref={passwordField} placeholder='Create a strong password' required
                                                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                value={authData.password} onChange={handleAuthDataChange}
                                            />
                                            <button
                                                type='button' onClick={() => setShowPassword(!showPassword)}
                                                className='absolute inset-y-0 right-0 pr-3 flex items-center'
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff className='h-5 w-5 text-gray-400' />
                                                ) : (
                                                    <Visibility className='h-5 w-5 text-gray-400' />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                                            Confirm Password<span className='text-red-600'>*</span>
                                        </label>
                                        <div className='mt-1 relative'>
                                            <input
                                                id='confirmPassword' name='confirmPassword' type={showConfirmPassword ? 'text' : 'password'} ref={confirmPasswordField} placeholder='Retype your password' required
                                                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                value={authData.confirmPassword} onChange={handleAuthDataChange}
                                            />
                                            <button
                                                type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className='absolute inset-y-0 right-0 pr-3 flex items-center'
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff className='h-5 w-5 text-gray-400' />
                                                ) : (
                                                    <Visibility className='h-5 w-5 text-gray-400' />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type='submit'
                                        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    >
                                        Register
                                    </button>
                                </form>
                            )}
                            {!isRegister &&
                                <div>
                                    <form className='space-y-6' onSubmit={handleSubmit}>
                                        <div>
                                            <label htmlFor='emailOrPhone' className='block text-sm font-medium text-gray-700'>
                                                Email or Phone number
                                            </label>
                                            <div className='mt-1'>
                                                <input
                                                    id='emailOrPhone' name='emailOrPhone' type='text' ref={emailOrPhoneField} placeholder='Enter either your email or phone number' required
                                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                    value={authData.emailOrPhone} onChange={handleAuthDataChange}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                                Password
                                            </label>
                                            <div className='mt-1 relative'>
                                                <input
                                                    id='password' name='password' type={showPassword ? 'text' : 'password'} ref={passwordField} placeholder='Enter your password' required
                                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                                    value={authData.password} onChange={handleAuthDataChange}
                                                />
                                                <button
                                                    type='button' onClick={() => setShowPassword(!showPassword)}
                                                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOff className='h-5 w-5 text-gray-400' />
                                                    ) : (
                                                        <Visibility className='h-5 w-5 text-gray-400' />
                                                    )}
                                                </button>
                                            </div>
                                            <span
                                                onClick={() => setForgotPasswordModal(true)}
                                                className='text-sm font-semibold mt-1 text-blue-600 hover:underline cursor-pointer'
                                            >Forgot password?</span>
                                        </div>
                                        <button
                                            type='submit'
                                            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        >
                                            Login
                                        </button>
                                    </form>
                                    <div className='mt-6'>
                                        <div className='relative'>
                                            <div className='absolute inset-0 flex items-center'>
                                                <div className='w-full border-t border-gray-300'></div>
                                            </div>
                                            <div className='relative flex justify-center text-sm'>
                                                <span className='px-2 bg-white text-gray-500'>Or</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            <p className='text-center mt-2'>
                                {isRegister ?
                                    <div>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={handleIsRegister}> Login</span></div>
                                    : <div>Don't have an account? <span className='text-blue-600 cursor-pointer' onClick={handleIsRegister}> Register</span></div>
                                }
                            </p>
                            <div className='relative'>
                                {error && <span className='absolute -bottom-8 text-sm text-red-600'>{error}</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <ForgotPasswordModal
                    isOpen={showForgotPasswordModal}
                    onClose={() => setForgotPasswordModal(false)}
                    modalText={modalText}
                    showLinearProgress={showLinearProgress}
                    modalFieldIsDisabled={modalFieldIsDisabled}
                    setModalFieldIsDisabled={setModalFieldIsDisabled}
                    onSubmit={handleForgotPassword}
                ></ForgotPasswordModal>
            </div>
            <Footer />
        </div>
    );
}

export default Authentication;
