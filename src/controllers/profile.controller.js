import { Influencer } from '../models/Influencer.js';

// Update influencer profile
export const updateInfluencerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      profileImage,
      username,
      name,
      bio,
      contentCategories,
      contentTypes,
      contactInfo,
      location
    } = req.body;

    // Find the influencer
    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Validate username uniqueness if provided
    if (username !== undefined) {
      if (username) {
        // Check if username format is valid
        if (!/^[a-zA-Z0-9_]+$/.test(username) || username.length < 3 || username.length > 30) {
          return res.status(400).json({ message: 'Username must be 3-30 characters, alphanumeric and underscores only' });
        }

        const existingInfluencer = await Influencer.findOne({
          username: username,
          _id: { $ne: userId }
        });
        if (existingInfluencer) {
          return res.status(409).json({ message: 'Username already taken' });
        }
      }
      influencer.username = username;
    }

    // Update profile fields
    if (profileImage !== undefined) {
      influencer.avatarUrl = profileImage;
    }
    if (name !== undefined) {
      influencer.name = name;
    }
    if (bio !== undefined) {
      influencer.bio = bio;
    }

    if (contentCategories !== undefined) {
      if (!Array.isArray(contentCategories)) {
        return res.status(400).json({ message: 'Content categories must be an array' });
      }
      influencer.contentCategories = contentCategories;
    }

    if (contentTypes !== undefined) {
      if (!Array.isArray(contentTypes)) {
        return res.status(400).json({ message: 'Content types must be an array' });
      }
      influencer.contentTypes = contentTypes;
    }

    // Update contact info
    if (contactInfo) {
      // Initialize contactInfo if it doesn't exist
      if (!influencer.contactInfo) {
        influencer.contactInfo = {};
      }

      // Update contactInfo fields
      if (contactInfo.secondaryEmail !== undefined) {
        influencer.contactInfo.secondaryEmail = contactInfo.secondaryEmail;
      }
      if (contactInfo.location !== undefined) {
        influencer.contactInfo.location = contactInfo.location;
      }
      if (contactInfo.website !== undefined) {
        influencer.contactInfo.website = contactInfo.website;
      }
      if (contactInfo.instagram !== undefined) {
        influencer.contactInfo.instagram = contactInfo.instagram;
      }
      if (contactInfo.tiktok !== undefined) {
        influencer.contactInfo.tiktok = contactInfo.tiktok;
      }
    }

    // Handle location object update if provided (for geolocation)
    if (location && typeof location === 'object') {
      if (!influencer.location) {
        influencer.location = {};
      }
      if (location.city !== undefined) {
        influencer.location.city = location.city;
      }
      if (location.country !== undefined) {
        influencer.location.country = location.country;
      }
      if (location.state !== undefined) {
        influencer.location.state = location.state;
      }
      if (location.coordinates !== undefined) {
        if (!influencer.location.coordinates) {
          influencer.location.coordinates = {
            type: 'Point',
            coordinates: [0, 0]
          };
        }
        if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
          influencer.location.coordinates.coordinates = location.coordinates;
        }
      }
    }

    // Update statistics if needed
    influencer.updateStatistics();

    await influencer.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: influencer._id,
        name: influencer.name,
        email: influencer.email,
        role: 'influencer',
        profileImage: influencer.avatarUrl,
        username: influencer.username,
        bio: influencer.bio,
        contentCategories: influencer.contentCategories,
        contentTypes: influencer.contentTypes,
        contactInfo: {
          email: influencer.email,
          phone: influencer.phone,
          secondaryEmail: influencer.contactInfo?.secondaryEmail,
          location: influencer.contactInfo?.location,
          website: influencer.contactInfo?.website,
          instagram: influencer.contactInfo?.instagram,
          tiktok: influencer.contactInfo?.tiktok
        },
        location: influencer.location ? {
          city: influencer.location.city,
          country: influencer.location.country,
          state: influencer.location.state,
          coordinates: influencer.location.coordinates?.coordinates
        } : null,
        statistics: influencer.statistics,
        portfolio: influencer.portfolio?.length || 0,
        status: influencer.status,
        isVerified: influencer.isVerified,
        acceptTerms: influencer.acceptTerms,
        verificationStatus: influencer.verificationStatus,
        updatedAt: influencer.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get influencer profile
