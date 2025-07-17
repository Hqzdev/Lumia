import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PolicyPage() {
  return (
    <div className="flex justify-center mt-10">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Usage Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">
              1. General Provisions
            </h2>
            <p>
              This policy sets out the rules and conditions for using the Lumia
              service. By using our service, you agree to these terms.
            </p>
          </section>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-2">2. User Data</h2>
            <p>
              We respect the privacy of your data and strive to ensure its
              security. For more information about data collection and
              processing, please refer to our{' '}
              <a href="/privacy" className="underline text-blue-600">
                Privacy Policy
              </a>
              .
            </p>
          </section>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-2">3. Responsibility</h2>
            <p>
              The user is responsible for actions performed using the service.
              The administration is not liable for any losses resulting from the
              use of the service.
            </p>
          </section>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold mb-2">4. Policy Changes</h2>
            <p>
              We reserve the right to change this policy at any time. The
              current version is always available on this page.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
