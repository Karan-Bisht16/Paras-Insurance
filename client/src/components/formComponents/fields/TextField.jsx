import { TextField } from '@mui/material';

const MyTextField = ({ label, id, name, placeholder, required, max, min, data, handleFormDataChange, type = 'text', repeat, repeatIndex }) => {
    const handleEnter = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    return (
        <div className='form-field'>
            {repeat ?
                <TextField
                    type={type} label={label} id={id} name={`${repeatIndex}${name}`} placeholder={placeholder} required={required}
                    InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                    max={type === 'number' ? max : ""} min={type === 'number' ? min : ""}
                    value={data[name]} onChange={handleFormDataChange} onKeyDown={handleEnter}
                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
                :
                <TextField
                    type={type} label={label} id={id} name={name} placeholder={placeholder} required={required}
                    InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                    max={type === 'number' ? max : ""} min={type === 'number' ? min : ""}
                    value={data[name]} onChange={handleFormDataChange}
                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
            }
        </div>
    );
}

export default MyTextField;