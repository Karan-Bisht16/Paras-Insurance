// import { useContext, useState } from 'react';
import { Phone, Mail, Facebook, Twitter } from '@mui/icons-material';
// importing api end-points
// import { createCallback } from '../api';
// importing contexts
// import { SnackBarContext } from '../contexts/SnackBar.context';
// importing assets
import imgContactUs from '../assets/img-contactUs.svg';

// LATER:  add in client notes and create client is necessary
const ContactForm = () => {
    // const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);

    // const [formData, setFormData] = useState({
    //     name: '',
    //     phone: '',
    //     message: ''
    // });

    // const handleChange = (event) => {
    //     const { name, value } = event.target;
    //     setFormData({ ...formData, [name]: value });
    // }
    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     try {
    //         await createCallback({ formData });
    //         setSnackbarValue({ message: 'Callback requested', status: 'success' });
    //     } catch (error) {
    //         setSnackbarValue({ message: error?.response?.data.message, status: 'error' });
    //     }
    //     setSnackbarState(true);
    // }

    return (
        <div className="min-h-[90vh] relative bg-white overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[#111827]"></div>
                <div
                    className="absolute inset-0 bg-white"
                    style={{ clipPath: 'polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)' }}
                />
            </div>

            <div className="relative">
                <div className="max-w-xl mx-auto px-6 py-12">
                    <div className="bg-white rounded-lg shadow-xl p-8 relative">
                        <div className="grid md:grid-cols-1 gap-12">
                            <div>
                                <h1 className='text-3xl text-left font-semibold'>
                                    Get In Touch
                                </h1>
                                {/* <p className="text-gray-600 mb-8">We are here for you! How can we help?</p> */}
                                <p className="text-gray-600">We are here for you! How can we help?</p>

                                {/* 
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <input
                                            type="text" name="name" placeholder="Enter your name*" required
                                            value={formData.name} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="tel" name="phone" placeholder="Enter your phone*" required
                                            value={formData.phone} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            name="message" placeholder="Go ahead, we are listening...*" rows={4} required
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
                                */}
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
        </div>
    )
}

export default ContactForm;