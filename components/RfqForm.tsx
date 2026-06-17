"use client";

import { FormEvent, useState } from "react";
import { contact } from "@/lib/site-data";

type FormState = "idle" | "pending" | "success" | "error";

const initialMessage = "";

export function RfqForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState(initialMessage);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (payload.website) {
      setStatus("success");
      setMessage("Thank you. Your RFQ was received.");
      form.reset();
      return;
    }

    setStatus("pending");
    setMessage("Sending your RFQ...");

    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, pageUrl: window.location.href }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(result?.message || "The RFQ service is not available yet.");
      }

      setStatus("success");
      setMessage(result?.message || "Thank you. Your RFQ was received.");
      form.reset();
    } catch (error) {
      const body = [
        "New RFQ for Chika / ACT Manufacturing",
        "",
        `Name: ${payload.name || ""}`,
        `Email: ${payload.email || ""}`,
        `Company: ${payload.company || ""}`,
        `Country: ${payload.country || ""}`,
        `Project type: ${payload.projectType || ""}`,
        `Annual volume: ${payload.annualVolume || ""}`,
        `Material: ${payload.material || ""}`,
        `Surface finish: ${payload.surfaceFinish || ""}`,
        `Message: ${payload.message || ""}`,
      ].join("\n");

      const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(
        "Chika / ACT RFQ",
      )}&body=${encodeURIComponent(body)}`;

      setStatus("error");
      setMessage(
        error instanceof Error
          ? `${error.message} You can also email ${contact.email} or WhatsApp ${contact.whatsapp}.`
          : `Please email ${contact.email} or WhatsApp ${contact.whatsapp}.`,
      );
      window.location.href = mailto;
    }
  }

  return (
    <form className="rfq-form" onSubmit={onSubmit}>
      <label>
        Name
        <input name="name" autoComplete="name" required placeholder="Your name" />
      </label>
      <label>
        Company email
        <input name="email" type="email" autoComplete="email" required placeholder="name@company.com" />
      </label>
      <label>
        Company
        <input name="company" autoComplete="organization" placeholder="Company name" />
      </label>
      <label>
        Country / Region
        <input name="country" autoComplete="country-name" placeholder="United States" />
      </label>
      <label>
        Project type
        <select name="projectType" defaultValue="Injection molded components">
          <option>Injection molded components</option>
          <option>Metal fabricated parts</option>
          <option>Automation equipment</option>
          <option>Finished assembly / terminal product</option>
          <option>Tooling and pilot production</option>
        </select>
      </label>
      <label>
        Annual volume
        <input name="annualVolume" placeholder="Example: 50,000 pcs / year" />
      </label>
      <label>
        Material
        <input name="material" placeholder="ABS, PC, aluminum, steel..." />
      </label>
      <label>
        Surface finish
        <input name="surfaceFinish" placeholder="Texture, spray coating, anodizing..." />
      </label>
      <label className="full">
        Requirement summary
        <textarea
          name="message"
          required
          placeholder="Share drawings, sample status, dimensions, tolerance, finish, destination market, and target schedule."
        />
      </label>
      <label className="rfq-trap" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button primary full" type="submit" disabled={status === "pending"}>
        {status === "pending" ? "Sending..." : "Send RFQ"}
      </button>
      <p className={`form-status ${status !== "idle" ? `is-${status}` : ""}`} aria-live="polite">
        {message}
      </p>
    </form>
  );
}
