import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import { tailChase } from 'ldrs';
// importing api end-points
import { createClientPolicy, fetchAllPolicyFields, fetchEveryPolicyId, findClient, login, register } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
// importing components
import FormSection from '../components/formComponents/FormSection';
import RegisterModal from '../components/subcomponents/RegisterModal';
import Footer from '../components/Footer';

const InsuranceForm = () => {
    const location = useLocation();
    const { policyId } = location.state || {};
    const { isLoggedIn, setIsLoggedIn, condenseClientInfo, setCondenseClientInfo } = useContext(ClientContext);

    const navigate = useNavigate();
    const [isLoadingForm, setIsLoadingForm] = useState(true);
    const [currentPolicyId, setCurrentPolicyId] = useState(policyId);
    const [everyPolicyId, setEveryPolicyId] = useState([]);
    const [formFields, setFormFields] = useState({});
    const [formData, setFormData] = useState({});
    const handleFormDataChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevFormData => {
            return { ...prevFormData, [name]: value };
        });
    }

    const [error, setError] = useState('');
    const [regiserModalError, setRegisterModalError] = useState('');
    const handleError = (error) => {
        console.error(error);
        if (error.code === 'ERR_NETWORK') {
            setError('Server is down. Please try again later.');
        } else {
            setError(error.response.data.message);
        }
    }
    const generateDataFormat = (form) => {
        const dataFormat = {};
        form.sections.forEach((section) => {
            section.fields.forEach((field) => {
                if (field.type === 'repeat') {
                    for (let i = 1; i <= field.minCount; i++) {
                        field.children.forEach((child) => {
                            const key = `${i}${child.id}`;
                            if (child.type === 'checkbox') {
                                dataFormat[key] = [];
                            } else if (child.default) {
                                dataFormat[key] = child.default;
                            } else if (child.type === 'radio') {
                                dataFormat[key] = null;
                            } else {
                                dataFormat[key] = '';
                            }
                        });
                    }
                } else if (field.type === 'checkbox') {
                    dataFormat[field.id] = [];
                } else if (field.default) {
                    dataFormat[field.id] = field.default;
                } else if (field.type === 'radio') {
                    dataFormat[field.id] = null;
                } else {
                    dataFormat[field.id] = '';
                }
            });
        });
        return dataFormat;
    }
    const getAllPolicyFields = async () => {
        try {
            const { data } = await fetchAllPolicyFields({ policyId: currentPolicyId });
            setFormFields(data?.form);
            setFormData(generateDataFormat(data?.form));
            setIsLoadingForm(false);
        } catch (error) {
            handleError(error);
        }
    }
    const getEveryPolicyIds = async () => {
        const { data } = await fetchEveryPolicyId();
        if (currentPolicyId === undefined) {
            setCurrentPolicyId(data[0]._id);
        }
        setEveryPolicyId(data);
    }
    useEffect(() => {
        window.scrollTo(0, 0);
        getEveryPolicyIds();
    }, []);

    useEffect(() => {
        if (currentPolicyId !== undefined) {
            getAllPolicyFields();
        }
        setCurrentSection(0);
    }, [currentPolicyId]);

    const handleChangeForm = (event) => {
        const { value } = event.target;
        setCurrentPolicyId(value);
    }

    const [currentSection, setCurrentSection] = useState(0);
    const handleNext = () => {
        if (document.getElementById('insuranceForm').checkValidity()) {
            if (currentSection < formFields.sections.length - 1) {
                setCurrentSection(currentSection + 1);
            }
        } else {
            document.getElementById('insuranceForm').reportValidity();
        }
    };
    const handlePrevious = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    const [defaultFormData, setDefaultFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const handleDefaultFormDataChange = (event) => {
        const { name, value } = event.target;
        setDefaultFormData(prevDefaultFormData => {
            return { ...prevDefaultFormData, [name]: value };
        });
    }

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [loginOrRegister, setLoginOrRegister] = useState('');
    const handleFormSubmit = async (event) => {
        event?.preventDefault();

        try {
            if (isLoggedIn) {
                const copyCondenseClientInfo = structuredClone(condenseClientInfo);
                delete copyCondenseClientInfo._id;
                const { data } = await createClientPolicy({ formData: { ...copyCondenseClientInfo, ...formData }, policyId: currentPolicyId, clientId: condenseClientInfo._id });
                const { clientInfo } = data;
                setCondenseClientInfo(clientInfo);
                navigate('/', { state: { status: 'success', message: 'Policy added to your account per your interest!', time: new Date().getTime() } })
            } else {
                setFormData(prevFormData => { return { ...prevFormData, ...defaultFormData } });
                try {
                    const { data } = await findClient(defaultFormData);
                    setEmailOrPhone(data);
                    setLoginOrRegister('Login');
                } catch (error) {
                    const { status } = error;
                    if (status === 404) setLoginOrRegister('Register');
                }
                setShowRegisterModal(true);
            }
        } catch (error) {
            handleError(error);
        }
    }

    const handleLogin = async (password) => {
        try {
            setRegisterModalError('');

            if (loginOrRegister === 'Login') {
                const { data } = await login({ emailOrPhone, password });
                await setCondenseClientInfo(data);
                await setIsLoggedIn(true);
                await setShowRegisterModal(false);

                const copyCondenseClientInfo = structuredClone(data);
                delete copyCondenseClientInfo._id;
                const result = await createClientPolicy({ formData: { ...copyCondenseClientInfo, ...formData }, policyId: currentPolicyId, clientId: data._id });
                const { clientInfo } = result?.data;

                setCondenseClientInfo(clientInfo);
            } else if (loginOrRegister === 'Register') {
                const { data } = await register({ ...defaultFormData, password });
                await setCondenseClientInfo(data);
                await setIsLoggedIn(true);
                await setShowRegisterModal(false);

                const copyCondenseClientInfo = structuredClone(data);
                delete copyCondenseClientInfo._id;
                const result = await createClientPolicy({ formData: { ...copyCondenseClientInfo, ...formData }, policyId: currentPolicyId, clientId: data._id });
                const { clientInfo } = result?.data;

                setCondenseClientInfo(clientInfo);
            }

            navigate('/', { state: { status: 'success', message: 'Policy added to your account per your interest!', time: new Date().getTime() } })
        } catch (error) {
            setRegisterModalError(error?.response?.data?.message);
        }
    }

    tailChase.register();

    return (
        <div>
            {isLoadingForm ?
                <div className='min-h-screen flex justify-center items-center'>
                    <l-tail-chase size='40' speed='1.75' color='#111827' />
                </div>
                :
                <div className='min-h-[85vh] bg-white flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8'>
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[#111827]"></div>
                        <div
                            className="absolute inset-0 bg-white"
                            style={{ clipPath: 'polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)' }}
                        />
                    </div>
                    <div className='max-w-lg w-full space-y-8 relative z-10'>
                        <div className='flex relative items-center'>
                            <select onChange={handleChangeForm} value={currentPolicyId}
                                className='w-full py-2 px-8 cursor-pointer appearance-none outline-none rounded-md'
                            >
                                {everyPolicyId.map(({ _id, policyName }, index) => (
                                    <option key={index} value={_id}>{policyName}</option>
                                ))}
                            </select>
                            <ExpandMore className='absolute right-7 pointer-events-none' />
                        </div>
                        <form id='insuranceForm' onSubmit={handleFormSubmit} className='bg-white shadow-md rounded-lg pt-6 pb-8 px-8 transition duration-300 ease-in-out hover:shadow-xl'>
                            <h1 className='text-2xl font-bold text-center mb-4'>{formFields.sections[currentSection].heading}</h1>
                            {!isLoggedIn && currentSection === 0 &&
                                <div>
                                    <div>
                                        <label htmlFor='firstName' className='block text-sm font-medium text-gray-700 mb-1'>
                                            First Name<span className='text-red-600'>*</span>
                                        </label>
                                        <input
                                            type='text' id='firstName' name='firstName' value={defaultFormData.firstName} onChange={handleDefaultFormDataChange} placeholder='Enter your first name' required={true}
                                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>
                                            Last Name
                                        </label>
                                        <input
                                            type='text' id='lastName' name='lastName' value={defaultFormData.lastName} onChange={handleDefaultFormDataChange} placeholder='Enter your last name'
                                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                                            Email<span className='text-red-600'>*</span>
                                        </label>
                                        <input
                                            type='email' id='email' name='email' value={defaultFormData.email} onChange={handleDefaultFormDataChange} placeholder='Enter your email' required={true}
                                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
                                            Phone<span className='text-red-600'>*</span>
                                        </label>
                                        <input
                                            type='tel' id='phone' name='phone' value={defaultFormData.phone} onChange={handleDefaultFormDataChange} placeholder='Enter your phone number' required={true} pattern='[0-9]{10}'
                                            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                        />
                                    </div>
                                </div>
                            }
                            <FormSection
                                fields={formFields.sections[currentSection].fields}
                                data={formData} handleFormDataChange={handleFormDataChange}
                            />
                            <div className='flex justify-between mt-6'>
                                {currentSection > 0 && (
                                    <button type='button' onClick={handlePrevious} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'>
                                        Previous
                                    </button>
                                )}
                                {currentSection < formFields.sections.length - 1 && (
                                    <button type='button' onClick={handleNext} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                                        Next
                                    </button>
                                )}
                                {currentSection === formFields.sections.length - 1 && (
                                    <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                                        {formFields.submitButtonLabel}
                                    </button>
                                )}
                            </div>
                            <div className='relative'>
                                {error && <span className='absolute -bottom-6 text-sm text-red-600'>{error}</span>}
                            </div>
                        </form>
                    </div>
                </div>
            }
            <RegisterModal
                loginOrRegister={loginOrRegister}
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSubmit={handleLogin}
                error={regiserModalError}
            />
            <Footer />
        </div>
    );
}

export default InsuranceForm;