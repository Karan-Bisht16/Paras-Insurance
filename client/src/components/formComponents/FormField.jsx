import TextField from './fields/TextField';
import DateField from './fields/DateField';
import TelField from './fields/TelField';
import RadioField from './fields/RadioField';
import CheckboxField from './fields/CheckboxField';
import RepeatField from './fields/RepeatField';
import SelectField from './fields/SelectField';
import FileUploadField from './fields/FileUploadField';

const FormField = (props) => {
    switch (props.type) {
        case 'text':
        case 'number':
            return <TextField {...props} />;
        case 'email':
            return <TextField {...props} />;
        case 'date':
            return <DateField {...props} />;
        case 'tel':
            return <TelField {...props} />;
        case 'radio':
            return <RadioField {...props} />;
        case 'checkbox':
            return <CheckboxField {...props} />;
        case 'repeat':
            return <RepeatField {...props} />;
        case 'select':
            return <SelectField {...props} />;
        case 'file':
            return <FileUploadField {...props} />;
        default:
            return null;
    }
}

export default FormField;