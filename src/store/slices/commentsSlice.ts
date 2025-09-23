import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null,
};

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
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
            replies: replies || [],
          };
        })
      );

      return commentsWithReplies;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async (
    { postId, content, parentId }: { postId: string; content: string; parentId?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content,
            post_id: postId,
            parent_id: parentId || null,
          },
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

      if (error) throw error;

      toast.success('Comment added successfully!');
      return { comment: data, parentId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Comment deleted successfully!');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { comment, parentId } = action.payload;
        
        if (parentId) {
          // Add as reply
          const parentComment = state.comments.find(c => c.id === parentId);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(comment);
          }
        } else {
          // Add as new comment
          state.comments.unshift({ ...comment, replies: [] });
        }
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        
        // Check if it's a top-level comment
        const commentIndex = state.comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          state.comments.splice(commentIndex, 1);
          return;
        }
        
        // Check if it's a reply
        for (const comment of state.comments) {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex(r => r.id === commentId);
            if (replyIndex !== -1) {
              comment.replies.splice(replyIndex, 1);
              break;
            }
          }
        }
      });
  },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;