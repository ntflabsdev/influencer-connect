import { UserSession } from '../models/UserSession.js';

// Middleware to track user sessions
export const trackSession = async (req, res, next) => {
  try {
    // Only track sessions for authenticated requests
    if (!req.user) {
      return next();
    }

    const userId = req.user._id || req.user.id;
    const userModel = req.user.constructor.modelName;
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Generate a simple session ID (in production, use proper session management)
    // For demo purposes, we'll use a combination of user ID and timestamp
    const sessionId = `session_${userId}_${Date.now()}`;

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent);

    // Create or update session
    let session = await UserSession.findOne({
      userId: userId,
      userModel: userModel,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      // Create new session
      session = new UserSession({
        userId: userId,
        userModel: userModel,
        sessionId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ipAddress,
        userAgent,
        lastActive: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } else {
      // Update existing session
      session.lastActive = new Date();
    }

    await session.save();

    // Attach session to request for later use
    req.session = session;

    next();
  } catch (err) {
    // Don't fail the request if session tracking fails
    console.error('Session tracking error:', err);
    next();
  }
};

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  }

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  // Create device name
  const deviceName = `${browser} on ${deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablet' : 'Desktop'}`;

  return {
    deviceType,
    browser,
    os,
    deviceName
  };
}