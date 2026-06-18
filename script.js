const navToggle = document.querySelector("[data-nav-toggle]");
const mainNav = document.querySelector("[data-main-nav]");
const navBackdrop = document.querySelector("[data-nav-backdrop]");
const rfqForm = document.querySelector("[data-rfq-form]");
const formStatus = document.querySelector("[data-form-status]");
const contactEmail = "yunimentalworking@gmail.com";
const contactWhatsapp = "+86 18938580209";
const maxAttachmentFiles = 5;
const maxAttachmentFileBytes = 30 * 1024 * 1024;
const maxAttachmentTotalBytes = 100 * 1024 * 1024;

navToggle?.addEventListener("click", () => {
  const isOpen = !mainNav?.classList.contains("open");
  setNavigationState(isOpen);
});

navBackdrop?.addEventListener("click", () => {
  setNavigationState(false);
});

mainNav?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  setNavigationState(false);

  const href = link.getAttribute("href") || "";
  const isExternalAction = href.startsWith("mailto:") || href.startsWith("tel:") || href.includes("wa.me");
  const opensElsewhere = link.target && link.target !== "_self";

  if (!isExternalAction && !opensElsewhere) {
    event.preventDefault();
    window.location.href = link.href;
  }
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-lightbox]");
  if (!trigger) return;

  event.preventDefault();
  openLightbox(trigger.getAttribute("href"), trigger.querySelector("img")?.alt || "CHIKA manufacturing image");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    setNavigationState(false);
  }
});

function setNavigationState(isOpen) {
  mainNav?.classList.toggle("open", isOpen);
  navBackdrop?.classList.toggle("open", isOpen);
  navToggle?.classList.toggle("is-open", isOpen);
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);
}

rfqForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(rfqForm);
  const payload = Object.fromEntries(
    [...data.entries()].filter(([, value]) => !(value instanceof File))
  );
  payload.pageUrl = window.location.href;

  if (payload.website) {
    rfqForm.reset();
    setFormStatus("Thank you. Your RFQ was received.", "success");
    return;
  }

  const submitButton = rfqForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setFormStatus("Sending your RFQ...", "pending");

  try {
    if (!payload.name || !payload.email || !payload.message) {
      throw new Error("Please enter your name, company email, and requirement summary.");
    }

    payload.attachments = await readRfqAttachments(rfqForm);

    const response = await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "The RFQ endpoint is not available yet.");
    }

    rfqForm.reset();
    setFormStatus(result.message || "Thank you. Your RFQ was received.", "success");
  } catch (error) {
    const subject = `CHIKA Manufacturing RFQ - ${payload.projectType || "Manufacturing project"}`;
    const body = [
      "New RFQ for CHIKA Manufacturing",
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
      `Page: ${payload.pageUrl || ""}`,
      payload.attachments?.length ? `Attachments: ${payload.attachments.map((file) => file.filename).join(", ")}` : "Attachments: not included in fallback email",
    ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormStatus(
      `${error.message || "The RFQ service is not available yet."} Email ${contactEmail} or WhatsApp ${contactWhatsapp}.`,
      "error",
    );
  } finally {
    submitButton.disabled = false;
  }
});

async function readRfqAttachments(form) {
  const files = [...form.querySelector('input[type="file"]')?.files || []].filter((file) => file.size > 0);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  if (files.length > maxAttachmentFiles) {
    throw new Error(`Please upload up to ${maxAttachmentFiles} files. For larger file packages, email ${contactEmail}.`);
  }

  const oversizedFile = files.find((file) => file.size > maxAttachmentFileBytes);
  if (oversizedFile) {
    throw new Error(`${oversizedFile.name} is over 30 MB. Please compress it, split the package, or email ${contactEmail}.`);
  }

  if (totalBytes > maxAttachmentTotalBytes) {
    throw new Error(`Your uploaded files are over 100 MB total. Please email large CAD packages to ${contactEmail}.`);
  }

  return Promise.all(files.map(readFileAsAttachment));
}

function readFileAsAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      const content = result.includes(",") ? result.split(",").pop() : "";
      resolve({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        content,
      });
    });
    reader.addEventListener("error", () => reject(new Error(`Could not read ${file.name}. Please try again.`)));
    reader.readAsDataURL(file);
  });
}

function setFormStatus(message, state) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.remove("is-success", "is-error", "is-pending");
  formStatus.classList.add(`is-${state}`);
}

function openLightbox(src, alt) {
  if (!src) return;
  closeLightbox();

  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `<img src="${src}" alt="${alt.replace(/"/g, "&quot;")}">`;
  overlay.addEventListener("click", closeLightbox);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.querySelector(".lightbox-overlay")?.remove();
  document.body.style.overflow = "";
}
