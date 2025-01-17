import { useEffect, useState } from "react";
import { Button, Divider, TextField, Tooltip } from "@mui/material";
import { Close } from "@mui/icons-material";
import Spreadsheet from "react-spreadsheet";
import { sendQuotation } from "../../../api";
import { ScrollArea } from "../../subcomponents/ScrollArea";

const CombinedQuotationDetails = ({ selectedPolicy, details, onClose, reload }) => {
    const { combinedQuotationDetails, associatedPoCs } = details;
    const [selectedCombinedQuotation, setSelectedCombinedQuotation] = useState([]);
    const transformQuotationData = (inputArray) => {
        if (inputArray[0].length === 0) {
            inputArray.shift();
        }
        let transformedArray = [];

        let headerRow = inputArray[0].map(item => ({
            value: item || "",
            readOnly: true
        }));
        transformedArray.push(headerRow);

        inputArray.slice(1).forEach(row => {
            let transformedRow = row.map(item => ({
                value: item || "",
                readOnly: true
            }));
            transformedArray.push(transformedRow);
        });

        return transformedArray;
    }

    useEffect(() => {
        let combinedQuotation = combinedQuotationDetails?.quotationData;

        if (combinedQuotation) {
            if (combinedQuotation.length > 0 && combinedQuotationDetails?.status !== 'UploadedByAdmin') {
                combinedQuotation = transformQuotationData(combinedQuotationDetails?.quotationData);
            }
            setSelectedCombinedQuotation(combinedQuotation);
        }
    }, []);

    const [error, setError] = useState('');
    const handleSendPartialQuotation = async () => {
        setError();
        try {
            await sendQuotation({ clientPolicyId: selectedPolicy._id });
            reload();
            onClose();
        } catch (error) {
            setError(error?.response?.data?.message);
        }
    }

    return (
        <div className="fixed inset-0 !z-[1000] bg-black/10 flex justify-center items-center" onClick={onClose}>
            <div
                onClick={(event) => event.stopPropagation()}
                className="bg-white max-w-5xl w-full h-[75vh] rounded-lg shadow-sm"
            >
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">{selectedPolicy?.format?.policyName}</h2>
                    <Close onClick={onClose} className="cursor-pointer" />
                </div>
                <div className="px-6 py-4 max-h-[50%] overflow-y-scroll no-scrollbar">
                    <p className="font-semibold text-lg">Mail and WhatsApp sent to:</p>
                    {associatedPoCs?.map((associatedPoC, index) => 
                            <div key={index} className="mt-2.5 mb-1">
                                <div className="grid grid-cols-4 gap-2">
                                    <TextField
                                        label='Company Name'
                                        value={associatedPoC.companyName[0]} slotProps={{ input: { readOnly: true } }}
                                    />
                                    <TextField
                                        label='Name'
                                        value={associatedPoC.names[0]} slotProps={{ input: { readOnly: true } }}
                                    />
                                    <TextField
                                        label='Email'
                                        value={associatedPoC.emails[0]} slotProps={{ input: { readOnly: true } }}
                                    />
                                    <TextField
                                        label='Phone'
                                        value={associatedPoC.phones[0]} slotProps={{ input: { readOnly: true } }}
                                    />
                                </div>
                            </div>
                    )}
                </div>
                <Divider />
                <div className="px-6 py-4 !h-[50%] no-scrollbar">
                    <h3 className="font-semibold text-xl mb-1">Combined quotation uptil now:</h3>
                    <p className="mb-1"><strong>Status: </strong>{combinedQuotationDetails?.status}</p>
                    {selectedCombinedQuotation?.length > 0 ?
                        <div>
                            <ScrollArea className='w-full !h-[calc(37.5vh-125px)] no-scrollbar rounded-lg border-2 border-gray-400'>
                                <Spreadsheet data={selectedCombinedQuotation} />
                            </ScrollArea>
                            {combinedQuotationDetails?.countRecievedQuotations < combinedQuotationDetails?.countTotalEmails && combinedQuotationDetails?.status === 'Pending' &&
                                <div className="flex justify-end mt-4">
                                    <Button
                                        onClick={handleSendPartialQuotation}
                                        className="!text-white !bg-gray-900 !hover:opacity-95"
                                    >
                                        Send Partial Quotation
                                    </Button>
                                </div>
                            }
                        </div>
                        :
                        <div className="w-full text-center bg-gray-200 rounded-lg text-lg py-8">
                            No quotation recieved
                        </div>
                    }
                    <div className='relative'>
                        {error && <span className='absolute -bottom-2 text-sm text-red-600'>{error}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CombinedQuotationDetails;