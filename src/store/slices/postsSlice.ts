import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  image_url?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 0, limit = 10, search }: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      let query = supabase
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
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        posts: data || [],
        hasMore: (data || []).length === limit,
        page,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey (
            id,
            name,
            avatar_url,
            bio
          ),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author' | 'likes_count' | 'comments_count'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
          *,
          author:profiles!posts_author_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      toast.success('Post created successfully!');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, ...updateData }: Partial<Post> & { id: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
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

      if (error) throw error;

      toast.success('Post updated successfully!');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Post deleted successfully!');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({ postId, userId }: { postId: string; userId: string }, { rejectWithValue }) => {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
        return { postId, liked: false };
      } else {
        await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: userId }]);
        return { postId, liked: true };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.currentPage = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 0) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        state.hasMore = action.payload.hasMore;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          post.is_liked = action.payload.liked;
          post.likes_count += action.payload.liked ? 1 : -1;
        }
        if (state.currentPost?.id === action.payload.postId) {
          state.currentPost.is_liked = action.payload.liked;
          state.currentPost.likes_count += action.payload.liked ? 1 : -1;
        }
      });
  },
});

export const { clearCurrentPost, resetPosts } = postsSlice.actions;
export default postsSlice.reducer;