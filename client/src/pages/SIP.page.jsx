import { useContext, useEffect, useState } from 'react';
import { Button, Container, ListItemText } from '@mui/material';
import { AccountBalanceWallet, CheckCircleOutline, SupervisorAccount, TrendingDown, Update } from '@mui/icons-material';
import { tailChase } from 'ldrs';
// importing api end-points
import { createSip, fetchProfileData, findClient, login, register, uploadSipMedia } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
import { SnackBarContext } from '../contexts/SnackBar.context';
// importing components
import UpdateProfileForm from '../components/UpdateProfileForm';
import FeatureCard from '../components/subcomponents/FeatureCard';
// importing content
import content from "../content.json";
import RegisterModal from '../components/subcomponents/RegisterModal';

const SIP = () => {
    const features = [
        {
            icon: AccountBalanceWallet,
            title: 'Light on Pocket',
            description: 'Plan the amount you want to invest in SIP Mutual Funds and eliminate the burden of lump-sum investments at a single time.'
        },
        {
            icon: TrendingDown,
            title: 'Lowers Average Cost',
            description: 'Improves your average cost of holding even during troubled time since MF-SIP works in bull as well as bear markets.'
        },
        {
            icon: Update,
            title: 'Disciplined Investing',
            description: 'Eliminate the need to time the market with regular disciplined investments in MF-SIP that benefit you during volatile markets.'
        },
        {
            icon: SupervisorAccount,
            title: 'Expert Management',
            description: 'Experienced professionals manage your funds thereby reducing risks involved in MF-SIP investments.'
        }
    ];
    const benefits = content['benefits'];

    const { isLoggedIn, setIsLoggedIn, condenseClientInfo, setCondenseClientInfo } = useContext(ClientContext);
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);

    const [isLoadingClientData, setIsLoadingClientData] = useState(true);
    const [isUnauthorisedAction, setIsUnauthorisedAction] = useState(false);
    const [isClientDataFound, setIsClientDataFound] = useState(true);
    const [clientData, setClientData] = useState({});

    const getClientData = async () => {
        try {
            const { data } = await fetchProfileData({ clientId: condenseClientInfo._id });
            const { personalDetails, financialDetails, employmentDetails } = data;
            setClientData({ personalDetails, financialDetails, employmentDetails });
            setIsLoadingClientData(false);
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
        }
    }, []);

    const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
    const openUpdateProfile = () => {
        setIsUpdateProfileOpen(true);
    }
    const closeUpdateProfile = () => {
        setIsUpdateProfileOpen(false);
    }

    const [sipFormData, setSipFormData] = useState({});
    const handleAddSip = async (formData, removedFiles, files) => {
        try {
            setSipFormData({ formData, removedFiles, files })
            if (isLoggedIn) {
                const { status, data } = await createSip({ formData, removedFiles, id: condenseClientInfo._id });
                if (status === 200) {
                    await uploadSipMedia({ ...files, sipId: data._id });
                    setSnackbarValue({ message: 'SIP added to your account per your interest!', status: 'success' });
                    setSnackbarState(true);
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

                const result = await createSip({
                    formData: sipFormData?.formData,
                    removedFiles: sipFormData?.removedFiles,
                    id: data?._id
                });
                if (result.status === 200) {
                    await uploadSipMedia({ ...sipFormData?.files, sipId: result?.data?._id });
                }
            } else if (loginOrRegister === 'Register') {
                const { data } = await register({
                    firstName: sipFormData?.formData?.personalDetails?.firstName,
                    lastName: sipFormData?.formData?.personalDetails?.lastName || '',
                    email: sipFormData?.formData?.personalDetails?.contact?.email,
                    phone: sipFormData?.formData?.personalDetails?.contact?.phone,
                    password
                });
                await setCondenseClientInfo(data);
                await setIsLoggedIn(true);
                await setShowRegisterModal(false);

                const result = await createSip({
                    formData: sipFormData?.formData,
                    removedFiles: sipFormData?.removedFiles,
                    id: data?._id
                });
                if (result.status === 200) {
                    await uploadSipMedia({ ...sipFormData?.files, sipId: result?.data?._id });
                }
            }
            setSnackbarValue({ message: 'SIP added to your account per your interest!', status: 'success' });
            setSnackbarState(true);
            closeUpdateProfile();
            return false;
        } catch (error) {
            setRegisterModalError(error?.response?.data?.message);
        }
    }

    tailChase.register();

    return (
        <div>
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
                        <div>
                            <div className='pt-12'>
                                <Container maxWidth="lg">
                                    <div className='flex items-center justify-between mb-4'>
                                        <h1 className='text-3xl text-left font-semibold'>
                                            SIP - Systematic Investment Plan
                                        </h1>
                                        <Button onClick={openUpdateProfile} className='!text-white !bg-gray-900 hover:opacity-95'>INVEST NOW</Button>
                                    </div>
                                    <p>
                                        An intelligent yet simple mode of investing in mutual funds, a Systematic Investment Plan or SIP
                                        does away with the need to time the market. The process involves the customer investing a certain
                                        pre-determined amount in a specific mutual fund scheme on a regular basis - be it weekly, monthly,
                                        quarterly etc. With Paaras Financials securities you can choose to diversify your investments by starting SIP
                                        in Mutual Funds i.e. MFSIP. You can also refer our MFSIP Reckoners to pick and choose the best
                                        funds for your investment.&nbsp;
                                        <span className='font-semibold text-gray-900 cursor-pointer hover:underline' onClick={openUpdateProfile}>Start MF SIP now.</span>
                                    </p>
                                    <div className='w-full flex gap-8 items-center text-gray-800 justify-center mt-12 mb-2'>
                                        <a href='#keyFeaturesAndBenefits' className='text-md'>Key Features & Benefits of SIP</a>
                                        <span>|</span>
                                        <a href='#howSipWorks' className='text-md'>How does SIP works?</a>
                                        <span>|</span>
                                        <a href='#whyStartSip' className='text-md'>Why Should You Start a SIP?</a>
                                    </div>
                                    <div className='w-full border-[1px] border-gray-800'></div>
                                </Container>
                            </div>

                            <div id='keyFeaturesAndBenefits' className='bg-gray-100 pt-8 pb-16'>
                                <Container maxWidth="lg">
                                    <h2 className='text-3xl text-left font-semibold mb-2'>
                                        Key Features & Benefits of SIP
                                    </h2>
                                    <p>
                                        Invest in Mutual Fund Systematic Investment Plans to start small and reap big benefits.
                                    </p>
                                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8'>
                                        {features.map((feature, index) => (
                                            <FeatureCard key={index} {...feature} />
                                        ))}
                                    </div>
                                </Container>
                            </div>

                            <div id='howSipWorks' className='pt-12 pb-16'>
                                <Container maxWidth="lg">
                                    <h2 className='text-3xl text-left font-semibold mb-2'>
                                        How does SIP works?
                                    </h2>
                                    <p>
                                        Trigger date for Mutual Fund Systematic Investment Plan (MF-SIP) is based upon individual logic defined at respective exchanges.
                                    </p>
                                    <div className='mt-2'>
                                        <div className='mt-2'>
                                            <strong>NSE</strong>
                                            <div className='ml-4'>
                                                <p>•&nbsp; First MF-SIP Order: Triggered on MF-SIP Registration day in the system.</p>
                                                <p>•&nbsp; Second MF-SIP order: Triggered either after calculating 30 days or on pre-determined Start Date (whichever is higher).</p>
                                                <p>•&nbsp; Third Order onwards: Subsequent MF-SIP orders are then triggered according to the pre-determined SIP Start Date.</p>
                                            </div>
                                        </div>
                                        <div className='mt-2'>
                                            <strong>BSE</strong>
                                            <div className='ml-4'>
                                                <p>•&nbsp; First MF-SIP Order: Triggered on MF-SIP Registration day in the system.</p>
                                                <p>•&nbsp; Second MF-SIP order: Triggered after a minimum gap of 30 days between first and second order.</p>
                                                <p>•&nbsp; Third Order onwards: Subsequent MF-SIP orders are then triggered according to the pre-determined SIP Start Date.</p>
                                            </div>
                                        </div>
                                    </div>
                                </Container>
                            </div>

                            <div id='whyStartSip' className='bg-gray-100 py-12'>
                                <Container maxWidth="lg">
                                    <h2 className='text-3xl text-left font-semibold mb-4'>
                                        Why Should You Start a SIP?
                                    </h2>
                                    <div>
                                        {benefits.map((benefit, index) => (
                                            <div key={index} className='flex gap-4 items-center ml-4 mb-1'>
                                                <CheckCircleOutline color="primary" />
                                                <ListItemText primary={benefit} />
                                            </div>
                                        ))}
                                    </div>
                                </Container>
                            </div>
                        </div>
            }

            {isUpdateProfileOpen &&
                <UpdateProfileForm
                    clientData={clientData}
                    closeUpdateProfile={closeUpdateProfile}
                    onSubmit={handleAddSip}
                    label='Start a SIP'
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

export default SIP;