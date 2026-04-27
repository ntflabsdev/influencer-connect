import { Influencer } from '../models/Influencer.js';
import { Business } from '../models/Business.js';
import { Admin } from '../models/Admin.js';
import { Message } from '../models/Message.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { to, body } = req.body;
    if (to === String(req.user._id)) return res.status(400).json({ message: 'Cannot message yourself' });

    // Try to find recipient in all three models
    let recipient = await Influencer.findById(to);
    if (!recipient) {
      recipient = await Business.findById(to);
    }
    if (!recipient) {
      recipient = await Admin.findById(to);
    }
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    // Determine model types for from and to
    const fromModel = req.user.constructor.modelName;
    let toModel = 'Influencer';
    if (recipient instanceof Business) toModel = 'Business';
    else if (recipient instanceof Admin) toModel = 'Admin';
    
    const message = await Message.create({
      from: req.user._id,
      fromModel,
      to,
      toModel,
      body,
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id },
      ],
    })
      .sort('-createdAt')
      .limit(50);

    // mark as read
    await Message.updateMany(
      { from: userId, to: req.user._id, readAt: { $exists: false } },
      { $set: { readAt: new Date() } },
    );

    res.json({ messages: messages.reverse() }); // return chronological
  } catch (err) {
    next(err);
  }
};

export const inbox = async (req, res, next) => {
  try {
    const latest = await Message.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    })
      .sort('-createdAt')
      .limit(100)
      .populate('from to', 'name role avatarUrl');

    const threads = [];
    const seen = new Set();
    for (const msg of latest) {
      const other = String(msg.from._id) === String(req.user._id) ? msg.to : msg.from;
      const key = String(other._id);
      if (seen.has(key)) continue;
      seen.add(key);
      threads.push({
        with: other,
        lastMessage: msg,
        unread: msg.to._id.toString() === req.user._id.toString() && !msg.readAt,
      });
      if (threads.length >= 30) break;
    }

    res.json({ threads });
  } catch (err) {
    next(err);
  }
};





