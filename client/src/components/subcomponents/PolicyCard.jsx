const PolicyCard = ({ label, description }) => {
    return (
        <div className="p-4 w-[400px]">
            <p className="font-semibold text-center">{label}</p>
            <p className='text-sm text-[#97503A] text-center'>{description}</p>
        </div>
    );
}

export default PolicyCard;