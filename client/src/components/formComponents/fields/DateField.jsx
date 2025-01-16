import { TextField } from "@mui/material";
// importing helper functions
import { getSuffix } from "../../../utils/helperFunctions";

const DateField = ({ label, id, name, required, data, handleFormDataChange, repeat, repeatIndex }) => {
    return (
        <div className="form-field">
            {repeat
                ?
                <>
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                        {repeatIndex}{getSuffix(repeatIndex)} {label} {required && <span className="text-red-600">*</span>}
                    </label>
                    <TextField
                        type="date" id={id} name={`${repeatIndex}${name}`} required={required}
                        value={data[`${repeatIndex}${name}`]} onChange={handleFormDataChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </>
                :
                <>
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required && <span className="text-red-600">*</span>}
                    </label>
                    <TextField
                        type="date" id={id} name={name} required={required}
                        value={data[name]} onChange={handleFormDataChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </>
            }
        </div>
    );
}

export default DateField;