"use server";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { guardPublicSubmission } from "@/lib/guardSubmission";
import { getContactMailConfig } from "@/lib/server/config";

export type ContactResult =
  | { success: true }
  | { success: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  formData: FormData
): Promise<ContactResult> {
  // --- 1. Extract & validate fields ---
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { success: false, error: "All fields are required." };
  }

  if (!EMAIL_RE.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // --- 2. Bot / rate-limit guard ---
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null;

  const guardError = await guardPublicSubmission(formData, ip);
  if (guardError) {
    if (guardError === "spam") {
      console.warn("Contact form blocked by honeypot — likely bot or autofill");
      return { success: true };
    }
    return { success: false, error: guardError };
  }

  // --- 3. Resolve centralized recipient/sender (D-15) ---
  // No SMTP env var is read here; getContactMailConfig owns that. When the
  // transport is unconfigured we surface a clear error instead of attempting a
  // doomed send (the missing-config environment case from TASK-017).
  const mail = getContactMailConfig();
  if (!mail.ok) {
    console.error("Contact email not configured:", mail.reason);
    return {
      success: false,
      error: "Messaging is temporarily unavailable. Please try again later.",
    };
  }

  // --- 4. Send email via Nodemailer ---
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: mail.user,
      pass: mail.password,
    },
  });

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 520px;">
      <h2 style="margin-bottom: 4px;">New contact form submission</h2>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  const textBody = `New contact form submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

  try {
    await transporter.sendMail({
      from: mail.user,
      to: mail.recipient,
      replyTo: headerSafe(email),
      subject: headerSafe(`[Arizmi] Contact from ${name}`),
      text: textBody,
      html: htmlBody,
    });
  } catch (err) {
    console.error("Contact email failed:", err);
    return {
      success: false,
      error: "Failed to send message. Please try again later.",
    };
  }

  return { success: true };
}

/**
 * Strip CR/LF from any user-supplied value used in an email header (subject,
 * replyTo) so a crafted name/email cannot inject additional headers.
 */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** Minimal HTML escaping for user-supplied values in the email body */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
