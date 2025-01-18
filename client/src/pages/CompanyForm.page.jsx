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

    const [submitting, setSubmitting] = useState(false);
    const handleAddQuotation = async (quotationData) => {
        if (submitting) return;

        await setSubmitting(true);
        try {
            await createQuotation({ clientPolicyId, clientId, companyId, quotationData });
            navigate('/', { state: { status: 'success', message: 'Quotation data recieved!', time: new Date().getTime() } })
        } catch (error) {
            console.error(error);
        }
        await setSubmitting(false);
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
                        <div className="flex flex-col gap-4 justify-between bg-gray-100 md:flex-row min-h-screen">
                            <div className="md:hidden m-4">
                                <QuotationForm onSubmit={handleAddQuotation} />
                            </div>
                            <div className="w-full md:w-[56vw] h-[calc(100vh-64px)] p-4 bg-gray-100 overflow-y-auto no-scrollbar">
                                <PolicyDetailModal
                                    selectedPolicy={clientPolicyData}
                                    isCompanyForm={true}
                                />
                            </div>
                            <div className="hidden md:block w-full md:w-[40vw] my-4 mr-4">
                                <QuotationForm submitting={submitting} onSubmit={handleAddQuotation} />
                            </div>
                        </div>
            }
        </>
    );
}

export default CompanyForm;