'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
    return (
        <div className="min-h-screen mt-5 bg-muted/50 flex items-center justify-center px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-4xl"
            >
                <Card className="shadow-xl bg-background/80 backdrop-blur-md border border-border">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-primary">
                            Terms & Conditions – Sri Senthil Murugan Driving School (SMDS)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-muted-foreground text-sm leading-relaxed">
                        <p>
                            By enrolling at SMDS, you agree to the following terms and conditions
                            that ensure transparency, accountability, and a smoother learning experience.
                        </p>

                        <section>
                            <h3 className="font-semibold text-base text-foreground">1. License Assistance</h3>
                            <ul className="list-disc pl-5 mt-1">
                                <li>Subject to prevailing RTO norms and government regulations.</li>
                                <li>
                                    SMDS will assist with documentation, but the final approval rests with the RTO.
                                </li>
                                <li>
                                    Required documents: age proof, address proof, and a valid medical certificate.
                                </li>
                                <li>
                                    The trainee is responsible for verifying personal details and resubmitting any documents requested by RTO.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-base text-foreground">2. RTO Tests & Scheduling</h3>
                            <ul className="list-disc pl-5 mt-1">
                                <li>Theoretical tests are mandatory for a learner license.</li>
                                <li>Permanent license can only be applied 30 days after getting a learner license.</li>
                                <li>Application for permanent license must be completed within 180 days of learner license issuance.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-base text-foreground">3. Vehicle & Facilities</h3>
                            <ul className="list-disc pl-5 mt-1">
                                <li>Test vehicle choice is based on SMDS’s availability. Requests cannot be guaranteed.</li>
                                <li>Pick-and-drop services are provided on test days from SMDS office only.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-base text-foreground">4. Limitations & Disclaimers</h3>
                            <ul className="list-disc pl-5 mt-1">
                                <li>RTO is the only authority for issuing licenses. SMDS does not guarantee issuance.</li>
                                <li>SMDS is not responsible for postal delivery delays or rejections by RTO.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-base text-foreground">5. Grievance Redressal</h3>
                            <p>
                                Issues or concerns must be reported to the SMDS manager promptly. For urgent matters,
                                please visit our <a href="/contact-us" className="underline text-primary">Contact Page</a>.
                            </p>
                        </section>

                        <footer className="pt-4 border-t border-border text-xs text-muted-foreground">
                            Last updated: May 22, 2025
                        </footer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
