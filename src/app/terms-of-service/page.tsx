
'use client';
import MainLayout from '@/components/main-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <MainLayout>
       <div className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-headline text-5xl">Terms of Service</h1>
               <p className="text-sm text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <Card className="shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="space-y-8 text-muted-foreground">
                    <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Athah website (the "Service") operated by Athah ("us", "we", or "our").</p>
                    
                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">1. Agreement to Terms</h2>
                        <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>
                    </div>

                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">2. Products</h2>
                        <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.</p>
                    </div>

                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">3. Orders and Payment</h2>
                        <p>We accept various forms of payment as specified during the checkout process. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.</p>
                    </div>

                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">4. User Accounts</h2>
                        <p>You may be required to create an account to use some features of the Service. You are responsible for safeguarding your account, so use a strong password and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above.</p>
                    </div>

                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
                        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Athah and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.</p>
                    </div>

                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
                        <p>In no event shall Athah, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                    </div>

                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">7. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                    </div>

                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">8. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at support@athah.com.</p>
                    </div>
                  </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
