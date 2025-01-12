import { Divider, TextField } from "@mui/material";
import { Close, OpenInNew } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toFormattedDate } from "../../utils/helperFunctions";

const SipDetailModal = ({ label, selectedSip, closeModal }) => {
    return (
        <div className='fixed !z-[1000] inset-0 bg-black/10 flex justify-center items-center' onClick={closeModal}>
            <div
                onClick={(event) => event.stopPropagation()}
                className='relative h-[75vh] overflow-y-scroll no-scrollbar bg-white w-[65vw] pb-6 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'
            >
                <div className='px-6'>
                    <div className='flex justify-between items-center'>
                        <h1 className='text-3xl text-left font-semibold my-4'>{label} Details</h1>
                        <Close onClick={closeModal} className='cursor-pointer' />
                    </div>
                </div>
                <Divider />
                <div className='px-6 py-2'>
                    <p className='text-2xl font-semibold pt-1 pb-4'>Personal Details</p>
                    <div className='grid grid-cols-4 gap-4 mb-4'>
                        <div className='w-full'>
                            <TextField label="First Name" value={selectedSip?.personalDetails?.firstName} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            <TextField label="Last Name" value={selectedSip?.personalDetails?.lastName} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            <TextField label="DoB" value={toFormattedDate(selectedSip?.personalDetails?.dob)} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            <TextField label="Gender" value={selectedSip?.personalDetails?.gender} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                    </div>
                    <div className='flex justify-between gap-4 mb-3'>
                        <div className='w-full'>
                            <TextField label="Email" value={selectedSip?.personalDetails?.contact?.email} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            <TextField label="Phone" value={selectedSip?.personalDetails?.contact?.phone} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                    </div>
                    <p className='text-2xl font-semibold pb-4'>Address</p>
                    <div className='grid grid-cols-5 gap-4 mb-3'>
                        <TextField label="Street" value={selectedSip?.personalDetails?.address?.street} fullWid slotProps={{ input: { readOnly: true } }} h />
                        <TextField label="City" value={selectedSip?.personalDetails?.address?.city} fullWidth slotProps={{ input: { readOnly: true } }} />
                        <TextField label="State" value={selectedSip?.personalDetails?.address?.state} fullWidth slotProps={{ input: { readOnly: true } }} />
                        <TextField label="PINCODE" value={selectedSip?.personalDetails?.address?.pincode} fullWidth slotProps={{ input: { readOnly: true } }} />
                        <TextField label="Country" value={selectedSip?.personalDetails?.address?.country} fullWidth slotProps={{ input: { readOnly: true } }} />
                    </div>

                    <p className='text-2xl font-semibold pb-4'>Nominee Details</p>
                    <div className='grid grid-cols-4 gap-4 mb-4'>
                        <TextField label="Nominee Name" value={selectedSip?.personalDetails.nominee.name} fullWidth slotProps={{ input: { readOnly: true } }} />
                        <TextField label="Nominee DoB" value={toFormattedDate(selectedSip?.personalDetails.nominee.dob)} fullWidth slotProps={{ input: { readOnly: true } }} />
                        <TextField label="Relation with Nominee " value={selectedSip?.personalDetails.nominee.relationship} fullWidth slotProps={{ input: { readOnly: true } }} />
                        <TextField label="Nominee Phone" value={selectedSip?.personalDetails.nominee.phone} fullWidth slotProps={{ input: { readOnly: true } }} />
                    </div>
                </div>

                <Divider />
                <div className='px-6 py-2'>
                    <p className='text-2xl font-semibold pt-1 pb-4'>Financial Details</p>
                    <div className='grid grid-cols-4 gap-4 mb-4'>
                        <div className='w-full'>
                            <TextField label="PAN Card Number" value={selectedSip?.financialDetails?.panCardNo} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            {selectedSip?.financialDetails?.panCardURL &&
                                <div className='flex w-full h-full'>
                                    <Link
                                        to={selectedSip?.financialDetails?.panCardURL}
                                        target="_blank" rel="noopener noreferrer"
                                        className='h-full w-full py-1 px-2 rounded-md text-white bg-gray-900 hover:opacity-95'
                                    >
                                        <div className='h-full flex gap-2 items-center justify-center'>
                                            Uploaded PAN Card
                                            <OpenInNew className='!size-4' />
                                        </div>
                                    </Link>
                                </div>
                            }
                        </div>
                        <div className='w-full'>
                            <TextField label="Aadhaar" value={selectedSip?.financialDetails?.aadhaarNo} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            {selectedSip?.financialDetails?.aadhaarURL &&
                                <div className='flex h-full w-full'>
                                    <Link
                                        to={selectedSip?.financialDetails?.aadhaarURL}
                                        target="_blank" rel="noopener noreferrer"
                                        className='h-full w-full py-1 px-2 rounded-md text-white bg-gray-900 hover:opacity-95'
                                    >
                                        <div className='h-full flex gap-2 items-center justify-center'>
                                            Uploaded Aadhaar
                                            <OpenInNew className='!size-4' />
                                        </div>
                                    </Link>
                                </div>
                            }
                        </div>
                    </div>
                    <div className='grid grid-cols-3 gap-4 mb-4'>
                        <div className='w-full'>
                            <TextField label="Bank Account Number" value={selectedSip?.financialDetails?.accountDetails?.accountNo} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            <TextField label="IFSC Code" value={selectedSip?.financialDetails?.accountDetails?.ifscCode} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                        <div className='w-full'>
                            <TextField label="Bank Name" value={selectedSip?.financialDetails?.accountDetails?.bankName} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </div>
                    </div>
                    <div>
                        {selectedSip?.financialDetails?.accountDetails?.cancelledChequeURL &&
                            <div className='flex w-full h-12'>
                                <Link
                                    to={selectedSip?.financialDetails?.accountDetails?.cancelledChequeURL}
                                    target="_blank" rel="noopener noreferrer"
                                    className='h-full w-full py-1 px-2 rounded-md text-white bg-gray-900 hover:opacity-95'
                                >
                                    <div className='h-full flex gap-2 items-center justify-center'>
                                        Uploaded Cancelled Cheque
                                        <OpenInNew className='!size-4' />
                                    </div>
                                </Link>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SipDetailModal;