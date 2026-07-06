import React, { useState, useEffect, useRef } from 'react';
import { useCMS } from '../context/CMSContext';
import { Post, Category, AITool, Comment, Author } from '../types';
import { 
  Heart, Bookmark, Share2, Copy, Link2, Calendar, Clock, User, 
  ArrowRight, Search, Sparkles, Star, ChevronLeft, ChevronRight, 
  Mail, Check, MapPin, Phone, Github, Twitter, Linkedin, Facebook,
  Play, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Layers, Info, Cpu, BookOpen
} from 'lucide-react';
import * as Icons from 'lucide-react';

export const ReaderView: React.FC = () => {
  const {
    posts,
    categories,
    aiTools,
    comments,
    authors,
    subscribers,
    themeSettings,
    bookmarks,
    recentlyViewed,
    selectedPostId,
    setSelectedPostId,
    selectedToolId,
    setSelectedToolId,
    selectedCategoryId,
    setSelectedCategoryId,
    activeTag,
    setActiveTag,
    searchQuery,
    setSearchQuery,
    addComment,
    addSubscriber,
    likePost,
    viewPost,
    toggleBookmark,
    isAdminMode,
    setIsAdminMode
  } = useCMS();

  // Navigation pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Newsletter subscribe state
  const [newsEmail, setNewsEmail] = useState('');
  const [newsMsg, setNewsMsg] = useState({ success: false, text: '' });

  // Comment submission state
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentEmail, setNewCommentEmail] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Floating States
  const [isCopied, setIsCopied] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(() => {
    return !localStorage.getItem('ai_inventory_cookies_accepted');
  });

  // Reading progress state
  const [scrollProgress, setScrollProgress] = useState(0);

  // Map Lucide icons or official logo image URLs dynamically
  const renderIcon = (name: string, className = "h-5 w-5") => {
    if (name && (name.startsWith('http://') || name.startsWith('https://') || name.includes('/') || name.includes('.'))) {
      return <img src={name} alt="Logo" className={`${className} object-contain rounded`} referrerPolicy="no-referrer" />;
    }
    const IconComponent = (Icons as any)[name] || Icons.Cpu;
    return <IconComponent className={className} />;
  };

  // Scroll to top on navigation actions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedPostId, selectedToolId, selectedCategoryId, activeTag]);

  // Track scroll position for article reading progress
  useEffect(() => {
    if (!selectedPostId) {
      setScrollProgress(0);
      return;
    }
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedPostId]);

  // Track page view increment once when post is selected
  useEffect(() => {
    if (selectedPostId) {
      viewPost(selectedPostId);
    }
  }, [selectedPostId]);

  // Filter posts based on search query, active category and tag
  const getFilteredPosts = () => {
    let result = posts.filter(p => p.status === 'published');

    if (selectedCategoryId && selectedCategoryId !== 'all-tools') {
      result = result.filter(p => p.categoryId === selectedCategoryId);
    }

    if (activeTag) {
      if (activeTag === 'about-view' || activeTag === 'contact-view') {
        return []; // special pages
      }
      result = result.filter(p => p.tags.includes(activeTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p => p.title.toLowerCase().includes(q) || 
             p.content.toLowerCase().includes(q) ||
             p.summary.toLowerCase().includes(q) ||
             p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  };

  // Filter tools based on category & search
  const getFilteredTools = () => {
    let result = aiTools;
    if (selectedCategoryId && selectedCategoryId !== 'all-tools') {
      result = result.filter(t => t.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t => t.name.toLowerCase().includes(q) || 
             t.description.toLowerCase().includes(q) ||
             t.features.some(f => f.toLowerCase().includes(q))
      );
    }
    return result;
  };

  // Pagination for posts
  const filteredPosts = getFilteredPosts();
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Subscribe Handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentEmail = newsEmail;
    
    // Also submit to Formspree
    try {
      await fetch("https://formspree.io/f/mykqovvp", {
        method: "POST",
        body: JSON.stringify({
          formType: "Newsletter Subscription",
          email: currentEmail,
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error("Formspree subscription failed:", err);
    }

    const res = addSubscriber(currentEmail);
    setNewsMsg({ success: res.success, text: res.message });
    if (res.success) {
      setNewsEmail('');
    }
  };

  // Contact Form Handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    // Also submit to Formspree
    try {
      await fetch("https://formspree.io/f/mykqovvp", {
        method: "POST",
        body: JSON.stringify({
          formType: "Contact Form",
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject || "No Subject",
          message: contactForm.message
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error("Formspree contact submit failed:", err);
    }

    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  // Comment Submission Handler
  const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newCommentName || !newCommentEmail || !newCommentContent) return;

    // Also submit to Formspree
    try {
      await fetch("https://formspree.io/f/mykqovvp", {
        method: "POST",
        body: JSON.stringify({
          formType: "Blog Comment",
          postId: postId,
          postTitle: posts.find(p => p.id === postId)?.title || postId,
          name: newCommentName,
          email: newCommentEmail,
          comment: newCommentContent
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error("Formspree comment submit failed:", err);
    }

    addComment(postId, newCommentName, newCommentEmail, newCommentContent);
    setCommentSuccess(true);
    setNewCommentName('');
    setNewCommentEmail('');
    setNewCommentContent('');
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  // Copy article link to clipboard
  const handleCopyLink = (post: Post) => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const featuredPost = posts.find(p => p.isFeatured && p.status === 'published') || posts[0];

  // Render Theme Font styling
  const fontSansClass = themeSettings.fontSans === 'Inter' ? 'font-sans' : 'font-sans';
  const fontHeadingClass = themeSettings.fontHeading === 'Space Grotesk' ? 'font-heading' : 'font-heading';

  return (
    <div className={`min-h-screen transition-all ${themeSettings.isDarkMode ? 'bg-[#020617] text-slate-100' : (themeSettings.bgStyle === 'slate' ? 'bg-slate-50 text-gray-900' : 'bg-gray-50/50 text-gray-900')} ${fontSansClass}`}>
      
      {/* 1. Article Reading Progress Bar */}
      {selectedPostId && (
        <div className="fixed top-16 left-0 z-50 h-1.5 w-full bg-gray-100 dark:bg-gray-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-75" 
            style={{ width: `${scrollProgress}%`, backgroundColor: themeSettings.primaryColor }}
          />
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ====================================
            CASE 1: VIEWING A SPECIFIC BLOG POST
            ==================================== */}
        {selectedPostId && (
          (() => {
            const post = posts.find(p => p.id === selectedPostId);
            if (!post) return <div className="text-center py-20">Post not found.</div>;
            
            const author = authors.find(a => a.id === post.authorId);
            const category = categories.find(c => c.id === post.categoryId);
            const relatedPosts = posts.filter(p => p.id !== post.id && p.categoryId === post.categoryId && p.status === 'published').slice(0, 3);
            const postComments = comments.filter(c => c.postId === post.id && c.approved);

            return (
              <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-300">
                
                {/* Back Button and Sidebar Sticky Metadata */}
                <div className="lg:col-span-3">
                  <div className="sticky top-24 space-y-6">
                    <button
                      onClick={() => setSelectedPostId(null)}
                      className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      style={{ color: themeSettings.primaryColor }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Articles
                    </button>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mb-4" style={{ color: themeSettings.primaryColor, backgroundColor: `${themeSettings.primaryColor}10` }}>
                        {category?.name || 'AI Insight'}
                      </span>
                      
                      <div className="space-y-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-2" />
                          <span>Published on {post.publishDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-2" />
                          <span>{post.readingTime} min read</span>
                        </div>
                        <div className="flex items-center">
                          <Sparkles className="h-3.5 w-3.5 mr-2 text-yellow-500" />
                          <span>{post.views} global reads</span>
                        </div>
                      </div>

                      {/* Author Card */}
                      {author && (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center space-x-3">
                            <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full object-cover" />
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{author.name}</h4>
                              <p className="text-[11px] text-gray-400">{author.role}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">{author.bio}</p>
                        </div>
                      )}
                    </div>

                    {/* Bookmark, Like & Social Shares */}
                    <div className="flex justify-around items-center rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm">
                      <button 
                        onClick={() => likePost(post.id)}
                        className="flex items-center text-sm font-semibold text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 group"
                      >
                        <Heart className="h-5 w-5 mr-1.5 group-hover:scale-110 transition-transform" />
                        <span>{post.likes}</span>
                      </button>

                      <button 
                        onClick={() => toggleBookmark(post.id)}
                        className={`flex items-center text-sm font-semibold group ${bookmarks.includes(post.id) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'}`}
                        style={bookmarks.includes(post.id) ? { color: themeSettings.primaryColor } : {}}
                      >
                        <Bookmark className={`h-5 w-5 mr-1.5 group-hover:scale-110 transition-transform ${bookmarks.includes(post.id) ? 'fill-current' : ''}`} />
                        <span>Save</span>
                      </button>

                      <button 
                        onClick={() => handleCopyLink(post)}
                        className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 group"
                      >
                        {isCopied ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5 mr-1.5 group-hover:scale-110 transition-transform" />}
                        <span>{isCopied ? 'Copied' : 'Share'}</span>
                      </button>
                    </div>

                    {/* Simple Table of Contents */}
                    <div className="hidden lg:block rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">On This Page</h4>
                      <div className="space-y-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                        <a href="#intro" className="block hover:text-blue-600 dark:hover:text-blue-400">1. Introduction & Overview</a>
                        <a href="#insights" className="block hover:text-blue-600 dark:hover:text-blue-400">2. Strategic Benchmarks</a>
                        <a href="#evaluation" className="block hover:text-blue-600 dark:hover:text-blue-400">3. Direct Comparison Matrix</a>
                        <a href="#decision" className="block hover:text-blue-600 dark:hover:text-blue-400">4. Critical Roadblocks</a>
                        <a href="#comments" className="block hover:text-blue-600 dark:hover:text-blue-400">5. Community Conversations</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Article Content Area */}
                <div className="lg:col-span-9 space-y-8">
                  <div className="space-y-4">
                    <h1 className={`${fontHeadingClass} text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight`}>
                      {post.title}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 italic">
                      {post.summary}
                    </p>
                  </div>

                  {/* Featured Header Image */}
                  <div className="relative overflow-hidden rounded-2xl aspect-video max-h-[460px]">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-101 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Render Core Content (Supporting standard rendering with clean markup styling) */}
                  <div className="prose prose-blue max-w-none dark:prose-invert text-base md:text-lg text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
                    <div id="intro" />
                    {/* Convert simple markdown strings into visually styled sections */}
                    {post.content.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('# ')) {
                        return null; // Skip duplicate h1
                      }
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={pIdx} className={`${fontHeadingClass} text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-l-4 border-blue-600 pl-3`} style={{ borderColor: themeSettings.primaryColor }}>
                            {paragraph.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={pIdx} className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
                            {paragraph.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (paragraph.startsWith('> ')) {
                        return (
                          <blockquote key={pIdx} className="border-l-4 border-blue-500 bg-blue-50/40 p-4 rounded-r-xl dark:bg-blue-950/20 dark:border-blue-400 my-6 italic text-base md:text-lg text-gray-600 dark:text-gray-400">
                            {paragraph.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      if (paragraph.startsWith('* ')) {
                        return (
                          <ul key={pIdx} className="list-disc pl-6 space-y-2 text-base md:text-lg text-gray-700 dark:text-gray-300">
                            {paragraph.split('\n').map((li, lIdx) => (
                              <li key={lIdx}>{li.replace('* ', '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.startsWith('1. ')) {
                        return (
                          <ol key={pIdx} className="list-decimal pl-6 space-y-2 text-base md:text-lg text-gray-700 dark:text-gray-300">
                            {paragraph.split('\n').map((li, lIdx) => (
                              <li key={lIdx}>{li.replace(/^\d+\.\s+/, '')}</li>
                            ))}
                          </ol>
                        );
                      }
                      if (paragraph.includes('|')) {
                        // Render simple tables beautifully
                        const rows = paragraph.split('\n').filter(r => r.trim());
                        return (
                          <div key={pIdx} className="overflow-x-auto my-6 border border-gray-200 rounded-xl dark:border-gray-800 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rows.map((row, rIdx) => {
                                  if (row.includes('---') || row.includes(':---')) return null;
                                  const cols = row.split('|').filter((_, colIdx, arr) => colIdx > 0 && colIdx < arr.length - 1);
                                  const isHeader = rIdx === 0;
                                  return (
                                    <tr key={rIdx} className={isHeader ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-950"}>
                                      {cols.map((col, colIdx) => (
                                        <td key={colIdx} className={`px-4 py-3 text-base ${isHeader ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                          {col.trim()}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      if (paragraph.startsWith('```')) {
                        const codeLines = paragraph.split('\n');
                        const language = codeLines[0].replace('```', '') || 'code';
                        const code = codeLines.slice(1, -1).join('\n');
                        return (
                          <div key={pIdx} className="relative rounded-xl overflow-hidden bg-gray-900 text-gray-100 my-6 font-mono text-sm p-5 shadow-inner">
                            <div className="absolute right-4 top-3 text-xs tracking-wider uppercase font-semibold text-gray-500">
                              {language}
                            </div>
                            <pre className="overflow-x-auto">{code}</pre>
                          </div>
                        );
                      }
                      if (paragraph.startsWith('<iframe')) {
                        // Safe extraction for iframe
                        const srcMatch = paragraph.match(/src="([^"]+)"/);
                        if (srcMatch && srcMatch[1]) {
                          return (
                            <div key={pIdx} className="relative overflow-hidden rounded-xl aspect-video shadow-md my-6">
                              <iframe 
                                className="absolute inset-0 w-full h-full border-0" 
                                src={srcMatch[1]} 
                                title="YouTube Video Embed" 
                                allowFullScreen
                              />
                            </div>
                          );
                        }
                      }
                      if (paragraph.startsWith('<img')) {
                        // Safe extraction for img
                        const srcMatch = paragraph.match(/src="([^"]+)"/);
                        if (srcMatch && srcMatch[1]) {
                          return (
                            <img 
                              key={pIdx} 
                              src={srcMatch[1]} 
                              alt="Article visual" 
                              className="w-full h-80 object-cover rounded-xl my-6" 
                              referrerPolicy="no-referrer"
                            />
                          );
                        }
                      }
                      return <p key={pIdx} className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300">{paragraph}</p>;
                    })}
                  </div>

                  {/* Article Tags */}
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
                    {post.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setActiveTag(tag);
                          setSelectedPostId(null);
                        }}
                        className="rounded-full bg-gray-100 px-3.5 py-1 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-blue-950/40"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  {/* Related Articles Section */}
                  {relatedPosts.length > 0 && (
                    <div className="space-y-4 pt-10 border-t border-gray-200 dark:border-gray-800">
                      <h3 className={`${fontHeadingClass} text-xl font-extrabold text-gray-900 dark:text-white`}>Related Articles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedPosts.map(rp => (
                          <div 
                            key={rp.id}
                            onClick={() => setSelectedPostId(rp.id)}
                            className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900"
                          >
                            <img src={rp.featuredImage} alt={rp.title} className="h-40 w-full object-cover rounded-xl mb-3" referrerPolicy="no-referrer" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest" style={{ color: themeSettings.primaryColor }}>
                              {categories.find(c => c.id === rp.categoryId)?.name || 'AI Insight'}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 mt-1 line-clamp-2" style={{ color: themeSettings.primaryColor }}>{rp.title}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments Thread */}
                  <div id="comments" className="pt-10 border-t border-gray-200 dark:border-gray-800 space-y-6">
                    <h3 className={`${fontHeadingClass} text-xl font-extrabold text-gray-900 dark:text-white flex items-center`}>
                      <Icons.MessageSquare className="h-5 w-5 mr-2 text-blue-600" style={{ color: themeSettings.primaryColor }} />
                      Comments ({postComments.length})
                    </h3>

                    {/* Submit Comment Form */}
                    <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="space-y-4 bg-gray-50 p-6 rounded-2xl dark:bg-gray-900/60">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Leave a Reply</h4>
                      <p className="text-xs text-gray-400">Your email address will not be published. Required fields are marked *</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          value={newCommentName}
                          onChange={(e) => setNewCommentName(e.target.value)}
                          placeholder="Name *"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                        />
                        <input
                          type="email"
                          required
                          value={newCommentEmail}
                          onChange={(e) => setNewCommentEmail(e.target.value)}
                          placeholder="Email *"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                        />
                      </div>
                      <textarea
                        required
                        rows={4}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        placeholder="Type your constructive comment here... *"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                      />
                      
                      <button
                        type="submit"
                        className="rounded-xl px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      >
                        Submit Comment
                      </button>

                      {commentSuccess && (
                        <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Comment submitted! It will appear once approved by the administrator.
                        </div>
                      )}
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {postComments.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No approved comments yet. Be the first to start the discussion!</p>
                      ) : (
                        postComments.map(comment => (
                          <div key={comment.id} className="bg-white border border-gray-100 p-5 rounded-2xl dark:bg-gray-900 dark:border-gray-800/80 shadow-sm flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm dark:bg-blue-950 dark:text-blue-400" style={{ color: themeSettings.primaryColor, backgroundColor: `${themeSettings.primaryColor}15` }}>
                              {comment.authorName[0]}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{comment.authorName}</h4>
                                <span className="text-[10px] text-gray-400">{comment.date}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })()
        )}

        {/* ====================================
            CASE 2: VIEWING A SPECIFIC AI TOOL REVIEW
            ==================================== */}
        {selectedToolId && (
          (() => {
            const tool = aiTools.find(t => t.id === selectedToolId);
            if (!tool) return <div className="text-center py-20">Tool not found.</div>;
            const category = categories.find(c => c.id === tool.categoryId);

            return (
              <div className="space-y-8 animate-in fade-in duration-300">
                <button
                  onClick={() => setSelectedToolId(null)}
                  className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  style={{ color: themeSettings.primaryColor }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Tools Directory
                </button>

                {/* Hero Tool Card */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>
                        {renderIcon(tool.logo, "h-8 w-8")}
                      </div>
                      <div>
                        <h1 className={`${fontHeadingClass} text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white`}>
                          {tool.name}
                        </h1>
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                          {category?.name || 'AI Inventory'} Directory Product
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <div className="flex items-center rounded-xl bg-yellow-50 px-3 py-1.5 text-sm font-bold text-yellow-600 dark:bg-yellow-950/40">
                        <Star className="h-4 w-4 fill-current text-yellow-500 mr-1.5" />
                        {tool.rating} / 5.0
                      </div>
                      <span className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300 uppercase tracking-wider">
                        {tool.pricing}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col space-y-3 sm:pl-4">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-2xl px-6 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all text-center shadow-md shadow-blue-500/10"
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    >
                      Visit Official Tool
                      <Icons.ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                    {tool.pricingDetails && (
                      <p className="text-center text-[11px] text-gray-400 italic">
                        {tool.pricingDetails}
                      </p>
                    )}
                  </div>
                </div>

                {/* detailed columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Specs */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-4">
                      <h3 className={`${fontHeadingClass} text-lg font-bold text-gray-900 dark:text-white`}>Product Overview</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tool.longDescription}</p>
                    </div>

                    {/* Features List */}
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-4">
                      <h3 className={`${fontHeadingClass} text-lg font-bold text-gray-900 dark:text-white`}>Key Features & Modules</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tool.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                            <Check className="h-4.5 w-4.5 text-emerald-500 mr-2 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Pros & Cons */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">PROS</h3>
                      <ul className="space-y-2.5">
                        {tool.pros.map((pro, pIdx) => (
                          <li key={pIdx} className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2.5 mt-0.5 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">CONS</h3>
                      <ul className="space-y-2.5">
                        {tool.cons.map((con, cIdx) => (
                          <li key={cIdx} className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                            <ShieldAlert className="h-4 w-4 text-red-500 mr-2.5 mt-0.5 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* ====================================
            CASE 3: ALL AI TOOLS DIRECTORY LIST
            ==================================== */}
        {selectedCategoryId === 'all-tools' && !selectedToolId && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <h1 className={`${fontHeadingClass} text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white`}>
                The Unified AI Tools Directory
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Explore fully cited research reviews, benchmarks, pricing plans, and curated links for the world's most powerful productivity platforms.
              </p>
            </div>

            {/* Filter tags by categories */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedCategoryId('all-tools')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategoryId === 'all-tools'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                }`}
                style={selectedCategoryId === 'all-tools' ? { backgroundColor: themeSettings.primaryColor } : {}}
              >
                All Tools ({aiTools.length})
              </button>
              {categories.map((cat) => {
                const count = aiTools.filter(t => t.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                    }`}
                    style={selectedCategoryId === cat.id ? { backgroundColor: themeSettings.primaryColor } : {}}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredTools().length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-400">No tools found matching this criteria.</div>
              ) : (
                getFilteredTools().map(tool => (
                  <div 
                    key={tool.id}
                    className="group rounded-2xl border border-gray-200/80 bg-white p-5 hover:shadow-md hover:border-blue-500/20 transition-all dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/30 dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>
                            {renderIcon(tool.logo, "h-6 w-6")}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors" style={{ color: themeSettings.primaryColor }}>{tool.name}</h3>
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-400">
                              {categories.find(c => c.id === tool.categoryId)?.name || 'AI Insight'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center rounded-lg bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-600 dark:bg-yellow-950/30">
                          <Star className="h-3.5 w-3.5 fill-current text-yellow-500 mr-1" />
                          {tool.rating}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {tool.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tool.features.slice(0, 3).map((feat, fIdx) => (
                          <span key={fIdx} className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                        {tool.pricing}
                      </span>
                      <button
                        onClick={() => setSelectedToolId(tool.id)}
                        className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        style={{ color: themeSettings.primaryColor }}
                      >
                        Read Full Review
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ====================================
            CASE 4: ABOUT VIEW / MISSION
            ==================================== */}
        {activeTag === 'about-view' && (
          <div className="max-w-3xl mx-auto space-y-10 py-8 animate-in fade-in duration-300">
            <div className="space-y-4 text-center">
              <h1 className={`${fontHeadingClass} text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white`}>Our Mission at AI Inventory</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Charting the Generative Revolution with Integrity and Depth.</p>
            </div>

            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-10 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                Launched in 2026, <strong>AI Inventory</strong> is a premium, fully-independent tech publication focused exclusively on Artificial Intelligence. We analyze writing tools, code models, video generators, voice synthesizers, automation nodes, and productivity platforms.
              </p>
              <p>
                Our core philosophy centers on <strong>depth over clickbait</strong>. In an era where thousands of simple wrappers launch daily, our dedicated writing board works tirelessly to benchmark, stress-test, and filter the noise.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-gray-100 dark:border-gray-800">
                <div className="text-center space-y-1">
                  <span className="text-3xl font-extrabold text-blue-600" style={{ color: themeSettings.primaryColor }}>30+</span>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">In-depth Articles</p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-extrabold text-blue-600" style={{ color: themeSettings.primaryColor }}>20+</span>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tools Indexed</p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-extrabold text-blue-600" style={{ color: themeSettings.primaryColor }}>24K+</span>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Monthly Readers</p>
                </div>
              </div>

              <h3 className={`${fontHeadingClass} text-lg font-bold text-gray-900 dark:text-white pt-2`}>Independent Benchmarking Standards</h3>
              <p>
                Unlike standard sponsored hubs, every single product review in our directory is crafted by technical professionals. We buy paid seats, code integration branches, render cinematic frame outputs, and compare performance tables directly under stress to ensure our ratings are honest, balanced, and valuable.
              </p>
            </div>
          </div>
        )}

        {/* ====================================
            CASE 5: CONTACT VIEW & FAQS
            ==================================== */}
        {activeTag === 'contact-view' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-8 animate-in fade-in duration-300">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <h1 className={`${fontHeadingClass} text-3xl font-extrabold text-gray-900 dark:text-white`}>Get in Touch</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Have an AI product suggestion, advertising query, or feedback? Send us a message!</p>
              </div>

              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-5">
                <div className="flex items-start space-x-3.5 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" style={{ color: themeSettings.primaryColor }} />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Editorial HQ</h4>
                    <p className="text-xs text-gray-400 mt-0.5">85 Pine Street, Silicon Valley, CA 94025</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" style={{ color: themeSettings.primaryColor }} />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Inquiries</h4>
                    <p className="text-xs text-gray-400 mt-0.5">christiannashon@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" style={{ color: themeSettings.primaryColor }} />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Business Hours</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Mon - Fri, 9:00 AM - 6:00 PM PST</p>
                  </div>
                </div>
              </div>

              {/* FAQ Accordions */}
              <div className="space-y-4">
                <h3 className={`${fontHeadingClass} text-lg font-bold text-gray-900 dark:text-white`}>Frequently Asked Questions</h3>
                {[
                  { q: "Can we list our AI tool in your directory?", a: "Yes, you can submit your tool via our editorial email. We benchmark all submissions thoroughly." },
                  { q: "How do you calculate product rating scores?", a: "Our ratings evaluate feature depth, price accuracy, logic benchmarking, and customer feedback." },
                  { q: "Do you support sponsored reviews?", a: "We accept sponsorships but retain absolute editorial independence over final benchmarking scores." }
                ].map((faq, fIdx) => (
                  <div key={fIdx} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{faq.q}</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleContactSubmit} className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-4">
                <h3 className={`${fontHeadingClass} text-xl font-bold text-gray-900 dark:text-white`}>Send Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Alexander"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="alexander@mail.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Product Sponsorship Inquiry"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Message Body *</label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="How can our editorial board assist you today? *"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  Send Inquiry Message
                </button>

                {contactSuccess && (
                  <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Message sent successfully! Our team will respond shortly.
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ====================================
            CASE 6: PRIMARY HOMEPAGE / ARCHIVE VIEWS
            ==================================== */}
        {!selectedPostId && !selectedToolId && selectedCategoryId !== 'all-tools' && activeTag !== 'about-view' && activeTag !== 'contact-view' && (
          <div className="space-y-16 animate-in fade-in duration-300">
            
            {/* 1. HERO SECTION (Only on Homepage turn 1 without categories/tags/searches) */}
            {!selectedCategoryId && !activeTag && !searchQuery && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-blue-50/40 via-white to-transparent p-6 sm:p-8 rounded-3xl border border-gray-100 dark:from-gray-900/10 dark:to-transparent dark:border-gray-900">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center space-x-2 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-xs font-bold text-blue-600 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>The Curated AI Tools Directory</span>
                  </div>
                  <h1 className={`${fontHeadingClass} text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight`}>
                    Discover the <span className="text-blue-600" style={{ color: themeSettings.primaryColor }}>Best AI Tools</span> for Every Task.
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Expert evaluations, performance benchmarks, and deep coding guides mapping out the leading artificial intelligence platforms.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedCategoryId('all-tools')}
                      className="rounded-xl px-5 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    >
                      Explore Tools
                    </button>
                    <button
                      onClick={() => {
                        const latestSec = document.getElementById('latest-posts');
                        latestSec?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Latest Articles
                    </button>
                  </div>
                </div>

                {/* Large Featured Article Hero Card */}
                {featuredPost && (
                  <div 
                    onClick={() => setSelectedPostId(featuredPost.id)}
                    className="lg:col-span-7 group cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800/80 dark:bg-gray-900 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-video overflow-hidden h-64 sm:h-80">
                      <img 
                        src={featuredPost.featuredImage} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 rounded-xl bg-blue-600 text-white px-3.5 py-1.5 text-xs font-bold" style={{ backgroundColor: themeSettings.primaryColor }}>
                        FEATURED
                      </div>
                    </div>
                    <div className="p-6 space-y-2.5">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest" style={{ color: themeSettings.primaryColor }}>
                        {categories.find(c => c.id === featuredPost.categoryId)?.name || 'AI insight'}
                      </span>
                      <h2 className={`${fontHeadingClass} text-2xl sm:text-3xl font-extrabold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors`}>
                        {featuredPost.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-400 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {featuredPost.summary}
                      </p>
                      <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-400 pt-2 font-semibold">
                        <span className="flex items-center"><User className="h-3.5 w-3.5 mr-1" /> Alexander Sterling</span>
                        <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {featuredPost.publishDate}</span>
                        <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {featuredPost.readingTime} min</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Active Filters Header */}
            {(selectedCategoryId || activeTag || searchQuery) && (
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Showing results for:{' '}
                  <span className="text-blue-600" style={{ color: themeSettings.primaryColor }}>
                    {searchQuery ? `Search: "${searchQuery}"` : (activeTag ? `Tag: #${activeTag}` : `Category: ${categories.find(c => c.id === selectedCategoryId)?.name}`)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setActiveTag(null);
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600 font-sans"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* 2. TRENDING POSTS SECTION */}
            {!selectedCategoryId && !activeTag && !searchQuery && (
              <div className="space-y-4">
                <h3 className={`${fontHeadingClass} text-xl font-extrabold text-gray-900 dark:text-white flex items-center`}>
                  <Icons.Flame className="h-5 w-5 mr-1 text-orange-500 animate-pulse" />
                  Trending Conversations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {posts.filter(p => p.status === 'published').slice(1, 5).map(post => (
                    <div 
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className="group cursor-pointer rounded-2xl border border-gray-200/80 bg-white p-4 hover:shadow-md transition-all dark:border-gray-800/80 dark:bg-gray-900 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <img src={post.featuredImage} alt={post.title} className="h-36 w-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                        <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase" style={{ color: themeSettings.primaryColor }}>
                          {categories.find(c => c.id === post.categoryId)?.name || 'AI Insight'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 line-clamp-2" style={{ color: themeSettings.primaryColor }}>{post.title}</h4>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50 dark:border-gray-800 mt-2">
                        <span>{post.publishDate}</span>
                        <span>{post.readingTime} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. FEATURED CATEGORIES BAR (Always available for list feeds) */}
            <div className="space-y-4">
              <h3 className={`${fontHeadingClass} text-xl font-extrabold text-gray-900 dark:text-white flex items-center`}>
                <Layers className="h-5 w-5 mr-1.5 text-blue-600 animate-pulse" style={{ color: themeSettings.primaryColor }} />
                Browse AI Tools by Category
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(cat => {
                  const count = aiTools.filter(t => t.categoryId === cat.id).length;
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSearchQuery('');
                      }}
                      className={`cursor-pointer rounded-2xl border p-5 text-center hover:border-blue-500/20 hover:shadow-md transition-all duration-300 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/10 dark:border-blue-500 ring-2 ring-blue-500/10' 
                          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                      }`}
                    >
                      <div className="mx-auto h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400 mb-3" style={{ color: themeSettings.primaryColor }}>
                        {renderIcon(cat.icon, "h-6 w-6")}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{cat.name}</h4>
                      <span className="text-xs text-gray-400 font-semibold">{count} Premium Tools</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. MAIN DYNAMIC CONTAINER: SEARCH vs SELECTED CATEGORY vs HOMEPAGE FEED */}
            {searchQuery.trim() !== '' ? (
              <div className="space-y-12 animate-in fade-in duration-300">
                {/* Search Header */}
                <div className="border-b border-gray-150 pb-4 dark:border-gray-800">
                  <h2 className={`${fontHeadingClass} text-2xl font-extrabold text-gray-900 dark:text-white`}>
                    Search Results for <span className="text-blue-600" style={{ color: themeSettings.primaryColor }}>"{searchQuery}"</span>
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Discovered {getFilteredTools().length} matching tools and {getFilteredPosts().length} matching publications.
                  </p>
                </div>

                {/* Related Tools Block */}
                <div className="space-y-6">
                  <h3 className={`${fontHeadingClass} text-lg font-bold text-gray-900 dark:text-white flex items-center`}>
                    <Cpu className="h-5 w-5 mr-1.5 text-blue-600" style={{ color: themeSettings.primaryColor }} />
                    Matching AI Tools ({getFilteredTools().length})
                  </h3>
                  {getFilteredTools().length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400 text-sm">
                      No matching tools found in our directory.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredTools().map(tool => (
                        <div 
                          key={tool.id}
                          onClick={() => setSelectedToolId(tool.id)}
                          className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>
                                  {renderIcon(tool.logo, "h-5.5 w-5.5")}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors" style={{ color: themeSettings.primaryColor }}>{tool.name}</h4>
                                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-semibold">{tool.subcategory}</span>
                                </div>
                              </div>
                              <div className="flex items-center rounded-lg bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-600 dark:bg-yellow-950/30">
                                <Star className="h-3 w-3 fill-current text-yellow-500 mr-1" />
                                {tool.rating}
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{tool.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.features.slice(0, 3).map((feat, fIdx) => (
                                <span key={fIdx} className="text-[9px] font-semibold bg-gray-55 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded">
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-3 border-t border-gray-50 dark:border-gray-800 mt-4 font-bold uppercase tracking-wider">
                            <span className="text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 px-2 py-0.5 rounded">{tool.pricing}</span>
                            <span className="text-blue-600 group-hover:underline dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>Full Review</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Articles Block */}
                <div className="space-y-6">
                  <h3 className={`${fontHeadingClass} text-lg font-bold text-gray-900 dark:text-white flex items-center`}>
                    <BookOpen className="h-5 w-5 mr-1.5 text-blue-600" style={{ color: themeSettings.primaryColor }} />
                    Matching Publications & Insights ({getFilteredPosts().length})
                  </h3>
                  {getFilteredPosts().length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400 text-sm">
                      No publications match your search keyword.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredPosts().map(post => {
                        const author = authors.find(a => a.id === post.authorId);
                        return (
                          <div 
                            key={post.id}
                            onClick={() => setSelectedPostId(post.id)}
                            className="group cursor-pointer rounded-2xl border border-gray-200/80 bg-white overflow-hidden hover:shadow-md hover:border-blue-500/10 transition-all dark:border-gray-800/80 dark:bg-gray-900 flex flex-col justify-between h-full"
                          >
                            <div>
                              <div className="relative aspect-video overflow-hidden">
                                <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover group-hover:scale-101 transition-transform duration-300" referrerPolicy="no-referrer" />
                              </div>
                              <div className="p-5 space-y-2.5">
                                <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase" style={{ color: themeSettings.primaryColor }}>
                                  {categories.find(c => c.id === post.categoryId)?.name || 'AI Insight'}
                                </span>
                                <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2" style={{ color: themeSettings.primaryColor }}>
                                  {post.title}
                                </h4>
                                <p className="text-sm text-gray-400 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                  {post.summary}
                                </p>
                              </div>
                            </div>

                            <div className="p-5 pt-0 mt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50/50 dark:border-gray-800 pt-3">
                              <span className="flex items-center"><User className="h-3.5 w-3.5 mr-1" /> {author?.name || 'Staff'}</span>
                              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {post.readingTime} min</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCategoryId ? (
              /* Grouped Tools Explorer View when a Category is Active */
              <div className="space-y-12 animate-in fade-in duration-300">
                {(() => {
                  const categoryObj = categories.find(c => c.id === selectedCategoryId);
                  const categoryTools = aiTools.filter(t => t.categoryId === selectedCategoryId);
                  const matchedPosts = getFilteredPosts();
                  
                  // Group tools by subcategory
                  const toolsBySubcategory: Record<string, typeof aiTools> = {};
                  categoryTools.forEach(tool => {
                    const sub = tool.subcategory || 'General';
                    if (!toolsBySubcategory[sub]) {
                      toolsBySubcategory[sub] = [];
                    }
                    toolsBySubcategory[sub].push(tool);
                  });

                  return (
                    <div className="space-y-12">
                      {/* Category Header */}
                      <div className="rounded-3xl bg-gradient-to-br from-blue-50/30 to-transparent border border-gray-150 p-6 sm:p-8 dark:from-gray-900/20 dark:border-gray-800/80 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400 animate-bounce" style={{ color: themeSettings.primaryColor }}>
                            {categoryObj && renderIcon(categoryObj.icon, "h-6 w-6")}
                          </div>
                          <h1 className={`${fontHeadingClass} text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white`}>
                            {categoryObj?.name}
                          </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed">
                          {categoryObj?.description}
                        </p>
                      </div>

                      {/* Sub-sections of Tools */}
                      <div className="space-y-12">
                        {Object.keys(toolsBySubcategory).map(subName => (
                          <div key={subName} className="space-y-5">
                            <div className="border-b border-gray-150 pb-2 dark:border-gray-850 flex items-center justify-between">
                              <h3 className={`${fontHeadingClass} text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center`}>
                                <span className="w-2.5 h-2.5 rounded-full mr-2.5 bg-blue-600 animate-pulse" style={{ backgroundColor: themeSettings.primaryColor }} />
                                {subName}
                              </h3>
                              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full font-semibold">
                                {toolsBySubcategory[subName].length} Tools
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {toolsBySubcategory[subName].map(tool => (
                                <div 
                                  key={tool.id}
                                  onClick={() => setSelectedToolId(tool.id)}
                                  className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
                                >
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>
                                          {renderIcon(tool.logo, "h-5.5 w-5.5")}
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors" style={{ color: themeSettings.primaryColor }}>{tool.name}</h4>
                                          <span className="text-[10px] text-gray-400 font-semibold">{tool.subcategory}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center rounded-lg bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-600 dark:bg-yellow-950/30">
                                        <Star className="h-3 w-3 fill-current text-yellow-500 mr-1" />
                                        {tool.rating}
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{tool.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {tool.features.slice(0, 3).map((feat, fIdx) => (
                                        <span key={fIdx} className="text-[9px] font-semibold bg-gray-55 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded">
                                          {feat}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-3 border-t border-gray-50 dark:border-gray-800 mt-4 font-bold uppercase tracking-wider">
                                    <span className="text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 px-2 py-0.5 rounded">{tool.pricing}</span>
                                    <span className="text-blue-600 group-hover:underline dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>Read Review</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Related Insights/Publications for this category */}
                      <div className="space-y-6 pt-8 border-t border-gray-150 dark:border-gray-800">
                        <h3 className={`${fontHeadingClass} text-lg font-bold text-gray-900 dark:text-white flex items-center`}>
                          <BookOpen className="h-5 w-5 mr-1.5 text-blue-600" style={{ color: themeSettings.primaryColor }} />
                          {categoryObj?.name} Editorial Publications & Deep Dives
                        </h3>
                        {matchedPosts.length === 0 ? (
                          <div className="text-center py-10 text-gray-400 text-sm">
                            No matching publications or guides published in this category yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matchedPosts.map(post => {
                              const author = authors.find(a => a.id === post.authorId);
                              return (
                                <div 
                                  key={post.id}
                                  onClick={() => setSelectedPostId(post.id)}
                                  className="group cursor-pointer rounded-2xl border border-gray-200/80 bg-white overflow-hidden hover:shadow-md hover:border-blue-500/10 transition-all dark:border-gray-800/80 dark:bg-gray-900 flex flex-col justify-between h-full"
                                >
                                  <div>
                                    <div className="relative aspect-video overflow-hidden">
                                      <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover group-hover:scale-101 transition-transform duration-300" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="p-5 space-y-2.5">
                                      <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase" style={{ color: themeSettings.primaryColor }}>
                                        {categoryObj?.name}
                                      </span>
                                      <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2" style={{ color: themeSettings.primaryColor }}>
                                        {post.title}
                                      </h4>
                                      <p className="text-sm text-gray-400 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                        {post.summary}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="p-5 pt-0 mt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50/50 dark:border-gray-800 pt-3">
                                    <span className="flex items-center"><User className="h-3.5 w-3.5 mr-1" /> {author?.name || 'Staff'}</span>
                                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {post.readingTime} min</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Regular Homepage Feed (No Search, No selected category) */
              <div id="latest-posts" className="space-y-6">
                <h3 className={`${fontHeadingClass} text-xl font-extrabold text-gray-900 dark:text-white`}>
                  Latest Publications
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPosts.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400">No matching articles found.</div>
                  ) : (
                    currentPosts.map(post => {
                      const author = authors.find(a => a.id === post.authorId);
                      return (
                        <div 
                          key={post.id}
                          onClick={() => setSelectedPostId(post.id)}
                          className="group cursor-pointer rounded-2xl border border-gray-200/80 bg-white overflow-hidden hover:shadow-md hover:border-blue-500/10 transition-all dark:border-gray-800/80 dark:bg-gray-900 flex flex-col justify-between h-full"
                        >
                          <div>
                            <div className="relative aspect-video overflow-hidden">
                              <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover group-hover:scale-101 transition-transform duration-300" referrerPolicy="no-referrer" />
                            </div>
                            <div className="p-5 space-y-2.5">
                              <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase" style={{ color: themeSettings.primaryColor }}>
                                {categories.find(c => c.id === post.categoryId)?.name || 'AI Insight'}
                              </span>
                              <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2" style={{ color: themeSettings.primaryColor }}>
                                {post.title}
                              </h4>
                              <p className="text-sm text-gray-400 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                {post.summary}
                              </p>
                            </div>
                          </div>

                          <div className="p-5 pt-0 mt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50/50 dark:border-gray-800 pt-3">
                            <span className="flex items-center"><User className="h-3.5 w-3.5 mr-1" /> {author?.name || 'Staff'}</span>
                            <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {post.readingTime} min</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-800 dark:hover:bg-gray-900"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. POPULAR TOOLS PROMOTIONAL SECTION */}
            <div className="space-y-4 pt-4">
              <h3 className={`${fontHeadingClass} text-xl font-extrabold text-gray-900 dark:text-white flex items-center`}>
                <Icons.Star className="h-5 w-5 mr-1 text-yellow-500 fill-current" />
                Featured AI Directory Listings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiTools.slice(0, 6).map(tool => (
                  <div 
                    key={tool.id}
                    onClick={() => setSelectedToolId(tool.id)}
                    className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>
                          {renderIcon(tool.logo, "h-5.5 w-5.5")}
                        </div>
                        <div className="flex items-center rounded-lg bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-600">
                          <Star className="h-3 w-3 fill-current text-yellow-500 mr-1" />
                          {tool.rating}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 mt-2" style={{ color: themeSettings.primaryColor }}>{tool.name}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{tool.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-3 border-t border-gray-50 dark:border-gray-800 mt-4 font-bold uppercase tracking-wider">
                      <span>{tool.pricing}</span>
                      <span className="text-blue-600 group-hover:underline dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>Review</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. NEWSLETTER REGISTRATION FOOTER BOX */}
            <section className="rounded-3xl bg-blue-600 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 dark:bg-blue-950" style={{ backgroundColor: themeSettings.primaryColor }}>
              <div className="space-y-3 max-w-lg text-center md:text-left">
                <h3 className={`${fontHeadingClass} text-2xl font-bold`}>Join the AI Inventory Weekly</h3>
                <p className="text-sm text-blue-50/90 leading-relaxed">
                  Join 24,000+ developers, researchers, and content creators receiving weekly updates on newly released wrappers, model weight updates, and benchmark guides.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="w-full max-w-sm space-y-3 shrink-0">
                <div className="flex rounded-xl overflow-hidden bg-white/10 p-1 backdrop-blur-sm border border-white/10">
                  <input
                    type="email"
                    required
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder-blue-100 outline-none border-0"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                    style={{ color: themeSettings.primaryColor }}
                  >
                    Subscribe
                  </button>
                </div>
                {newsMsg.text && (
                  <p className={`text-xs font-semibold ${newsMsg.success ? 'text-emerald-300' : 'text-red-300'}`}>
                    {newsMsg.text}
                  </p>
                )}
              </form>
            </section>
          </div>
        )}
      </div>

      {/* ====================================
          7. COMMON VISUAL FOOTER BAR
          ==================================== */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 mt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-2.5 text-white">
              <Cpu className="h-7 w-7 text-blue-500" style={{ color: themeSettings.primaryColor }} />
              <span className="font-heading text-lg font-bold tracking-tight">
                AI <span className="text-blue-500" style={{ color: themeSettings.primaryColor }}>Inventory</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Dedicated editorial board indexing artificial intelligence algorithms, coding libraries, image upscalers, and conversational models independently.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Explore</h4>
            <div className="flex flex-col space-y-2 text-xs">
              <button onClick={() => { setSelectedCategoryId(null); setActiveTag(null); setSelectedPostId(null); setSelectedToolId(null); setSearchQuery(''); }} className="hover:text-white text-left">Home Feed</button>
              <button onClick={() => setSelectedCategoryId('all-tools')} className="hover:text-white text-left">AI Tools Directory</button>
              <button onClick={() => setActiveTag('Tutorial')} className="hover:text-white text-left">Tutorial Guides</button>
              <button onClick={() => setActiveTag('Comparison')} className="hover:text-white text-left">Comparisons</button>
            </div>
          </div>

          {/* Links Col 2 */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Categories</h4>
            <div className="flex flex-col space-y-2 text-xs">
              {categories.slice(0, 4).map(c => (
                <button key={c.id} onClick={() => { setSelectedCategoryId(c.id); setSelectedPostId(null); setSelectedToolId(null); }} className="hover:text-white text-left">{c.name}</button>
              ))}
            </div>
          </div>

          {/* Links Col 3 */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Legal & HQ</h4>
            <div className="flex flex-col space-y-2 text-xs">
              <button onClick={() => setActiveTag('about-view')} className="hover:text-white text-left">About Missions</button>
              <button onClick={() => setActiveTag('contact-view')} className="hover:text-white text-left">Contact Form</button>
              <span className="text-gray-600">Privacy Policy</span>
              <span className="text-gray-600">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 border-t border-gray-800 text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} AI Inventory. All rights reserved.</span>
          <div className="flex items-center space-x-1.5">
            <span>Designed with high contrast elements. Premium SEO optimized.</span>
            <button 
              onClick={() => {
                setIsAdminMode(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-gray-800 hover:text-gray-700 dark:text-gray-800/10 dark:hover:text-gray-500 transition-colors cursor-pointer text-[10px] select-none ml-1 opacity-20 hover:opacity-100"
              style={{ fontSize: '7px' }}
              title="CMS Gate"
            >
              &bull;
            </button>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {cookieConsent && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-950 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start space-x-3 text-xs">
            <Info className="h-5 w-5 text-blue-600 shrink-0" style={{ color: themeSettings.primaryColor }} />
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 dark:text-white">Cookie Consent</h4>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                We use cookies to save your dynamically selected custom CMS theme colors, bookmarks, and local search histories safely on your system.
              </p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    localStorage.setItem('ai_inventory_cookies_accepted', 'true');
                    setCookieConsent(false);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  Accept Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReaderView;
