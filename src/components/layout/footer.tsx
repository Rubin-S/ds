'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-muted/20 text-muted-foreground py-8 px-4 md:px-10 mt-20"
        >
            <div className="max-w-6xl mx-auto text-center space-y-4">
                <p className="text-sm">© {new Date().getFullYear()} Sri Senthil Murugan Driving School. All rights reserved.</p>
                <div className="space-x-4 text-sm">
                    <Link href="/terms" className="hover:text-primary transition">Terms & Conditions</Link>
                    <Link href="#faq" className="hover:text-primary transition">FAQ</Link>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
