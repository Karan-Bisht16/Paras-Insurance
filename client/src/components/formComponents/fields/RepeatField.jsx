import React, { useState } from 'react';
import FormField from '../FormField';

function RepeatField({ minCount, maxCount, children, addButtonLabel, removeButtonLabel, data, handleFormDataChange }) {
    const [repeats, setRepeats] = useState(minCount);

    const handleAddRepeat = async (event) => {
        if (repeats < maxCount) {
            await setRepeats(repeats + 1);
        }
    };
    const handleRemoveRepeat = async (event) => {
        if (repeats > minCount) {
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
                        className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm'
                    >
                        {addButtonLabel || 'Remove'}
                    </button>
                )}
                {repeats > minCount && (
                    <button
                        type="button"
                        onClick={handleRemoveRepeat}
                        className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm'
                    >
                        {removeButtonLabel || 'Add More'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default RepeatField;