export const getInfluencerProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?.id || req.user?._id;

    const influencer = await Influencer.findById(userId);

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Check if this is a public request (no authentication)
    const isPublicRequest = !req.user;
    const isOwnProfile = req.user && userId === (req.user.id || req.user._id).toString();

    let userData;

    if (isPublicRequest) {
      // Public view - limited information
      userData = {
        id: influencer._id,
        name: influencer.name,
        profileImage: influencer.avatarUrl || influencer.profileImage,
        basicInfo: {
          username: influencer.username,
          bio: influencer.bio
        },
        contentCategories: influencer.contentCategories,
        contactInfo: {
          location: influencer.contactInfo?.location,
          website: influencer.contactInfo?.website
        },
        location: influencer.location ? {
          city: influencer.location.city,
          country: influencer.location.country
        } : null,
        statistics: {
          totalFollowers: influencer.statistics?.totalFollowers || 0,
          rating: influencer.statistics?.rating || 0,
          ratingCount: influencer.statistics?.ratingCount || 0
        },
        createdAt: influencer.createdAt
      };
    } else if (isOwnProfile) {
      // Own profile - full information
      userData = {
        id: influencer._id,
        name: influencer.name,
        email: influencer.email,
        role: 'influencer',
        profileImage: influencer.avatarUrl || influencer.profileImage,
        basicInfo: {
          username: influencer.username,
          bio: influencer.bio
        },
        contentCategories: influencer.contentCategories,
        contentTypes: influencer.contentTypes,
        contactInfo: {
          email: influencer.email,
          phone: influencer.phone,
          location: influencer.contactInfo?.location,
          website: influencer.contactInfo?.website,
          secondaryEmail: influencer.contactInfo?.secondaryEmail,
          instagram: influencer.contactInfo?.instagram,
          tiktok: influencer.contactInfo?.tiktok
        },
        location: influencer.location ? {
          city: influencer.location.city,
          country: influencer.location.country,
          state: influencer.location.state,
          coordinates: influencer.location.coordinates?.coordinates
        } : null,
        statistics: influencer.statistics,
        portfolio: influencer.portfolio,
        meta: {
          instagram: influencer.meta?.instagram?.connected ? {
            username: influencer.meta.instagram.username,
            followers: influencer.meta.instagram.followers
          } : null,
          tiktok: influencer.meta?.tiktok?.connected ? {
            username: influencer.meta.tiktok.username,
            followers: influencer.meta.tiktok.followers
          } : null
        },
        status: influencer.status,
        isVerified: influencer.isVerified,
        verificationStatus: influencer.verificationStatus,
        createdAt: influencer.createdAt,
        updatedAt: influencer.updatedAt
      };
    } else {
      // Other authenticated user viewing profile - most information
      userData = {
        id: influencer._id,
        name: influencer.name,
        profileImage: influencer.avatarUrl || influencer.profileImage,
        basicInfo: {
          username: influencer.username,
          bio: influencer.bio
        },
        contentCategories: influencer.contentCategories,
        contactInfo: {
          location: influencer.contactInfo?.location,
          website: influencer.contactInfo?.website
        },
        location: influencer.location ? {
          city: influencer.location.city,
          country: influencer.location.country
        } : null,
        statistics: {
          totalFollowers: influencer.statistics?.totalFollowers || 0,
          rating: influencer.statistics?.rating || 0,
          ratingCount: influencer.statistics?.ratingCount || 0
        },
        createdAt: influencer.createdAt
      };
    }

    res.json({ user: userData });
  } catch (err) {
    next(err);
  }
};

// Get public influencer profiles (for browsing)
export const getPublicInfluencerProfiles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, location, search } = req.query;

    const filter = { status: 'active' };

    // Filter by content category
    if (category) {
      filter.contentCategories = category;
    }

    // Filter by location (search in contactInfo.location or location.city)
    if (location) {
      filter.$or = [
        { 'contactInfo.location': new RegExp(location, 'i') },
        { 'location.city': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }

    // Search by name, username, or bio
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const [influencers, total] = await Promise.all([
      Influencer.find(filter)
        .select('name avatarUrl username bio contentCategories contactInfo location createdAt')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Influencer.countDocuments(filter)
    ]);

    // Format the response
    const profiles = influencers.map(influencer => ({
      id: influencer._id,
      name: influencer.name,
      profileImage: influencer.avatarUrl,
      username: influencer.username,
      bio: influencer.bio,
      contentCategories: influencer.contentCategories,
      location: influencer.contactInfo?.location || influencer.location?.city || influencer.location?.country || null,
      website: influencer.contactInfo?.website || null,
      joinedAt: influencer.createdAt
    }));

    res.json({
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get available content categories
export const getContentCategories = async (req, res, next) => {
  try {
    const categories = [
      'Fashion',
      'Beauty',
      'Lifestyle',
      'Travel',
      'Food',
      'Fitness',
      'Technology',
      'Gaming',
      'Art',
      'Music',
      'Sports',
      'Business',
      'Education',
      'Health',
      'Photography',
      'Dance',
      'Comedy',
      'Motivation',
      'Reviews',
      'DIY'
    ];

    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

// Add content to portfolio
export const addToPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { platform, postUrl, thumbnailUrl, caption } = req.body;

    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    // Initialize portfolio if it doesn't exist
    if (!influencer.portfolio) {
      influencer.portfolio = [];
    }

    influencer.portfolio.push({
      platform,
      postUrl,
      thumbnailUrl: thumbnailUrl || postUrl, // Fallback to postUrl if same
      caption,
      addedAt: new Date()
    });

    await influencer.save();

    res.status(201).json({
      message: 'Content added to portfolio',
      portfolio: influencer.portfolio
    });
  } catch (err) {
    next(err);
  }
};

// Remove content from portfolio
export const removeFromPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { contentId } = req.params;

    const influencer = await Influencer.findById(userId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    if (!influencer.portfolio) {
      return res.status(404).json({ message: 'Portfolio is empty' });
    }

    influencer.portfolio = influencer.portfolio.filter(
      item => item._id.toString() !== contentId.toString()
    );

    await influencer.save();

    res.json({
      message: 'Content removed from portfolio',
      portfolio: influencer.portfolio
    });
  } catch (err) {
    next(err);
  }
};