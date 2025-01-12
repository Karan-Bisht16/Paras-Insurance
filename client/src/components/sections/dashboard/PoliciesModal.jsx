const PolicyModal = ({ combinedQuotation, isOpen, onClose, onSend }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">
                    Available policies ({combinedQuotation.length})
                </h2>

                {combinedQuotation.length === 0 ? (
                    <p className="text-center text-gray-500 my-4">No policy found</p>
                ) : (
                    combinedQuotation.map((policy, index) => (
                        <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">{policy.policyName}</h3>
                            <p className="mb-2"><strong>Company:</strong> {policy.companyName}</p>
                            <p className="mb-2"><strong>Type:</strong> {policy.policyType}</p>
                            <p className="mb-2"><strong>Description:</strong> {policy.policyDescription}</p>
                            <p className="mb-2"><strong>Features:</strong></p>
                            <ul className="list-disc pl-5 mb-2">
                                {policy.policyFeatures.split(',').map((feature, i) => (
                                    <li key={i}>{feature.trim()}</li>
                                ))}
                            </ul>
                            <p className="mb-2"><strong>Coverage Amount:</strong> ${policy.coverageAmount.toLocaleString()}</p>
                            <p className="mb-2"><strong>Coverage Type:</strong> {policy.coverageType}</p>
                            <p className="mb-2"><strong>Premium Amount:</strong> ${policy.premiumAmount.toLocaleString()}</p>
                            <p><strong>Premium Type:</strong> {policy.premiumType}</p>
                        </div>
                    ))
                )}

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                    >
                        Close
                    </button>
                    <button
                        onClick={onSend}
                        disabled={combinedQuotation.length === 0}
                        className={`${combinedQuotation.length === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700'
                            } text-white font-bold py-2 px-4 rounded`}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PolicyModal;