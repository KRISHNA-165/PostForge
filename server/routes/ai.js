import express from 'express';

const router = express.Router();

// Simple heuristic suggestions when no external LLM is configured
router.post('/suggest', async (req, res) => {
  try {
    const { title, content } = req.body || {};

    const plain = (content || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const baseTitle = (title && title.trim()) || (plain.split('. ')[0] || '').slice(0, 60);

    const suggestions = {
      titles: [
        baseTitle || 'A Fresh Perspective on Modern Development',
        'Lessons Learned: Building a Full-Stack Blog Platform',
        'From Idea to Release: Crafting a Blogging Experience'
      ],
      outlines: [
        [
          'Introduction and Motivation',
          'Key Challenges and Solutions',
          'Architecture Overview',
          'Results and Next Steps'
        ],
        [
          'Problem Statement',
          'Tech Stack and Rationale',
          'Implementation Details',
          'Testing and Deployment'
        ]
      ],
      excerpt:
        (plain || 'Share your story with a concise, engaging summary that hooks readers.')
          .slice(0, 155)
    };

    return res.json(suggestions);
  } catch (err) {
    console.error('AI suggest error:', err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

export default router;


