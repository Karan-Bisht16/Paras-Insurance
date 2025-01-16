// importing helper functions
import { getSuffix } from "../../../utils/helperFunctions";

const SelectField = ({ id, label, name, required, children, data, handleFormDataChange, repeat, repeatIndex }) => {
    const defaultValueLowerCase = 'select an option';

    return (
        <div className="form-field">
            {repeat
                ?
                <>
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                        {repeatIndex}{getSuffix(repeatIndex)} {label} {required && <span className="text-red-600">*</span>}
                    </label>
                    <div className='border-gray-300 border rounded-md shadow-sm'>
                        <select
                            id={id} required={required} name={`${repeatIndex}${name}`} onChange={handleFormDataChange}
                            value={data[`${repeatIndex}${name}`]}
                            className="block w-full px-3 py-4 border border-r-[16px] border-transparent bg-gray-50 rounded-md focus:outline-none text-md"
                        >
                            {children.map((option, index) => (
                                <option key={`${id}-${index}-${repeatIndex}`} value={option.name} disabled={option.value?.toLowerCase() === defaultValueLowerCase ? true : false}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
                :
                <>
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required && <span className="text-red-600">*</span>}
                    </label>
                    <div className='border-gray-300 border rounded-md shadow-sm placeholder-gray-400'>
                        <select
                            id={id} required={required} name={name} onChange={handleFormDataChange}
                            value={data[name]}
                            className="block w-full px-3 py-4 border border-r-[16px] border-transparent rounded-md focus:outline-none text-md"
                        >
                            {children.map((option, index) => (
                                <option key={`${id}-${index}`} value={option.name} disabled={option.value?.toLowerCase() === defaultValueLowerCase ? true : false}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            }
        </div>
    );
};

export default SelectField;