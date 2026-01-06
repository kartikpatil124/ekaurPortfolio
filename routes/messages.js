const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Submit contact message (public)
router.post('/', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all messages (admin only)
router.get('/', async (req, res) => {
  try {
    if (!req.session.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark message as read (admin only)
router.put('/:id/read', async (req, res) => {
  try {
    if (!req.session.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message (admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (!req.session.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;