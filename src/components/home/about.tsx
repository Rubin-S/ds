// @components/home/SpecialSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    UserGroupIcon,
    ClockIcon,
    ChartBarIcon,
    MapIcon,
    CurrencyRupeeIcon,
} from '@heroicons/react/24/solid';
import {CarIcon} from "lucide-react";

const features = [
    {
        Icon: UserGroupIcon,
        title: 'Expert Instructors',
        desc: 'Certified trainer with 25+ years of experience, ensuring you learn safe, modern driving techniques.',
    },
    {
        Icon: CarIcon,
        title: 'Modern Fleet',
        desc: 'Latest manual & automatic vehicles equipped with dual controls for maximum safety and comfort.',
    },
    {
        Icon: ClockIcon,
        title: 'Flexible Schedules',
        desc: 'Morning, evening, weekend batches—and even one-on-one slots to fit your busy life.',
    },
    {
        Icon: ChartBarIcon,
        title: 'High Pass Rate',
        desc: 'Over 99% first-time license pass rate thanks to focused training and mock tests.',
    },
    {
        Icon: MapIcon,
        title: 'Road-Test Routes',
        desc: 'Practice on actual RTO routes under real-world conditions so you’re fully prepared.',
    },
    {
        Icon: CurrencyRupeeIcon,
        title: 'Affordable Plans',
        desc: 'Transparent, budget-friendly packages—no hidden fees, no surprises.',
    },
];

const container = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.1,
            when: 'beforeChildren'
        }
    },
};

const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const SpecialSection: React.FC = () => (
    <motion.section
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
    >
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12">
                What’s so special about <span className="text-blue-600">SMDS</span>?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map(({ Icon, title, desc }, idx) => (
                    <motion.div
                        key={idx}
                        className="flex items-start space-x-4"
                        variants={item}
                    >
                        <Icon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-xl font-medium mb-1">{title}</h3>
                            <p className="text-gray-600">{desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.section>
);

export default SpecialSection;
