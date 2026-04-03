/**
 * Email notification stub.
 *
 * This module provides a placeholder for sending emails.
 * When SMTP is configured in production, replace the console.log
 * with an actual transport (e.g. nodemailer).
 *
 * Environment variables to configure later:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_FROM_NAME
 */

export interface EmailParams {
  to: string
  subject: string
  body: string
}

export async function sendEmail(params: EmailParams): Promise<void> {
  // TODO: Configure SMTP (e.g., nodemailer)
  // In production, uncomment and install nodemailer:
  //
  // import nodemailer from 'nodemailer'
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: Number(process.env.SMTP_PORT) || 587,
  //   secure: false,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS,
  //   },
  // })
  //
  // await transporter.sendMail({
  //   from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
  //   to: params.to,
  //   subject: params.subject,
  //   html: params.body,
  // })

  console.log(`[EMAIL STUB] To: ${params.to}, Subject: ${params.subject}`)
}

/**
 * Convenience helpers for common notification types.
 * These build on sendEmail() and will work once SMTP is configured.
 */

export async function notifyAssignmentGraded(params: {
  studentEmail: string
  studentName: string
  assignmentTitle: string
  courseTitle: string
  grade: number
}): Promise<void> {
  await sendEmail({
    to: params.studentEmail,
    subject: `Tugasan dinilai: ${params.assignmentTitle}`,
    body: `
      <p>Salam ${params.studentName},</p>
      <p>Tugasan anda <strong>${params.assignmentTitle}</strong> dalam kursus
      <strong>${params.courseTitle}</strong> telah dinilai.</p>
      <p>Markah: <strong>${params.grade}</strong></p>
    `,
  })
}

export async function notifyNewAnnouncement(params: {
  recipientEmail: string
  recipientName: string
  courseTitle: string
  announcementTitle: string
}): Promise<void> {
  await sendEmail({
    to: params.recipientEmail,
    subject: `Pengumuman baharu: ${params.announcementTitle}`,
    body: `
      <p>Salam ${params.recipientName},</p>
      <p>Pengumuman baharu dalam kursus <strong>${params.courseTitle}</strong>:</p>
      <p><strong>${params.announcementTitle}</strong></p>
    `,
  })
}
