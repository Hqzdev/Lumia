'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Shield,
  Eye,
  Database,
  Users,
  Globe,
  Lock,
  X as CloseIcon,
} from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          {/* Крестик для закрытия */}
          <button
            type="button"
            className="absolute right-0 top-0 p-2 text-gray-400 hover:text-gray-700"
            aria-label="Close"
            onClick={() => router.back()}
          >
            <CloseIcon className="size-6" />
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              Last updated: January 15, 2024
            </div>
            <div className="flex items-center gap-1">
              <Globe className="size-4" />
              Effective globally
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
              href="#introduction"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              1. Introduction
            </a>
            <a
              href="#information-we-collect"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              2. Information We Collect
            </a>
            <a
              href="#how-we-use-information"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              3. How We Use Information
            </a>
            <a
              href="#information-sharing"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              4. Information Sharing
            </a>
            <a
              href="#data-retention"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              5. Data Retention
            </a>
            <a
              href="#security"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              6. Security
            </a>
            <a
              href="#your-rights"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              7. Your Rights
            </a>
            <a
              href="#cookies"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              8. Cookies and Tracking
            </a>
            <a
              href="#international-transfers"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              9. International Transfers
            </a>
            <a
              href="#children"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              10. Children's Privacy
            </a>
            <a
              href="#changes"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              11. Changes to Policy
            </a>
            <a
              href="#contact"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              12. Contact Us
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          {/* Introduction */}
          <section id="introduction">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                1. Introduction
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to LumiaAi. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our
                artificial intelligence chatbot service and related
                applications, websites, and services (collectively, the
                &quot;Service&quot;).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We are committed to protecting your privacy and ensuring
                transparency about our data practices. This policy applies to
                all users of our Service, regardless of how you access or use
                it.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> By using our Service, you agree to
                  the collection and use of information in accordance with this
                  Privacy Policy. If you do not agree with our policies and
                  practices, do not use our Service.
                </p>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section id="information-we-collect">
            <div className="flex items-center gap-2 mb-4">
              <Database className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                2. Information We Collect
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                2.1 Information You Provide
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  <strong>Account Information:</strong> Email address, username,
                  password, and profile information
                </li>
                <li>
                  <strong>Conversation Data:</strong> Messages, prompts, and
                  responses in your conversations with LumiaAi
                </li>
                <li>
                  <strong>User Content:</strong> Files, documents, images, and
                  other content you upload or share
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing details and
                  payment method information (processed by third-party
                  providers)
                </li>
                <li>
                  <strong>Communication Data:</strong> Information when you
                  contact us for support or feedback
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                2.2 Information Collected Automatically
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you use our Service, we automatically collect certain
                information:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  <strong>Usage Data:</strong> How you interact with our
                  Service, including features used and time spent
                </li>
                <li>
                  <strong>Device Information:</strong> Device type, operating
                  system, browser type, and unique device identifiers
                </li>
                <li>
                  <strong>Log Data:</strong> IP address, access times, pages
                  viewed, and referring URLs
                </li>
                <li>
                  <strong>Location Data:</strong> General location information
                  based on IP address
                </li>
                <li>
                  <strong>Performance Data:</strong> Response times, error
                  rates, and system performance metrics
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                2.3 Information from Third Parties
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may receive information about you from third parties,
                including:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Authentication providers (Google, Microsoft, Apple)</li>
                <li>Payment processors and billing services</li>
                <li>Analytics and advertising partners</li>
                <li>Integration partners and connected services</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section id="how-we-use-information">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                3. How We Use Information
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect for various purposes,
                including:
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                3.1 Service Provision
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  Providing, maintaining, and improving our AI chatbot service
                </li>
                <li>
                  Processing and responding to your queries and conversations
                </li>
                <li>
                  Personalizing your experience and providing relevant responses
                </li>
                <li>Managing your account and subscription</li>
                <li>Processing payments and managing billing</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                3.2 Communication
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Sending you service-related notifications and updates</li>
                <li>
                  Responding to your inquiries and providing customer support
                </li>
                <li>Sending marketing communications (with your consent)</li>
                <li>Notifying you about changes to our Service or policies</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                3.3 Improvement and Development
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Training and improving our AI models and algorithms</li>
                <li>Analyzing usage patterns to enhance user experience</li>
                <li>Developing new features and services</li>
                <li>Conducting research and analytics</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                3.4 Safety and Security
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                  Detecting and preventing fraud, abuse, and security threats
                </li>
                <li>Enforcing our Terms of Service and community guidelines</li>
                <li>Protecting the rights and safety of our users</li>
                <li>
                  Complying with legal obligations and law enforcement requests
                </li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Model Training:</strong> We may use your conversations
                  to improve our AI models, but we implement privacy-preserving
                  techniques and do not use personal information to identify you
                  in our training data.
                </p>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section id="information-sharing">
            <div className="flex items-center gap-2 mb-4">
              <Users className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                4. Information Sharing and Disclosure
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties except as described in this policy:
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                4.1 Service Providers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share information with trusted third-party service
                providers who assist us in operating our Service:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Cloud hosting and infrastructure providers</li>
                <li>Payment processing and billing services</li>
                <li>Customer support and communication tools</li>
                <li>Analytics and monitoring services</li>
                <li>Security and fraud prevention services</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                4.2 Legal Requirements
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information when required by law or in
                response to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Valid legal process, such as subpoenas or court orders</li>
                <li>Government or regulatory requests</li>
                <li>Law enforcement investigations</li>
                <li>Protection of our rights, property, or safety</li>
                <li>Prevention of fraud or illegal activities</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                4.3 Business Transfers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of a merger, acquisition, or sale of assets, your
                information may be transferred as part of the business
                transaction. We will notify you of any such change in ownership
                or control.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                4.4 Consent
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information with your explicit consent or at
                your direction, such as when you choose to integrate with
                third-party services.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section id="data-retention">
            <div className="flex items-center gap-2 mb-4">
              <Database className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                5. Data Retention
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide
                our Service and fulfill the purposes outlined in this policy:
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                5.1 Account Data
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your account information until you delete your account
                or request deletion. After account deletion, we may retain
                certain information for legal compliance and security purposes.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                5.2 Conversation Data
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Conversation history is retained according to your settings and
                subscription plan. You can delete individual conversations or
                your entire chat history at any time.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                5.3 Training Data
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Data used for model training may be retained longer to maintain
                model performance, but is anonymized and cannot be linked back
                to individual users.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-gray-700 text-sm">
                  <strong>Retention Periods:</strong>
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600">
                  <li>Active account data: Until account deletion</li>
                  <li>
                    Conversation history: User-controlled, up to account
                    deletion
                  </li>
                  <li>Usage logs: 90 days</li>
                  <li>Payment records: 7 years (legal requirement)</li>
                  <li>Support communications: 3 years</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security */}
          <section id="security">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                6. Security
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement comprehensive security measures to protect your
                information:
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                6.1 Technical Safeguards
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>End-to-end encryption for data in transit</li>
                <li>Strong encryption for data at rest</li>
                <li>Multi-factor authentication options</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure development practices and code reviews</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                6.2 Operational Safeguards
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Access controls and principle of least privilege</li>
                <li>Employee security training and background checks</li>
                <li>Incident response and breach notification procedures</li>
                <li>Regular backup and disaster recovery testing</li>
                <li>Compliance with industry security standards</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                6.3 Your Role in Security
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can help protect your account by:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Using a strong, unique password</li>
                <li>Enabling multi-factor authentication</li>
                <li>Keeping your login credentials confidential</li>
                <li>Logging out of shared or public devices</li>
                <li>Reporting suspicious activity immediately</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">
                  <strong>Security Incident Reporting:</strong> If you suspect
                  unauthorized access to your account or notice any security
                  vulnerabilities, please contact us immediately at
                  security@LumiaAi.com.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section id="your-rights">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                7. Your Rights and Choices
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                You have various rights regarding your personal information,
                depending on your location:
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                7.1 Access and Portability
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Request access to your personal information</li>
                <li>Obtain a copy of your data in a portable format</li>
                <li>Review how your information is being used</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                7.2 Correction and Updates
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Correct inaccurate or incomplete information</li>
                <li>Update your account and profile information</li>
                <li>Modify your communication preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                7.3 Deletion and Restriction
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Delete your account and associated data</li>
                <li>Request deletion of specific information</li>
                <li>Restrict processing of your information</li>
                <li>Object to certain uses of your data</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                7.4 Marketing Communications
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can opt out of marketing communications at any time by:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Clicking unsubscribe links in emails</li>
                <li>Updating your account preferences</li>
                <li>Contacting our support team</li>
              </ul>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm">
                  <strong>Exercise Your Rights:</strong> To exercise any of
                  these rights, please contact us at privacy@LumiaAi.com or use
                  the privacy controls in your account settings. We will respond
                  to your request within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                12. Contact Us
              </h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us:
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                    <p className="text-blue-600">privacy@LumiaAi.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Support</h4>
                    <p className="text-blue-600">support@LumiaAi.com</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Mailing Address
                    </h4>
                    <p className="text-gray-700 text-sm">
                      LumiaAi Privacy Team
                      <br />
                      123 AI Street
                      <br />
                      San Francisco, CA 94105
                      <br />
                      United States
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Data Protection Officer
                    </h4>
                    <p className="text-blue-600">dpo@LumiaAi.com</p>
                  </div>
                </div>
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
