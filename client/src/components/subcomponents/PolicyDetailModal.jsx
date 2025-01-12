import { Close } from "@mui/icons-material";
import { Divider } from "@mui/material";

// LATER: Assigned policy view certificate button within modal aswell
const PolicyDetailModal = ({ selectedPolicy, closeModal, isCompanyForm }) => {
    const repeatedFields = (n, field) => {
        const elements = [];
        let hasNonNullElement = false;

        for (let index = 0; index < n; index++) {
            elements.push(
                ...Object.entries(field.children).map(([key, childField]) => {
                    const dataValue = selectedPolicy.data[`${index + 1}${childField.name}`];
                    if (dataValue == null || dataValue === '') {
                        return null;
                    } else {
                        hasNonNullElement = true;
                        return (
                            <div className="w-full" key={`${index}-${key}`}>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">{childField.label}</h3>
                                <p className="border-2 rounded-lg px-2 py-1">
                                    {dataValue}&nbsp;
                                </p>
                            </div>
                        );
                    }
                })
            );
        }

        return { isEmpty: !hasNonNullElement, elements };
    };

    if (isCompanyForm) {
        return (
            <div>
                <div className='relative bg-white pb-6 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                    <div className='px-6'>
                        <div className='flex items-center justify-between'>
                            <h1 className='text-3xl text-left font-semibold my-4'>
                                {selectedPolicy?.format?.policyName}
                            </h1>
                        </div>
                    </div>
                    <Divider />
                    <div className='px-6 py-2'>
                        <p className='text-2xl font-semibold pt-1'>Policy Details</p>
                        <div className='flex justify-between gap-4 mb-2'>
                            <div className='w-full'>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">Name</h3>
                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.format?.policyName}&nbsp;</p>
                            </div>
                            <div className='w-full'>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">Category</h3>
                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.format?.policyType}&nbsp;</p>
                            </div>
                        </div>
                        <div className='flex justify-between gap-4 mb-2'>
                            <div className='w-full'>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">Description</h3>
                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.format?.policyDescription}&nbsp;</p>
                            </div>
                        </div>
                        <Divider className='!my-4' />
                        <p className='text-2xl font-semibold'>Personal Details</p>
                        <div className='flex justify-between gap-4 mb-2'>
                            <div className='w-full'>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">First Name</h3>
                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.data?.firstName}&nbsp;</p>
                            </div>
                            <div className='w-full'>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">Last Name</h3>
                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.data?.lastName}&nbsp;</p>
                            </div>
                        </div>
                        {Object.entries(selectedPolicy?.format?.policyForm?.sections)?.map(([key, section]) => (
                            Object.entries(section?.fields)?.map(([key, field], index) => (
                                field.type === 'repeat' ?
                                    <>
                                        {(() => {
                                            const { isEmpty, elements } = repeatedFields(field.maxCount, field);

                                            return !isEmpty ? (
                                                <>
                                                    <Divider className='!my-4' />
                                                    <p className='text-2xl font-semibold pb-2'>Dependents Information</p>
                                                    {elements}
                                                </>
                                            ) : null;
                                        })()}
                                    </>
                                    :
                                    <div className='w-full' key={index}>
                                        <h3 className="block text-sm font-medium text-gray-700 mb-1">{field.label}</h3>
                                        <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy.data[field.name]}&nbsp;</p>
                                    </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed !z-[1000] inset-0 bg-black/10 flex justify-center items-center' onClick={closeModal}>
            <div
                onClick={(event) => event.stopPropagation()}
                className='relative h-[75vh] overflow-y-scroll no-scrollbar bg-white w-[65vw] pb-6 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'
            >
                <div className='px-6'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-3xl text-left font-semibold my-4'>
                            {selectedPolicy?.format?.policyName} ({selectedPolicy?.stage})
                        </h1>
                        <Close onClick={closeModal} className='cursor-pointer' />
                    </div>
                </div>
                <Divider />
                <div className='px-6 py-2'>
                    <p className='text-2xl font-semibold pt-1'>Policy Details</p>
                    <div className='flex justify-between gap-4 mb-2'>
                        <div className='w-full'>
                            <h3 className="block text-sm font-medium text-gray-700 mb-1">Name</h3>
                            <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.format?.policyName}&nbsp;</p>
                        </div>
                        <div className='w-full'>
                            <h3 className="block text-sm font-medium text-gray-700 mb-1">Category</h3>
                            <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.format?.policyType}&nbsp;</p>
                        </div>
                    </div>
                    <div className='flex justify-between gap-4 mb-2'>
                        <div className='w-full'>
                            <h3 className="block text-sm font-medium text-gray-700 mb-1">Description</h3>
                            <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.format?.policyDescription}&nbsp;</p>
                        </div>
                    </div>
                    <Divider className='!my-4' />
                    <p className='text-2xl font-semibold'>Personal Details</p>
                    <div className='flex justify-between gap-4 mb-2'>
                        <div className='w-full'>
                            <h3 className="block text-sm font-medium text-gray-700 mb-1">First Name</h3>
                            <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.data?.firstName}&nbsp;</p>
                        </div>
                        <div className='w-full'>
                            <h3 className="block text-sm font-medium text-gray-700 mb-1">Last Name</h3>
                            <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.data?.lastName}&nbsp;</p>
                        </div>
                    </div>
                    <div className='flex justify-between gap-4 mb-2'>
                        <div className='w-full'>
                            <h3 className="block text-sm font-medium text-gray-700 mb-1">Email</h3>
                            <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.data?.email}&nbsp;</p>
                        </div>
                        <div className='w-full'>
                            <h3 className="block text-sm font-medium text-gray-700 mb-1">Phone</h3>
                            <p className='border-2 rounded-lg px-2 py-1'>+91-{selectedPolicy?.data?.phone}&nbsp;</p>
                        </div>
                    </div>
                    {Object.entries(selectedPolicy?.format?.policyForm?.sections)?.map(([key, section]) => (
                        Object.entries(section?.fields)?.map(([key, field], index) => (
                            field.type === 'repeat' ?
                                <>
                                    {(() => {
                                        const { isEmpty, elements } = repeatedFields(field.maxCount, field);

                                        return !isEmpty ? (
                                            <>
                                                <Divider className='!my-4' />
                                                <p className='text-2xl font-semibold pb-2'>Dependents Information</p>
                                                {elements}
                                            </>
                                        ) : null;
                                    })()}
                                </>
                                :
                                <div className='w-full' key={index}>
                                    <h3 className="block text-sm font-medium text-gray-700 mb-1">{field.label}</h3>
                                    <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy.data[field.name]}&nbsp;</p>
                                </div>
                        ))
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PolicyDetailModal;