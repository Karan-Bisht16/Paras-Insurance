import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tailChase } from 'ldrs';
// importing api end-points
import { createQuotation, fetchClientPolicy } from "../api";
// importing components
import QuotationForm from "../components/subcomponents/QuotationForm";
import PolicyDetailModal from "../components/subcomponents/PolicyDetailModal";

const CompanyForm = () => {
    const navigate = useNavigate();
    const { clientId, clientPolicyId, companyId } = useParams();

    const [isLoadingClientPolicyData, setIsLoadingClientPolicyData] = useState(true);
    const [clientPolicyData, setClientPolicyData] = useState({});
    const [formAlreadyFilled, setFormAlreadyFilled] = useState(false);
    const [noCompany, setNoCompany] = useState(false);

    const getClientPolicyData = async () => {
        try {
            const { data } = await fetchClientPolicy({ clientPolicyId, companyId });
            setClientPolicyData(data);
            setIsLoadingClientPolicyData(false);
        } catch (error) {
            if (error?.status === 404) {
                setNoCompany(true);
                setIsLoadingClientPolicyData(false);
            } else if (error?.status === 401) {
                setFormAlreadyFilled(true);
                setIsLoadingClientPolicyData(false);
            }
            console.error(error);
        }
    }
    useEffect(() => {
        window.scrollTo(0, 0);
        getClientPolicyData();
    }, [clientPolicyId, companyId]);

    const handleAddQuotation = async (quotationData) => {
        try {
            await createQuotation({ clientPolicyId, clientId, companyId, quotationData });
            navigate('/', { state: { status: 'success', message: 'Quotation data recieved!', time: new Date().getTime() } })
        } catch (error) {
            console.error(error);
        }
    }

    tailChase.register();

    return (
        <>
            {isLoadingClientPolicyData ?
                <div className='min-h-screen flex justify-center items-center'>
                    <l-tail-chase size='40' speed='1.75' color='#111827' />
                </div>
                :
                formAlreadyFilled ?
                    <div className="flex flex-col justify-center items-center my-16">
                        <lord-icon
                            src='https://cdn.lordicon.com/hmzvkifi.json'
                            trigger='in-reveal'
                            stroke='bold' state='morph-cross'
                            colors='primary:#111827,secondary:#111827'
                            style={{ width: '250px', height: '250px' }}
                        />
                        <p className='text-3xl font-semibold text-gray-900'>Form already filled</p>
                    </div>
                    :
                    noCompany ?
                        <div className="flex flex-col justify-center items-center my-16">
                            <lord-icon
                                src="https://cdn.lordicon.com/hwjcdycb.json"
                                trigger="hover"
                                colors='primary:#111827,secondary:#111827'
                                style={{ width: '250px', height: '250px' }}
                            />
                            <p className='text-3xl font-semibold text-gray-900'>No Company found</p>
                        </div>
                        :
                        <div className="flex flex-col bg-gray-100 md:flex-row min-h-screen">
                            <div className="w-full md:w-[60vw] p-4 bg-gray-100 overflow-y-auto">
                                <PolicyDetailModal
                                    selectedPolicy={clientPolicyData}
                                    isCompanyForm={true}
                                />
                            </div>
                            <div className="w-full md:w-[38vw] my-4">
                                <QuotationForm onSubmit={handleAddQuotation} />
                            </div>
                        </div>
            }
        </>
    );
}

export default CompanyForm;