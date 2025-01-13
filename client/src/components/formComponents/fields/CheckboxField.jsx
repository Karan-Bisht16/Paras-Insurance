import { useState } from 'react';

const CheckboxField = ({ label, id, name, required, children, data, handleFormDataChange, repeat, repeatIndex }) => {
    // LATER: js for required
    const [checkboxValues, setCheckboxValues] = useState([]);
    const handleCheckboxValues = async (event) => {
        const { value } = event.target;
        if (checkboxValues.includes(value)) {
            const index = checkboxValues.indexOf(value)
            if (index > -1) {
                checkboxValues.splice(index, 1);
            }
            await setCheckboxValues([...checkboxValues]);
            event.target.value = [...checkboxValues];
        } else {
            await setCheckboxValues(prevCheckboxValues => {
                return [value, ...prevCheckboxValues];
            });
            event.target.value = [...checkboxValues, value];
        }
        if (repeat) {
            event.target.name = `${repeatIndex}${name}`;
        } else {
            event.target.name = name;
        }
        handleFormDataChange(event);
    }

    return (
        <div className="form-field">
            <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-600">*</span>}
                </legend>
                <div className="space-y-2">
                    {repeat
                        ?
                        children.map((option, index) => (
                            <div key={`${id}-${index}-${repeatIndex}`} className="flex items-center">
                                <input
                                    type="checkbox" id={`${id}-${index}-${repeatIndex}`} name={option.name} value={option.label}
                                    onChange={handleCheckboxValues}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`${id}-${index}-${repeatIndex}`} className="ml-3 block text-sm font-medium text-gray-700">{option.label}</label>
                            </div>
                        ))
                        :
                        children.map((option, index) => (
                            <div key={`${id}-${index}`} className="flex items-center">
                                <input
                                    type="checkbox" id={`${id}-${index}`} name={option.name} value={option.label}
                                    onChange={handleCheckboxValues}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`${id}-${index}`} className="ml-3 block text-sm font-medium text-gray-700">{option.label}</label>
                            </div>
                        ))
                    }

                </div>
            </fieldset>
        </div>
    );
}

export default CheckboxField;