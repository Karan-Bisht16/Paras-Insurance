import { useState } from 'react';

const RegisterModal = ({ isOpen, onClose, onSubmit }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(password);
    };

    if (!isOpen) return null;

    return (
        <div className='fixed !z-[1000] inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
            <div className='bg-white p-8 rounded-lg shadow-xl w-96 sm:w-[400px]'>
                <h2 className='text-xl text-center font-normal mb-4'>Set a password to <span className='text=2xl font-bold'>secure</span>  your account</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className='mb-6'>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                            Password
                        </label>
                        <input
                            type='password' id='password'
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                            required
                        />
                    <p className='text-xs text-gray-700'>*If you already have an account, this password will be ignored.</p>
                    </div>
                    <div className='flex items-center justify-between'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;