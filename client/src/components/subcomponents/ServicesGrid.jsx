import { useContext, useEffect, useState } from 'react';
import { Add, AddModerator } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tailChase } from 'ldrs';
// importing api end-points
import { fetchAllPolicies } from '../../api';
// importing contexts
import { ClientContext } from '../../contexts/Client.context';
// importing components
import PolicyCard from './PolicyCard';

const ServicesGrid = () => {
    const navigate = useNavigate();
    const { isLoggedIn, condenseClientInfo } = useContext(ClientContext);
    const [services, setServices] = useState([]);

    const getAllPolicies = async () => {
        const { data } = await fetchAllPolicies();
        setServices(data);
    }

    useEffect(() => {
        getAllPolicies();
    }, []);

    const handleNavigateInsuranceForm = (policyId) => {
        navigate('/insuranceForm', { state: { policyId: policyId } });
    }
    const handleNavigateSip = () => {
        navigate('/sip');
    }
    const handleNavigateGeneralInsurance = () => {
        navigate('/generalInsurance');
    }

    tailChase.register();

    return (
        <section id='productsAndServices' className='py-8 md:py-12 px-8 bg-gray-100'>
            <div className='px-4 md:px-6'>
                <h2 className='text-3xl font-bold text-center mb-8'>Our Products & Services</h2>
                <div className='flex justify-center'>
                    {services.length == 0 ?
                        <l-tail-chase size='40' speed='1.75' color='#111827' />
                        :
                        <div className='flex flex-wrap justify-center gap-6'>
                            <div
                                onClick={handleNavigateSip}
                                className='animate-border inline-block bg-white bg-gradient-to-r from-blue-400 via-purple-900 to-blue-900 bg-[length:400%_400%] p-1 rounded-lg cursor-pointer hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
                            >
                                <div className='h-full flex flex-col justify-center bg-white rounded-md py-2 px-2'>
                                    <div className='w-full flex justify-center'>
                                        <Add />
                                    </div>
                                    <PolicyCard
                                        label='Start a SIP'
                                        description='SIP is a smart, simple way to invest in mutual funds regularly, with offering MFSIP options and Reckoners to help choose the best funds.'
                                        className='bg-white h-full transition-shadow hover:shadow-md'
                                    />
                                </div>
                            </div>
                            <div
                                onClick={handleNavigateGeneralInsurance}
                                className='animate-border inline-block bg-white bg-gradient-to-r from-blue-400 via-purple-900 to-blue-900 bg-[length:400%_400%] p-1 rounded-lg cursor-pointer hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
                            >
                                <div className='h-full flex flex-col justify-center bg-white rounded-md py-2 px-2'>
                                    <div className='w-full flex justify-center'>
                                        <AddModerator />
                                    </div>
                                    <PolicyCard
                                        label='General Insurance'
                                        description={`Protect what matters with comprehensive coverage for life's uncertainties.`}
                                        className='bg-white h-full transition-shadow hover:shadow-md'
                                    />
                                </div>
                            </div>
                            {
                                services.map((service, index) => (
                                    <div onClick={() => handleNavigateInsuranceForm(service._id)} key={index}
                                        // className='animate-border inline-block bg-white bg-gradient-to-r from-blue-400 via-purple-900 to-blue-900 bg-[length:400%_400%] p-1 rounded-lg cursor-pointer hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
                                        className='block bg-white rounded-lg py-8 px-3 cursor-pointer hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
                                    >
                                        {/* <div className='h-full flex flex-col justify-center bg-white rounded-md py-4 px-2'> */}
                                        <div className='w-full flex justify-center'>
                                            <div dangerouslySetInnerHTML={{ __html: service.policyIcon }}></div>
                                        </div>
                                        <PolicyCard
                                            label={service.policyName}
                                            description={service.policyDescription}
                                            className='bg-white h-full transition-shadow hover:shadow-md'
                                        />
                                        {/* </div> */}
                                    </div>
                                ))
                            }
                        </div>
                    }
                </div>
            </div>
        </section>
    );
}

export default ServicesGrid;