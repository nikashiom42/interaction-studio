import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  main_image: string | null;
  author_name: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
}

const BlogSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['published-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [blogPosts]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.querySelector('.blog-card')?.clientWidth || 400;
      const scrollAmount = direction === 'left' ? -cardWidth - 24 : cardWidth + 24;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Estimate reading time based on content length
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Don't render section if no blogs
  if (!isLoading && (!blogPosts || blogPosts.length === 0)) {
    return null;
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              From Our Blog
            </h2>
            <p className="text-muted-foreground">
              Tips, guides, and inspiration for your next road trip
            </p>
          </div>

          {/* Navigation Arrows - Desktop */}
          {blogPosts && blogPosts.length > 2 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'border-border hover:border-foreground hover:bg-secondary text-foreground'
                    : 'border-border/50 text-muted-foreground cursor-not-allowed'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'border-border hover:border-foreground hover:bg-secondary text-foreground'
                    : 'border-border/50 text-muted-foreground cursor-not-allowed'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[calc(50%-12px)] min-w-[300px] max-w-[500px] bg-card rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-10 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blog Cards Carousel */}
        {!isLoading && blogPosts && (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
          >
            {blogPosts.map((post, index) => (
              <article
                key={post.id}
                className="blog-card flex-shrink-0 w-[calc(50%-12px)] min-w-[300px] max-w-[500px] snap-start bg-card rounded-xl overflow-hidden shadow-card card-hover animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                {/* Image */}
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                  {post.main_image ? (
                    <img
                      src={post.main_image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-5">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {post.published_at && (
                      <>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                        </div>
                        <span>•</span>
                      </>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getReadingTime(post.content)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More Button */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Mobile Scroll Indicator */}
        {blogPosts && blogPosts.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
            {blogPosts.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-border"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
