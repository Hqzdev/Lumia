import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPage() {
  return (
    <div className="flex justify-center mt-10">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
            <p>
              This Privacy Policy explains how Lumia collects, uses, and
              protects your personal information when you use our service.
            </p>
          </section>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-2">2. Data Collection</h2>
            <p>
              We may collect information that you provide directly, such as your
              name, email address, and any other data you submit through the
              service. We may also collect technical data such as IP address,
              browser type, and usage statistics.
            </p>
          </section>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-2">
              3. Use of Information
            </h2>
            <p>
              Your information is used to provide and improve our services,
              communicate with you, and ensure the security of our platform. We
              do not sell your personal data to third parties.
            </p>
          </section>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your data
              from unauthorized access, alteration, or disclosure.
            </p>
          </section>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-2">
              5. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. The latest
              version will always be available on this page.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

