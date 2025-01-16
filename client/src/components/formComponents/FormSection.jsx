// importing components
import FormField from './FormField';

const FormSection = ({ fields, data, setData, handleFormDataChange }) => {
    return (
        <div className='form-section space-y-2'>
            {fields.map((field, index) => (
                <FormField
                    key={`${field.id}-${index}`}
                    {...field}
                    data={data}
                    setData={setData}
                    handleFormDataChange={handleFormDataChange}
                />
            ))}
        </div>
    );
}

export default FormSection;