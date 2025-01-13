const FileUploadField = ({ id, name, label, required, handleFormDataChange, multiple, accept }) => {
    return (
        <div className="form-field !mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <input
                type="file" id={id} name={name} required={required}
                accept={accept} multiple={multiple}
                onChange={handleFormDataChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semiboldfile:bg-indigo-50 file:bg-gray-900 file:text-white hover:file:opacity-95 file:cursor-pointer"
            />
        </div>
    );
}

export default FileUploadField;