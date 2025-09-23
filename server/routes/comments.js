import express from 'express';
import { supabase } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Get top-level comments
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            author:profiles!comments_user_id_fkey (
              id,
              name,
              avatar_url
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || []
        };
      })
    );

    res.json(commentsWithReplies);

  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add new comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, post_id, parent_id } = req.body;
    const user_id = req.user.id;

    if (!content || !post_id) {
      return res.status(400).json({ error: 'Content and post_id are required' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          content,
          post_id,
          user_id,
          parent_id: parent_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        author:profiles!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(comment);

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if comment exists and user owns it
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        author:profiles!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json(comment);

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if comment exists and user owns it
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete all replies first
    await supabase
      .from('comments')
      .delete()
      .eq('parent_id', id);

    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;