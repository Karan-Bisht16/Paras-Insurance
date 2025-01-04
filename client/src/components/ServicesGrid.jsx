import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tailChase } from 'ldrs';
// importing api end-points
import { fetchAllPolicies } from '../api';
// importing components
import PolicyCard from './subcomponents/PolicyCard';

const ServicesGrid = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);

    const getAllPolicies = async () => {
        const { data } = await fetchAllPolicies();
        setServices(data);
    }

    useEffect(() => {
        getAllPolicies();
    }, []);

    const handleNavigate = (policyId) => {
        navigate('/insuranceForm', { state: { policyId: policyId } });
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
                        <div className='flex-col gap-6 md:flex md:flex-row md:flex-wrap md:justify-center'>
                            {
                                services.map((service, index) => (
                                    <div onClick={() => handleNavigate(service._id)} key={index}
                                        className='block bg-white rounded-lg py-8 mb-4 cursor-pointer hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]'
                                    >
                                        <div className='w-full flex justify-center'>
                                            <div dangerouslySetInnerHTML={{ __html: service.policyIcon }}></div>
                                        </div>
                                        <PolicyCard
                                            label={service.policyName}
                                            description={service.policyDescription}
                                            className='bg-white h-full transition-shadow hover:shadow-md'
                                        />
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