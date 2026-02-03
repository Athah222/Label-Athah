'use client';

import MainLayout from '@/components/main-layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

const faqData = [
  {
    question: 'What is your shipping policy?',
    answer:
      'We offer free standard shipping on all orders over ₹5000. For orders below this amount, a flat shipping fee of ₹50 applies. Orders are typically processed within 1-2 business days, and delivery usually takes 3-7 business days across India.',
  },
  {
    question: 'Can I return or exchange an item?',
    answer:
      "Yes, we have a 30-day return and exchange policy. Items must be in their original, unworn condition with all tags attached. Please contact our support team at label.athah910@gmail.com to initiate a return or exchange.",
  },
  {
    question: 'Do you offer custom sizing?',
    answer:
      "Absolutely! We pride ourselves on creating pieces that fit you perfectly. Look for the 'Request a custom size' link on any product page, or contact us directly with your measurements to discuss a bespoke creation.",
  },
  {
    question: 'How do I track my order?',
    answer:
      'Once your order has been shipped, you will receive a confirmation email with a tracking ID and a link to the carrier’s portal to monitor your delivery progress.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards, UPI, and net banking via our secure payment gateway, Razorpay. All transactions are encrypted and safe.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Currently, Athah ships exclusively within India. However, we are exploring international shipping options and hope to serve our global customers very soon.',
  },
];

export default function FAQPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-headline text-5xl">Frequently Asked Questions</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Everything you need to know about shopping with Athah.
            </p>
          </div>

          <Card className="shadow-lg border-none bg-secondary/20">
            <CardContent className="p-6 md:p-10">
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                    <AccordionTrigger className="text-left font-medium text-lg hover:text-primary transition-colors py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Still have questions?</p>
            <a
              href="mailto:label.athah910@gmail.com"
              className="text-primary font-semibold hover:underline mt-2 inline-block text-lg"
            >
              Contact our support team
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
