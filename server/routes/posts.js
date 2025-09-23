import express from 'express';
import { supabase } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all posts with pagination and search
router.get('/', async (req, res) => {
  try {
    const { 
      page = 0, 
      limit = 10, 
      search, 
      author_id 
    } = req.query;

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    const { data: posts, error } = await query;

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
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);

  } catch (error) {
    console.error('Fetch post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, tags, image_url } = req.body;
    const author_id = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          excerpt: excerpt || null,
          tags: tags || [],
          image_url: image_url || null,
          author_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        author:profiles!posts_author_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(post);

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, tags, image_url } = req.body;
    const user_id = req.user.id;

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.author_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        excerpt,
        tags,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        author:profiles!posts_author_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json(post);

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.author_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const { data: existingLike, error: likeError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) throw error;

      res.json({ liked: false, message: 'Post unliked' });
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) throw error;

      res.json({ liked: true, message: 'Post liked' });
    }

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
});

export default router;