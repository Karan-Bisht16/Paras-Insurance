import { useState } from 'react';

const RegisterModal = ({ loginOrRegister, isOpen, onClose, onSubmit, error }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(password);
    };

    if (!isOpen) return null;

    return (
        <div className='fixed !z-[1000] inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
            <div className='bg-white p-8 pb-10 rounded-lg shadow-xl w-96 sm:w-[400px]'>
                {loginOrRegister === 'Login' ?
                    <h2 className='text-xl text-center font-normal mb-4'>Enter your password to continue</h2>
                    :
                    <h2 className='text-xl text-center font-normal mb-4'>Enter a password to <strong>secure</strong> your account</h2>
                }

                <form onSubmit={handleSubmit}>
                    <div className='mb-6'>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                            Password
                        </label>
                        <input
                            type='password' id='password'
                            value={password} onChange={(event) => setPassword(event.target.value)}
                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                            required
                        />
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
                            {loginOrRegister}
                        </button>
                    </div>
                    <div className='relative'>
                        {error && <span className='absolute -bottom-6 text-sm text-red-600'>{error}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;