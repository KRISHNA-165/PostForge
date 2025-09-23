import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, User, Clock, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { likePost } from '../store/slices/postsSlice';
import { supabase } from '../lib/supabase';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  image_url?: string;
  author_id: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;
    
    dispatch(likePost({ postId: post.id, userId: user.id }));
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;

      const method = isBookmarked ? 'DELETE' : 'POST';
      await fetch(`/api/bookmarks/${post.id}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      // swallow for now; could add toast
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden card-hover">
      {post.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Link to={`/profile/${post.author.id}`} className="flex items-center space-x-3 hover:opacity-80">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </Link>
        </div>

        {/* Title */}
        <Link to={`/post/${post.id}`}>
          <h2 className="card-title mb-3 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt || stripHtml(post.content).substring(0, 150) + '...'}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${
                post.is_liked
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
              disabled={!isAuthenticated}
            >
              <Heart
                className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">{post.likes_count || 0}</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${
                isBookmarked
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              disabled={!isAuthenticated}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{post.comments_count || 0}</span>
            </Link>
          </div>

          <Link
            to={`/post/${post.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;