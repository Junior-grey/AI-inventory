export interface Post {
  id: string;
  title: string;
  content: string;
  summary: string;
  status: 'draft' | 'published' | 'scheduled';
  categoryId: string;
  tags: string[];
  publishDate: string;
  authorId: string;
  readingTime: number; // in minutes
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  slug: string;
  likes: number;
  views: number;
  commentsCount: number;
  canonicalUrl?: string;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon name
  image: string; // Background visual
}

export interface AITool {
  id: string;
  name: string;
  rating: number;
  description: string;
  longDescription?: string;
  logo: string; // Lucide icon or image link
  url: string;
  categoryId: string;
  pricing: 'free' | 'freemium' | 'paid';
  features: string[];
  pros: string[];
  cons: string[];
  pricingDetails?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  date: string;
  approved: boolean;
  isSpam?: boolean;
}

export interface Author {
  id: string;
  name: string;
  role: 'Admin' | 'Editor' | 'Author' | 'Contributor' | 'Reader';
  avatar: string;
  bio: string;
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export interface ThemeSettings {
  primaryColor: string; // hex
  secondaryColor: string; // hex
  accentColor: string; // hex
  bgStyle: 'white' | 'slate' | 'dark' | 'glass';
  fontSans: string;
  fontHeading: string;
  borderRadius: string; // rounded-none, rounded-md, rounded-xl, rounded-full
  cardStyle: 'default' | 'flat' | 'bordered' | 'glass';
  isDarkMode: boolean;
}

export interface AnalyticsData {
  visitors: number;
  pageviews: number;
  bounceRate: number; // %
  trafficSources: { source: string; percentage: number; count: number }[];
  topCountries: { country: string; percentage: number; count: number }[];
  devices: { device: string; percentage: number }[];
  browsers: { browser: string; percentage: number }[];
  dailyStats: { date: string; visitors: number; pageviews: number }[];
  popularSearches: { query: string; count: number }[];
  popularCategories: { name: string; views: number }[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'pdf' | 'document' | 'icon';
  size: string; // e.g. "1.2 MB"
  uploadDate: string;
  folder?: string;
  altText?: string;
}

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  code: 301 | 302;
}
