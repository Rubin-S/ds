'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const faqs = [
    {
        question: "Do I need any documents to join SMDS?",
        answer: "Yes, basic ID proof, age proof, and address proof are needed to start your training and assist with your license application.",
    },
    {
        question: "How long does it take to get a driving license?",
        answer: "Typically, it takes 30+ days after your Learner's License to apply for the Permanent License, subject to RTO availability.",
    },
    {
        question: "Does SMDS guarantee license approval?",
        answer: "No. SMDS provides assistance and training, but license approval is strictly based on RTO evaluations and your test performance.",
    },
    {
        question: "Is there a pick-and-drop facility for the RTO test?",
        answer: "Yes. SMDS offers a pick-and-drop facility for your license tests from the driving school premises only.",
    },
];

export const FaqSection: React.FC = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="py-16 px-4 md:px-8 bg-muted/20"
        >
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Frequently Asked Questions</h2>
                <p className="text-muted-foreground text-base md:text-lg">
                    Everything you need to know before starting your driving journey with SMDS.
                </p>
            </div>

            <Accordion type="multiple" className="max-w-3xl mx-auto space-y-2">
                {faqs.map((faq, idx) => (
                    <AccordionItem value={`faq-${idx}`} key={idx} className="border border-muted rounded-md">
                        <AccordionTrigger className="text-left text-lg p-5 font-medium text-foreground">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground p-5 text-sm md:text-base">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </motion.section>
    );
};

export default FaqSection;
