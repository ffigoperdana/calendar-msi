import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Overview</h2>
        <p className="mb-3">
          Calendar MSI ("we", "our", "the app") is a calendar management tool built for internal use at PT Mastersystem Infotama Tbk. Tbk.. This privacy policy explains how we handle your information when you use our application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Information We Access</h2>
        <p className="mb-3">When you sign in with Google, we access:</p>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li>Your Google account profile (name, email, profile picture)</li>
          <li>Your Google Calendar data (to read and display events)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li>To authenticate you and provide access to the application</li>
          <li>To display your calendar events within the app</li>
          <li>To export event data to Excel format when you request it</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Data Storage</h2>
        <p className="mb-3">
          We do not store your personal data on external servers. Your authentication session is stored locally in your browser. Calendar data is fetched directly from Google's APIs and is not persisted on our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
        <p className="mb-3">We use the following third-party services:</p>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li><strong>Google OAuth 2.0</strong> — for authentication</li>
          <li><strong>Google Calendar API</strong> — to read your calendar events</li>
          <li><strong>Firebase</strong> — for authentication management</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
        <p className="mb-3">
          We do not sell, trade, or share your personal information with third parties. Your data is only used within the application for the purposes described above.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
        <p className="mb-3">You can:</p>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li>Revoke access at any time through your Google Account settings</li>
          <li>Log out to clear your local session</li>
          <li>Request deletion of any data associated with your account</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        <p className="mb-3">
          If you have questions about this privacy policy, contact us at{" "}
          <a href="mailto:perdanaputrafigo@gmail.com" className="text-primary underline">
            perdanaputrafigo@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
