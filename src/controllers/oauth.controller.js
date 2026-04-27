import axios from 'axios';
import { Influencer } from '../models/Influencer.js';
import { env } from '../config/env.js';

// Instagram OAuth URLs
const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize';
const INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_USER_URL = 'https://graph.instagram.com/me';
const INSTAGRAM_REFRESH_URL = 'https://graph.instagram.com/refresh_access_token';

// TikTok OAuth URLs
const TIKTOK_AUTH_URL = 'https://www.tiktok.com/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open-api.tiktok.com/oauth/access_token/';
const TIKTOK_USER_URL = 'https://open-api.tiktok.com/user/info/';
const TIKTOK_REFRESH_URL = 'https://open-api.tiktok.com/oauth/refresh_token/';

// Generate Instagram OAuth URL
export const getInstagramAuthUrl = (req, res, next) => {
  try {
    const state = req.user._id.toString(); // Use user ID as state for security
    const authUrl = `${INSTAGRAM_AUTH_URL}?client_id=${env.instagram.clientId}&redirect_uri=${encodeURIComponent(env.instagram.redirectUrl)}&scope=user_profile,user_media&response_type=code&state=${state}`;

    res.json({
      authUrl,
      platform: 'instagram'
    });
  } catch (err) {
    next(err);
  }
};

// Handle Instagram OAuth callback
export const handleInstagramCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.redirect(`${env.clientUrl}/social/instagram/error?message=Authorization denied`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(INSTAGRAM_TOKEN_URL, null, {
      params: {
        client_id: env.instagram.clientId,
        client_secret: env.instagram.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: env.instagram.redirectUrl,
        code: code
      }
    });

    const { access_token, user_id } = tokenResponse.data;

    // Get user profile data
    const userResponse = await axios.get(INSTAGRAM_USER_URL, {
      params: {
        fields: 'id,username,account_type,media_count,followers_count',
        access_token: access_token
      }
    });

    const instagramData = userResponse.data;

    // Update user with Instagram data
    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.redirect(`${env.clientUrl}/social/instagram/error?message=Influencer not found`);
    }

    influencer.meta.instagram = {
      userId: instagramData.id,
      username: instagramData.username,
      accessToken: access_token,
      refreshToken: null, // Instagram short-lived tokens don't have refresh tokens
      expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
      followers: instagramData.followers_count || 0,
      connected: true
    };

    await influencer.save();

    res.redirect(`${env.clientUrl}/social/instagram/success`);
  } catch (err) {
    console.error('Instagram OAuth error:', err.response?.data || err.message);
    res.redirect(`${env.clientUrl}/social/instagram/error?message=Failed to connect Instagram`);
  }
};

// Generate TikTok OAuth URL
export const getTikTokAuthUrl = (req, res, next) => {
  try {
    const state = req.user._id.toString();
    const authUrl = `${TIKTOK_AUTH_URL}?client_key=${env.tiktok.clientId}&scope=user.info.basic,user.info.profile,user.info.stats&response_type=code&redirect_uri=${encodeURIComponent(env.tiktok.redirectUrl)}&state=${state}`;

    res.json({
      authUrl,
      platform: 'tiktok'
    });
  } catch (err) {
    next(err);
  }
};

// Handle TikTok OAuth callback
export const handleTikTokCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.redirect(`${env.clientUrl}/social/tiktok/error?message=Authorization denied`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(TIKTOK_TOKEN_URL, {
      client_key: env.tiktok.clientId,
      client_secret: env.tiktok.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: env.tiktok.redirectUrl
    });

    const { data: tokenData } = tokenResponse.data;
    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // Get user profile data
    const userResponse = await axios.post(TIKTOK_USER_URL, {
      client_key: env.tiktok.clientId,
      access_token: access_token,
      open_id: open_id,
      fields: 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count'
    });

    const tiktokData = userResponse.data.data.user;

    // Update user with TikTok data
    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.redirect(`${env.clientUrl}/social/tiktok/error?message=Influencer not found`);
    }

    influencer.meta.tiktok = {
      userId: open_id,
      username: tiktokData.display_name,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + (expires_in * 1000)),
      followers: tiktokData.follower_count || 0,
      connected: true
    };

    await influencer.save();

    res.redirect(`${env.clientUrl}/social/tiktok/success`);
  } catch (err) {
    console.error('TikTok OAuth error:', err.response?.data || err.message);
    res.redirect(`${env.clientUrl}/social/tiktok/error?message=Failed to connect TikTok`);
  }
};

// Refresh Instagram token
export const refreshInstagramToken = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const influencer = await Influencer.findById(userId);

    if (!influencer?.meta?.instagram?.accessToken) {
      return res.status(400).json({ message: 'Instagram not connected' });
    }

    // Instagram short-lived tokens need to be refreshed through re-authorization
    // We'll mark as needing refresh
    influencer.meta.instagram.connected = false;
    await influencer.save();

    res.json({
      message: 'Instagram token expired. Please reconnect.',
      needsReconnect: true
    });
  } catch (err) {
    next(err);
  }
};

// Refresh TikTok token
export const refreshTikTokToken = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const influencer = await Influencer.findById(userId);

    if (!influencer?.meta?.tiktok?.refreshToken) {
      return res.status(400).json({ message: 'TikTok not connected or no refresh token available' });
    }

    const refreshResponse = await axios.post(TIKTOK_REFRESH_URL, {
      client_key: env.tiktok.clientId,
      client_secret: env.tiktok.clientSecret,
      refresh_token: influencer.meta.tiktok.refreshToken,
      grant_type: 'refresh_token'
    });

    const { data: tokenData } = refreshResponse.data;
    const { access_token, refresh_token, expires_in } = tokenData;

    // Update tokens
    influencer.meta.tiktok.accessToken = access_token;
    influencer.meta.tiktok.refreshToken = refresh_token;
    influencer.meta.tiktok.expiresAt = new Date(Date.now() + (expires_in * 1000));

    await influencer.save();

    res.json({
      message: 'TikTok token refreshed successfully',
      expiresAt: user.meta.tiktok.expiresAt
    });
  } catch (err) {
    console.error('TikTok refresh error:', err.response?.data || err.message);
    next(err);
  }
};

// Disconnect Instagram
export const disconnectInstagram = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const influencer = await Influencer.findById(userId);

    if (influencer?.meta?.instagram) {
      influencer.meta.instagram = {
        connected: false
      };
    }

    await influencer.save();

    res.json({ message: 'Instagram disconnected successfully' });
  } catch (err) {
    next(err);
  }
};

// Disconnect TikTok
export const disconnectTikTok = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const influencer = await Influencer.findById(userId);

    if (influencer?.meta?.tiktok) {
      influencer.meta.tiktok = {
        connected: false
      };
    }

    await influencer.save();

    res.json({ message: 'TikTok disconnected successfully' });
  } catch (err) {
    next(err);
  }
};

// Get social connections status
export const getSocialConnections = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const influencer = await Influencer.findById(userId).select('meta');

    const connections = {
      instagram: {
        connected: influencer?.meta?.instagram?.connected || false,
        username: influencer?.meta?.instagram?.username || null,
        followers: influencer?.meta?.instagram?.followers || 0,
        expiresAt: influencer?.meta?.instagram?.expiresAt || null
      },
      tiktok: {
        connected: influencer?.meta?.tiktok?.connected || false,
        username: influencer?.meta?.tiktok?.username || null,
        followers: influencer?.meta?.tiktok?.followers || 0,
        expiresAt: influencer?.meta?.tiktok?.expiresAt || null
      }
    };

    res.json({ connections });
  } catch (err) {
    next(err);
  }
};