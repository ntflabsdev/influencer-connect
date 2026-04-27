import sgMail from '@sendgrid/mail';
import { env } from '../config/env.js';

if (env.sendgrid.apiKey) sgMail.setApiKey(env.sendgrid.apiKey);

export const sendEmail = async ({ to, subject, html }) => {
  if (!env.sendgrid.apiKey) {
    return Promise.resolve(); // noop in dev if not configured
  }
  return sgMail.send({
    to,
    from: env.sendgrid.from,
    subject,
    html,
  });
};





