import { useState } from 'react';
// importing components
import FormField from '../FormField';

const RepeatField = ({ minCount, maxCount, name, children, addButtonLabel, removeButtonLabel, data, setData, handleFormDataChange, ...rest }) => {
    const generateDataFormat = (fields, index) => {
        const dataFormat = {};
        fields.forEach((field) => {
            if (field.type === 'checkbox') {
                dataFormat[`${index}${field.id}`] = [];
            } else if (field.defaultValue) {
                dataFormat[`${index}${field.id}`] = field.defaultValue;
            } else if (field.type === 'radio') {
                dataFormat[`${index}${field.id}`] = null;
            } else {
                dataFormat[`${index}${field.id}`] = '';
            }
        });
        return dataFormat;
    }

    const [repeats, setRepeats] = useState(data[name]);

    const handleAddRepeat = async () => {
        setData((prevData) => { return { ...prevData, ...generateDataFormat(children, repeats + 1), [name]: repeats + 1 } });
        if (repeats < maxCount) {
            await setRepeats(repeats + 1);
        }
    };
    const handleRemoveRepeat = async () => {
        if (repeats > minCount) {
            const fieldsToRemove = generateDataFormat(children, repeats);

            setData((prevData) => {
                const updatedData = { ...prevData };
                Object.keys(fieldsToRemove).forEach((key) => {
                    delete updatedData[key];
                });
                return updatedData;
            });
            await setRepeats(repeats - 1);
        }
    };

    return (
        <div className='repeat-field space-y-6'>
            {Array.from({ length: repeats }).map((_, index) => (
                <div key={index} className='repeat-group bg-gray-50 p-4 rounded-md'>
                    <div className='space-y-2'>
                        {children.map((field, fieldIndex) => (
                            <FormField
                                key={`${field.id}-${index}-${fieldIndex}`}
                                {...field} repeat={true} repeatIndex={index + 1}
                                data={data} handleFormDataChange={handleFormDataChange}
                            />
                        ))}
                    </div>
                </div>
            ))}
            <div className='flex justify-between'>
                {repeats < maxCount && (
                    <button
                        type="button"
                        onClick={handleAddRepeat}
                        className='mt-3 w-full inline-flex uppercase justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm'
                    >
                        {addButtonLabel || 'Remove'}
                    </button>
                )}
                {repeats > minCount && (
                    <button
                        type="button"
                        onClick={handleRemoveRepeat}
                        className='mt-3 w-full inline-flex uppercase justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm'
                    >
                        {removeButtonLabel || 'Add More'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default RepeatField;