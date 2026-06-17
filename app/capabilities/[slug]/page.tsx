import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { capabilities } from "@/lib/site-data";

export function generateStaticParams() {
  return capabilities.map((capability) => ({ slug: capability.slug }));
}

export default async function CapabilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const capability = capabilities.find((item) => item.slug === slug);

  if (!capability) {
    notFound();
  }

  return (
    <main className="detail-page">
      <Link className="back-link" href="/">
        Back to home
      </Link>
      <section className="detail-hero">
        <div>
          <span className="section-label">Capability</span>
          <h1>{capability.title}</h1>
          <p>{capability.summary}</p>
        </div>
        <figure>
          <Image src={capability.image} alt={capability.title} fill sizes="(max-width: 900px) 100vw, 48vw" />
        </figure>
      </section>
      <section className="detail-list">
        <h2>What buyers can discuss in an RFQ</h2>
        <ul>
          {capability.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
          <li>Drawing review, sample review, pilot production, inspection plan, packaging, and export coordination.</li>
        </ul>
        <Link className="button primary" href="/#rfq">
          Send an RFQ
        </Link>
      </section>
    </main>
  );
}
