import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Edit, Trash2, User, Clock, Tag } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchPostById, likePost, deletePost } from '../store/slices/postsSlice';
import { fetchComments, addComment, deleteComment, clearComments } from '../store/slices/commentsSlice';
import { Helmet } from 'react-helmet-async';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentPost, loading } = useSelector((state: RootState) => state.posts);
  const { comments, loading: commentsLoading } = useSelector((state: RootState) => state.comments);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
      dispatch(fetchComments(id));
    }
    
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, id]);

  const handleLike = () => {
    if (!isAuthenticated || !user || !currentPost) return;
    dispatch(likePost({ postId: currentPost.id, userId: user.id }));
  };

  const handleDelete = async () => {
    if (!currentPost || !window.confirm('Are you sure you want to delete this post?')) return;
    
    const result = await dispatch(deletePost(currentPost.id));
    if (deletePost.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id || !isAuthenticated) return;
    
    const result = await dispatch(addComment({ postId: id, content: newComment }));
    if (addComment.fulfilled.match(result)) {
      setNewComment('');
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim() || !id || !isAuthenticated) return;
    
    const result = await dispatch(addComment({ postId: id, content: replyContent, parentId }));
    if (addComment.fulfilled.match(result)) {
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(commentId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="spinner"></div>
          <span className="text-gray-600">Loading post...</span>
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{`${currentPost.title} – BlogHub`}</title>
        <meta name="description" content={stripHtml(currentPost.content).slice(0, 155)} />
      </Helmet>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Featured Image */}
          {currentPost.image_url && (
            <div className="aspect-video w-full">
              <img
                src={currentPost.image_url}
                alt={currentPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {currentPost.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center justify-between mb-6">
                <Link to={`/profile/${currentPost.author.id}`} className="flex items-center space-x-4">
                  {currentPost.author.avatar_url ? (
                    <img
                      src={currentPost.author.avatar_url}
                      alt={currentPost.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{currentPost.author.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(currentPost.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </Link>

                {/* Post Actions */}
                {isAuthenticated && user?.id === currentPost.author_id && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-post/${currentPost.id}`}
                      className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              {currentPost.tags && currentPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement */}
              <div className="flex items-center space-x-6 py-4 border-t border-b border-gray-200">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                    currentPost.is_liked
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <Heart
                    className={`h-5 w-5 ${currentPost.is_liked ? 'fill-current' : ''}`}
                  />
                  <span className="font-medium">{currentPost.likes_count || 0}</span>
                </button>

                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{comments.length}</span>
                  <span>comments</span>
                </div>
              </div>
            </header>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />
          </div>
        </div>

        {/* Comments Section */}
        <section id="comments" className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h3>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="btn-primary"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">Please sign in to leave a comment.</p>
              <Link to="/login" className="btn-primary inline-block">
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <div className="spinner"></div>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  {/* Comment */}
                  <div className="flex space-x-4">
                    {comment.author.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.author.name}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {isAuthenticated && user?.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      
                      {isAuthenticated && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Reply
                        </button>
                      )}

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div className="mt-4">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                            className="input-field resize-none mb-2"
                            placeholder="Write a reply..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReplySubmit(comment.id)}
                              disabled={!replyContent.trim()}
                              className="btn-primary text-sm"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="btn-secondary text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-3">
                              {reply.author.avatar_url ? (
                                <img
                                  src={reply.author.avatar_url}
                                  alt={reply.author.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                  </span>
                                  {isAuthenticated && user?.id === reply.user_id && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-red-600 hover:text-red-700 text-xs"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </section>
      </article>
    </div>
  );
};

export default PostDetail;