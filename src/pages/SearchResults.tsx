import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchPosts, resetPosts } from '../store/slices/postsSlice';
import PostCard from '../components/PostCard';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.posts);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    if (query) {
      dispatch(resetPosts());
      dispatch(fetchPosts({ page: 0, search: query }));
      setSearchTerm(query);
    }
  }, [query, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative max-w-2xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="input-field pr-12"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-4"
              >
                <Search className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </form>

          {query && (
            <p className="text-gray-600">
              Showing results for: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="spinner"></div>
              <span className="text-gray-600">Searching...</span>
            </div>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found {posts.length} result{posts.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        ) : query ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any posts matching "{query}". Try different keywords or browse all posts.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Start your search</h3>
            <p className="text-gray-600">
              Enter keywords above to find posts that interest you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;