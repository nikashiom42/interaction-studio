import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

const defaultTitle = 'Car Rental Georgia | Premium Cars & Tours';
const defaultDescription = 'Rent premium cars in Georgia. Explore Tbilisi, Batumi, Kutaisi and more with our reliable car rental service. Best prices, free cancellation, 24/7 support.';
const defaultKeywords = 'car rental Georgia, rent a car Tbilisi, car hire Batumi, Georgia tours, road trips Georgia, self-drive Georgia';
const siteUrl = 'https://carrental.ge';

const SEO = ({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = '/og-image.jpg',
  url,
  type = 'website',
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | Car Rental Georgia` : defaultTitle;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Car Rental Georgia" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Additional SEO */}
      <meta name="geo.region" content="GE" />
      <meta name="geo.placename" content="Georgia" />
      <html lang="en" />
    </Helmet>
  );
};

export default SEO;
