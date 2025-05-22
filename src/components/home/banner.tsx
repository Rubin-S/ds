// @components/home/Banner.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Link from "next/link";

interface BannerProps {
    backgroundImages: string[];
    pretitle: string;
    title: string;
    ctaText: string;
    ctaLink: string;
    intervalMs?: number;
}

const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay, duration: 0.6, ease: 'easeOut' },
    }),
};

export const Banner: React.FC<BannerProps> = ({
                                                  backgroundImages,
                                                  pretitle,
                                                  title,
                                                  ctaText,
                                                  ctaLink,
                                                  intervalMs = 3000,
                                              }) => {
    return (
        <section className="relative h-[70vh] overflow-hidden">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                loop
                autoplay={{ delay: intervalMs, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation
                className="h-full"
            >
                {backgroundImages.map((src, idx) => (
                    <SwiperSlide key={idx} className="relative">
                        <Image
                            src={src}
                            alt={`Slide ${idx + 1}`}
                            fill
                            className="object-cover"
                            priority={idx === 0}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Overlay + animated text/button */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
                <motion.p
                    className="text-xl text-white mb-4"
                    initial="hidden"
                    animate="visible"
                    variants={textVariants}
                    custom={0.2}
                >
                    {pretitle}
                </motion.p>
                <motion.h1
                    className="text-5xl font-bold text-white mb-6 max-w-5xl"
                    initial="hidden"
                    animate="visible"
                    variants={textVariants}
                    custom={0.5}
                >
                    {title}
                </motion.h1>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={textVariants}
                    custom={0.8}
                >
                    <Button>
                        <Link href={ctaLink} className="w-full h-full block z-10">
                            {ctaText}
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default Banner;
