# Influencer Connect Backend (Express + MongoDB)

Hinglish quickstart backend with admin, influencer, and business roles. Includes AWS S3 uploads, SendGrid email stub, and Stripe payment hold flow.

## Setup
1) `cp config/env.example .env` then fill values.  
2) `npm install`  
3) `npm run dev`
4) Optional: `docker-compose up -d mongo` for local Mongo

## Highlights
- Roles: admin, influencer, business with JWT auth (`src/middlewares/auth.js`).
- Models: `User`, `Offer`, `Application`, `ContentSubmission`, `Review`, `Message`, `Payment`.
- Routes:
  - `/api/auth` register/login
  - `/api/influencer` offer listing, apply, submit content
  - `/api/business` offer create, review apps, approve content
  - `/api/admin` approvals + analytics
  - `/api/upload` S3 image upload
  - `/api/payments` Stripe holds/capture/refund
  - `/api/messages` inbox + conversations
  - `/api/kyc` uploads + admin moderation
- S3 helper (`src/services/s3.js`), SendGrid helper (`src/services/email.js`), Stripe helper (`src/services/stripe.js`).

## Next Steps
- Add request validation per route and rate limits per role.
- Add KYC document upload + moderation queue.
- Add messaging (socket or polling) and notifications via email.
- Harden: tests, logging, metrics, idempotent Stripe webhooks, background jobs.

## Seeding
- `npm run seed` will wipe Users/Offers and add: admin (admin@test.com), business (biz@test.com), influencer (infl@test.com) with default password `password123` and one sample offer.


