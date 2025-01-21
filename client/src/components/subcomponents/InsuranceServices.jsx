import { BusinessRounded, FavoriteBorder, ShieldOutlined } from "@mui/icons-material"
import { Fade } from "@mui/material"
import img from "../../assets/frontdown.jpeg"

const InsuranceServices = () => {
  return (
    <section className="py-8 md:py-16">
      <div className="container px-4 md:px-40">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr]">
          <Fade in timeout={1000}>
            <img
              src={img || "/placeholder.svg"}
              alt="Family Protection Illustration"
              width={600}
              height={400}
              className="w-full h-full object-cover rounded-xl"
            />
          </Fade>
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Insurance Services</h2>
              <p className="text-gray-500">
                Comprehensive coverage options tailored to protect what matters most to you.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FavoriteBorder className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Life/Health Coverage</h3>
                  <p className="text-sm text-gray-500">
                    Protect yourself and your loved ones with our comprehensive health plans.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <BusinessRounded className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">BusinessRounded Coverage</h3>
                  <p className="text-sm text-gray-500">
                    Secure your business assets and operations with tailored insurance solutions.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <ShieldOutlined className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Comprehensive Coverage</h3>
                  <p className="text-sm text-gray-500">
                    Comprehensive, all-in-one protection for your ultimate peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InsuranceServices

