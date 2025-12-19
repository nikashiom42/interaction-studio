import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  category: string;
  date: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Scenic Routes in Georgia for Your Road Trip',
    excerpt: 'Discover the most breathtaking driving routes through the Caucasus mountains, from Tbilisi to Kazbegi and beyond.',
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80',
    readTime: '5 min read',
    category: 'Travel Guide',
    date: 'Dec 15, 2025',
  },
  {
    id: '2',
    title: 'Self-Drive vs Chauffeur: Which Option is Right for You?',
    excerpt: 'Compare the benefits of driving yourself versus hiring a professional driver for your Georgian adventure.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    readTime: '4 min read',
    category: 'Tips & Advice',
    date: 'Dec 12, 2025',
  },
  {
    id: '3',
    title: 'Best Family-Friendly Cars for Your Georgian Vacation',
    excerpt: 'Find the perfect vehicle for your family trip with our guide to spacious, comfortable, and safe rental options.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    readTime: '6 min read',
    category: 'Car Reviews',
    date: 'Dec 10, 2025',
  },
  {
    id: '4',
    title: 'Hidden Gems: Off-the-Beaten-Path Destinations in Georgia',
    excerpt: 'Explore lesser-known destinations that are perfect for adventurous travelers with a rental car.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    readTime: '7 min read',
    category: 'Adventure',
    date: 'Dec 8, 2025',
  },
];

const BlogSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.querySelector('.blog-card')?.clientWidth || 400;
      const scrollAmount = direction === 'left' ? -cardWidth - 24 : cardWidth + 24;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
        </div>

        {/* Blog Cards Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
        >
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className="blog-card flex-shrink-0 w-[calc(50%-12px)] min-w-[300px] max-w-[500px] snap-start bg-card rounded-xl overflow-hidden shadow-card card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                {/* Book the Car Button */}
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg btn-scale hover:bg-coral-hover transition-colors"
                >
                  Book the Car
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
          {blogPosts.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-border"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;