import { useContext, useState } from "react"
import { CircularProgress, TextField } from "@mui/material"
import { Phone, Mail, Facebook, Twitter } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import img from "../assets/cpic.jpeg"
// importing api end-points
import { requestCallbackViaWebsite } from "../api"
// importing contexts
import { ClientContext } from "../contexts/Client.context"
import { SnackBarContext } from "../contexts/SnackBar.context"

const ContactForm = () => {
  const navigate = useNavigate()
  const { isLoggedIn, condenseClientInfo } = useContext(ClientContext)
  const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext)

  const [formData, setFormData] = useState({
    firstName: condenseClientInfo?.firstName || "",
    lastName: condenseClientInfo?.lastName || "",
    email: condenseClientInfo?.email || "",
    phone: condenseClientInfo?.phone || "",
    message: "",
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (isLoggedIn) {
        await requestCallbackViaWebsite({ ...formData, clientId: condenseClientInfo._id })
      } else {
        await requestCallbackViaWebsite(formData)
      }
      navigate("/", { state: { status: "success", message: "Callback requested", time: new Date().getTime() } })
    } catch (error) {
      setSnackbarValue({ message: error?.response?.data.message, status: "error" })
      setSnackbarState(true)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-[90vh] relative bg-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#01978B]"></div>
        <div
          className="absolute inset-0 bg-white"
          style={{ clipPath: "polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)" }}
        />
      </div>

      {submitting && (
        <div className="fixed inset-0 !z-[1000] bg-black/10 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}
      <div className="relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 relative">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h1 className="text-3xl text-left font-semibold mb-4">Get In Touch</h1>
                <p className="text-gray-600 mb-8">We are here for you! How can we help?</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                      type="text"
                      label="First Name"
                      name="firstName"
                      placeholder="Enter your first name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                    />
                    <TextField
                      type="text"
                      label="Last Name"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <TextField
                    type="email"
                    label="Email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                  />
                  <TextField
                    type="tel"
                    label="Phone (excluding +91)"
                    name="phone"
                    placeholder="Enter your phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                  />
                  <TextField
                    name="message"
                    label="Message"
                    placeholder="Go ahead, we are listening..."
                    multiline
                    rows={3}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    InputLabelProps={{ sx: { ".MuiInputLabel-asterisk": { color: "red" } } }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400"
                  />
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-[#01978B] text-white py-3 rounded-lg hover:bg-white hover:text-[#01978B] transition duration-300"
                    >
                      Submit
                    </button>
                    <p className="text-sm mt-2 text-gray-600">
                      <span className="text-red-600">*</span> Mandatory fields
                    </p>
                  </div>
                </form>
              </div>

              <div className="relative flex flex-col items-center justify-center">
                <div className="mb-8 transition-all duration-500 ease-in-out transform hover:scale-105">
                  <img
                    src={img || "/placeholder.svg"}
                    alt="Contact illustration"
                    className="w-full max-w-[300px] rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] shadow-lg transition-all duration-300 hover:rounded-[50%] hover:shadow-xl"
                  />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-gray-600">
                    <Phone className="text-[#111827]" />
                    <span>+91-9876543210</span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <Mail className="text-[#111827]" />
                    <span>support@parasfinancials.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-[#111827] rounded-l-lg p-2 space-y-4">
            <a
              href="https://www.facebook.com/share/15cwJAS29V/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white hover:text-gray-300 transition-colors duration-300"
            >
              <Facebook />
            </a>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactForm

