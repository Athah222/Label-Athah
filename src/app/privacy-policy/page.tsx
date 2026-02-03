
'use client';
import MainLayout from '@/components/main-layout';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="font-headline text-5xl">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <Card className="shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="space-y-8 text-muted-foreground">
                    <p>Welcome to Athah. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
                    
                    <div>
                      <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                      <p>We may collect personal information from you such as your name, email address, shipping address, billing address, and payment information when you place an order, create an account, or subscribe to our newsletter.</p>
                    </div>
                    
                    <div>
                      <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                      <p className="mb-2">We use the information we collect to:</p>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                          <li>Process your transactions and fulfill your orders.</li>
                          <li>Communicate with you, including sending you emails about your order or our promotions.</li>
                          <li>Improve our website and customer service.</li>
                          <li>Personalize your user experience.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">3. Information Sharing</h2>
                      <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>
                    </div>

                    <div>
                      <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">4. Security of Your Information</h2>
                      <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
                    </div>

                    <div>
                      <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">5. Your Rights</h2>
                      <p>You have the right to access, correct, or delete your personal information. You can do this by logging into your account or contacting us directly.</p>
                    </div>

                    <div>
                      <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">6. Changes to This Privacy Policy</h2>
                      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
                    </div>
                    
                    <div>
                      <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">7. Contact Us</h2>
                      <p>If you have any questions about this Privacy Policy, please contact us at support@athah.com.</p>
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
