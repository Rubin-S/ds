'use client';

import React, { useState } from 'react';
import { db } from '@/firebase/init.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { name, email, message } = formData;

        if (!name.trim() || !email.trim() || !message.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const messagesRef = collection(db, 'messages');
            await addDoc(messagesRef, {
                name,
                email,
                text: message,
                timestamp: serverTimestamp(),
            });
            setSuccess(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            console.error("Error adding document: ", err);
            setError("Failed to send message.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen px-4 py-20 md:px-10 bg-white"
        >
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-primary mb-4">Contact Us</h1>
                <p className="text-center text-muted-foreground mb-10">
                    Have questions? Need help? Feel free to reach out to us.
                </p>

                <form className="space-y-6" onSubmit={handleSend}>
                    <div>
                        <label htmlFor="name" className="block mb-1 font-medium text-muted-foreground">
                            Your Name
                        </label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium text-muted-foreground">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block mb-1 font-medium text-muted-foreground">
                            Your Message
                        </label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your message here..."
                            rows={5}
                            disabled={submitting}
                        />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                        {submitting ? 'Sending...' : 'Send Message'}
                    </Button>

                    {error && <p className="text-red-600 mt-2">{error}</p>}
                    {success && <p className="text-green-600 mt-2">Message sent successfully!</p>}
                </form>

                <div className="mt-16 text-center text-muted-foreground text-sm">
                    <p>Phone: +91 9443091530</p>
                    <p>Email: rubinsenthil@gmail.com</p>
                    <p>Address: 17, Udhayamampattu Rd, Thiyagadurgam, Tamil Nadu 606206</p>
                </div>
            </div>
        </motion.section>
    );
};

export default ContactPage;
