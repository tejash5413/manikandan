import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function TestimonialsSlider() {
    const testimonials = [
        {
            type: 'video',
            url: 'https://www.youtube.com/embed/OyK-DAafgN8',
            title: 'Student Review 1'
        },
        {
            type: 'video',
            url: 'https://www.youtube.com/embed/sXM_sQlFYrA',
            title: 'Student Review 2'
        },
        {
            type: 'image',
            url: '/images/testimonial1.jpg',
            title: 'Photo Feedback'
        },
        {
            type: 'image',
            url: '/images/testimonial2.jpg',
            title: 'Happy Student'
        }
    ];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false
    };

    return (
        <div className="my-5" data-aos="fade-up">
            <h4 className="text-center mb-3">Student Testimonials</h4>
            <Slider {...settings}>
                {testimonials.map((item, idx) => (
                    <div key={idx} className="text-center">
                        {item.type === 'video' ? (
                            <div className="ratio ratio-16x9">
                                <iframe
                                    src={item.url}
                                    title={item.title}
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <img
                                src={item.url}
                                alt={item.title}
                                className="img-fluid rounded shadow"
                                style={{ maxHeight: '400px', objectFit: 'cover', margin: '0 auto' }}
                            />
                        )}
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default TestimonialsSlider;
