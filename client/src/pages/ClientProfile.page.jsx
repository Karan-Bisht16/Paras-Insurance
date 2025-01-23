import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Button, Divider } from "@mui/material"
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  timelineOppositeContentClasses,
  TimelineSeparator,
} from "@mui/lab"
import { Delete, Edit, ExpandMore, Female, Male, OpenInNew } from "@mui/icons-material"
import { tailChase } from "ldrs"
// importing api end-points
import { deleteProfile, fetchProfileData, updateProfile, uploadProfileMedia } from "../api"
// importing contexts
import { ClientContext } from "../contexts/Client.context"
// importing components
import Footer from "../components/Footer"
import UpdateProfileForm from "../components/UpdateProfileForm"
import { Badge } from "../components/subcomponents/Badge"
import { ScrollArea } from "../components/subcomponents/ScrollArea"
// importing helper functions
import { toFormattedDate, toFormattedTime } from "../utils/helperFunctions"

const ClientProfile = () => {
  const { id } = useParams()

  const navigate = useNavigate()
  const { setIsLoggedIn, condenseClientInfo, setCondenseClientInfo } = useContext(ClientContext)
  const [isLoadingClientData, setIsLoadingClientData] = useState(true)
  const [isUnauthorisedAction, setIsUnauthorisedAction] = useState(false)
  const [isClientDataFound, setIsClientDataFound] = useState(true)
  const [clientData, setClientData] = useState({})

  const getClientData = async () => {
    try {
      const { data } = await fetchProfileData({ clientId: id })
      setClientData(data)
      setIsLoadingClientData(false)
    } catch (error) {
      const { status } = error
      const errorMessage = error?.response?.data?.message
      if (status === 400 && errorMessage === "Unauthorised action.") {
        setIsLoadingClientData(false)
        setIsUnauthorisedAction(true)
      } else if (status === 404 && errorMessage === "No client found.") {
        setIsLoadingClientData(false)
        setIsClientDataFound(false)
      } else {
        console.error(error)
      }
    }
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    getClientData()
  }, [id])

  const handleDelete = async () => {
    try {
      await deleteProfile()
      setIsLoggedIn(false)
      setCondenseClientInfo(null)
      navigate("/")
    } catch (error) {
      console.error(error)
    }
  }

  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false)
  const openUpdateProfile = () => {
    setIsUpdateProfileOpen(true)
  }
  const closeUpdateProfile = () => {
    setIsUpdateProfileOpen(false)
  }
  const handleUpdate = async (formData, removedFiles, files) => {
    try {
      const { status, data } = await updateProfile({ formData, removedFiles })
      const updatedClientData = data
      if (status === 200) {
        setClientData(updatedClientData)
        const { status, data } = await uploadProfileMedia({ ...files, clientId: clientData._id })
        setClientData(data)
        if (status === 200) {
          return false
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message
      return errorMessage
    }
  }

  tailChase.register()

  return (
    <div>
      {isLoadingClientData ? (
        <div className="min-h-screen flex justify-center items-center">
          <l-tail-chase size="40" speed="1.75" color="#111827" />
        </div>
      ) : isUnauthorisedAction ? (
        <div className="flex flex-col justify-center items-center my-16">
          <lord-icon
            src="https://cdn.lordicon.com/dicvhxpz.json"
            trigger="morph"
            stroke="bold"
            state="morph-cross"
            colors="primary:#111827,secondary:#111827"
            style={{ width: "250px", height: "250px" }}
          />
          <p className="text-3xl font-semibold text-gray-900">Unauthorised action performed</p>
        </div>
      ) : !isClientDataFound ? (
        <div className="flex flex-col justify-center items-center my-16">
          <lord-icon
            src="https://cdn.lordicon.com/hwjcdycb.json"
            trigger="hover"
            colors="primary:#111827,secondary:#111827"
            style={{ width: "250px", height: "250px" }}
          />
          <p className="text-3xl font-semibold text-gray-900">No client found</p>
        </div>
      ) : (
        <div className="py-12 px-4 sm:px-16 bg-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[#01978B]"></div>
            <div
              className="absolute inset-0 bg-white"
              style={{ clipPath: "polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)" }}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between relative bg-white/95 py-4 px-6 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-4 sm:mb-0">
              <Avatar className="!w-24 !h-24 sm:!w-32 sm:!h-32 border-4 border-gray-900" />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-semibold">
                  {clientData?.personalDetails?.firstName} {clientData?.personalDetails?.lastName}
                </h1>
                <h3 className="text-base sm:text-lg text-gray-600">
                  {clientData?.personalDetails?.contact?.email}
                  <br />
                  +91-{clientData?.personalDetails?.contact?.phone}
                </h3>
              </div>
            </div>
            {!(
              condenseClientInfo?.role?.toLowerCase() === "admin" && clientData?.userType?.toLowerCase() === "employee"
            ) && (
              <Button
                variant="contained"
                onClick={openUpdateProfile}
                className="flex items-center gap-2.5 !bg-[#01978B] hover:opacity-95 w-full sm:w-auto"
              >
                Update
                <Edit className="!size-4" />
              </Button>
            )}
          </div>
          <div className="relative mt-4 rounded-3xl">
            <Accordion
              defaultExpanded
              className="!bg-white/95 !mb-0 !border-b-2 !border-gray-600 !rounded-t-xl !shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]"
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <p className="text-xl sm:text-2xl font-semibold px-2 pt-1">Personal Details</p>
              </AccordionSummary>
              <Divider />
              <AccordionDetails className="!px-4 sm:!px-8 !py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">First Name</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.personalDetails?.firstName}&nbsp;</p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Last Name</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.personalDetails?.lastName}&nbsp;</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Email</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.personalDetails?.contact?.email}&nbsp;</p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Phone</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      +91-{clientData?.personalDetails?.contact?.phone}&nbsp;
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {toFormattedDate(clientData?.personalDetails?.dob)}&nbsp;
                    </p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Gender</h3>
                    <p className="border-2 rounded-lg px-2 py-1 flex items-center gap-2">
                      {clientData?.personalDetails?.gender}
                      {clientData?.personalDetails?.gender === "Male" ? <Male /> : <Female />}
                      &nbsp;
                    </p>
                  </div>
                  <div className="w-full mt-6 flex items-center gap-2">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">KYC</h3>
                    <p className="px-2 py-1 flex items-center">
                      {clientData?.KYC ? <Badge label="Uploaded" status="good" /> : <Badge label="NA" status="bad" />}
                    </p>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              defaultExpanded
              className="!bg-white/95 !mt-0 !mb-0 !border-b-2 !border-gray-600 !shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]"
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <p className="text-xl sm:text-2xl font-semibold px-2 pt-1">Residence Details</p>
              </AccordionSummary>
              <Divider />
              <AccordionDetails className="!px-4 sm:!px-8 !py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Street</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {clientData?.personalDetails?.address?.street}&nbsp;
                    </p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">City</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.personalDetails?.address?.city}&nbsp;</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">State</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.personalDetails?.address?.state}&nbsp;</p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Country</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {clientData?.personalDetails?.address?.country}&nbsp;
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full sm:w-1/2">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">PINCODE</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {clientData?.personalDetails?.address?.pincode}&nbsp;
                    </p>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              defaultExpanded
              className="!bg-white/95 !mt-0 !mb-0 !border-b-2 !border-gray-600 !shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]"
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <p className="text-xl sm:text-2xl font-semibold px-2 pt-1">Nominee Details</p>
              </AccordionSummary>
              <Divider />
              <AccordionDetails className="!px-4 sm:!px-8 !py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.personalDetails?.nominee?.name}&nbsp;</p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Nominee Phone</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      +91-{clientData?.personalDetails?.nominee?.phone}&nbsp;
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Nominee DoB</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.personalDetails?.nominee?.dob}&nbsp;</p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Relationship with Nominee</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {clientData?.personalDetails?.nominee?.relationship}&nbsp;
                    </p>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              defaultExpanded
              className="!bg-white/95 !mt-0 !mb-0 !border-b-2 !border-gray-600 !shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]"
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <p className="text-xl sm:text-2xl font-semibold px-2 pt-1">Financial Details</p>
              </AccordionSummary>
              <Divider />
              <AccordionDetails className="!px-4 sm:!px-8 !py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <p className="w-full border-2 rounded-lg px-2 py-1">
                        {clientData?.financialDetails?.panCardNo}&nbsp;
                      </p>
                      {clientData?.financialDetails?.panCardURL ? (
                        <Link
                          to={clientData?.financialDetails?.panCardURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-72 py-1 px-2 rounded-md text-white bg-gray-900 hover:opacity-95"
                        >
                          <div className="flex gap-2 items-center justify-center">
                            Uploaded PAN Card
                            <OpenInNew className="!size-4" />
                          </div>
                        </Link>
                      ) : (
                        <p className="w-full sm:w-72 py-1 px-2 rounded-md text-center text-white bg-red-600 hover:opacity-95">
                          No PAN Card Uploaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Aadhaar</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <p className="w-full border-2 rounded-lg px-2 py-1">
                        {clientData?.financialDetails?.aadhaarNo}&nbsp;
                      </p>
                      {clientData?.financialDetails?.aadhaarURL ? (
                        <Link
                          to={clientData?.financialDetails?.aadhaarURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-72 py-1 px-2 rounded-md text-white bg-gray-900 hover:opacity-95"
                        >
                          <div className="flex gap-2 items-center justify-center">
                            Uploaded Aadhaar
                            <OpenInNew className="!size-4" />
                          </div>
                        </Link>
                      ) : (
                        <p className="w-full sm:w-72 py-1 px-2 rounded-md text-center text-white bg-red-600 hover:opacity-95">
                          No Aadhaar Uploaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {clientData?.financialDetails?.accountDetails?.accountNo}&nbsp;
                    </p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {clientData?.financialDetails?.accountDetails?.ifscCode}&nbsp;
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Bank Name</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      {clientData?.financialDetails?.accountDetails?.bankName}&nbsp;
                    </p>
                  </div>
                  <div className="w-full flex items-end">
                    {clientData?.financialDetails?.accountDetails?.cancelledChequeURL ? (
                      <Link
                        to={clientData?.financialDetails?.accountDetails?.cancelledChequeURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1 px-2 rounded-md text-white bg-gray-900 hover:opacity-95"
                      >
                        <div className="flex gap-2 items-center justify-center">
                          Uploaded Cancelled Cheque
                          <OpenInNew className="!size-4" />
                        </div>
                      </Link>
                    ) : (
                      <p className="w-full py-1 px-2 rounded-md text-center text-white bg-red-600 hover:opacity-95">
                        No Cancelled Cheque Image Uploaded
                      </p>
                    )}
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              defaultExpanded
              className="!bg-white/95 !mt-0 !rounded-b-xl !shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]"
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <p className="text-xl sm:text-2xl font-semibold px-2 pt-1">Employment Details</p>
              </AccordionSummary>
              <Divider />
              <AccordionDetails className="!px-4 sm:!px-8 !py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Company Name</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.employmentDetails?.companyName}&nbsp;</p>
                  </div>
                  <div className="w-full">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Designation</h3>
                    <p className="border-2 rounded-lg px-2 py-1">{clientData?.employmentDetails?.designation}&nbsp;</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                  <div className="w-full sm:w-1/2">
                    <h3 className="block text-sm font-medium text-gray-700 mb-1">Annual Income</h3>
                    <p className="border-2 rounded-lg px-2 py-1">
                      ₹ {clientData?.employmentDetails?.annualIncome}&nbsp;
                    </p>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
          <div className="relative bg-white/95 py-4 px-6 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] mt-8">
            <h1 className="text-2xl sm:text-3xl text-left font-semibold mb-4">Interaction History</h1>
            <div className="px-2 sm:px-4 py-6">
              {clientData?.interactionHistory?.length === 0 && (
                <div className="bg-gray-100 px-4 py-2 rounded-md">No prior interaction history</div>
              )}
              <ScrollArea className="h-[50vh]">
                <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: { xs: 0.5, sm: 0.2 } } }}>
                  {clientData?.interactionHistory?.map(({ timestamp, type, description }, index) => (
                    <TimelineItem key={index} className="!p-0" sx={{ p: 0 }}>
                      <TimelineOppositeContent
                        color="textSecondary"
                        className="!flex !justify-end !mr-2 !items-center !pl-0 !text-xs sm:!text-sm"
                      >
                        {toFormattedDate(timestamp)} :: {toFormattedTime(timestamp)}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <div className="bg-gray-100 ml-2 px-4 py-2 rounded-md text-sm">
                          <p>
                            <strong>Type:</strong>&nbsp;{type}
                          </p>
                          <p>
                            <strong>Description:</strong>&nbsp;{description}
                          </p>
                        </div>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
      {isUpdateProfileOpen && (
        <UpdateProfileForm
          clientData={clientData}
          closeUpdateProfile={closeUpdateProfile}
          onSubmit={handleUpdate}
          label="Update Details"
        />
      )}
      <Footer />
    </div>
  )
}

export default ClientProfile

