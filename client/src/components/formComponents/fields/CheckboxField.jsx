import { useState } from "react";

const CheckboxField = ({ label, id, name, required, children, data, handleFormDataChange, repeat, repeatIndex }) => {
    const fieldKey = repeat ? `${repeatIndex}${name}` : name;

    const [checkboxValues, setCheckboxValues] = useState(
        typeof data[fieldKey] === 'string' ? data[fieldKey]?.split(',') : []
    );

    const handleCheckboxValues = (event) => {
        const { value } = event.target;

        let updatedValues;
        if (checkboxValues.includes(value)) {
            updatedValues = checkboxValues.filter((v) => v !== value);
        } else {
            updatedValues = [...checkboxValues, value];
        }

        setCheckboxValues(updatedValues);

        event.target.value = updatedValues;
        event.target.name = fieldKey;

        handleFormDataChange(event);
    };

    return (
        <div className="form-field">
            <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-600">*</span>}
                </legend>
                <div className="space-y-2">
                    {children.map((option, index) => {
                        const checkboxId = repeat
                            ? `${id}-${index}-${repeatIndex}`
                            : `${id}-${index}`;
                        return (
                            <div key={checkboxId} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={checkboxId}
                                    name={option.name}
                                    value={option.label}
                                    checked={checkboxValues.includes(option.label)}
                                    onChange={handleCheckboxValues}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor={checkboxId}
                                    className="ml-3 block text-sm font-medium text-gray-700"
                                >
                                    {option.label}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </fieldset>
        </div>
    );
};

export default CheckboxField;
