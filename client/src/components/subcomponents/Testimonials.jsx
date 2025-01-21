import { Star } from '@mui/icons-material';
// importing content
import content from "../../content.json";

const Testimonials = () => {
    const reviews = content['reviews'];

    return (
        <section className='py-12 md:py-16 bg-[#e1faf8]'>
            <div className='px-4 md:px-20 lg:px-40'>
                <h2 className='text-3xl font-bold text-left mb-8'>What Our Clients Are Saying</h2>
                <div className='grid gap-8 md:grid-cols-3'>
                    {reviews.map(({ clientName, review }, index) => (
                        <div key={index} className='bg-white p-6 rounded-lg shadow-sm'>
                            <div className='flex items-center gap-4 mb-4'>
                                <div className='size-12 md:size-6 lg:size-12 rounded-full overflow-hidden'>
                                    <img
                                        src='https://static.thenounproject.com/png/363640-200.png'
                                        alt={clientName}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div>
                                    <h3 className='font-semibold'>{clientName}</h3>
                                    <div className='flex gap-1'>
                                        {[...Array(5)].map((_, index) => (
                                            <Star key={index} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className='text-gray-600 text-sm'>
                                {review}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials;