'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  FileText,
  AlertTriangle,
  Scale,
  Users,
  Zap,
  Shield,
} from 'lucide-react';

export default function TermsAndPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="size-4" />
            Back to Settings
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              Last updated: January 15, 2024
            </div>
            <div className="flex items-center gap-1">
              <FileText className="size-4" />
              Version 2.1
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <a
              href="#acceptance"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              1. Acceptance of Terms
            </a>
            <a
              href="#description"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              2. Description of Service
            </a>
            <a
              href="#eligibility"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              3. Eligibility
            </a>
            <a
              href="#account"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              4. Account Registration
            </a>
            <a
              href="#acceptable-use"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              5. Acceptable Use Policy
            </a>
            <a
              href="#content"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              6. User Content
            </a>
            <a
              href="#intellectual-property"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              7. Intellectual Property
            </a>
            <a
              href="#payment"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              8. Payment and Billing
            </a>
            <a
              href="#privacy"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              9. Privacy
            </a>
            <a
              href="#disclaimers"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              10. Disclaimers
            </a>
            <a
              href="#limitation"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              11. Limitation of Liability
            </a>
            <a
              href="#termination"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              12. Termination
            </a>
            <a
              href="#governing-law"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              13. Governing Law
            </a>
            <a
              href="#changes"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              14. Changes to Terms
            </a>
            <a
              href="#contact"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              15. Contact Information
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          {/* Acceptance */}
          <section id="acceptance">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                1. Acceptance of Terms
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms of Service (&quot;Terms&quot;) constitute a legally
                binding agreement between you and LumiaAi (&quot;we,&quot;
                &quot;us,&quot; or &quot;our&quot;) regarding your use of our
                artificial intelligence chatbot service, including our website,
                mobile applications, and related services (collectively, the
                &quot;Service&quot;).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using our Service, you agree to be bound by
                these Terms and our Privacy Policy. If you do not agree to these
                Terms, you may not access or use our Service.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-5 text-red-600 shrink-0" />
                  <p className="text-red-800 text-sm">
                    <strong>Important:</strong> These Terms include important
                    information about future changes to the Terms, limitations
                    of liability, a class action waiver, and resolution of
                    disputes by arbitration instead of in court.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Description of Service */}
          <section id="description">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                2. Description of Service
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                LumiaAi is an AI-powered conversational service that allows
                users to interact with advanced language models through
                text-based conversations. Our Service includes:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Text-based conversations with AI models</li>
                <li>Code generation and analysis capabilities</li>
                <li>Creative writing and content generation</li>
                <li>Question answering and information retrieval</li>
                <li>Language translation and learning assistance</li>
                <li>Integration with third-party applications and services</li>
                <li>File upload and analysis features</li>
                <li>Custom GPT creation and sharing</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                2.1 Service Availability
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to provide continuous access to our Service, but we do
                not guarantee uninterrupted availability. The Service may be
                temporarily unavailable due to maintenance, updates, or
                technical issues.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                2.2 Service Modifications
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify, suspend, or discontinue any
                aspect of the Service at any time, with or without notice. We
                may also impose limits on certain features or restrict access to
                parts of the Service.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section id="eligibility">
            <div className="flex items-center gap-2 mb-4">
              <Users className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                3. Eligibility
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our Service, you must:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  Be at least 13 years old (or the minimum age in your
                  jurisdiction)
                </li>
                <li>Have the legal capacity to enter into these Terms</li>
                <li>
                  Not be prohibited from using the Service under applicable laws
                </li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                3.1 Age Requirements
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Users between 13 and 18 years old must have parental or guardian
                consent to use the Service. We may require verification of such
                consent.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                3.2 Geographic Restrictions
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service may not be available in all countries or regions.
                You are responsible for complying with local laws and
                regulations regarding your use of the Service.
              </p>
            </div>
          </section>

          {/* Account Registration */}
          <section id="account">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                4. Account Registration and Security
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                4.1 Account Creation
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features of the Service, you must create an
                account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your login credentials confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                4.2 Account Security
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are solely responsible for maintaining the security of your
                account. We recommend:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Using a strong, unique password</li>
                <li>Enabling two-factor authentication</li>
                <li>Regularly reviewing account activity</li>
                <li>Logging out from shared or public devices</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                4.3 Account Suspension
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may suspend or terminate your account if you violate these
                Terms, engage in fraudulent activity, or pose a security risk to
                our Service or other users.
              </p>
            </div>
          </section>

          {/* Acceptable Use Policy */}
          <section id="acceptable-use">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                5. Acceptable Use Policy
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to use the Service responsibly and in compliance with
                all applicable laws. You may not:
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                5.1 Prohibited Content
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  Generate or share illegal, harmful, or offensive content
                </li>
                <li>
                  Create content that promotes violence, hatred, or
                  discrimination
                </li>
                <li>Produce sexually explicit or inappropriate material</li>
                <li>Generate misleading or false information</li>
                <li>
                  Create content that infringes intellectual property rights
                </li>
                <li>Share personal information of others without consent</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                5.2 Prohibited Activities
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Attempt to reverse engineer or extract model weights</li>
                <li>Use automated tools to access the Service excessively</li>
                <li>Interfere with or disrupt the Service's operation</li>
                <li>Circumvent usage limits or access controls</li>
                <li>Use the Service for competitive intelligence gathering</li>
                <li>Resell or redistribute access to the Service</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                5.3 Commercial Use Restrictions
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Commercial use of the Service is subject to additional terms and
                may require a separate license. Contact us for commercial
                licensing options.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Enforcement:</strong> We reserve the right to
                  investigate violations of this policy and take appropriate
                  action, including content removal, account suspension, or
                  legal action.
                </p>
              </div>
            </div>
          </section>

          {/* User Content */}
          <section id="content">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                6. User Content and Data
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                6.1 Your Content
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of the content you provide to the Service
                (&quot;User Content&quot;). By using the Service, you grant us a
                limited license to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Process and analyze your content to provide the Service</li>
                <li>
                  Use your content to improve our AI models (subject to privacy
                  controls)
                </li>
                <li>
                  Store and transmit your content as necessary for Service
                  operation
                </li>
                <li>
                  Display your content back to you and in shared conversations
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                6.2 Generated Content
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Content generated by our AI models in response to your prompts
                (&quot;Generated Content&quot;) is provided to you under a
                permissive license. You may use Generated Content for any lawful
                purpose, subject to these Terms.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                6.3 Content Responsibility
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Ensuring you have rights to any content you upload</li>
                <li>Complying with applicable laws regarding your content</li>
                <li>Not sharing sensitive or confidential information</li>
                <li>
                  Reviewing Generated Content before use in important contexts
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                6.4 Content Moderation
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We employ automated and human moderation to enforce our content
                policies. We may remove content that violates these Terms
                without prior notice.
              </p>
            </div>
          </section>

          {/* Payment and Billing */}
          <section id="payment">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                8. Payment and Billing
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                8.1 Subscription Plans
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer various subscription plans with different features and
                usage limits. Current pricing and plan details are available on
                our website.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                8.2 Payment Terms
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  Subscription fees are billed in advance on a recurring basis
                </li>
                <li>All fees are non-refundable except as required by law</li>
                <li>
                  You authorize us to charge your payment method automatically
                </li>
                <li>You must maintain valid payment information</li>
                <li>Price changes will be communicated with 30 days notice</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                8.3 Free Tier
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may offer limited free access to the Service. Free tier usage
                is subject to additional restrictions and may be modified or
                discontinued at any time.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                8.4 Taxes
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for any applicable taxes related to your use
                of the Service. We may collect taxes where required by law.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Billing Support:</strong> For billing questions or
                  disputes, contact our support team at billing@LumiaAi.com
                  within 60 days of the charge.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section id="disclaimers">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                10. Disclaimers and Limitations
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                10.1 Service Disclaimers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL
                WARRANTIES, INCLUDING:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  Accuracy, completeness, or reliability of Generated Content
                </li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security or privacy of data transmission</li>
                <li>Fitness for any particular purpose</li>
                <li>Non-infringement of third-party rights</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                10.2 AI Limitations
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our AI models have inherent limitations and may:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Generate inaccurate or misleading information</li>
                <li>Exhibit biases present in training data</li>
                <li>Produce inconsistent or contradictory responses</li>
                <li>Lack real-time information or current events knowledge</li>
                <li>Make errors in reasoning or calculations</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                10.3 User Responsibility
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You acknowledge that:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>You use the Service at your own risk</li>
                <li>You should verify important information independently</li>
                <li>
                  Generated Content should not replace professional advice
                </li>
                <li>You are responsible for compliance with applicable laws</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-5 text-red-600 shrink-0" />
                  <p className="text-red-800 text-sm">
                    <strong>Important:</strong> Do not rely on Generated Content
                    for medical, legal, financial, or safety-critical decisions
                    without consulting qualified professionals.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section id="termination">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                12. Termination
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                12.1 Termination by You
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time by following the
                account deletion process in your settings. Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Your access to the Service will cease immediately</li>
                <li>Your subscription will not be renewed</li>
                <li>
                  Your data will be deleted according to our retention policy
                </li>
                <li>These Terms will remain in effect for past use</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                12.2 Termination by Us
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your access immediately, without
                prior notice, for:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Security threats or abuse</li>
                <li>Non-payment of fees</li>
                <li>Prolonged inactivity</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                12.3 Effect of Termination
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Upon termination, all rights and licenses granted to you will
                cease, and you must stop using the Service. Provisions that
                should survive termination will remain in effect.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section id="contact">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                15. Contact Information
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these Terms or our Service, please contact
                us:
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      General Support
                    </h4>
                    <p className="text-blue-600">support@LumiaAi.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Legal Inquiries
                    </h4>
                    <p className="text-blue-600">legal@LumiaAi.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Business Address
                    </h4>
                    <p className="text-gray-700 text-sm">
                      LumiaAi Legal Department
                      <br />
                      123 AI Street
                      <br />
                      San Francisco, CA 94105
                      <br />
                      United States
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Phone</h4>
                    <p className="text-gray-700">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Business hours: 9 AM - 5 PM PST
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Legal Notice:</strong> These Terms constitute the
                  entire agreement between you and LumiaAi regarding the Service
                  and supersede all prior agreements and understandings.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            © 2024 LumiaAi. All rights reserved. |{' '}
            <Link href="/policy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>{' '}
            |{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
