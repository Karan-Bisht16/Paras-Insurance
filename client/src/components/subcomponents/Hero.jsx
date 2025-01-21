import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Fade } from "@mui/material"
// importing contexts
import { ClientContext } from "../../contexts/Client.context"
import img from "../../assets/fronthome.jpeg"

const Hero = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useContext(ClientContext)

  return (
    <section className="pb-8 md:pb-12">
      <div className="px-4 md:px-40">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 pr-3 py-1 text-sm text-primary">
              Comprehensive Coverage
            </div>
            <h1 className="text-4xl font-thin tracking-tighter">
              Protecting your future with <span className="font-semibold">Paaras</span>
            </h1>
            <p className="max-w-[600px] text-[#97503A] md:text-lg">
              Secure your tomorrow with tailored insurance solutions for every aspect of your life.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {isLoggedIn ? (
                <a
                  href="#productsAndServices"
                  className="px-4 py-1 font-semibold text-lg rounded-md text-white bg-[#01978B] border-white hover:opacity-95"
                >
                  Get Started
                </a>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="px-4 py-1 font-semibold text-lg rounded-md text-white bg-[#01978B] border-white hover:opacity-95"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
          <Fade in timeout={1000}>
            <img
              src={img || "/placeholder.svg"}
              alt="Insurance Protection Concept"
              className="w-[612px] h-[256px] object-cover rounded-lg"
            />
          </Fade>
        </div>
      </div>
    </section>
  )
}

export default Hero

