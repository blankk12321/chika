import Link from "next/link";
import { qualityItems } from "@/lib/site-data";

export default function QualityPage() {
  return (
    <main className="detail-page">
      <Link className="back-link" href="/">
        Back to home
      </Link>
      <section className="detail-list wide">
        <span className="section-label">Quality</span>
        <h1>Testing and inspection capability for overseas acceptance checks.</h1>
        <p>
          Chika / ACT source material lists laboratory, reliability, environmental, surface, electrical, and dimensional
          checks for internal machines, modules, and parts.
        </p>
        <ul>
          {qualityItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
