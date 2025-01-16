import { OpenInNew } from "@mui/icons-material";
import { Link } from "react-router-dom";

// LATER: js for repeat
const FileUploadField = ({ id, name, label, editLabel, data, required, handleFormDataChange, multiple, accept }) => {
    const isEditing = !!data[name];

    return (
        <div className="!mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <input
                type="file" id={id} name={name} required={required && !isEditing}
                accept={accept} multiple={multiple}
                onChange={handleFormDataChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:uppercase file:rounded-md file:border-0 file:text-sm file:font-semiboldfile:bg-indigo-50 file:bg-gray-900 file:text-white hover:file:opacity-95 file:cursor-pointer"
            />
            {data[name] &&
                <Link
                    to={data[name]}
                    target="_blank" rel="noopener noreferrer"
                    className='w-full flex gap-2 justify-center items-center mt-2 py-1 px-2 cursor-pointer rounded-md text-white bg-gray-900 hover:opacity-95'
                >
                    {editLabel}
                    <OpenInNew className='!size-4' />
                </Link>
            }
        </div>
    );
}

export default FileUploadField;