import { stripe } from '../services/stripe.js';
import { Payment } from '../models/Payment.js';
import { env } from '../config/env.js';
import { notify } from '../services/notify.js';
import { Application } from '../models/Application.js';
// User model removed - payment controller doesn't directly use User model

export const createHold = async (req, res, next) => {
  try {
    const { applicationId, amount } = req.body;
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      capture_method: 'manual',
      payment_method_types: ['card'],
      metadata: { applicationId },
    });
    const payment = await Payment.create({
      application: applicationId,
      amount,
      status: 'created',
      hold: true,
      stripePaymentIntentId: intent.id,
    });
    res.status(201).json({ clientSecret: intent.client_secret, payment });
  } catch (err) {
    next(err);
  }
};

export const captureHold = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const intent = await stripe.paymentIntents.capture(paymentIntentId);
    await Payment.findOneAndUpdate({ stripePaymentIntentId: paymentIntentId }, { status: 'succeeded' });
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId }).populate({
      path: 'application',
      populate: [{ path: 'influencer' }, { path: 'offer' }],
    });
    if (payment?.application?.influencer) {
      await notify('payment_captured', {
        user: payment.application.influencer,
        subject: 'Payment released',
        html: `Hi ${payment.application.influencer.name}, your payment for the offer is released.`,
      });
    }
    res.json({ intent });
  } catch (err) {
    next(err);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
    await Payment.findOneAndUpdate({ stripePaymentIntentId: paymentIntentId }, { status: 'refunded' });
    res.json({ refund });
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, env.stripe.webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const intent = event.data.object;
    if (!intent?.id) return res.status(200).json({ received: true });

    const updates = {};
    if (event.type === 'payment_intent.succeeded') updates.status = 'succeeded';
    if (event.type === 'payment_intent.payment_failed') updates.status = 'failed';
    if (event.type === 'payment_intent.canceled') updates.status = 'failed';
    if (Object.keys(updates).length) {
      const payment = await Payment.findOneAndUpdate({ stripePaymentIntentId: intent.id }, updates, { new: true }).populate({
        path: 'application',
        populate: [{ path: 'influencer' }, { path: 'offer' }],
      });
      if (payment?.application?.influencer && updates.status === 'succeeded') {
        await notify('payment_captured', {
          user: payment.application.influencer,
          subject: 'Payment released',
          html: `Hi ${payment.application.influencer.name}, your payment for the offer is released.`,
        });
      }
      if (payment?.application?.influencer && updates.status === 'failed') {
        await notify('payment_failed', {
          user: payment.application.influencer,
          subject: 'Payment failed',
          html: `Hi ${payment.application.influencer.name}, payment failed. Please update payment method.`,
        });
      }
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};

