// importing helper functions
import { getSuffix } from "../../../utils/helperFunctions";

const RadioField = ({ label, id, name, required, children, data, handleFormDataChange, repeat, repeatIndex }) => {
    return (
        <div className="form-field">
            <fieldset>
                <div className="space-y-2">
                    {repeat ?
                        children.length <= 2 ?
                            <>
                                <legend className="text-sm font-medium text-gray-700 mb-1">
                                    {repeatIndex}{getSuffix(repeatIndex)} {label} {required && <span className="text-red-600">*</span>}
                                </legend>
                                <div className='flex gap-8 sm:gap-16 lg:gap-32'>
                                    {children.map((option, index) => (
                                        <div key={`${id}-${index}`} className="flex items-center">
                                            <input
                                                type="radio" id={`${id}-${index}-${repeatIndex}`} name={`${repeatIndex}${name}`} required={required}
                                                value={option.label} onChange={handleFormDataChange} checked={option.label === data[`${repeatIndex}${name}`]}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            />
                                            <label htmlFor={`${id}-${index}-${repeatIndex}`} className="ml-3 pb-[2px] block text-sm font-medium text-gray-700">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </>
                            :
                            <>
                                <legend className="text-sm font-medium text-gray-700 mb-1">
                                    {repeatIndex}{getSuffix(repeatIndex)} {label} {required && <span className="text-red-600">*</span>}
                                </legend>
                                {children.map((option, index) => (
                                    <div key={`${id}-${index}`} className="flex items-center">
                                        <input
                                            type="radio" id={`${id}-${index}-${repeatIndex}`} name={`${repeatIndex}${name}`} required={required}
                                            value={option.label} onChange={handleFormDataChange} checked={option.label === data[name]}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label htmlFor={`${id}-${index}-${repeatIndex}`} className="ml-3 block text-sm font-medium text-gray-700">{option.label}</label>
                                    </div>
                                ))}
                            </>
                        :
                        children.length <= 2 ?
                            <>
                                <legend className="text-sm font-medium text-gray-700 mb-1">
                                    {label} {required && <span className="text-red-600">*</span>}
                                </legend>
                                <div className='flex gap-8 sm:gap-16 lg:gap-32'>
                                    {children.map((option, index) => (
                                        <div key={`${id}-${index}`} className="flex items-center">
                                            <input
                                                type="radio" id={`${id}-${index}`} name={name} required={required}
                                                value={option.label} onChange={handleFormDataChange} checked={option.label === data[name]}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            />
                                            <label htmlFor={`${id}-${index}`} className="ml-3 pb-[2px] block text-sm font-medium text-gray-700">{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </>
                            :
                            <>
                                <legend className="text-sm font-medium text-gray-700 mb-1">
                                    {label} {required && <span className="text-red-600">*</span>}
                                </legend>
                                {children.map((option, index) => (
                                    <div key={`${id}-${index}`} className="flex items-center">
                                        <input
                                            type="radio" id={`${id}-${index}`} name={name} required={required}
                                            value={option.label} onChange={handleFormDataChange} checked={option.label === data[name]}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label htmlFor={`${id}-${index}`} className="ml-3 block text-sm font-medium text-gray-700">{option.label}</label>
                                    </div>
                                ))}
                            </>
                    }
                </div>
            </fieldset>
        </div>
    );
}

export default RadioField;