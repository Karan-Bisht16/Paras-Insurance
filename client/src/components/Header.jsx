import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import img from "../assets/name.png"
import {
    Avatar,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Tooltip,
    Fade,
    Zoom,
} from "@mui/material"
import { AccountCircle, Assignment, Logout, Password, Upload } from "@mui/icons-material"
// importing api end-points
import { forgotPassword, logout, uploadExisitingClientPolicy, uploadExisitingClientPolicyMedia } from "../api"
// importing contexts
import { ClientContext } from "../contexts/Client.context"
import { SnackBarContext } from "../contexts/SnackBar.context"
import AssignPolicyModal from "./subcomponents/AssignPolicyModal"

const Header = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { isLoggedIn, setIsLoggedIn, condenseClientInfo, setCondenseClientInfo } = useContext(ClientContext)
    const { setSnackbarValue, setSnackbarState } = useContext(SnackBarContext)

    const [anchorElement, setAnchorElement] = useState(null)
    const openMenu = Boolean(anchorElement)
    const handleMenuClick = (event) => {
        setAnchorElement(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAnchorElement(null)
    }

    const handleAuthNavigate = async () => {
        handleMenuClose()
        navigate("/auth")
    }

    const handleProfileNavigate = async () => {
        handleMenuClose()
        navigate(`/profile/${condenseClientInfo._id}`)
    }

    const handleMyPoliciesNavigate = async () => {
        handleMenuClose()
        navigate(`/policies/${condenseClientInfo._id}`)
    }

    const [resetPasswordRequested, setResetPasswordRequested] = useState(false)
    const handleResetPassword = async () => {
        setResetPasswordRequested(true)
        await forgotPassword({ email: condenseClientInfo.email })
        setSnackbarValue({ message: `Reset password link to ${condenseClientInfo.email}`, status: "success" })
        setSnackbarState(true)
        handleMenuClose()
        setResetPasswordRequested(false)
    }

    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        firstName: condenseClientInfo?.firstName,
        lastName: condenseClientInfo?.lastName,
        email: condenseClientInfo?.email,
        phone: condenseClientInfo?.phone,
        expiryDate: "",
        policyNo: "",
    })
    const handleFormDataChange = (event) => {
        const { name, value } = event.target
        setFormData((prevFormData) => {
            return { ...prevFormData, [name]: value }
        })
    }
    const [policyDocument, setPolicyDocument] = useState("")
    const handleDocumentUpload = (event) => {
        const file = event.target.files[0]
        setPolicyDocument((prevFiles) => {
            return { ...prevFiles, policyDocument: file }
        })
    }

    const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] = useState(false)
    const openAssignPolicyModal = () => {
        handleMenuClose()
        setIsAssignPolicyModalOpen(true)
    }
    const closeAssignPolicyModal = () => {
        setIsAssignPolicyModalOpen(false)
        setPolicyDocument("")
        setFormData((prevFormData) => {
            return { ...prevFormData, expiryDate: "", policyNo: "" }
        })
    }
    const handleUploadPolicy = async () => {
        event.preventDefault()
        setError("")
        try {
            const { data } = await uploadExisitingClientPolicy({ formData })
            await uploadExisitingClientPolicyMedia({ ...policyDocument, clientPolicyId: data?._id })
            setSnackbarValue({ message: "Policy Uploaded!", status: "success" })
            setSnackbarState(true)
            closeAssignPolicyModal()
        } catch (error) {
            setError(error?.response?.data?.message)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            setIsLoggedIn(false)
            setCondenseClientInfo(null)
            handleMenuClose()
            navigate("/", { state: { status: "success", message: "Logout successfully!", time: new Date().getTime() } })
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (location.state && location.state.status) {
            const arrivalTime = location.state.time
            const now = new Date().getTime()
            if (now - arrivalTime < 5000) {
                setSnackbarValue({ message: location.state.message, status: location.state.status })
                setSnackbarState(true)
            }
        }
    }, [location.state, setSnackbarValue, setSnackbarState])

    return (
        <>
            <header className="relative top-0 left-0 right-0 z-50 bg-[#01978B] text-white border-b border-gray-800">
                <div className="flex h-16 px-8 items-center justify-between">
                    {(!isLoggedIn ||
                        !(
                            (condenseClientInfo.role?.toLowerCase() === "admin" ||
                                condenseClientInfo.role?.toLowerCase() === "superadmin") &&
                            location.pathname === "/"
                        )) && (
                            <Link to="/" className="font-semibold text-xl flex items-center gap-2 ">
                                <Zoom in={true} timeout={800}>
                                    <img
                                        src={img}
                                        alt="Paaras Financials Logo"
                                        className="h-12 w-auto"
                                    />
                                </Zoom>
                                <Fade in={true} timeout={1000}>
                                    <span></span>
                                </Fade>
                            </Link>


                        )}
                    <nav className="hidden md:flex !gap-8 pr-28">
                        {(!isLoggedIn ||
                            !(
                                condenseClientInfo.role?.toLowerCase() === "admin" ||
                                condenseClientInfo.role?.toLowerCase() === "superadmin"
                            )) && (
                                <>
                                    <Link to="/" className="text-sm hover:opacity-95">
                                        Policies
                                    </Link>
                                    <Link to="/sip" className="text-sm hover:opacity-95">
                                        Invest in SIP
                                    </Link>
                                    <Link to="/aboutUs" className="text-sm hover:opacity-95">
                                        About Us
                                    </Link>
                                    <Link to="/contactUs" className="text-sm hover:opacity-95">
                                        Contact Us
                                    </Link>
                                </>
                            )}
                    </nav>
                    {isLoggedIn ? (
                        <div>
                            <div className="flex gap-2 items-center justify-center hover:opacity-95">
                                <Tooltip title="Account settings">
                                    <IconButton
                                        onClick={handleMenuClick}
                                        size="small"
                                        aria-controls={openMenu ? "account-menu" : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={openMenu ? "true" : undefined}
                                    >
                                        {condenseClientInfo.avatar ?
                                            <img src={condenseClientInfo.avatar} className="!w-8 !h-8 object-cover rounded-full" />
                                            :
                                            <Avatar className="!w-8 !h-8 !text-gray-900">
                                                {condenseClientInfo.firstName?.charAt(0)}
                                            </Avatar>
                                        }
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <Menu
                                anchorEl={anchorElement}
                                id="account-menu"
                                open={openMenu}
                                onClose={handleMenuClose}
                                slotProps={{
                                    paper: {
                                        elevation: 0,
                                        sx: {
                                            overflow: "visible",
                                            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                            mt: 1.5,
                                            "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
                                            "&::before": {
                                                content: `''`,
                                                display: "block",
                                                position: "absolute",
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: "background.paper",
                                                transform: "translateY(-50%) rotate(45deg)",
                                                zIndex: 0,
                                            },
                                        },
                                    },
                                }}
                                transformOrigin={{ horizontal: "right", vertical: "top" }}
                                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            >
                                <MenuItem onClick={handleProfileNavigate}>
                                    <ListItemIcon>
                                        <AccountCircle fontSize="medium" className="text-[#97503A]" />
                                    </ListItemIcon>
                                    My Profile
                                </MenuItem>
                                <MenuItem onClick={handleMyPoliciesNavigate}>
                                    <ListItemIcon>
                                        <Assignment fontSize="small" className="text-[#97503A]" />
                                    </ListItemIcon>
                                    My Policies & SIP
                                </MenuItem>
                                <MenuItem onClick={openAssignPolicyModal}>
                                    <ListItemIcon>
                                        <Upload fontSize="small" className="text-[#97503A]" />
                                    </ListItemIcon>
                                    Upload Existing Policy
                                </MenuItem>
                                <MenuItem onClick={handleResetPassword}>
                                    <ListItemIcon>
                                        {resetPasswordRequested ? (
                                            <CircularProgress className="!size-5" />
                                        ) : (
                                            <Password fontSize="small" className="text-[#97503A]" />
                                        )}
                                    </ListItemIcon>
                                    Reset Password
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" className="text-[#97503A]" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        <Button onClick={handleAuthNavigate} className="!text-gray-900 !bg-white !font-semibold">
                            Login
                        </Button>
                    )}
                </div>
            </header>
            {resetPasswordRequested && <div className="fixed !z-[2000] inset-0 bg-black/10"></div>}
            {isAssignPolicyModalOpen && (
                <AssignPolicyModal
                    closeAssignPolicyModal={closeAssignPolicyModal}
                    onSubmit={handleUploadPolicy}
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onDocumentUpload={handleDocumentUpload}
                    tabIndex={3}
                    error={error}
                />
            )}
        </>
    )
}

export default Header

