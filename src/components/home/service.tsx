'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export const ServiceCard: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="px-4 md:px-8 py-12"
        >
            <Card className="relative max-w-4xl mx-auto bg-background border border-border shadow-xl rounded-xl overflow-hidden transition-transform hover:scale-[1.01] duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10 opacity-20 pointer-events-none" />

                <CardContent className="relative z-10 p-8 md:p-12 space-y-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                            Make the Most Out of the Driving Course
                        </h2>
                        <p className="mt-2 text-muted-foreground text-base md:text-lg">
                            We&#39;re committed to providing everything you need for a stress-free licensing journey.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-md bg-muted/50 border border-muted-foreground/20">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                ✅ License Assistance
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground">
                                End-to-end guidance with documentation, slot booking, and test prep — we’ve got you covered.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Link
                            href="/terms"
                            className="inline-flex items-center text-primary hover:text-primary/80 hover:underline font-medium transition-all group"
                        >
                            Click here for terms and conditions
                            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ServiceCard;
