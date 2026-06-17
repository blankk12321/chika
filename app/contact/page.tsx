import Link from "next/link";
import { RfqForm } from "@/components/RfqForm";
import { contact } from "@/lib/site-data";

export default function ContactPage() {
  return (
    <main className="detail-page contact-page">
      <Link className="back-link" href="/">
        Back to home
      </Link>
      <section className="rfq-section standalone">
        <div>
          <span className="section-label">Contact</span>
          <h1>Send an RFQ to Chika / ACT Manufacturing.</h1>
          <p>
            Use the form for injection molding, metal fabrication, tooling, automation equipment, assembly, or testing
            inquiries.
          </p>
          <div className="contact-panel">
            <strong>Direct contact</strong>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href="https://wa.me/8618938580209">WhatsApp: {contact.whatsapp}</a>
          </div>
        </div>
        <RfqForm />
      </section>
    </main>
  );
}
