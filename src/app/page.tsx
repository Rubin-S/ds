// app/page.tsx

import React from 'react';
import Image from 'next/image';

export const metadata = {
    title: 'Ace Drive – Your Trusted Driving School',
    description: 'Learn to drive confidently with Ace Drive: expert instructors, flexible schedules, and modern vehicles.',
};

export default function HomePage() {
    return (
        <main className="space-y-24">
            {/* Hero */}
            <section className="relative h-[70vh] bg-cover bg-center" style={{ backgroundImage: "url('/driving-hero.jpg')" }}>
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
                    <h1 className="text-5xl font-bold mb-4">Master the Road with Confidence</h1>
                    <p className="text-xl mb-6">Professional driving lessons tailored to your pace and schedule.</p>
                    <a
                        href="/contact"
                        className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition"
                    >
                        Book Your Lesson
                    </a>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-semibold text-center mb-12">Our Services</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: 'Beginner Lessons', icon: '/icons/steering-wheel.svg', desc: 'Start from scratch with zero driving experience.' },
                        { title: 'Refresher Courses', icon: '/icons/refresh.svg', desc: 'Brushing up skills for license renewal or confidence boost.' },
                        { title: 'Advanced Training', icon: '/icons/racing-flag.svg', desc: 'Learn complex maneuvers, highway driving, and defensive techniques.' },
                    ].map((svc) => (
                        <div key={svc.title} className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <Image src={svc.icon} alt="" width={64} height={64} className="mx-auto mb-4" />
                            <h3 className="text-xl font-medium mb-2">{svc.title}</h3>
                            <p className="text-gray-600">{svc.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Instructors */}
            <section id="instructors" className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-semibold text-center mb-12">Meet Our Instructors</h2>
                    <div >
                        {[
                            { name: 'Senthil Murugan', photo: '/instructors/alice.jpg', bio: '25+ years of teaching experience with a patient approach.' },
                        ].map((instr) => (
                            <div key={instr.name} className="bg-white rounded-lg overflow-hidden shadow-md">
                                <Image src={instr.photo} alt={instr.name} width={300} height={300} className="object-cover" />
                                <div className="p-4">
                                    <h3 className="text-lg font-medium">{instr.name}</h3>
                                    <p className="text-gray-600 text-sm mt-2">{instr.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-semibold text-center mb-12">What Our Students Say</h2>
                <div className="space-y-8">
                    {[
                        { quote: 'Ace Drive made learning to drive fun and stress-free!', name: 'Ravi K.' },
                        { quote: 'I passed my license test on the first try thanks to their expert tips.', name: 'Neha P.' },
                        { quote: 'Flexible scheduling fit my busy college life perfectly.', name: 'Arjun M.' },
                    ].map((t, i) => (
                        <blockquote key={i} className="bg-white p-6 rounded-lg shadow-lg">
                            <p className="italic text-gray-800">“{t.quote}”</p>
                            <footer className="mt-4 text-right text-gray-600">— {t.name}</footer>
                        </blockquote>
                    ))}
                </div>
            </section>

            {/* Call to Action / Contact */}
            <section id="contact" className="bg-blue-600 text-white py-16">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-semibold mb-6">Ready to Hit the Road?</h2>
                    <p className="mb-8">Contact us today to schedule your first lesson and join hundreds of successful drivers.</p>
                    <a
                        href="mailto:info@acedrive.com"
                        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition"
                    >
                        Email Us
                    </a>
                </div>
            </section>
        </main>
    );
}
