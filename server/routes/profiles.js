import express from 'express';
import { supabase } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);

  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, avatar_url } = req.body;
    const user_id = req.user.id;

    if (user_id !== id) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        name: name || undefined,
        bio: bio || undefined,
        avatar_url: avatar_url || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(profile);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 0, limit = 10 } = req.query;

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey (
          id,
          name,
          avatar_url
        ),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      posts: posts || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: (posts || []).length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Fetch user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

export default router;