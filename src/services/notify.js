import { sendEmail } from './email.js';

// Simple notification fan-out (currently email only)
// event: string, payload: object with { user, subject, html }
export const notify = async (event, payload) => {
  if (!payload?.user?.email) return;
  return sendEmail({
    to: payload.user.email,
    subject: payload.subject || `Notification: ${event}`,
    html: payload.html || '',
  });
};





