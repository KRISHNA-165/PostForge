import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { fetchPosts, resetPosts } from '../store/slices/postsSlice';
import PostCard from '../components/PostCard';
import { PenTool, TrendingUp, Users, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posts, loading, hasMore, currentPage } = useSelector((state: RootState) => state.posts);
  const [initialLoad, setInitialLoad] = useState(true);
  const latestSectionRef = useRef<HTMLDivElement | null>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (initialLoad) {
      dispatch(resetPosts());
      dispatch(fetchPosts({ page: 0 }));
      setInitialLoad(false);
    }
  }, [dispatch, initialLoad]);

  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoad) {
      dispatch(fetchPosts({ page: currentPage + 1 }));
    }
  }, [inView, hasMore, loading, currentPage, dispatch, initialLoad]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>BlogHub – Discover and Share Stories</title>
        <meta name="description" content="Read the latest stories from our community and share your own with BlogHub." />
      </Helmet>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="hero-title mb-6 fade-in">
              Share Your Stories with the World
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto fade-in">
              Join our community of writers and readers. Discover amazing stories, share your thoughts, and connect with like-minded individuals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
              <button
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                onClick={() => {
                  if (latestSectionRef.current) {
                    latestSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Start Reading
              </button>
              <button
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
                onClick={() => navigate('/create-post')}
              >
                Write Your Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{posts.length}+</h3>
              <p className="text-gray-600">Stories Published</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1K+</h3>
              <p className="text-gray-600">Active Writers</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Monthly Readers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-16" ref={latestSectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Latest Stories</h2>
            <p className="text-gray-600 text-lg">
              Discover the newest and most engaging content from our community
            </p>
          </div>

          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div ref={ref} className="flex justify-center py-8">
                  {loading && (
                    <div className="flex items-center space-x-2">
                      <div className="spinner"></div>
                      <span className="text-gray-600">Loading more stories...</span>
                    </div>
                  )}
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">You've reached the end of our stories!</p>
                </div>
              )}
            </>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="spinner"></div>
                <span className="text-gray-600">Loading stories...</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <PenTool className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No stories yet</h3>
              <p className="text-gray-600">Be the first to share your story with the community!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;