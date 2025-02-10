import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
    Button,
    CircularProgress,
    MenuItem,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Fade,
    useTheme,
    useMediaQuery,
} from "@mui/material"
import { Close, Delete, ExpandMore, OpenInNew, Upload } from "@mui/icons-material"
import { maxHeight, styled } from "@mui/system"
// importing api end-points
import { fetchEveryPolicyId } from "../api"

const FormContainer = styled("div")(({ theme }) => ({
    width: "100%",
    maxWidth: "65vw",
    margin: "0 auto",
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
        maxWidth: "95vw",
        maxHeight: "65vh",
        overflow: "scroll"
    },
    transition: "all 0.3s ease-in-out",
}))

const UpdateProfileForm = ({
    clientData,
    closeUpdateProfile,
    isNotClosable,
    onSubmit,
    label,
    includePolicyType,
    initialPolicyType,
    excludeEmployementDetails,
    disable,
    initialClientData
}) => {
    const [error, setError] = useState("")

    const [formData, setFormData] = useState(clientData)
    const handleChange = (event, section, subsection = null) => {
        const { name, value } = event.target
        if (subsection) {
            setFormData((prevState) => ({
                ...prevState,
                [section]: {
                    ...prevState[section],
                    [subsection]: {
                        ...prevState[section][subsection],
                        [name]: value,
                    },
                },
            }))
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [section]: {
                    ...prevState[section],
                    [name]: value,
                },
            }))
        }
    }
    const [initialCurrentPolicyForEdit, setInitialCurrentPolicyForEdit] = useState(initialPolicyType || "")
    const [currentPolicyId, setCurrentPolicyId] = useState("")
    const handlePolicyChange = (event) => {
        setCurrentPolicyId(event.target?.value)
    }
    const [everyPolicyId, setEveryPolicyId] = useState([])
    const getEveryPolicyIds = async () => {
        const { data } = await fetchEveryPolicyId()
        setEveryPolicyId(data)
        if (currentPolicyId === "") {
            setCurrentPolicyId(data[0]._id)
        }
        if (initialCurrentPolicyForEdit?.trim() !== "") {
            setCurrentPolicyId(data.filter((policy) => policy.policyName === initialCurrentPolicyForEdit)[0]?._id)
        }
    }
    useEffect(() => {
        window.scrollTo(0, 0)
        getEveryPolicyIds()
    }, [])
    const steps = ["User Details", "Financial Details & Employment Details"]
    const [activeStep, setActiveStep] = useState(0)
    const handleNext = () => {
        if (activeStep === 0) {
            setError("")
            if (formData?.personalDetails?.firstName?.trim() === "") {
                setError("First name is mandatory")
            } else if (formData?.personalDetails?.contact?.email?.trim() === "") {
                setError("Email is mandatory")
            } else if (formData?.personalDetails?.contact?.phone?.trim() === "") {
                setError("Phone is mandatory")
            } else if (formData?.personalDetails?.dob === null) {
                setError("Date of Birth is mandatory")
            } else {
                setActiveStep(1)
            }
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
    }
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const [files, setFiles] = useState({
        panCard: "",
        aadhaar: "",
        cancelledCheque: "",
    })
    const [removedFiles, setRemovedFiles] = useState({
        panCard: false,
        aadhaar: false,
        cancelledCheque: false,
    })
    const handleFileUploadPanCard = () => {
        document.getElementById(`panCardFileUpload`)?.click()
    }
    const handleFileUploadAadhaar = () => {
        document.getElementById(`aadhaarFileUpload`)?.click()
    }
    const handleFileUploadCancelledCheque = () => {
        document.getElementById(`cancelledChequeFileUpload`)?.click()
    }
    const removeUploadFilePanCard = () => {
        setFormData((prevFormData) => {
            return {
                ...prevFormData,
                financialDetails: {
                    ...prevFormData["financialDetails"],
                    panCardURL: "",
                },
            }
        })
        setRemovedFiles((prevState) => ({ ...prevState, panCard: true }))
    }
    const removeUploadFileAadhaar = () => {
        setFormData((prevFormData) => {
            return {
                ...prevFormData,
                financialDetails: {
                    ...prevFormData["financialDetails"],
                    aadhaarURL: "",
                },
            }
        })
        setRemovedFiles((prevState) => ({ ...prevState, aadhaar: true }))
    }
    const removeUploadFileCancelledCheque = () => {
        setFormData((prevFormData) => {
            return {
                ...prevFormData,
                financialDetails: {
                    ...prevFormData["financialDetails"],
                    accountDetails: {
                        ...prevFormData["financialDetails"]["accountDetails"],
                        cancelledChequeURL: "",
                    },
                },
            }
        })
        setRemovedFiles((prevState) => ({ ...prevState, cancelledCheque: true }))
    }
    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        const { name } = event.target
        setFiles((prevFiles) => {
            return { ...prevFiles, [name]: file }
        })
    }

    const [updating, setUpdating] = useState(false)
    const handleSubmit = async (event) => {
        event.preventDefault()
        setUpdating(true)
        setError("")
        let errorMessage = ""
        if (includePolicyType) {
            errorMessage = await onSubmit(
                formData,
                removedFiles,
                files,
                everyPolicyId.filter((policy) => policy._id === currentPolicyId)[0]?.policyName,
            )
        } else {
            errorMessage = await onSubmit(formData, removedFiles, files)
        }
        setUpdating(false)
        if (!errorMessage) {
            closeUpdateProfile()
        } else {
            setError(errorMessage)
        }
    }

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    return (
        <>
            {updating && (
                <div className="fixed !z-[2000] inset-0 bg-black/10 flex justify-center items-center">
                    <CircularProgress />
                </div>
            )}
            <div
                onClick={closeUpdateProfile}
                className={`fixed inset-0 ${!isNotClosable && "!z-[1000] bg-gray-600 bg-opacity-50"} flex items-center justify-center ${isMobile ? "p-2" : ""}`}
            >
                <div onClick={(event) => event.stopPropagation()} className="bg-white rounded-lg shadow-md pb-4">
                    <div className="flex justify-between items-center px-6 py-4 border-b">
                        <h2 className="text-xl font-semibold">{label}</h2>
                        {!isNotClosable && (
                            <button onClick={closeUpdateProfile} className="text-gray-500 hover:text-gray-700">
                                <Close />
                            </button>
                        )}
                        {includePolicyType && (
                            <div className="flex relative items-center">
                                <select
                                    onChange={handlePolicyChange}
                                    value={currentPolicyId}
                                    className="w-60 py-2 cursor-pointer appearance-none outline-none border p-2 rounded"
                                >
                                    {everyPolicyId.map(({ _id, policyName }, index) => (
                                        <option key={index} value={_id}>
                                            {policyName}
                                        </option>
                                    ))}
                                </select>
                                <ExpandMore className="absolute right-1 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    <FormContainer>
                        <form onSubmit={handleSubmit}>
                            <Fade in={activeStep === 0} timeout={500} style={{ display: activeStep === 0 ? "block" : "none" }}>
                                <div>
                                    <section className="mb-4">
                                        <h3 className="block text-sm font-medium text-[#01978B] mb-2">Personal Details</h3>
                                        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4"} gap-2`}>
                                            <TextField
                                                label="First Name"
                                                type="text"
                                                name="firstName"
                                                required={true}
                                                InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                                                value={formData.personalDetails?.firstName}
                                                onChange={(e) => handleChange(e, "personalDetails")}
                                                disabled={disable ? ((initialClientData?.personalDetails?.firstName && initialClientData?.personalDetails?.firstName?.trim() !== '') ? true : false) : false}
                                            />
                                            <TextField
                                                label="Last Name"
                                                type="text"
                                                name="lastName"
                                                value={formData.personalDetails?.lastName}
                                                onChange={(e) => handleChange(e, "personalDetails")}
                                                disabled={disable ? ((initialClientData?.personalDetails?.lastName && initialClientData?.personalDetails?.lastName?.trim() !== '') ? true : false) : false}
                                            />
                                            <TextField
                                                type="date"
                                                name="dob"
                                                required={true}
                                                InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                                                value={formData.personalDetails?.dob ? formData.personalDetails?.dob.split("T")[0] : ""}
                                                onChange={(e) => handleChange(e, "personalDetails")}
                                                disabled={disable ? ((
                                                    (initialClientData.personalDetails?.dob ? initialClientData.personalDetails?.dob.split("T")[0] : "") &&
                                                    (formData.personalDetails?.dob ? formData.personalDetails?.dob.split("T")[0] : ""))
                                                    ? true : false) : false
                                                }
                                            />
                                            <TextField
                                                select
                                                label="Gender"
                                                name="gender"
                                                value={formData.personalDetails?.gender}
                                                onChange={(e) => handleChange(e, "personalDetails")}
                                                disabled={disable ? ((initialClientData?.personalDetails?.gender && initialClientData?.personalDetails?.gender?.trim() !== '') ? true : false) : false}
                                            >
                                                <MenuItem value="Male">Male</MenuItem>
                                                <MenuItem value="Female">Female</MenuItem>
                                                <MenuItem value="Other">Other</MenuItem>
                                            </TextField>
                                        </div>
                                        <div className={` mt-2 grid ${isMobile ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-2"} gap-2`}>
                                            <TextField
                                                label="Email"
                                                type="email"
                                                name="email"
                                                required={true}
                                                InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                                                value={formData.personalDetails?.contact?.email}
                                                onChange={(e) => handleChange(e, "personalDetails", "contact")}
                                                disabled={disable ? ((initialClientData?.personalDetails?.contact?.email && initialClientData?.personalDetails?.contact?.email?.trim() !== '') ? true : false) : false}
                                            />
                                            <TextField
                                                label="Phone (excluding +91)"
                                                type="tel"
                                                name="phone"
                                                required={true}
                                                InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                                                value={formData.personalDetails?.contact?.phone}
                                                onChange={(e) => handleChange(e, "personalDetails", "contact")}
                                                disabled={disable ? ((initialClientData?.personalDetails?.contact?.phone && initialClientData?.personalDetails?.contact?.phone?.trim() !== '') ? true : false) : false}
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <h4 className="block text-sm font-medium text-[#01978B] mb-2">Residence Details</h4>
                                            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-5"} gap-4`}>
                                                <TextField
                                                    label="Street"
                                                    type="text"
                                                    name="street"
                                                    value={formData.personalDetails?.address?.street}
                                                    onChange={(e) => handleChange(e, "personalDetails", "address")}
                                                />
                                                <TextField
                                                    label="City"
                                                    type="text"
                                                    name="city"
                                                    value={formData.personalDetails?.address?.city}
                                                    onChange={(e) => handleChange(e, "personalDetails", "address")}
                                                />
                                                <TextField
                                                    label="State"
                                                    type="text"
                                                    name="state"
                                                    value={formData.personalDetails?.address?.state}
                                                    onChange={(e) => handleChange(e, "personalDetails", "address")}
                                                />
                                                <TextField
                                                    label="Country"
                                                    type="text"
                                                    name="country"
                                                    value={formData.personalDetails?.address?.country}
                                                    onChange={(e) => handleChange(e, "personalDetails", "address")}
                                                />
                                                <TextField
                                                    label="PINCODE"
                                                    type="text"
                                                    name="pincode"
                                                    value={formData.personalDetails?.address?.pincode}
                                                    onChange={(e) => handleChange(e, "personalDetails", "address")}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <h4 className="block text-sm font-medium text-[#01978B] mb-2">Nominee Details</h4>
                                            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4"} gap-4`}>
                                                <TextField
                                                    label="Nominee Name"
                                                    type="text"
                                                    name="name"
                                                    value={formData.personalDetails?.nominee?.name}
                                                    onChange={(e) => handleChange(e, "personalDetails", "nominee")}
                                                />
                                                <TextField
                                                    label="Nominee Number"
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.personalDetails?.nominee?.phone}
                                                    onChange={(e) => handleChange(e, "personalDetails", "nominee")}
                                                />
                                                <TextField
                                                    type="date"
                                                    name="dob"
                                                    value={formData.personalDetails?.nominee?.dob}
                                                    onChange={(e) => handleChange(e, "personalDetails", "nominee")}
                                                />
                                                <TextField
                                                    select
                                                    label="Relation with Nominee"
                                                    name="relationship"
                                                    value={formData.personalDetails?.nominee?.relationship}
                                                    onChange={(e) => handleChange(e, "personalDetails", "nominee")}
                                                >
                                                    <MenuItem value="Spouse">Spouse</MenuItem>
                                                    <MenuItem value="Son">Son</MenuItem>
                                                    <MenuItem value="Daughter">Daughter</MenuItem>
                                                    <MenuItem value="Father">Father</MenuItem>
                                                    <MenuItem value="Mother">Mother</MenuItem>
                                                </TextField>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </Fade>
                            <Fade in={activeStep === 1} timeout={500} style={{ display: activeStep === 1 ? "block" : "none" }}>
                                <div>
                                    <section className="mb-4">
                                        <h3 className="block text-sm font-medium text-gray-700 mb-2">Financial Details</h3>
                                        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-4`}>
                                            <div className="flex gap-2 items-center">
                                                <TextField
                                                    label="PAN Card Number"
                                                    type="text"
                                                    name="panCardNo"
                                                    placeholder="PAN Card Number"
                                                    value={formData.financialDetails?.panCardNo}
                                                    onChange={(e) => handleChange(e, "financialDetails")}
                                                    className="w-full border p-2 rounded"
                                                />
                                                or
                                                {formData.financialDetails?.panCardURL ? (
                                                    <>
                                                        <Link
                                                            to={formData.financialDetails?.panCardURL}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-72 flex gap-2 justify-center items-center py-1 px-2 cursor-pointer rounded-md text-white bg-[#01978B]"
                                                        >
                                                            PAN Card
                                                            <OpenInNew className="!size-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={removeUploadFilePanCard}
                                                            className="w-80 py-1 px-2 flex gap-2 justify-center items-center rounded-md text-white bg-red-600"
                                                        >
                                                            Remove file
                                                            <Delete className="!size-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            name="panCard"
                                                            id="panCardFileUpload"
                                                            multiple={false}
                                                            accept=".pdf, image/*"
                                                            onChange={handleFileUpload}
                                                            className="border p-2 rounded opacity-0 absolute -z-10"
                                                        />
                                                        <div
                                                            onClick={handleFileUploadPanCard}
                                                            className="w-48 h-8 flex gap-2 justify-center items-center py-1 px-2 cursor-pointer rounded-md text-white bg-[#01978B]"
                                                        >
                                                            <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                                                                {files.panCard ? files.panCard?.name : "Upload PAN Card"}
                                                            </span>
                                                            <Upload className="!size-4" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 items-center justify-between">
                                                <TextField
                                                    label="Aadhar Number"
                                                    type="text"
                                                    name="aadhaarNo"
                                                    placeholder="Aadhaar Number"
                                                    value={formData.financialDetails?.aadhaarNo}
                                                    onChange={(e) => handleChange(e, "financialDetails")}
                                                    className="w-full border p-2 rounded"
                                                />
                                                or
                                                {formData.financialDetails?.aadhaarURL ? (
                                                    <>
                                                        <Link
                                                            to={formData.financialDetails?.aadhaarURL}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-72 flex gap-2 justify-center items-center py-1 px-2 cursor-pointer rounded-md text-white bg-[#01978B]"
                                                        >
                                                            Aadhaar
                                                            <OpenInNew className="!size-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={removeUploadFileAadhaar}
                                                            className="w-80 py-1 px-2 flex gap-2 justify-center items-center rounded-md text-white bg-red-600"
                                                        >
                                                            Remove file
                                                            <Delete className="!size-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            name="aadhaar"
                                                            id="aadhaarFileUpload"
                                                            multiple={false}
                                                            accept=".pdf, image/*"
                                                            onChange={handleFileUpload}
                                                            className="border p-2 rounded opacity-0 absolute -z-10"
                                                        />
                                                        <div
                                                            onClick={handleFileUploadAadhaar}
                                                            className="w-48 h-8 flex gap-2 justify-center items-center py-1 px-2 cursor-pointer rounded-md text-white bg-[#01978B]"
                                                        >
                                                            <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                                                                {files.aadhaar ? files.aadhaar?.name : "Upload Aadhaar"}
                                                            </span>
                                                            <Upload className="!size-4" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <h4 className="block text-sm font-medium text-gray-700 mb-2">Account Details</h4>
                                            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"} gap-4`}>
                                                <TextField
                                                    label="account No"
                                                    type="text"
                                                    name="accountNo"
                                                    placeholder="Account Number"
                                                    value={formData.financialDetails?.accountDetails?.accountNo}
                                                    onChange={(e) => handleChange(e, "financialDetails", "accountDetails")}
                                                    className="border p-2 rounded"
                                                />
                                                <TextField
                                                    label="IFSC CODE"
                                                    type="text"
                                                    name="ifscCode"
                                                    placeholder="IFSC Code"
                                                    value={formData.financialDetails?.accountDetails?.ifscCode}
                                                    onChange={(e) => handleChange(e, "financialDetails", "accountDetails")}
                                                    className="border p-2 rounded"
                                                />
                                                <TextField
                                                    label="BankName"
                                                    type="text"
                                                    name="bankName"
                                                    placeholder="Bank Name"
                                                    value={formData.financialDetails?.accountDetails?.bankName}
                                                    onChange={(e) => handleChange(e, "financialDetails", "accountDetails")}
                                                    className="border p-2 rounded"
                                                />
                                            </div>

                                            <p className="text-center">or</p>
                                            {formData.financialDetails?.accountDetails?.cancelledChequeURL ? (
                                                <div className="flex gap-2 justify-center">
                                                    <Link
                                                        to={formData.financialDetails?.accountDetails?.cancelledChequeURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-72 flex gap-2 justify-center items-center py-1 px-2 cursor-pointer rounded-md text-white bg-[#01978B]"
                                                    >
                                                        Cancelled Cheque
                                                        <OpenInNew className="!size-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={removeUploadFileCancelledCheque}
                                                        className="w-80 py-1 px-2 flex gap-2 justify-center items-center rounded-md text-white bg-red-600"
                                                    >
                                                        Remove file
                                                        <Delete className="!size-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <input
                                                        type="file"
                                                        name="cancelledCheque"
                                                        id="cancelledChequeFileUpload"
                                                        multiple={false}
                                                        accept=".pdf, image/*"
                                                        onChange={handleFileUpload}
                                                        className="border p-2 rounded opacity-0 absolute -z-10"
                                                    />
                                                    <div
                                                        onClick={handleFileUploadCancelledCheque}
                                                        className="w-full h-8 flex gap-2 justify-center items-center py-1 px-2 cursor-pointer rounded-md text-white bg-[#01978B]"
                                                    >
                                                        <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                                                            {files.cancelledCheque ? files.cancelledCheque?.name : "Upload Cancelled Cheque Image"}
                                                        </span>
                                                        <Upload className="!size-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                    {!excludeEmployementDetails && (
                                        <section className="mb-4">
                                            <h3 className="block text-sm font-medium text-gray-700 mb-2">Employment Details</h3>
                                            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"} gap-4`}>
                                                <TextField
                                                    label="Company Name"
                                                    type="text"
                                                    name="companyName"
                                                    placeholder="Company Name"
                                                    value={formData.employmentDetails?.companyName}
                                                    onChange={(e) => handleChange(e, "employmentDetails")}
                                                    className="border p-2 rounded"
                                                />
                                                <TextField
                                                    label="Designation"
                                                    type="text"
                                                    name="designation"
                                                    placeholder="Designation"
                                                    value={formData.employmentDetails?.designation}
                                                    onChange={(e) => handleChange(e, "employmentDetails")}
                                                    className="border p-2 rounded"
                                                />
                                                <TextField
                                                    label="Income"
                                                    type="text"
                                                    name="annualIncome"
                                                    placeholder="Annual Income"
                                                    value={formData.employmentDetails?.annualIncome}
                                                    onChange={(e) => handleChange(e, "employmentDetails")}
                                                    className="border p-2 rounded"
                                                />
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </Fade>
                            <div className={`w-full h-14 mt-5 ${isMobile ? "flex flex-col gap-2" : ""}`}>
                                {activeStep === 0 && (
                                    <div className="float-right">
                                        <Button variant="contained" onClick={handleNext} className="!bg-[#01978B]">
                                            Next
                                        </Button>
                                    </div>
                                )}{" "}
                                {activeStep === 1 && (
                                    <>
                                        <div className="float-left">
                                            <Button variant="outlined" onClick={handleBack} className="!text-[#01978B]">
                                                Back
                                            </Button>
                                        </div>
                                        <div className="float-right">
                                            <Button variant="contained" type="submit" className="!bg-[#01978B]">
                                                {label}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="relative">
                                {error && <span className="absolute -bottom-2 text-sm text-red-600">{error}</span>}
                            </div>
                        </form>
                    </FormContainer>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => {
                            return (
                                <Step
                                    key={index}
                                    sx={{
                                        "& .MuiStepLabel-root .Mui-completed": { color: "#111827" },
                                        "& .MuiStepLabel-root .Mui-active": { color: "#111827" },
                                        "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": { fill: "white" },
                                    }}
                                >
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            )
                        })}
                    </Stepper>
                </div>
            </div>
        </>
    )
}

export default UpdateProfileForm

