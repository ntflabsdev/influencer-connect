import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Influencer } from '../models/Influencer.js';
import { Business } from '../models/Business.js';
import { Admin } from '../models/Admin.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    let user = await Influencer.findById(id);
    if (!user) {
      user = await Business.findById(id);
    }
    if (!user) {
      user = await Admin.findById(id);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are available
if (env.google.clientId && env.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.redirectUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          
          // Check if user already exists with this Google ID in any model
          let user = await Influencer.findOne({ 'meta.googleId': profile.id });
          if (!user) {
            user = await Business.findOne({ 'meta.googleId': profile.id });
          }
          if (!user) {
            user = await Admin.findOne({ 'meta.googleId': profile.id });
          }

          if (user) {
            // User exists, return it
            return done(null, user);
          }

          // Check if user exists with same email in any model
          let existingUser = await Influencer.findOne({ email });
          if (!existingUser) {
            existingUser = await Business.findOne({ email });
          }
          if (!existingUser) {
            existingUser = await Admin.findOne({ email });
          }

          if (existingUser) {
            // User exists with email but not Google ID, link the accounts
            if (!existingUser.meta) existingUser.meta = {};
            existingUser.meta.googleId = profile.id;
            existingUser.meta.avatarUrl = profile.photos?.[0]?.value;
            await existingUser.save();
            return done(null, existingUser);
          }

          // Note: New user creation should be handled in routes based on signup type
          // Passport strategy should not create users automatically
          logger.warn(`Google OAuth: No existing user found for ${email}. User creation should be handled in routes.`);
          return done(new Error('User not found. Please sign up first.'), null);
        } catch (err) {
          logger.error('Google OAuth error:', err);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('[Passport] Google OAuth credentials not provided, skipping Google strategy initialization');
}

export default passport;