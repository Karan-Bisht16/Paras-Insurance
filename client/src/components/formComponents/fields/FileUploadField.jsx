function FileUploadField({ id, name, label, required, handleFormDataChange, multiple, accept }) {
    console.log(handleFormDataChange);
    return (
        <div className="form-field">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type="file"
                id={id}
                name={name}
                required={required}
                multiple={multiple}
                accept={accept}
                onChange={handleFormDataChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semiboldfile:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
        </div>
    );
}

export default FileUploadField;

