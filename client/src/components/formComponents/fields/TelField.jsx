import { TextField } from "@mui/material";

const TelField = ({ label, id, name, placeholder, required, pattern, data, handleFormDataChange, repeat, repeatIndex }) => {
    const handleEnter = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    return (
        <div className='form-field'>
            {repeat
                ?
                <TextField
                    type='tel' label={label} id={id} name={`${repeatIndex}${name}`} placeholder={placeholder} required={required} pattern={pattern}
                    InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                    value={data[name]} onChange={handleFormDataChange} onKeyDown={handleEnter}
                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
                :
                <TextField
                    type='tel' label={label} id={id} name={name} placeholder={placeholder} required={required} pattern={pattern}
                    InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                    value={data[name]} onChange={handleFormDataChange}
                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
            }
        </div>
    );
}

export default TelField;