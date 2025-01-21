import { useState, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// importing api end-points
import { resetPassword } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';

const ResetPassword = () => {
    const { resetToken } = useParams();

    const navigate = useNavigate();

    const { setIsLoggedIn, setCondenseClientInfo } = useContext(ClientContext);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordField = useRef(null);
    const confirmPasswordField = useRef(null);

    const [authData, setAuthData] = useState({
        password: '',
        confirmPassword: '',
    });
    const handleAuthDataChange = (event) => {
        const { name, value } = event.target;
        setAuthData(prevAuthData => {
            return { ...prevAuthData, [name]: value };
        });
    }

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const handleError = (error) => {
        if (error.code === 'ERR_NETWORK') {
            setError('Server is down. Please try again later.');
        } else {
            setError(error?.response?.data?.message);
        }
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (authData.confirmPassword.trim() === '') {
            confirmPasswordField.current.focus();
            return false;
        } else if (authData.confirmPassword.trim() !== authData.password.trim()) {
            confirmPasswordField.current.focus();
            setError('Password do not match.')
            return false;
        }
        try {
            const { data } = await resetPassword({ resetToken, newPassword: authData.password });
            setSuccess(true);
            setCondenseClientInfo(data);
            setIsLoggedIn(true);
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (error) {
            handleError(error);
        }
    }

    return (
        <div className='bg-gray-100 flex flex-col justify-center py-4 sm:px-6 lg:px-8'>
            <h1 className='font-bold text-3xl text-center'>Reset your password</h1>
            <div className='mt-4 sm:mx-auto sm:w-full sm:max-w-md'>
                <div className='bg-white py-8 px-4 mb-16 lg:mb-60 shadow sm:rounded-lg sm:px-10'>
                    {success ? (
                        <div className='text-green-600 text-bold text-center'>
                            Your password has been reset successfully!<br />
                            Navigating to home page
                        </div>
                    ) : (
                        <form className='space-y-6' onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                    Create Password*
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
                                    Confirm Password*
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
                                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            >
                                Reset password
                            </button>
                            <div className='relative'>
                                {error && <span className='absolute -bottom-4 text-sm text-red-600'>{error}</span>}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;