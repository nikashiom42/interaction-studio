import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

interface Blog {
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
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  schema_markup: string | null;
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as Blog;
    },
    enabled: !!slug,
  });

  // Estimate reading time based on content length
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Blog post not found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={blog.meta_title || blog.title}
        description={blog.meta_description || blog.excerpt || undefined}
        url={`/blog/${blog.slug}`}
        type="article"
        image={blog.main_image || undefined}
        schemaMarkup={blog.schema_markup || undefined}
      />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {blog.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {blog.author_name && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{blog.author_name}</span>
                </div>
              )}
              {blog.published_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(blog.published_at), 'MMMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{getReadingTime(blog.content)}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.main_image && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={blog.main_image}
                alt={blog.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-lg text-muted-foreground mb-8 font-medium border-l-4 border-primary pl-4">
              {blog.excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:text-foreground
              prose-p:text-muted-foreground
              prose-a:text-primary
              prose-strong:text-foreground
              prose-ul:text-muted-foreground
              prose-ol:text-muted-foreground
              prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* CTA */}
        <div className="mt-16 p-8 bg-secondary/30 rounded-xl text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Ready for Your Georgian Adventure?
          </h3>
          <p className="text-muted-foreground mb-4">
            Explore our fleet of premium vehicles and book your perfect road trip today.
          </p>
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-coral-hover transition-colors"
          >
            Browse Our Cars
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
