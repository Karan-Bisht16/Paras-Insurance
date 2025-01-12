import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tailChase } from 'ldrs';
// importing api end-points
import { createGeneralInsurance, fetchProfileData, findClient, login, register, uploadGeneralInsuranceMedia } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
import { SnackBarContext } from '../contexts/SnackBar.context';
// importing components
import UpdateProfileForm from '../components/UpdateProfileForm';
import RegisterModal from '../components/subcomponents/RegisterModal';

const GeneralInsurance = () => {
    const navigate = useNavigate();

    const { isLoggedIn, setIsLoggedIn, condenseClientInfo, setCondenseClientInfo } = useContext(ClientContext);
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);

    const [isLoadingClientData, setIsLoadingClientData] = useState(true);
    const [isUnauthorisedAction, setIsUnauthorisedAction] = useState(false);
    const [isClientDataFound, setIsClientDataFound] = useState(true);
    const [clientData, setClientData] = useState({});

    const getClientData = async () => {
        try {
            const { data } = await fetchProfileData({ clientId: condenseClientInfo._id });
            setClientData(data);
            setIsLoadingClientData(false);
            setIsUpdateProfileOpen(true);
        } catch (error) {
            const { status } = error;
            const errorMessage = error?.response?.data?.message;
            if (status === 400 && errorMessage === 'Unauthorised action.') {
                setIsLoadingClientData(false);
                setIsUnauthorisedAction(true);
            } else if (status === 404 && errorMessage === 'No client found.') {
                setIsLoadingClientData(false);
                setIsClientDataFound(false);
            } else {
                console.error(error);
            }
        }
    }
    useEffect(() => {
        window.scrollTo(0, 0);
        if (isLoggedIn) {
            getClientData();
        } else {
            setClientData({
                personalDetails: {
                    firstName: "",
                    lastName: "",
                    gender: "",
                    contact: {
                        email: "",
                        phone: ""
                    },
                    address: {
                        street: "",
                        city: "",
                        state: "",
                        pincode: "",
                        country: ""
                    },
                    nominee: {
                        name: "",
                        dob: "",
                        relationship: "",
                        phone: ""
                    },
                },
                financialDetails: {
                    accountDetails: {
                        accountNo: "",
                        ifscCode: "",
                        bankName: "",
                        cancelledChequeURL: ""
                    },
                    panCardNo: "",
                    panCardURL: "",
                    aadhaarNo: "",
                    aadhaarURL: ""
                },
                employmentDetails: {
                    companyName: "",
                    designation: "",
                    annualIncome: ""
                },
            });
            setIsLoadingClientData(false);
            setIsUpdateProfileOpen(true);
        }

        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
    const closeUpdateProfile = () => { }

    const [generalInsuranceFormData, setGeneralInsuranceFormData] = useState({});
    const handleGeneralInsurance = async (formData, removedFiles, files, currentPolicyName) => {
        try {
            formData.policyType = currentPolicyName;
            setGeneralInsuranceFormData({ formData, removedFiles, files });
            if (isLoggedIn) {
                const { status, data } = await createGeneralInsurance({ formData, removedFiles, id: condenseClientInfo._id });
                if (status === 200) {
                    await uploadGeneralInsuranceMedia({ ...files, generalInsuranceId: data._id });
                    navigate('/', { state: { status: 'success', message: 'General Insurance added to your account per your interest!', time: new Date().getTime() } })
                    return false;
                }
            } else {
                try {
                    const { data } = await findClient({ email: formData?.personalDetails?.contact?.email, phone: formData?.personalDetails?.contact?.phone });
                    setEmailOrPhone(data);
                    setLoginOrRegister('Login');
                } catch (error) {
                    const { status } = error;
                    if (status === 404) setLoginOrRegister('Register');
                }
                setShowRegisterModal(true);
                return true;
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message;
            return errorMessage;
        }
    }

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [loginOrRegister, setLoginOrRegister] = useState('');
    const [regiserModalError, setRegisterModalError] = useState('');
    const handleLogin = async (password) => {
        try {
            setRegisterModalError('');

            if (loginOrRegister === 'Login') {
                const { data } = await login({ emailOrPhone, password });
                await setCondenseClientInfo(data);
                await setIsLoggedIn(true);
                await setShowRegisterModal(false);

                const result = await createGeneralInsurance({
                    formData: generalInsuranceFormData?.formData,
                    removedFiles: generalInsuranceFormData?.removedFiles,
                    id: data?._id
                });
                if (result.status === 200) {
                    await uploadGeneralInsuranceMedia({ ...generalInsuranceFormData?.files, generalInsuranceId: result?.data?._id });
                }
            } else if (loginOrRegister === 'Register') {
                const { data } = await register({
                    firstName: generalInsuranceFormData?.formData?.personalDetails?.firstName,
                    lastName: generalInsuranceFormData?.formData?.personalDetails?.lastName || '',
                    email: generalInsuranceFormData?.formData?.personalDetails?.contact?.email,
                    phone: generalInsuranceFormData?.formData?.personalDetails?.contact?.phone,
                    password
                });
                await setCondenseClientInfo(data);
                await setIsLoggedIn(true);
                await setShowRegisterModal(false);

                const result = await createGeneralInsurance({
                    formData: generalInsuranceFormData?.formData,
                    removedFiles: generalInsuranceFormData?.removedFiles,
                    id: data?._id
                });
                if (result.status === 200) {
                    await uploadGeneralInsuranceMedia({ ...generalInsuranceFormData?.files, generalInsuranceId: result?.data?._id });
                }
            }
            navigate('/', { state: { status: 'success', message: 'General Insurance added to your account per your interest!', time: new Date().getTime() } })
            return false;
        } catch (error) {
            setRegisterModalError(error?.response?.data?.message);
        }
    }

    tailChase.register();

    return (
        <div className='!overflow-y-hidden'>
            {isLoadingClientData ?
                <div className='min-h-screen flex justify-center items-center'>
                    <l-tail-chase size='40' speed='1.75' color='#111827' />
                </div>
                :
                isUnauthorisedAction ?
                    <div className="flex flex-col justify-center items-center my-16">
                        <lord-icon
                            src='https://cdn.lordicon.com/dicvhxpz.json'
                            trigger='morph'
                            stroke='bold' state='morph-cross'
                            colors='primary:#111827,secondary:#111827'
                            style={{ width: '250px', height: '250px' }}
                        />
                        <p className='text-3xl font-semibold text-gray-900'>Unauthorised action performed</p>
                    </div>
                    :
                    !isClientDataFound ?
                        <div className="flex flex-col justify-center items-center my-16">
                            <lord-icon
                                src="https://cdn.lordicon.com/hwjcdycb.json"
                                trigger="hover"
                                colors='primary:#111827,secondary:#111827'
                                style={{ width: '250px', height: '250px' }}
                            />
                            <p className='text-3xl font-semibold text-gray-900'>No client found</p>
                        </div>
                        :
                        <div className='h-[100vh] relative bg-white overflow-hidden'>
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-[#111827]"></div>
                                <div
                                    className="absolute inset-0 bg-white"
                                    style={{ clipPath: 'polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)' }}
                                />
                            </div>
                        </div>
            }
            {isUpdateProfileOpen &&
                <UpdateProfileForm
                    clientData={clientData}
                    closeUpdateProfile={closeUpdateProfile}
                    isNotClosable={true}
                    onSubmit={handleGeneralInsurance}
                    label='General Insurance'
                    includePolicyType={true}
                    excludeEmployementDetails={true}
                />
            }
            <RegisterModal
                loginOrRegister={loginOrRegister}
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSubmit={handleLogin}
                error={regiserModalError}
            />
        </div>
    );
}

export default GeneralInsurance;