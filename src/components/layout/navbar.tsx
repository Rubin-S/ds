'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Why SMDS?', href: '#why-smds' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '/contact-us' },
    { name: 'Terms', href: '/terms' },
];

export const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const mobileVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    return (
        <motion.nav
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-muted px-4 md:px-10 py-3 shadow-sm"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-primary">
                    SMDS
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Mobile menu toggle */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={mobileVariants}
                        transition={{ duration: 0.25 }}
                        className="md:hidden mt-2 px-4 space-y-2"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary transition"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
