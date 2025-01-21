import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className='bg-[#01978B] text-white pt-12 pb-4 px-4 md:px-40 relative z-10'>
            <div className='mx-auto'>
                <div className='grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8'>
                    <div>
                        <h5 className='font-bold text-md sm:text-xl mb-4'>Paaras Financials</h5>
                        <ul className='sm:space-y-2'>
                            <li><a href='#' className='text-xs sm:text-md hover:text-black'>Home</a></li>
                            <li><Link to='/aboutUs' className='text-xs sm:text-md hover:text-black'>About Us</Link></li>
                            <li><Link to='/contactUs' className='text-xs sm:text-md hover:text-black'>Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className='font-bold text-md sm:text-xl mb-4'>Our Solutions</h5>
                        <ul className='sm:space-y-2'>
                            <li><a href='/#productsAndServices' className='text-xs sm:text-md hover:text-black'>Products & Services</a></li>
                            <li>
                                <Link to='/sip' className='text-xs sm:text-md hover:text-black'>
                                    Start a SIP
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h5 className='font-bold text-md sm:text-xl mb-4'>Support</h5>
                        <ul className='sm:space-y-2'>
                            <li className='text-xs sm:text-md py-1 hover:text-black'>+91 9876543210</li>
                            <li className='text-xs sm:text-md py-1 hover:text-black'>support@paarasfinancials.com</li>
                        </ul>
                    </div>
                </div>
                <div className='mt-8 pt-4 border-t text-center border-gray-700'>
                    <p className='text-black text-sm'>
                        Designed and built with all the love in the world by the RASH Technologies team.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;