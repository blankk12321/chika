import Image from "next/image";
import Link from "next/link";
import { RfqForm } from "@/components/RfqForm";
import { applications, capabilities, contact, metrics, processSteps, productShowcase, qualityItems } from "@/lib/site-data";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1>Injection molding, metal fabrication and automation equipment from one Dongguan manufacturing partner.</h1>
            <p>
              Chika / ACT Manufacturing supports overseas OEM buyers with real workshop capacity, tooling support,
              controlled production, assembly, testing, and export-ready RFQ coordination.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#rfq">
                Send an RFQ
              </a>
              <a className="button secondary" href="#factory">
                View factory capability
              </a>
            </div>
          </div>
          <figure className="hero-media">
            <Image priority src="/assets/site/injection-machines.jpg" alt="Chika injection molding machines in Dongguan workshop" fill sizes="(max-width: 900px) 100vw, 58vw" />
            <figcaption>First view: real injection molding capacity</figcaption>
          </figure>
        </section>

        <section className="metrics" aria-label="Factory proof metrics">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </section>

        <section className="section priority-proof" id="factory">
          <div className="section-heading">
            <span className="section-label">Factory Evidence</span>
            <h2>Show injection machines first, then the lab, then the products buyers can source.</h2>
            <p>
              The site leads with real production evidence because overseas buyers need proof before they send drawings
              or samples. Injection molding is the first visible capability, followed by testing and product programs.
            </p>
          </div>
          <div className="proof-layout">
            <article className="proof-primary">
              <Image src="/assets/site/haitian-yanhing-machines.jpg" alt="Haitian and Yan Hing injection molding machines" fill sizes="(max-width: 900px) 100vw, 52vw" />
              <div>
                <strong>01</strong>
                <h3>Injection molding machines</h3>
                <p>15 Chika molding machines listed in source material, with tooling and automated line-side support.</p>
              </div>
            </article>
            <article>
              <Image src="/assets/site/testing-lab.jpg" alt="Chika and Teayee testing laboratory" fill sizes="(max-width: 900px) 100vw, 24vw" />
              <div>
                <strong>02</strong>
                <h3>Laboratory and inspection</h3>
                <p>RoHS, environmental, dimensional, surface, electrical, vibration, shock, and reliability checks.</p>
              </div>
            </article>
            <article>
              <Image src="/assets/site/showroom-products.jpg" alt="Chika product showroom for terminals and equipment" fill sizes="(max-width: 900px) 100vw, 24vw" />
              <div>
                <strong>03</strong>
                <h3>Product display</h3>
                <p>Finished assemblies, terminals, equipment programs, and application examples shown separately.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section" id="capabilities">
          <div className="section-heading">
            <span className="section-label">Capabilities</span>
            <h2>One supplier path for molded parts, metal structures, and automation-ready assemblies.</h2>
          </div>
          <div className="capability-grid">
            {capabilities.map((capability) => (
              <article className="capability-card" key={capability.slug}>
                <div className="card-image">
                  <Image src={capability.image} alt={capability.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
                </div>
                <div className="card-body">
                  <h3>{capability.title}</h3>
                  <p>{capability.summary}</p>
                  <ul>
                    {capability.points.slice(0, 3).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link href={`/capabilities/${capability.slug}/`}>View capability</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section lab-section" id="quality">
          <div className="lab-media">
            <Image src="/assets/site/precision-inspection-room.jpg" alt="Precision inspection room with measurement equipment" fill sizes="(max-width: 900px) 100vw, 45vw" />
          </div>
          <div>
            <span className="section-label">Quality & Testing</span>
            <h2>Lab capability is treated as a sourcing proof point, not an afterthought.</h2>
            <p>
              Source material lists environmental, mechanical, surface, electrical, chemical, and dimensional checks.
              The site keeps this evidence near the top so buyers can judge whether a program is audit-ready.
            </p>
            <ul className="quality-list">
              {qualityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section process-section">
          <div className="section-heading">
            <span className="section-label">RFQ Process</span>
            <h2>From drawing or sample to controlled production.</h2>
          </div>
          <div className="process-grid">
            {processSteps.map((step) => (
              <article key={step.step}>
                <span>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section product-section" id="applications">
          <div className="section-heading">
            <span className="section-label">Product Display</span>
            <h2>Product programs are shown in their own section for faster buyer scanning.</h2>
            <p>
              Keep finished examples separate from factory capability: buyers can first trust the process, then scan
              whether the supplier fits their product category.
            </p>
          </div>
          <div className="product-layout">
            {productShowcase.map((item) => (
              <article key={item.title}>
                <div className="card-image">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 900px) 100vw, 33vw" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="application-strip">
            {applications.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section rfq-section" id="rfq">
          <div>
            <span className="section-label">Start Sourcing</span>
            <h2>Send drawings, sample photos, or a short requirement list.</h2>
            <p>
              Include material, surface finish, tolerance, estimated annual volume, target market, and whether you need
              parts only or full assembly.
            </p>
            <div className="contact-panel">
              <strong>Chika / ACT RFQ Desk</strong>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <a href="https://wa.me/8618938580209">WhatsApp: {contact.whatsapp}</a>
            </div>
          </div>
          <RfqForm />
        </section>
      </main>
      <footer className="site-footer">
        <strong>Chika / ACT Manufacturing</strong>
        <span>Injection molding · Metal fabrication · Automation equipment · Assembly · Testing</span>
      </footer>
    </>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Chika ACT Manufacturing home">
        <Image src="/assets/site/chika-logo.png" alt="" width={46} height={46} />
        <span>
          <strong>Chika</strong>
          <small>ACT Manufacturing</small>
        </span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#capabilities">Capabilities</a>
        <a href="#factory">Factory</a>
        <a href="#quality">Quality</a>
        <a href="#applications">Applications</a>
        <a href="#rfq">RFQ</a>
      </nav>
      <a className="button header-button" href="#rfq">
        Send RFQ
      </a>
    </header>
  );
}
