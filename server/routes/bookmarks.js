import express from 'express';
import { supabase } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user's bookmarks (or by user_id query param for profiles page)
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    let targetUserId = user_id;

    if (!targetUserId) {
      // Try to infer from Authorization header if present
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        targetUserId = user?.id;
      }
    }

    if (!targetUserId) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ bookmarks: data || [] });
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Add bookmark
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ post_id: postId, user_id: userId }])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ bookmarked: true, bookmark: data });
  } catch (error) {
    // Handle unique constraint: already bookmarked
    if (error?.code === '23505') {
      return res.status(200).json({ bookmarked: true });
    }
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Remove bookmark
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ bookmarked: false });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

export default router;


