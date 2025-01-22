"use client"

import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Fade, Slide, Zoom } from "@mui/material"
import { Mail, Phone, Language } from "@mui/icons-material"
import img from "../assets/ab1.jpeg"
import img2 from "../assets/ab2.jpeg"

const AboutUs = () => {
  const parallaxRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.5}px)`
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e1faf8]">
      <div className="relative z-10">
        <Fade in timeout={1000}>
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12">
              <Slide direction="down" in timeout={1000}>
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-900">
                  Welcome to Paaras Financials
                </h1>
              </Slide>

              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <Fade in timeout={1500}>
                    <div className="prose max-w-none">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        At Paaras Financials, we believe in safeguarding your financial future and empowering you with
                        tailored solutions that ensure wealth creation, stability, and peace of mind. Led by Mrs. Indu
                        Jain, a seasoned financial advisor with over 16 years of experience, we are committed to helping
                        individuals, families, and businesses achieve their financial goals.
                      </p>
                    </div>
                  </Fade>
                  <Zoom in timeout={1500}>
                    <div className="relative h-[300px] rounded-xl overflow-hidden transform transition-transform hover:scale-105 duration-500">
                      <img
                        src={img}
                        alt="Professional Financial Advisor"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  </Zoom>
                </div>

                <Slide direction="right" in timeout={1500}>
                  <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="order-2 md:order-1">
                        <Zoom in timeout={2000}>
                          <div className="relative h-[400px] rounded-xl overflow-hidden transform transition-transform hover:scale-105 duration-500">
                            <img
                              src={img2}
                              alt="Financial Success"
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          </div>
                        </Zoom>
                      </div>
                      <div className="order-1 md:order-2">
                        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900">Meet Mrs. Indu Jain</h2>
                        <p className="text-gray-700 mb-6">
                          With a career spanning over two decades, Mrs. Indu Jain combines business acumen and financial
                          expertise to deliver unparalleled advisory services. Her journey from managing a successful
                          fashion studio, BE BANI THANI, to becoming the founder of Paaras Financials showcases her
                          dedication to excellence and innovation.
                        </p>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Professional Background</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                              <li>Financial Advisor specializing in wealth creation</li>
                              <li>15+ years consulting experience (2008–Present)</li>
                              <li>Former owner of BE BANI THANI (2000–2018)</li>
                              <li>JBN Convener, North Zone, JITO</li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
                            <p className="text-gray-700">
                              To provide clients with comprehensive financial strategies that ensure security and
                              growth.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Slide>

                <Zoom in timeout={2000}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#01978B]/10 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">Our Values</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">
                            Integrity: Building trust through honesty and transparency
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">Customer-First Approach: Prioritizing your unique needs</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">Professional Excellence: Delivering expert guidance</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">Innovation: Adapting to changing financial landscapes</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-[#01978B]/10 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">Why Choose Paaras Financials?</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">16+ Years of Expertise in financial planning</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">Comprehensive Solutions for all needs</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">24/7 Support for your peace of mind</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-[#01978B] font-bold">•</span>
                          <span className="text-gray-700">Competitive Rates without quality compromise</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Zoom>

                <Slide direction="up" in timeout={2000}>
                  <div className="bg-gray-900 text-white rounded-xl p-8">
                    <h3 className="text-2xl font-semibold mb-4">Message from Mrs. Indu Jain</h3>
                    <blockquote className="italic text-gray-300">
                      "When you give joy to other people, you get more joy in return. You should give a good thought to the happiness that you can give out."
                    </blockquote>
                  </div>
                </Slide>

                <Fade in timeout={2500}>
                  <div className="bg-[#01978B] text-white rounded-xl p-8">
                    <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-3">
                        <Phone className="text-white" />
                        <a href="tel:+919313333610" className="hover:underline">
                          +91-9313333610
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="text-white" />
                        <a href="mailto:investatparas@gmail.com" className="hover:underline">
                          investatparas@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Language className="text-white" />
                        <span>Health & Wealth Assured</span>
                      </div>
                    </div>
                  </div>
                </Fade>

                <div className="flex justify-center">
                  <Link
                    to="/contactUs"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#01978B] hover:bg-white hover:text-[#01978B] hover:border-[#01978B] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01978B]"
                  >
                    Get Started Today
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  )
}

export default AboutUs

