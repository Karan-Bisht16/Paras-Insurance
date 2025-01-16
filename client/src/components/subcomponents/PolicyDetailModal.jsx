import { Close, OpenInNew } from "@mui/icons-material";
import { Divider } from "@mui/material";
import { Link } from "react-router-dom";
// importing helper functions
import { getSuffix } from "../../utils/helperFunctions";

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
                        if (isCompanyForm && childField.nonTransferable) return null;
                        return (
                            <div className="w-full" key={`${index}-${key}`}>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">
                                    {index + 1}<sup>{getSuffix(index + 1)}</sup> {childField.label}
                                </h3>
                                <p className="bg-gray-50 border-2 rounded-lg px-2 py-1">
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
                                !field.nonTransferable &&
                                <>
                                    {field.type === 'repeat' ?
                                        <>
                                            {(() => {
                                                const { isEmpty, elements } = repeatedFields(field.maxCount, field);
                                                return !isEmpty ? (
                                                    <>
                                                        <Divider className='!my-4' />
                                                        <p className='text-2xl font-semibold pb-2'>Dependents Information</p>
                                                        <div className="bg-gray-100 p-4 rounded-lg">
                                                            {elements}
                                                        </div>
                                                        <Divider className='!my-4' />
                                                    </>
                                                ) : null;
                                            })()}
                                        </>
                                        :
                                        <div className='w-full' key={index}>
                                            {field.type === 'file'
                                                ?
                                                <>
                                                    <Link
                                                        to={selectedPolicy.data[field.name]}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className='w-full flex gap-2 justify-center items-center my-2 py-1 px-2 cursor-pointer rounded-md text-white bg-gray-900'
                                                    >
                                                        {field.editLabel}
                                                        <OpenInNew className='!size-4' />
                                                    </Link>
                                                </>
                                                :
                                                <>
                                                    <h3 className="block text-sm font-medium text-gray-700 mb-1">{field.label}</h3>
                                                    {field.type === 'select'
                                                        ?
                                                        <p className='border-2 rounded-lg px-2 py-1'>
                                                            {selectedPolicy.data[field.name] === field.defaultValue ? '' : selectedPolicy.data[field.name]}&nbsp;
                                                        </p>
                                                        :
                                                        <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy.data[field.name]}&nbsp;</p>
                                                    }
                                                </>
                                            }
                                        </div>
                                    }
                                </>
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
                    {selectedPolicy.policyId !== '6777932ef2013d3cfcc27347' &&
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
                    }
                    {selectedPolicy.policyId !== '6777932ef2013d3cfcc27347' &&
                        <div className='flex justify-between gap-4 mb-2'>
                            <div className='w-full'>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">Description</h3>
                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.format?.policyDescription}&nbsp;</p>
                            </div>
                        </div>
                    }
                    {selectedPolicy?.policyNo &&
                        <div className='flex justify-between gap-4 mb-2'>
                            <div className='w-full'>
                                <h3 className="block text-sm font-medium text-gray-700 mb-1">Policy Number</h3>
                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy?.policyNo}&nbsp;</p>
                            </div>
                        </div>
                    }
                    {selectedPolicy?.policyDocumentURL &&
                        <div className='flex justify-between gap-4 mb-2'>
                            <div className='w-full flex justify-end'>
                                <Link
                                    to={selectedPolicy?.policyDocumentURL}
                                    target="_blank" rel="noopener noreferrer"
                                    className='w-72 uppercase flex gap-2 justify-center items-center py-1 px-2 cursor-pointer rounded-md text-white bg-gray-900'
                                >
                                    Policy Document
                                    <OpenInNew className='!size-4' />
                                </Link>
                            </div>
                        </div>
                    }
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
                                                <div className="bg-gray-100 p-4 rounded-lg">
                                                    {elements}
                                                </div>
                                                <Divider className='!my-4' />
                                            </>
                                        ) : null;
                                    })()}
                                </>
                                :
                                <div className='w-full' key={index}>
                                    {field.type === 'file'
                                        ?
                                        <>
                                            <Link
                                                to={selectedPolicy.data[field.name]}
                                                target="_blank" rel="noopener noreferrer"
                                                className='w-full flex gap-2 justify-center items-center my-2 py-1 px-2 cursor-pointer rounded-md text-white bg-gray-900'
                                            >
                                                {field.editLabel}
                                                <OpenInNew className='!size-4' />
                                            </Link>
                                        </>
                                        :
                                        <>
                                            <h3 className="block text-sm font-medium text-gray-700 mb-1">{field.label}</h3>
                                            {field.type === 'select'
                                                ?
                                                <p className='border-2 rounded-lg px-2 py-1'>
                                                    {selectedPolicy.data[field.name] === field.defaultValue ? '' : selectedPolicy.data[field.name]}&nbsp;
                                                </p>
                                                :
                                                <p className='border-2 rounded-lg px-2 py-1'>{selectedPolicy.data[field.name]}&nbsp;</p>
                                            }
                                        </>
                                    }
                                </div>
                        ))
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PolicyDetailModal;