import React from "react";

const TermsOfService = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p className="mb-3">
          By accessing and using Calendar MSI ("the app"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
        <p className="mb-3">
          Calendar MSI is a calendar management and event tracking tool designed for internal use at PT Mitra Solusi Infokom. The app allows users to view, manage, and export calendar events using their Google account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li>You must sign in with a valid Google account to use the app</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You must not share your access credentials with unauthorized users</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
        <p className="mb-3">You agree not to:</p>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li>Use the app for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to the app or its systems</li>
          <li>Interfere with or disrupt the app's functionality</li>
          <li>Use the app to collect data about other users without consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
        <p className="mb-3">
          The app and its original content, features, and functionality are owned by PT Mitra Solusi Infokom and are protected by applicable intellectual property laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
        <p className="mb-3">
          The app is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the app.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Data and Privacy</h2>
        <p className="mb-3">
          Your use of the app is also governed by our{" "}
          <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
          Please review it to understand how we handle your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
        <p className="mb-3">
          We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
        <p className="mb-3">
          For questions about these terms, contact us at{" "}
          <a href="mailto:perdanaputrafigo@gmail.com" className="text-primary underline">
            perdanaputrafigo@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
