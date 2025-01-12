import { useState } from 'react';
import { LinearProgress } from '@mui/material';

const ForgotPasswordModal = ({ isOpen, onClose, modalText, showLinearProgress, modalFieldIsDisabled, setModalFieldIsDisabled, onSubmit }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setModalFieldIsDisabled(true);
        onSubmit(email);
    };

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="fixed bg-white p-8 pb-16 rounded-lg shadow-xl w-96 sm:w-[400px] z-10"
            >
                <div className='mb-4'>
                    <h2 className="text-xl text-center font-normal mb-1">Enter your registered email</h2>
                    <LinearProgress sx={{ opacity: showLinearProgress ? '100%' : '0%' }} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email" id="email" required disabled={modalFieldIsDisabled}
                            value={email} onChange={(event) => setEmail(event.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit" disabled={modalFieldIsDisabled}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Send reset password link
                    </button>
                    <div className='relative'>
                        {modalText && <span className='absolute -bottom-10 text-xs text-gray-700'>{modalText}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;