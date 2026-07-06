import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Category, AITool, Comment, Author, Subscriber, MediaItem, AnalyticsData, ThemeSettings, RedirectRule } from '../types';
import { generateSampleData } from '../data/sampleGenerator';

interface CMSContextType {
  posts: Post[];
  categories: Category[];
  aiTools: AITool[];
  comments: Comment[];
  authors: Author[];
  subscribers: Subscriber[];
  themeSettings: ThemeSettings;
  analyticsData: AnalyticsData;
  mediaLibrary: MediaItem[];
  redirectRules: RedirectRule[];
  bookmarks: string[];
  recentlyViewed: string[];
  
  // Navigation / Mode state
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  currentAdminView: string;
  setCurrentAdminView: (view: string) => void;
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
  selectedToolId: string | null;
  setSelectedToolId: (id: string | null) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // CRUD operations
  addPost: (post: Omit<Post, 'id' | 'views' | 'likes' | 'commentsCount'>) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  duplicatePost: (id: string) => void;
  likePost: (id: string) => void;
  viewPost: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  addAITool: (tool: Omit<AITool, 'id'>) => void;
  updateAITool: (tool: AITool) => void;
  deleteAITool: (id: string) => void;
  
  addComment: (postId: string, name: string, email: string, content: string) => void;
  approveComment: (id: string) => void;
  deleteComment: (id: string) => void;
  
  addSubscriber: (email: string) => { success: boolean; message: string };
  deleteSubscriber: (id: string) => void;
  
  updateTheme: (theme: Partial<ThemeSettings>) => void;
  toggleDarkMode: () => void;
  
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadDate'>) => void;
  deleteMediaItem: (id: string) => void;
  updateMediaAlt: (id: string, altText: string) => void;
  
  addRedirect: (rule: Omit<RedirectRule, 'id'>) => void;
  deleteRedirect: (id: string) => void;
  
  toggleBookmark: (postId: string) => void;
  
