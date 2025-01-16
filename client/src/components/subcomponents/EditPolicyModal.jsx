import { useState } from 'react';
import { Button, CircularProgress, Divider } from '@mui/material';
import { Close } from '@mui/icons-material';
import { tailChase } from 'ldrs';
// importing components
import FormSection from '../../components/formComponents/FormSection';

const EditPolicyModal = ({ formFields, formData, setFormData, onSubmit, onClose }) => {
    const [error, setError] = useState('');
    const [files, setFiles] = useState({});
    const handleFormDataChange = (event) => {
        const { name, value, type, files } = event.target;

        if (type === "file") {
            setFiles((prev) => ({
                ...prev,
                [name]: files[0],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    }

    const [currentSection, setCurrentSection] = useState(0);
    const handleNext = () => {
        if (document.getElementById('insuranceForm').checkValidity()) {
            if (currentSection < formFields.sections.length - 1) {
                setCurrentSection(currentSection + 1);
            }
        } else {
            document.getElementById('insuranceForm').reportValidity();
        }
    };
    const handlePrevious = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    const [submitting, setSubmitting] = useState(false);
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        const errorMessage = await onSubmit({ formData, files });
        if (!errorMessage) { onClose() }
        else { setError(errorMessage) }
        setSubmitting(false);
    }

    tailChase.register();

    return (
        <div className='fixed inset-0 !z-[1000] bg-black/10 flex justify-center items-center' onClick={onClose}>
            {submitting &&
                <div
                    onClick={(event) => event.stopPropagation()}
                    className='fixed inset-0 !z-[1000] bg-black/10 flex justify-center items-center'
                >
                    <CircularProgress />
                </div>
            }
            <div
                onClick={(event) => event.stopPropagation()}
                className='max-w-2xl w-full relative z-10 bg-white shadow-md rounded-lg h-[75vh] no-scrollbar overflow-y-scroll'
            >
                <div className='flex justify-between items-center px-6 py-4'>
                    <h2 className='text-xl font-semibold'>{formFields.sections[currentSection].heading}</h2>
                    <Close onClick={onClose} className='cursor-pointer' />
                </div>
                <Divider />
                <form id='insuranceForm' onSubmit={handleFormSubmit} className='py-4 px-6'>
                    <FormSection
                        fields={formFields.sections[currentSection].fields}
                        data={formData} setData={setFormData} handleFormDataChange={handleFormDataChange}
                    />
                    <div className='flex justify-between mt-6'>
                        {currentSection > 0 && (
                            <Button type='button' onClick={handlePrevious} className='!text-gray-900 !bg-gray-300 !hover:bg-gray-400'>
                                Previous
                            </Button>
                        )}
                        {currentSection < formFields.sections.length - 1 && (
                            <Button type='button' onClick={handleNext} className='!text-white !bg-gray-900 !hover:opacity-95'>
                                Next
                            </Button>
                        )}
                        {currentSection === formFields.sections.length - 1 && (
                            <Button type='submit' className='!text-white !bg-gray-900 !hover:opacity-95'>
                                {formFields.submitButtonLabel}
                            </Button>
                        )}
                    </div>
                    <div className='relative'>
                        {error && <span className='absolute -bottom-6 text-sm text-red-600'>{error}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditPolicyModal;