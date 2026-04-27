import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['Influencer', 'Business', 'Admin'] },
    sessionId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'], default: 'desktop' },
    browser: String,
    os: String,
    ipAddress: String,
    location: {
      city: String,
      country: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    userAgent: String,
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

userSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
userSessionSchema.index({ userId: 1, isActive: 1 });

userSessionSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

userSessionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

export const UserSession = mongoose.model('UserSession', userSessionSchema);