  // Permissions & Users
  rolePermissions: Record<string, string[]>;
  updateRolePermissions: (role: string, permissions: string[]) => void;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  
  // Backup & Restore
  resetToDefaults: () => void;
  importBackup: (jsonData: string) => { success: boolean; message: string };
  exportBackup: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or generate defaults
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem('ai_inventory_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically upgrade to expanded database if stored dataset is legacy/minimal
        if (!parsed.posts || parsed.posts.length < 55 || !parsed.aiTools || parsed.aiTools.length < 35) {
          const fresh = generateSampleData();
          localStorage.setItem('ai_inventory_db', JSON.stringify(fresh));
          return fresh;
        }
        // Automatically upgrade to modern Sleek Interface dark theme default if using legacy light mode defaults
        if (parsed.themeSettings && (parsed.themeSettings.primaryColor === '#0052FF' || !parsed.themeSettings.isDarkMode)) {
          parsed.themeSettings = {
            primaryColor: '#3B82F6',
            secondaryColor: '#020617',
            accentColor: '#60A5FA',
            bgStyle: 'slate',
            fontSans: 'Inter',
            fontHeading: 'Space Grotesk',
            borderRadius: 'rounded-2xl',
            cardStyle: 'glass',
            isDarkMode: true
          };
          localStorage.setItem('ai_inventory_db', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing saved DB, generating fresh.", e);
      }
    }
    const fresh = generateSampleData();
    localStorage.setItem('ai_inventory_db', JSON.stringify(fresh));
    return fresh;
  });

  // Individual slices from loaded DB
  const [posts, setPosts] = useState<Post[]>(db.posts || []);
  const [categories, setCategories] = useState<Category[]>(db.categories || []);
  const [aiTools, setAiTools] = useState<AITool[]>(db.aiTools || []);
  const [comments, setComments] = useState<Comment[]>(db.comments || []);
  const [authors, setAuthors] = useState<Author[]>(db.authors || []);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(db.subscribers || []);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(db.themeSettings || {
    primaryColor: '#3B82F6',
    secondaryColor: '#020617',
    accentColor: '#60A5FA',
    bgStyle: 'slate',
    fontSans: 'Inter',
    fontHeading: 'Space Grotesk',
    borderRadius: 'rounded-2xl',
    cardStyle: 'glass',
    isDarkMode: true
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(db.analyticsData || {});
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(db.mediaLibrary || []);
  const [redirectRules, setRedirectRules] = useState<RedirectRule[]>(db.redirectRules || []);
  
  // Local transient states (not persisted in the DB directly, but some synced)
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const b = localStorage.getItem('ai_inventory_bookmarks');
    return b ? JSON.parse(b) : [];
  });
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const r = localStorage.getItem('ai_inventory_recent');
    return r ? JSON.parse(r) : [];
  });
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentAdminView, setCurrentAdminView] = useState('dashboard');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Role Permissions list
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('ai_inventory_permissions');
    if (saved) return JSON.parse(saved);
    return {
      Admin: ['dashboard', 'posts_all', 'categories', 'tools', 'media', 'comments', 'newsletter', 'seo', 'themes', 'users', 'settings', 'analytics'],
      Editor: ['dashboard', 'posts_all', 'categories', 'tools', 'media', 'comments', 'seo'],
      Author: ['dashboard', 'posts_own', 'media', 'comments'],
      Contributor: ['dashboard', 'posts_own_draft', 'media'],
      Reader: []
    };
  });

  const [currentUserId, setCurrentUserId] = useState('auth-1'); // Default to Alexander (Admin)

  // Sync back bookmarks & recently viewed
  useEffect(() => {
    localStorage.setItem('ai_inventory_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ai_inventory_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Save full DB changes to localStorage
  useEffect(() => {
    const currentDb = {
      posts,
      categories,
      aiTools,
      comments,
      authors,
      subscribers,
      themeSettings,
      analyticsData,
      mediaLibrary,
      redirectRules
    };
    localStorage.setItem('ai_inventory_db', JSON.stringify(currentDb));
  }, [posts, categories, aiTools, comments, authors, subscribers, themeSettings, analyticsData, mediaLibrary, redirectRules]);

  // Synchronize CSS Variables with Theme Customizer
  useEffect(() => {
    const root = document.documentElement;
    // Apply primary/accent colors dynamically as tailwind variables or custom styles
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    root.style.setProperty('--accent-color', themeSettings.accentColor);
    
    // Toggle HTML dark class
    if (themeSettings.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeSettings]);

  // CRUD Implementations
  const addPost = (newPost: Omit<Post, 'id' | 'views' | 'likes' | 'commentsCount'>) => {
    const post: Post = {
      ...newPost,
      id: `post-${Date.now()}`,
      views: 0,
      likes: 0,
      commentsCount: 0
    };
    setPosts(prev => [post, ...prev]);
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const duplicatePost = (id: string) => {
    const postToDup = posts.find(p => p.id === id);
    if (postToDup) {
      const dup: Post = {
        ...postToDup,
        id: `post-dup-${Date.now()}`,
        title: `${postToDup.title} (Duplicate)`,
        slug: `${postToDup.slug}-duplicate-${Date.now().toString().slice(-4)}`,
        status: 'draft',
        publishDate: new Date().toISOString().split('T')[0],
        views: 0,
        likes: 0,
        commentsCount: 0,
        isFeatured: false
      };
      setPosts(prev => [dup, ...prev]);
    }
  };

  const likePost = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const viewPost = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, views: p.views + 1 } : p));
    
    // Add to recently viewed without duplicate and slice to max 5
    setRecentlyViewed(prev => {
      const clean = prev.filter(pId => pId !== id);
      return [id, ...clean].slice(0, 5);
    });
  };

  // Categories
  const addCategory = (newCat: Omit<Category, 'id'>) => {
    const cat: Category = {
      ...newCat,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, cat]);
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // AI Tools
  const addAITool = (newTool: Omit<AITool, 'id'>) => {
    const tool: AITool = {
      ...newTool,
      id: `tool-${Date.now()}`
    };
    setAiTools(prev => [tool, ...prev]);
  };

  const updateAITool = (updatedTool: AITool) => {
    setAiTools(prev => prev.map(t => t.id === updatedTool.id ? updatedTool : t));
  };

  const deleteAITool = (id: string) => {
    setAiTools(prev => prev.filter(t => t.id !== id));
  };

  // Comments
  const addComment = (postId: string, name: string, email: string, content: string) => {
    const com: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorName: name,
      authorEmail: email,
      content,
      date: new Date().toISOString().split('T')[0],
      approved: false // requires admin approval
    };
    setComments(prev => [com, ...prev]);
  };

  const approveComment = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
    // Increment post comment counts
    const comment = comments.find(c => c.id === id);
    if (comment && !comment.approved) {
      setPosts(prev => prev.map(p => p.id === comment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    }
  };

  const deleteComment = (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (comment && comment.approved) {
      setPosts(prev => prev.map(p => p.id === comment.postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p));
    }
    setComments(prev => prev.filter(c => c.id !== id));
  };

  // Newsletter
  const addSubscriber = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (subscribers.some(s => s.email === cleanEmail)) {
      return { success: true, message: 'You are already subscribed to our newsletter!' };
    }
    
    const sub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      date: new Date().toISOString().split('T')[0]
    };
    setSubscribers(prev => [sub, ...prev]);
    
    // Increment subscriber stats
    setAnalyticsData(prev => ({
      ...prev,
      visitors: prev.visitors + 1
    }));
    
    return { success: true, message: 'Thank you for subscribing to AI Inventory newsletter!' };
  };

  const deleteSubscriber = (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  // Theme Customizer
  const updateTheme = (theme: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({ ...prev, ...theme }));
  };

  const toggleDarkMode = () => {
    setThemeSettings(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  // Media Library
  const addMediaItem = (newItem: Omit<MediaItem, 'id' | 'uploadDate'>) => {
    const item: MediaItem = {
      ...newItem,
      id: `med-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setMediaLibrary(prev => [item, ...prev]);
  };

  const deleteMediaItem = (id: string) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
  };

  const updateMediaAlt = (id: string, altText: string) => {
    setMediaLibrary(prev => prev.map(m => m.id === id ? { ...m, altText } : m));
  };

  // Redirects
  const addRedirect = (newRule: Omit<RedirectRule, 'id'>) => {
    const rule: RedirectRule = {
      ...newRule,
      id: `red-${Date.now()}`
    };
    setRedirectRules(prev => [...prev, rule]);
  };

  const deleteRedirect = (id: string) => {
    setRedirectRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleBookmark = (postId: string) => {
    setBookmarks(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  // Permissions
  const updateRolePermissions = (role: string, permissions: string[]) => {
    const updated = { ...rolePermissions, [role]: permissions };
    setRolePermissions(updated);
    localStorage.setItem('ai_inventory_permissions', JSON.stringify(updated));
  };

  // Defaults Reset
  const resetToDefaults = () => {
    const defaults = generateSampleData();
    setPosts(defaults.posts);
    setCategories(defaults.categories);
    setAiTools(defaults.aiTools);
    setComments(defaults.comments);
    setAuthors(defaults.authors);
    setSubscribers(defaults.subscribers);
    setThemeSettings(defaults.themeSettings);
    setAnalyticsData(defaults.analyticsData);
    setMediaLibrary(defaults.mediaLibrary);
    setRedirectRules(defaults.redirectRules);
    setBookmarks([]);
    setRecentlyViewed([]);
    localStorage.setItem('ai_inventory_db', JSON.stringify(defaults));
  };

  // Backups
  const exportBackup = () => {
    const currentDb = {
      posts,
      categories,
      aiTools,
      comments,
      authors,
      subscribers,
      themeSettings,
      analyticsData,
      mediaLibrary,
      redirectRules
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(currentDb, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `ai_inventory_cms_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.posts && parsed.categories && parsed.aiTools) {
        setPosts(parsed.posts);
        setCategories(parsed.categories);
        setAiTools(parsed.aiTools);
        if (parsed.comments) setComments(parsed.comments);
        if (parsed.authors) setAuthors(parsed.authors);
        if (parsed.subscribers) setSubscribers(parsed.subscribers);
        if (parsed.themeSettings) setThemeSettings(parsed.themeSettings);
        if (parsed.analyticsData) setAnalyticsData(parsed.analyticsData);
        if (parsed.mediaLibrary) setMediaLibrary(parsed.mediaLibrary);
        if (parsed.redirectRules) setRedirectRules(parsed.redirectRules);
        
        return { success: true, message: 'Database imported successfully!' };
      }
      return { success: false, message: 'Invalid backup file structure.' };
    } catch (e: any) {
      return { success: false, message: `Failed to parse backup JSON: ${e.message}` };
    }
  };

  return (
    <CMSContext.Provider value={{
      posts,
      categories,
      aiTools,
      comments,
      authors,
      subscribers,
      themeSettings,
      analyticsData,
      mediaLibrary,
      redirectRules,
      bookmarks,
      recentlyViewed,
      isAdminMode,
      setIsAdminMode,
      currentAdminView,
      setCurrentAdminView,
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
      
      addPost,
      updatePost,
      deletePost,
      duplicatePost,
      likePost,
      viewPost,
      addCategory,
      updateCategory,
      deleteCategory,
      addAITool,
      updateAITool,
      deleteAITool,
      addComment,
      approveComment,
      deleteComment,
      addSubscriber,
      deleteSubscriber,
      updateTheme,
      toggleDarkMode,
      addMediaItem,
      deleteMediaItem,
      updateMediaAlt,
      addRedirect,
      deleteRedirect,
      toggleBookmark,
      
      rolePermissions,
      updateRolePermissions,
      currentUserId,
      setCurrentUserId,
      resetToDefaults,
      importBackup,
      exportBackup
    }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
