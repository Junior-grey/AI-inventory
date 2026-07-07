import React, { useState, useRef } from 'react';
import { useCMS } from '../context/CMSContext';
import { Post, Category, AITool, Comment, MediaItem, RedirectRule, Author } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import { 
  LayoutDashboard, FileText, FolderTree, Cpu, Image as ImageIcon, 
  MessageSquare, Mail, Shield, Sparkles, Plus, Edit, Trash2, 
  Check, Save, RefreshCw, Download, Upload, Eye, Copy, ArrowRight,
  User, CheckCircle2, AlertTriangle, Settings, FileSpreadsheet, Lock, HelpCircle
} from 'lucide-react';
import * as Icons from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
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
    rolePermissions,
    updateTheme,
    addPost,
    updatePost,
    deletePost,
    duplicatePost,
    addCategory,
    updateCategory,
    deleteCategory,
    addAITool,
    updateAITool,
    deleteAITool,
    approveComment,
    deleteComment,
    deleteSubscriber,
    addMediaItem,
    deleteMediaItem,
    updateMediaAlt,
    addRedirect,
    deleteRedirect,
    resetToDefaults,
    importBackup,
    exportBackup,
    currentAdminView,
    setCurrentAdminView,
    updateRolePermissions,
    setIsAdminMode,
    isAdminAuthorized,
    setIsAdminAuthorized
  } = useCMS();

  // Private Administrative Authentication Gate States mapped from global context
  const isAuthorized = isAdminAuthorized;
  const setIsAuthorized = setIsAdminAuthorized;
  const [authEmail, setAuthEmail] = useState('christiannashon@gmail.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPasscodeHint, setShowPasscodeHint] = useState(false);

  // Active Admin View State mapped in parent
  // Edit Form States
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Editor View Modes: 'write' (full screen write), 'split' (side-by-side live-render), 'preview' (full visual preview), 'seo' (Gemini audit)
  const [editorTab, setEditorTab] = useState<'write' | 'split' | 'preview' | 'seo'>('write');
  
  // Local auto-save tracker
  const [autoSaveTime, setAutoSaveTime] = useState<string>('');
  const [hasSavedDraft, setHasSavedDraft] = useState(() => {
    return localStorage.getItem('ai_inventory_saved_draft') !== null;
  });

  // Media Library Drawer Picker States
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'content' | 'featuredImage'>('content');

  const [postForm, setPostForm] = useState({
    title: '', content: '', summary: '', categoryId: '',
    tags: '', featuredImage: '', status: 'published' as 'published' | 'draft' | 'scheduled',
    metaTitle: '', metaDescription: '', seoKeywords: '',
    authorId: 'auth-1' // Custom Author Selector Support
  });

  // Category Form States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', icon: 'PenTool', image: '' });

  // Tool Form States
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [isCreatingTool, setIsCreatingTool] = useState(false);
  const [toolForm, setToolForm] = useState({
    name: '', rating: 4.5, description: '', longDescription: '',
    logo: 'Cpu', url: '', categoryId: '', pricing: 'free' as 'free' | 'freemium' | 'paid',
    features: '', pros: '', cons: '', pricingDetails: ''
  });

  // Media Folder States
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [mediaAlt, setMediaAlt] = useState<{ [id: string]: string }>({});

  // SEO & Redirect States
  const [redirectForm, setRedirectForm] = useState({ source: '', destination: '', code: 301 as 301 | 302 });

  // AI Generation Loading States
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiError, setAIError] = useState('');
  const [seoScoreData, setSeoScoreData] = useState<{ score: number; suggestions: string[] } | null>(null);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Map Lucide icons or official logo image URLs dynamically
  const renderIcon = (name: string, className = "h-5 w-5") => {
    if (name && (name.startsWith('http://') || name.startsWith('https://') || name.includes('/') || name.includes('.'))) {
      return <img src={name} alt="Logo" className={`${className} object-contain rounded`} referrerPolicy="no-referrer" />;
    }
    const IconComponent = (Icons as any)[name] || Icons.Cpu;
    return <IconComponent className={className} />;
  };

  // Cursor text insertion helper for Markdown formatting tools
  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(startPos, endPos);
    
    const replacement = before + (selectedText || 'text') + after;
    const newContent = text.substring(0, startPos) + replacement + text.substring(endPos);
    
    setPostForm(prev => ({ ...prev, content: newContent }));
    
    // Reset selection & focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + before.length, startPos + before.length + (selectedText || 'text').length);
    }, 50);
  };

  // Saved Draft recovery listener
  React.useEffect(() => {
    if (isCreatingPost && !editingPost) {
      const saved = localStorage.getItem('ai_inventory_saved_draft');
      if (saved) {
        setHasSavedDraft(true);
      }
    }
  }, [isCreatingPost, editingPost]);

  // Reactive draft autosaving
  React.useEffect(() => {
    if ((isCreatingPost || editingPost) && (postForm.title || postForm.content)) {
      const timer = setTimeout(() => {
        localStorage.setItem('ai_inventory_saved_draft', JSON.stringify(postForm));
        setAutoSaveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setHasSavedDraft(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [postForm, isCreatingPost, editingPost]);

  const handleRestoreDraft = () => {
    const saved = localStorage.getItem('ai_inventory_saved_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPostForm(parsed);
        setAutoSaveTime('Draft Restored');
        alert('Draft restored successfully!');
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  };

  const handleDiscardDraft = () => {
    if (confirm('Are you sure you want to discard your saved draft? This cannot be undone.')) {
      localStorage.removeItem('ai_inventory_saved_draft');
      setHasSavedDraft(false);
      setAutoSaveTime('');
      setPostForm({
        title: '', content: '', summary: '', categoryId: '',
        tags: '', featuredImage: '', status: 'published',
        metaTitle: '', metaDescription: '', seoKeywords: '',
        authorId: 'auth-1'
      });
    }
  };

  // Private Admin Access controller
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const emailMatch = authEmail.trim().toLowerCase() === 'christiannashon@gmail.com';
      const passwordMatch = authPassword === '8899' || authPassword === 'admin123';

      if (emailMatch && passwordMatch) {
        localStorage.setItem('ai_inventory_admin_authorized', 'true');
        setIsAuthorized(true);
        setIsAuthenticating(false);
      } else {
        setIsAuthenticating(false);
        if (!emailMatch) {
          setAuthError('Unauthorized Administrator Email. Only Christian Nashon is pre-registered.');
        } else {
          setAuthError('Invalid Security Passcode. Try 8899.');
        }
      }
    }, 1200); // Sleek transition feel
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('ai_inventory_admin_authorized');
    setIsAuthorized(false);
    setAuthPassword('');
    setAuthError('');
  };

  // XML sitemap generator
  const handleGenerateSitemap = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url>\n    <loc>https://ai-inventory.com/</loc>\n    <priority>1.0</priority>\n  </url>\n`;
    posts.filter(p => p.status === 'published').forEach(p => {
      xml += `  <url>\n    <loc>https://ai-inventory.com/blog/${p.slug}</loc>\n    <lastmod>${p.publishDate}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Gemini API client-side wrapper calling Express backend proxy
  const handleAIAssistance = async (type: 'generate-article' | 'seo-keywords' | 'seo-score') => {
    setIsAIGenerating(true);
    setAIError('');
    try {
      if (type === 'generate-article') {
        if (!postForm.title) {
          throw new Error('Please input a Post Title first so Gemini can research and outline the contents.');
        }
        const prompt = `Write a highly professional, engaging, production-grade blog article based on the title: "${postForm.title}". Include rich formatting, direct headings (use ## syntax), some bullet points detailing core features, an illustrative quote, a mock table summarizing metrics, and a simple TypeScript code snippet block. Make sure it reads incredibly well and has over 500 words. Return only the post body in clean markdown.`;
        
        const response = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setPostForm(prev => ({
          ...prev,
          content: data.text || '',
          summary: `Our expert analysis examining ${postForm.title.toLowerCase()}, breaking down core benefits, integration procedures, and performance benchmarks.`
        }));
      } else if (type === 'seo-keywords') {
        if (!postForm.title || !postForm.content) {
          throw new Error('Please input the Title and Content first so the AI can evaluate the SEO keywords.');
        }
        const prompt = `Analyze this blog post title: "${postForm.title}" and its content. Suggest a comma-separated list of exactly 6 optimal SEO focus keywords for meta headers, and write a compelling meta description under 150 characters. Return the result in this exact raw format without conversational wrapper:
KEYWORDS: word1, word2, word3, ...
DESCRIPTION: Compelling meta text...`;

        const response = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const lines = data.text?.split('\n') || [];
        let kws = '';
        let desc = '';
        lines.forEach((l: string) => {
          if (l.toUpperCase().startsWith('KEYWORDS:')) {
            kws = l.replace(/^KEYWORDS:\s*/i, '');
          }
          if (l.toUpperCase().startsWith('DESCRIPTION:')) {
            desc = l.replace(/^DESCRIPTION:\s*/i, '');
          }
        });

        setPostForm(prev => ({
          ...prev,
          seoKeywords: kws || prev.seoKeywords,
          metaDescription: desc || prev.metaDescription,
          metaTitle: `${postForm.title} | AI Inventory`
        }));
      } else if (type === 'seo-score') {
        if (!postForm.title || !postForm.content) {
          throw new Error('Provide article content to execute SEO readability and score optimization audit.');
        }
        const prompt = `Analyze this article title: "${postForm.title}" and content. Provide a numeric SEO score from 1 to 100 based on structure, keyword density, and length. Provide 3 direct bullet suggestions on improving internal linking and formatting. Return the answer in this JSON format: {"score": 85, "suggestions": ["bullet1", "bullet2", "bullet3"]}`;
        
        const response = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const parsed = JSON.parse(data.text || '{}');
        setSeoScoreData({
          score: parsed.score || 70,
          suggestions: parsed.suggestions || ['Ensure H2 headers exist', 'Add image ALT keywords', 'Write a custom meta tag']
        });
      }
    } catch (e: any) {
      console.error(e);
      setAIError(e.message || 'AI generation failed. Ensure your Gemini API Key is configured correctly.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Custom Live Render Markdown Previewer for visual edit checking
  const renderMarkdownToReact = (md: string) => {
    if (!md) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3 animate-pulse" />
          <p className="text-xs text-gray-400 font-medium">No contents written yet. Type inside the content editor to trigger live, premium preview rendering...</p>
        </div>
      );
    }

    const lines = md.split('\n');
    let insideCodeBlock = false;
    let codeContent: string[] = [];

    return (
      <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-800 dark:text-gray-200">
        {lines.map((line, idx) => {
          // Code block boundaries
          if (line.trim().startsWith('```')) {
            if (insideCodeBlock) {
              insideCodeBlock = false;
              const contentStr = codeContent.join('\n');
              codeContent = [];
              return (
                <pre key={idx} className="p-4 bg-[#030712] rounded-xl font-mono text-xs text-blue-400 overflow-x-auto border border-gray-800 my-4">
                  <code>{contentStr}</code>
                </pre>
              );
            } else {
              insideCodeBlock = true;
              return null;
            }
          }

          if (insideCodeBlock) {
            codeContent.push(line);
            return null;
          }

          // Headers
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="font-heading font-black text-base sm:text-lg text-gray-900 dark:text-white mt-6 mb-2 border-b border-gray-100 dark:border-gray-800/50 pb-1.5">
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="font-heading font-extrabold text-sm sm:text-base text-gray-900 dark:text-white mt-4 mb-2">
                {line.slice(4)}
              </h3>
            );
          }

          // Blockquotes & Callouts
          if (line.startsWith('> ')) {
            const blockText = line.slice(2);
            if (blockText.startsWith('[!NOTE]') || blockText.startsWith('[!IMPORTANT]')) {
              return (
                <div key={idx} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 my-3 text-xs font-semibold flex items-start gap-2.5">
                  <Sparkles className="h-4.5 w-4.5 text-blue-500 animate-pulse shrink-0" />
                  <div>
                    {blockText.replace(/\[!(NOTE|IMPORTANT)\]\s*/, '')}
                  </div>
                </div>
              );
            }
            return (
              <blockquote key={idx} className="pl-4 border-l-4 border-gray-300 dark:border-gray-700 italic text-gray-500 dark:text-gray-400 my-3">
                {blockText}
              </blockquote>
            );
          }

          // Images: ![alt](url)
          const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
            return (
              <div key={idx} className="my-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full max-h-80 object-cover" />
                {imgMatch[1] && <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 py-2 bg-gray-50/50 dark:bg-gray-950/40">{imgMatch[1]}</p>}
              </div>
            );
          }

          // Lists
          if (line.trim().startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start space-x-2 my-1 pl-4">
                <span className="text-blue-500 mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">{line.trim().slice(2)}</span>
              </div>
            );
          }

          // Dividers
          if (line.trim() === '---') {
            return <hr key={idx} className="border-gray-200 dark:border-gray-800 my-6" />;
          }

          // Empty lines
          if (!line.trim()) return <div key={idx} className="h-2" />;

          // Normal Paragraphs
          return (
            <p key={idx} className="text-gray-700 dark:text-gray-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  // CRUD actions submissions
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content || !postForm.categoryId) return;

    const tagsArr = postForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const keywordsArr = postForm.seoKeywords.split(',').map(t => t.trim()).filter(Boolean);
    const slug = postForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const pData = {
      title: postForm.title,
      content: postForm.content,
      summary: postForm.summary || postForm.content.slice(0, 150) + '...',
      categoryId: postForm.categoryId,
      tags: tagsArr.length ? tagsArr : ['AI Tool'],
      featuredImage: postForm.featuredImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
      status: postForm.status,
      metaTitle: postForm.metaTitle || postForm.title,
      metaDescription: postForm.metaDescription || postForm.summary,
      seoKeywords: keywordsArr,
      slug,
      publishDate: new Date().toISOString().split('T')[0],
      authorId: postForm.authorId || 'auth-1' // Custom Author profile assignment
    };

    if (editingPost) {
      updatePost({
        ...editingPost,
        ...pData
      });
      setEditingPost(null);
    } else {
      addPost(pData);
      setIsCreatingPost(false);
    }

    // Successfully saved, wipe any saved autosave drafts
    localStorage.removeItem('ai_inventory_saved_draft');
    setHasSavedDraft(false);
    setAutoSaveTime('');

    // Reset Form to initial clean parameters
    setPostForm({
      title: '', content: '', summary: '', categoryId: '',
      tags: '', featuredImage: '', status: 'published',
      metaTitle: '', metaDescription: '', seoKeywords: '',
      authorId: 'auth-1'
    });
    setSeoScoreData(null);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cData = {
      name: categoryForm.name,
      slug,
      description: categoryForm.description,
      icon: categoryForm.icon,
      image: categoryForm.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'
    };

    if (editingCategory) {
      updateCategory({ ...editingCategory, ...cData });
      setEditingCategory(null);
    } else {
      addCategory(cData);
      setIsCreatingCategory(false);
    }

    setCategoryForm({ name: '', slug: '', description: '', icon: 'PenTool', image: '' });
  };

  const handleToolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.name || !toolForm.url || !toolForm.categoryId) return;

    const featuresArr = toolForm.features.split(',').map(f => f.trim()).filter(Boolean);
    const prosArr = toolForm.pros.split(',').map(p => p.trim()).filter(Boolean);
    const consArr = toolForm.cons.split(',').map(c => c.trim()).filter(Boolean);

    const tData = {
      name: toolForm.name,
      rating: Number(toolForm.rating),
      description: toolForm.description,
      longDescription: toolForm.longDescription || toolForm.description,
      logo: toolForm.logo,
      url: toolForm.url,
      categoryId: toolForm.categoryId,
      pricing: toolForm.pricing,
      features: featuresArr,
      pros: prosArr,
      cons: consArr,
      pricingDetails: toolForm.pricingDetails
    };

    if (editingTool) {
      updateAITool({ ...editingTool, ...tData });
      setEditingTool(null);
    } else {
      addAITool(tData);
      setIsCreatingTool(false);
    }

    setToolForm({
      name: '', rating: 4.5, description: '', longDescription: '',
      logo: 'Cpu', url: '', categoryId: '', pricing: 'free',
      features: '', pros: '', cons: '', pricingDetails: ''
    });
  };

  const handleRedirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirectForm.source || !redirectForm.destination) return;
    addRedirect(redirectForm);
    setRedirectForm({ source: '', destination: '', code: 301 });
  };

  // Drag and Drop simulation for Media Library
  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isImage = file.type.startsWith('image/');
        addMediaItem({
          name: file.name,
          url: isImage ? 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600' : '#',
          type: isImage ? 'image' : 'document',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          folder: selectedFolder === 'All' ? 'Uploads' : selectedFolder,
          altText: `Uploaded ${file.name}`
        });
      }
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const res = importBackup(text);
        alert(res.message);
      };
      reader.readAsText(file);
    }
  };

  // Chart Colors
  const COLORS = ['#0052FF', '#00D8F6', '#FF9F00', '#10B981', '#6366F1', '#EC4899'];

  // Secure Administrative Lock Gate wrapper
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
        {/* Abstract glowing backgrounds */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="max-w-md w-full backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-2">
              <Lock className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="font-heading text-xl font-black text-white uppercase tracking-wider">Secure Admin Gate</h1>
            <p className="text-xs text-slate-400">Authorized cryptographic access for AI Inventory administrators only.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PRE-REGISTERED EMAIL</label>
              <input
                type="email"
                required
                disabled={isAuthenticating}
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="christiannashon@gmail.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SECURITY PASSCODE</label>
                <button
                  type="button"
                  onClick={() => setShowPasscodeHint(!showPasscodeHint)}
                  className="text-[9px] font-bold text-blue-500 hover:underline"
                >
                  {showPasscodeHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
              <input
                type="password"
                required
                disabled={isAuthenticating}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-blue-500 tracking-widest transition-colors"
              />
              {showPasscodeHint && (
                <div className="text-[10px] text-emerald-400 leading-normal bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
                  💡 Hint: Enter standard administrative PIN <strong>8899</strong> to authenticate your session.
                </div>
              )}
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-semibold text-center">
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Authenticating Session...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Sign In & Unlock Terminal
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors"
            >
              &larr; Return to Blog
            </button>
            <span className="text-[9px] font-mono text-slate-600">IP: 127.0.0.1</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
      
      {/* LEFT SIDEBAR: Admin Menu Navigation */}
      <aside className="lg:col-span-3 border-r border-gray-200 bg-white p-5 space-y-7 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center space-x-2 pb-5 border-b border-gray-100 dark:border-gray-900">
          <Shield className="h-6 w-6 text-blue-600" style={{ color: themeSettings.primaryColor }} />
          <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">CMS CONTROL</span>
        </div>

        <nav className="space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'posts', label: 'Publications (Posts)', icon: FileText },
            { id: 'categories', label: 'Tag Categories', icon: FolderTree },
            { id: 'tools', label: 'AI Directory (Tools)', icon: Cpu },
            { id: 'media', label: 'Media Library', icon: ImageIcon },
            { id: 'comments', label: 'Comments Moderate', icon: MessageSquare },
            { id: 'newsletter', label: 'Newsletter Growth', icon: Mail },
            { id: 'themes', label: 'Theme & Fonts', icon: Settings },
            { id: 'seo', label: 'SEO & Redirects', icon: HelpCircle },
            { id: 'settings', label: 'Backup & Restore', icon: Download }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentAdminView(item.id);
                  setEditingPost(null);
                  setIsCreatingPost(false);
                  setEditingCategory(null);
                  setIsCreatingCategory(false);
                  setEditingTool(null);
                  setIsCreatingTool(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  currentAdminView === item.id 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-900'
                }`}
                style={currentAdminView === item.id ? { backgroundColor: themeSettings.primaryColor } : {}}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-905/30 mt-4">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <Lock className="h-4.5 w-4.5" />
            <span>Lock Terminal</span>
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE: Active Admin Sub-Panel */}
      <main className="lg:col-span-9 bg-gray-50/50 p-6 sm:p-8 dark:bg-gray-950 overflow-y-auto">
        
        {/* ========================================================
            SUB-PANEL 1: DASHBOARD ANALYTICS OVERVIEW
            ======================================================== */}
        {currentAdminView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Editorial Health Hub</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reviewing traffic benchmarks, subscriptions, comments, and recent campaign metrics.</p>
              </div>
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setIsAdminMode(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                >
                  View Website
                </button>
                <button
                  onClick={() => {
                    setIsCreatingPost(true);
                    setCurrentAdminView('posts');
                  }}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  <Plus className="h-4 w-4" />
                  New Publication
                </button>
              </div>
            </div>

            {/* Quick Stat Highlight Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'VISITORS (30D)', val: analyticsData.visitors?.toLocaleString(), desc: '+12% traffic velocity' },
                { label: 'PAGEVIEWS (30D)', val: analyticsData.pageviews?.toLocaleString(), desc: '2.4 average views/session' },
                { label: 'INDEXED POSTS', val: posts.length, desc: `${posts.filter(p => p.status === 'published').length} active, ${posts.filter(p => p.status === 'draft').length} drafts` },
                { label: 'SUBSCRIBERS', val: subscribers.length, desc: 'Healthy newsletter growth' }
              ].map((stat, sIdx) => (
                <div key={sIdx} className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900 shadow-sm space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">{stat.label}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.val}</h3>
                  <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{stat.desc}</p>
                </div>
              ))}
            </div>

            {/* Recharts Traffic Visualization Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Traffic Chart */}
              <div className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Traffic Velocity Trends</h3>
                </div>
                <div className="h-64 w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.dailyStats}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeSettings.primaryColor} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={themeSettings.primaryColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke={themeSettings.primaryColor} fillOpacity={1} fill="url(#colorViews)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Traffic Sources Breakdown */}
              <div className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Channel Referral Splits</h3>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.trafficSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="percentage"
                      >
                        {analyticsData.trafficSources?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legends */}
                <div className="space-y-1.5 text-xs">
                  {analyticsData.trafficSources?.map((source: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] text-gray-500">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-semibold truncate max-w-[130px]">{source.source}</span>
                      </div>
                      <span>{source.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Articles and Recent Comments split lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Articles Table */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Read Publications</h3>
                <div className="space-y-3.5">
                  {posts.slice(0, 5).map((p, idx) => (
                    <div key={p.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-4">
                        <span className="font-black font-mono text-gray-300 w-4">0{idx + 1}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{p.title}</span>
                      </div>
                      <span className="font-bold font-mono text-blue-600 dark:text-blue-400 shrink-0">{p.views} views</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Comments Table */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Reader Interaction</h3>
                <div className="space-y-3">
                  {comments.slice(0, 4).map(comment => (
                    <div key={comment.id} className="flex justify-between items-start text-xs border-b border-gray-50 dark:border-gray-800/40 pb-2.5 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                          <span>{comment.authorName}</span>
                          {!comment.approved && <span className="rounded bg-yellow-100 text-yellow-800 text-[8px] px-1 font-bold">PENDING</span>}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1 italic">{comment.content}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-4">{comment.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 2: PUBLICATIONS MANAGER (POSTS CRUD)
            ======================================================== */}
        {currentAdminView === 'posts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Publications CMS</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Write, edit, preview, duplicate, schedule, or audit search compliance tags.</p>
              </div>
              {!isCreatingPost && !editingPost && (
                <button
                  onClick={() => setIsCreatingPost(true)}
                  className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  <Plus className="h-4 w-4" />
                  Write Article
                </button>
              )}
            </div>

            {/* FORM: Create or Edit Post view */}
            {(isCreatingPost || editingPost) ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-200">
                {/* Draft auto-recover banner */}
                {hasSavedDraft && !editingPost && !postForm.title && !postForm.content && (
                  <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-2xl p-4 dark:bg-blue-950/20 dark:border-blue-900/30 text-xs animate-in fade-in duration-300">
                    <div className="flex items-center space-x-2.5">
                      <FileSpreadsheet className="h-5 w-5 text-blue-500 shrink-0" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        An unfinished draft was found in your browser cache {autoSaveTime && `(Auto-saved: ${autoSaveTime})`}.
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleRestoreDraft}
                        className="rounded-lg bg-blue-600 text-white px-3 py-1.5 font-bold hover:bg-blue-700 cursor-pointer text-[10px]"
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      >
                        Restore Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('ai_inventory_saved_draft');
                          setHasSavedDraft(false);
                        }}
                        className="rounded-lg bg-white border border-gray-200 text-gray-600 px-3 py-1.5 font-semibold hover:bg-gray-50 cursor-pointer text-[10px] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3">
                  <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                      {editingPost ? `Edit Article: ${editingPost.title}` : 'Write New Publication'}
                    </h3>
                    <p className="text-[11px] text-gray-500">Formulate tutorials, reviews, and tool comparisons using full markdown layout structures.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingPost(false);
                      setEditingPost(null);
                      setSeoScoreData(null);
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                </div>

                {/* PREMIUM TABBED INTERFACE SELECTORS */}
                <div className="flex border-b border-gray-100 dark:border-gray-800/80 gap-1 overflow-x-auto pb-1.5">
                  {[
                    { id: 'write', label: 'Write Content', icon: Edit },
                    { id: 'split', label: 'Split Live Preview', icon: Icons.Columns || FileText },
                    { id: 'preview', label: 'Visual Reader Preview', icon: Eye },
                    { id: 'seo', label: 'SEO Compliance Audit', icon: Sparkles }
                  ].map((tab) => {
                    const TabIcon = tab.icon as any;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setEditorTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                          editorTab === tab.id
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:text-gray-400'
                        }`}
                      >
                        <TabIcon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* MAIN CMS POST SUBMISSION FORM */}
                <form onSubmit={handlePostSubmit} className="space-y-6">
                  {/* TAB 1: WRITE MODE */}
                  {editorTab === 'write' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-200">
                      {/* Left Input Fields */}
                      <div className="md:col-span-8 space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Article Display Title *</label>
                          <input
                            type="text"
                            required
                            value={postForm.title}
                            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                            placeholder="e.g. ChatGPT vs Claude: The Ultimate Reasoning Benchmark"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Fast formatting toolbox & draft indicators */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Content Body (Markdown Format) *</label>
                            {autoSaveTime && (
                              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold select-none bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>Draft auto-saved at {autoSaveTime}</span>
                              </div>
                            )}
                          </div>

                          {/* Interactive Formatting Action Toolbar */}
                          <div className="flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-gray-950/80 p-2 rounded-t-xl border-t border-x border-gray-200 dark:border-gray-800">
                            {[
                              { label: 'Bold', syntax: ['**', '**'], icon: Icons.Bold || 'B' },
                              { label: 'Italic', syntax: ['*', '*'], icon: Icons.Italic || 'I' },
                              { label: 'Heading 2', syntax: ['## ', ''], icon: 'H2' },
                              { label: 'Heading 3', syntax: ['### ', ''], icon: 'H3' },
                              { label: 'Code', syntax: ['`', '`'], icon: Icons.Code || 'C' },
                              { label: 'Code Block', syntax: ['```ts\n', '\n```'], icon: 'CodeBlk' },
                              { label: 'Quote', syntax: ['> ', ''], icon: 'Quote' },
                              { label: 'Note Box', syntax: ['> [!NOTE]\n', ''], icon: 'Callout' },
                              { label: 'Bullet List', syntax: ['- ', ''], icon: Icons.List || 'List' },
                              { label: 'Table Template', syntax: ['| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |', ''], icon: 'Table' },
                              { label: 'Separator', syntax: ['\n---\n', ''], icon: 'Line' },
                            ].map((tool, tIdx) => (
                              <button
                                key={tIdx}
                                type="button"
                                title={tool.label}
                                onClick={() => insertAtCursor(tool.syntax[0], tool.syntax[1])}
                                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold font-mono text-[10px] flex items-center justify-center min-w-[24px] h-[24px] cursor-pointer"
                              >
                                {typeof tool.icon === 'string' ? tool.icon : React.createElement(tool.icon as any, { className: "h-3.5 w-3.5" })}
                              </button>
                            ))}
                            <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-800 mx-1.5" />
                            <button
                              type="button"
                              onClick={() => {
                                setMediaPickerTarget('content');
                                setIsMediaPickerOpen(true);
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 cursor-pointer"
                            >
                              <ImageIcon className="h-3 w-3" />
                              Add Image
                            </button>
                          </div>

                          <textarea
                            ref={contentTextareaRef}
                            required
                            rows={14}
                            value={postForm.content}
                            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                            placeholder="Start typing your structured Markdown article..."
                            className="w-full rounded-b-xl border border-gray-200 font-mono text-xs p-4 outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white leading-relaxed"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Snippet summary description (SEO Description) *</label>
                          <textarea
                            required
                            rows={2}
                            value={postForm.summary}
                            onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                            placeholder="Provide a concise 1-2 sentence marketing abstract of the article..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Right Sidebar Metadata */}
                      <div className="md:col-span-4 space-y-5">
                        {/* Custom Author Selector */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Assigned Author Profile *</label>
                          <select
                            required
                            value={postForm.authorId}
                            onChange={(e) => setPostForm({ ...postForm, authorId: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          >
                            {authors.map(a => (
                              <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                            ))}
                            {/* Pre-fill Owner Profile Option */}
                            {!authors.some(a => a.name === 'Junnior Nashoon') && (
                              <option value="auth-junnior">Junnior Nashoon (Owner)</option>
                            )}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Main Category Tag *</label>
                          <select
                            required
                            value={postForm.categoryId}
                            onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Featured Header Image Link</label>
                            <button
                              type="button"
                              onClick={() => {
                                setMediaPickerTarget('featuredImage');
                                setIsMediaPickerOpen(true);
                              }}
                              className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
                            >
                              Browse Media
                            </button>
                          </div>
                          <input
                            type="text"
                            value={postForm.featuredImage}
                            onChange={(e) => setPostForm({ ...postForm, featuredImage: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tags (comma separated)</label>
                          <input
                            type="text"
                            value={postForm.tags}
                            onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                            placeholder="Review, Benchmark, Free"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Publish State</label>
                          <select
                            value={postForm.status}
                            onChange={(e) => setPostForm({ ...postForm, status: e.target.value as any })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          >
                            <option value="published">Published (Live Online)</option>
                            <option value="draft">Draft (Work in progress)</option>
                            <option value="scheduled">Scheduled (Cron Autorelease)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-2xl px-5 py-4 text-xs font-black uppercase text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                          style={{ backgroundColor: themeSettings.primaryColor }}
                        >
                          {editingPost ? 'Update Publication & Go Live' : 'Release Publication & Go Live'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SPLIT MODE PREVIEW */}
                  {editorTab === 'split' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
                      {/* Left pane: Textarea editor */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-extrabold text-gray-500 uppercase">Interactive Editor</label>
                          <button
                            type="button"
                            onClick={() => {
                              setMediaPickerTarget('content');
                              setIsMediaPickerOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg hover:bg-blue-100 cursor-pointer"
                          >
                            <ImageIcon className="h-3 w-3" />
                            Insert Image
                          </button>
                        </div>
                        <textarea
                          ref={contentTextareaRef}
                          required
                          rows={22}
                          value={postForm.content}
                          onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                          placeholder="# Start typing your structured markdown layout..."
                          className="w-full rounded-2xl border border-gray-200 font-mono text-xs p-5 outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white leading-relaxed shadow-inner"
                        />
                      </div>

                      {/* Right pane: Custom rendered markdown */}
                      <div className="space-y-3">
                        <label className="text-xs font-extrabold text-gray-500 uppercase">Live Rendered Layout Preview</label>
                        <div className="w-full h-[470px] overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-950/40">
                          {renderMarkdownToReact(postForm.content)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: VISUAL READER PREVIEW */}
                  {editorTab === 'preview' && (
                    <div className="max-w-3xl mx-auto py-4 space-y-6 animate-in fade-in duration-200">
                      <div className="text-center">
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">
                          {categories.find(c => c.id === postForm.categoryId)?.name || 'AI INVENTORY ARTICLE PREVIEW'}
                        </span>
                      </div>

                      <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight text-center">
                        {postForm.title || 'Untitled Publication Draft'}
                      </h1>

                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center italic max-w-xl mx-auto leading-relaxed">
                        {postForm.summary || 'Summary abstract placeholder. Specify your SEO Snippet to visualize reader marketing previews...'}
                      </p>

                      {/* Author badge preview */}
                      <div className="flex items-center justify-center space-x-3 py-2 border-y border-gray-100 dark:border-gray-800">
                        {(() => {
                          const authorObj = authors.find(a => a.id === postForm.authorId) || {
                            name: 'Junnior Nashoon',
                            role: 'Owner',
                            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                            bio: 'AI Brand Administrator and Tech Lead of AI Inventory.'
                          };
                          return (
                            <>
                              <img src={authorObj.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/10" referrerPolicy="no-referrer" />
                              <div className="text-left text-xs">
                                <p className="font-bold text-gray-900 dark:text-white leading-none">{authorObj.name}</p>
                                <p className="text-[10px] text-gray-400">{authorObj.role} &bull; Published Today</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {postForm.featuredImage && (
                        <div className="rounded-2xl overflow-hidden aspect-video max-h-80 border border-gray-100 dark:border-gray-800 shadow-sm">
                          <img src={postForm.featuredImage} alt="Featured" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}

                      <div className="py-2.5 max-w-none">
                        {renderMarkdownToReact(postForm.content)}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SEO COMPLIANCE AUDIT */}
                  {editorTab === 'seo' && (
                    <div className="max-w-2xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-5 dark:border-blue-900/30 dark:bg-blue-950/10 space-y-3 text-center">
                        <Sparkles className="h-8 w-8 text-blue-500 mx-auto animate-bounce" />
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Gemini SEO Auditor</h3>
                          <p className="text-xs text-gray-500 leading-normal max-w-md mx-auto mt-1">
                            Analyze keyword weights, readability grades, metadata standards, and optimize compliance vectors using real-time generative models.
                          </p>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <button
                            type="button"
                            disabled={isAIGenerating}
                            onClick={() => handleAIAssistance('seo-keywords')}
                            className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                            style={{ backgroundColor: themeSettings.primaryColor }}
                          >
                            {isAIGenerating ? 'Generating suggestions...' : 'Generate Optimized SEO Tags'}
                          </button>
                          <button
                            type="button"
                            disabled={isAIGenerating}
                            onClick={() => handleAIAssistance('seo-score')}
                            className="rounded-xl bg-white border border-gray-200 text-gray-700 px-4 py-2 text-xs font-semibold hover:bg-gray-50 cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 disabled:opacity-50"
                          >
                            Calculate SEO Score
                          </button>
                        </div>
                        {aiError && (
                          <p className="text-xs text-red-500 font-bold mt-2">{aiError}</p>
                        )}
                      </div>

                      {/* Display score */}
                      {seoScoreData && (
                        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/20 p-6 space-y-4 dark:bg-emerald-950/10 dark:border-emerald-900/30 animate-in zoom-in duration-200">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-extrabold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">SEO SCORING REPORT</h4>
                            <span className="text-2xl font-black font-mono text-emerald-600">{seoScoreData.score} / 100</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${seoScoreData.score}%` }} />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-gray-400">Compliance Directives:</span>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1.5 font-medium">
                              {seoScoreData.suggestions.map((s, idx) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* SEO Fields form */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">SEO Keywords (comma separated)</label>
                          <input
                            type="text"
                            value={postForm.seoKeywords}
                            onChange={(e) => setPostForm({ ...postForm, seoKeywords: e.target.value })}
                            placeholder="ChatGPT, Claude, Benchmark"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Meta Title Tag Override</label>
                          <input
                            type="text"
                            value={postForm.metaTitle}
                            onChange={(e) => setPostForm({ ...postForm, metaTitle: e.target.value })}
                            placeholder="ChatGPT vs Claude | Benchmark Review"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Meta Description Override</label>
                        <textarea
                          rows={2}
                          value={postForm.metaDescription}
                          onChange={(e) => setPostForm({ ...postForm, metaDescription: e.target.value })}
                          placeholder="Override snippet description meta settings..."
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* BOTTOM REUSABLE SUBMIT HEADER FOR NON-WRITE TABS */}
                  {editorTab !== 'write' && (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800 flex-wrap gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-bold">Status:</span>
                        <select
                          value={postForm.status}
                          onChange={(e) => setPostForm({ ...postForm, status: e.target.value as any })}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white dark:border-gray-800 dark:bg-gray-950 text-gray-900 dark:text-white outline-none"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingPost(false);
                            setEditingPost(null);
                            setSeoScoreData(null);
                          }}
                          className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl px-5 py-2.5 text-xs font-black uppercase text-white bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer"
                          style={{ backgroundColor: themeSettings.primaryColor }}
                        >
                          {editingPost ? 'Update Publication' : 'Release Publication'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>

                {/* INLINE DIALOG OVERLAY: MEDIA PICKER */}
                {isMediaPickerOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="max-w-2xl w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in scale-in duration-150">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-5 w-5 text-blue-500" />
                          <h4 className="font-heading text-sm font-extrabold text-gray-900 dark:text-white uppercase">Insert Image Asset</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(false)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                        >
                          Close Library
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-500 leading-normal">
                        Select any image from your media uploads below. You can insert it directly into your markdown content body, or assign it as the primary featured hero image.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-72 p-1.5">
                        {mediaLibrary.filter(item => item.type === 'image' || item.type === 'icon').map((media) => (
                          <div
                            key={media.id}
                            className="group relative border border-gray-100 dark:border-gray-800/80 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950/60 shadow-sm hover:ring-2 hover:ring-blue-500/20 transition-all cursor-pointer"
                          >
                            <img src={media.url} alt={media.altText} className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                            <div className="p-2 space-y-1 bg-white/95 dark:bg-gray-900/95 border-t border-gray-100 dark:border-gray-800/50">
                              <p className="text-[9px] font-bold text-gray-800 dark:text-gray-200 truncate">{media.name}</p>
                              <div className="flex flex-col gap-1 pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (mediaPickerTarget === 'content') {
                                      insertAtCursor(`![${media.altText || media.name}](${media.url})`, '');
                                    } else {
                                      setPostForm(prev => ({ ...prev, featuredImage: media.url }));
                                    }
                                    setIsMediaPickerOpen(false);
                                  }}
                                  className="w-full rounded text-[8px] font-extrabold uppercase py-1 text-center bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 cursor-pointer"
                                >
                                  {mediaPickerTarget === 'content' ? 'Insert Here' : 'Set Featured'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                        <span>Total Image assets: {mediaLibrary.filter(item => item.type === 'image' || item.type === 'icon').length} items</span>
                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(false)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 font-bold hover:bg-gray-50 text-gray-600 dark:border-gray-800 dark:text-gray-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* TABULAR LIST: Grid details of all publications */
              <div className="rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-950 font-bold uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-6 py-4.5 text-left">Publication Info</th>
                        <th className="px-6 py-4.5 text-left">Category</th>
                        <th className="px-6 py-4.5 text-left">Status</th>
                        <th className="px-6 py-4.5 text-left">Date</th>
                        <th className="px-6 py-4.5 text-left">Stats</th>
                        <th className="px-6 py-4.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
                      {posts.map(post => {
                        const cat = categories.find(c => c.id === post.categoryId);
                        return (
                          <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/30">
                            <td className="px-6 py-4 flex items-center space-x-3 min-w-[200px]">
                              <img src={post.featuredImage} alt="" className="h-10 w-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                              <span className="font-bold truncate max-w-[150px]">{post.title}</span>
                            </td>
                            <td className="px-6 py-4">{cat?.name || 'AI Insight'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                post.status === 'published' 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                  : (post.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600')
                              }`}>
                                {post.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">{post.publishDate}</td>
                            <td className="px-6 py-4 font-mono">
                              <span>{post.views} views</span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingPost(post);
                                  setPostForm({
                                    title: post.title, content: post.content, summary: post.summary,
                                    categoryId: post.categoryId, tags: post.tags.join(', '),
                                    featuredImage: post.featuredImage, status: post.status,
                                    metaTitle: post.metaTitle || '', metaDescription: post.metaDescription || '',
                                    seoKeywords: post.seoKeywords.join(', ')
                                  });
                                }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => duplicatePost(post.id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-indigo-600"
                                title="Duplicate"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deletePost(post.id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 3: CATEGORIES MANAGER (CRUD)
            ======================================================== */}
        {currentAdminView === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Taxonomy Tags</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add or edit custom categories mapping core AI toolsets.</p>
              </div>
              {!isCreatingCategory && !editingCategory && (
                <button
                  onClick={() => setIsCreatingCategory(true)}
                  className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </button>
              )}
            </div>

            {(isCreatingCategory || editingCategory) ? (
              <form onSubmit={handleCategorySubmit} className="bg-white p-6 rounded-3xl border border-gray-200 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-4 max-w-lg">
                <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="AI Coding"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Url Slug Override</label>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      placeholder="ai-coding"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Lucide Icon Name</label>
                    <select
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <option value="PenTool">PenTool (Writing)</option>
                      <option value="Code">Code (Development)</option>
                      <option value="Image">Image (Creatives)</option>
                      <option value="Video">Video (Streaming)</option>
                      <option value="Cpu">Cpu (General Automation)</option>
                      <option value="Layers">Layers (Productivity)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Taxonomy Description</label>
                    <textarea
                      rows={3}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Brief description defining files within this folder..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setEditingCategory(null);
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                    style={{ backgroundColor: themeSettings.primaryColor }}
                  >
                    Save Category
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => {
                  const count = posts.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl p-5 dark:border-gray-800 dark:bg-gray-900 flex justify-between items-start shadow-sm">
                      <div className="space-y-2">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950 dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>
                          {renderIcon(cat.icon, "h-5 w-5")}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{cat.name}</h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{cat.description}</p>
                        <span className="inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400" style={{ color: themeSettings.primaryColor }}>{count} articles linked</span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({
                              name: cat.name, slug: cat.slug,
                              description: cat.description, icon: cat.icon, image: cat.image
                            });
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 4: AI TOOLS DIRECTORY (CRUD)
            ======================================================== */}
        {currentAdminView === 'tools' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">AI Tools Directory Hub</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">List and review new AI software with customizable rating parameters.</p>
              </div>
              {!isCreatingTool && !editingTool && (
                <button
                  onClick={() => setIsCreatingTool(true)}
                  className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  <Plus className="h-4 w-4" />
                  Index AI Tool
                </button>
              )}
            </div>

            {(isCreatingTool || editingTool) ? (
              <form onSubmit={handleToolSubmit} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-5">
                <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white">
                  {editingTool ? `Modify review: ${editingTool.name}` : 'Submit AI Tool For Review'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={toolForm.name}
                      onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                      placeholder="e.g. ElevenLabs"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Affiliate / Target Link *</label>
                    <input
                      type="text"
                      required
                      value={toolForm.url}
                      onChange={(e) => setToolForm({ ...toolForm, url: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Select Directory Category *</label>
                    <select
                      required
                      value={toolForm.categoryId}
                      onChange={(e) => setToolForm({ ...toolForm, categoryId: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Rating Score *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        required
                        value={toolForm.rating}
                        onChange={(e) => setToolForm({ ...toolForm, rating: Number(e.target.value) })}
                        placeholder="4.8"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Pricing Tier *</label>
                      <select
                        value={toolForm.pricing}
                        onChange={(e) => setToolForm({ ...toolForm, pricing: e.target.value as any })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                      >
                        <option value="free">Free Only</option>
                        <option value="freemium">Freemium Models</option>
                        <option value="paid">Commercial Paid</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Pricing Specific Details</label>
                  <input
                    type="text"
                    value={toolForm.pricingDetails}
                    onChange={(e) => setToolForm({ ...toolForm, pricingDetails: e.target.value })}
                    placeholder="Free trial available, Standard starts at $20/month."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Short Pitch Overview *</label>
                  <textarea
                    required
                    rows={2}
                    value={toolForm.description}
                    onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                    placeholder="Provide a 1-sentence marketing highlight..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Extended Technical Review</label>
                  <textarea
                    rows={4}
                    value={toolForm.longDescription}
                    onChange={(e) => setToolForm({ ...toolForm, longDescription: e.target.value })}
                    placeholder="Elaborate on detailed capabilities, API rates, and stress testing behaviors..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Core Features (comma split)</label>
                    <textarea
                      rows={2}
                      value={toolForm.features}
                      onChange={(e) => setToolForm({ ...toolForm, features: e.target.value })}
                      placeholder="Feature 1, Feature 2"
                      className="w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Aesthetic PROS (comma split)</label>
                    <textarea
                      rows={2}
                      value={toolForm.pros}
                      onChange={(e) => setToolForm({ ...toolForm, pros: e.target.value })}
                      placeholder="Pro 1, Pro 2"
                      className="w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Aesthetic CONS (comma split)</label>
                    <textarea
                      rows={2}
                      value={toolForm.cons}
                      onChange={(e) => setToolForm({ ...toolForm, cons: e.target.value })}
                      placeholder="Con 1, Con 2"
                      className="w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingTool(false);
                      setEditingTool(null);
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                    style={{ backgroundColor: themeSettings.primaryColor }}
                  >
                    Save Tool Review
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-950 font-bold uppercase text-gray-400">
                      <tr>
                        <th className="px-6 py-4 text-left">AI Product</th>
                        <th className="px-6 py-4 text-left">Rating</th>
                        <th className="px-6 py-4 text-left">Pricing</th>
                        <th className="px-6 py-4 text-left">Target URL</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
                      {aiTools.map(tool => (
                        <tr key={tool.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-bold">{tool.name}</td>
                          <td className="px-6 py-4 font-semibold text-yellow-600">{tool.rating} / 5.0</td>
                          <td className="px-6 py-4 uppercase font-mono">{tool.pricing}</td>
                          <td className="px-6 py-4 text-gray-400 truncate max-w-[150px]">{tool.url}</td>
                          <td className="px-6 py-4 text-right space-x-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingTool(tool);
                                setToolForm({
                                  name: tool.name, rating: tool.rating, description: tool.description,
                                  longDescription: tool.longDescription, logo: tool.logo, url: tool.url,
                                  categoryId: tool.categoryId, pricing: tool.pricing,
                                  features: tool.features.join(', '), pros: tool.pros.join(', '),
                                  cons: tool.cons.join(', '), pricingDetails: tool.pricingDetails || ''
                                });
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteAITool(tool.id)}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 5: MEDIA LIBRARY
            ======================================================== */}
        {currentAdminView === 'media' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Media Library Assets</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Drag and drop mock folders and click to write ALT text descriptions directly.</p>
            </div>

            {/* Folder Tabs */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Headers', 'Screenshots', 'Logos', 'Guides', 'Videos'].map(folder => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    selectedFolder === folder 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                  }`}
                  style={selectedFolder === folder ? { backgroundColor: themeSettings.primaryColor } : {}}
                >
                  {folder}
                </button>
              ))}
            </div>

            {/* Simulated Drag and Drop Input Box */}
            <div className="border-2 border-dashed border-gray-300 bg-white rounded-3xl p-8 text-center space-y-4 dark:border-gray-800 dark:bg-gray-900 shadow-inner">
              <ImageIcon className="h-10 w-10 text-gray-400 mx-auto animate-bounce" />
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">Drag and Drop Media Files</h4>
                <p className="text-[10px] text-gray-400 mt-1">Accepts images, videos, audio tracks, sitemaps, PDFs up to 25 MB</p>
              </div>
              <input
                type="file"
                multiple
                onChange={handleMockUpload}
                className="hidden"
                id="media-uploader-input"
              />
              <button
                onClick={() => document.getElementById('media-uploader-input')?.click()}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                style={{ backgroundColor: themeSettings.primaryColor }}
              >
                Browse Files
              </button>
            </div>

            {/* Media Items List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaLibrary
                .filter(m => selectedFolder === 'All' || m.folder === selectedFolder)
                .map(media => (
                  <div key={media.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col justify-between">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                      {media.type === 'image' || media.type === 'icon' ? (
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-extrabold text-[10px] uppercase font-mono text-gray-400">{media.type}</span>
                      )}
                      <span className="absolute top-2 left-2 rounded bg-gray-900/80 text-[8px] font-bold text-white px-1.5 py-0.5">
                        {media.size}
                      </span>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-800 dark:text-white truncate max-w-[120px]">
                          {media.name}
                        </span>
                        <button
                          onClick={() => deleteMediaItem(media.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">ALT Text Tag Indicator</label>
                        <input
                          type="text"
                          value={mediaAlt[media.id] !== undefined ? mediaAlt[media.id] : (media.altText || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMediaAlt(prev => ({ ...prev, [media.id]: val }));
                            updateMediaAlt(media.id, val);
                          }}
                          placeholder="e.g. ChatGPT screen interface"
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 6: COMMENTS MODERATE
            ======================================================== */}
        {currentAdminView === 'comments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Interaction & Comments Moderator</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Approve pending comments or delete abusive statements from active publication pages.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-950 font-bold uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-4 text-left">Author</th>
                      <th className="px-6 py-4 text-left">Comment Body</th>
                      <th className="px-6 py-4 text-left">Post Slug</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
                    {comments.map(comment => {
                      const post = posts.find(p => p.id === comment.postId);
                      return (
                        <tr key={comment.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 min-w-[120px]">
                            <h4 className="font-bold">{comment.authorName}</h4>
                            <span className="text-[10px] text-gray-400">{comment.authorEmail}</span>
                          </td>
                          <td className="px-6 py-4 italic leading-relaxed max-w-xs">{comment.content}</td>
                          <td className="px-6 py-4 text-gray-400 truncate max-w-[120px]">{post?.title || comment.postId}</td>
                          <td className="px-6 py-4 font-mono">{comment.date}</td>
                          <td className="px-6 py-4 text-right space-x-2 shrink-0">
                            {!comment.approved ? (
                              <button
                                onClick={() => approveComment(comment.id)}
                                className="inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-600"
                              >
                                <Check className="h-3 w-3" />
                                Approve
                              </button>
                            ) : (
                              <span className="inline-flex rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-400">
                                Approved
                              </span>
                            )}
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 7: NEWSLETTER GROWTH
            ======================================================== */}
        {currentAdminView === 'newsletter' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Newsletter Growth</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Download active emails list in comma-split formatting or moderate readers.</p>
              </div>
              <button
                onClick={() => {
                  const emails = subscribers.map(s => s.email).join(', ');
                  const blob = new Blob([emails], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ai_inventory_subscribers_${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }}
                className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
                style={{ backgroundColor: themeSettings.primaryColor }}
              >
                <Download className="h-4 w-4" />
                Export CSV Emails
              </button>
            </div>

            {/* Newsletter subscriber grid table */}
            <div className="rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-950 font-bold uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-4 text-left">Active Subscriber Email</th>
                      <th className="px-6 py-4 text-left">Registration Date</th>
                      <th className="px-6 py-4 text-right">Moderations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
                    {subscribers.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold">{sub.email}</td>
                        <td className="px-6 py-4 font-mono">{sub.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteSubscriber(sub.id)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 8: THEME & FONTS CUSTOMIZER
            ======================================================== */}
        {currentAdminView === 'themes' && (() => {
          const themePresets = [
            {
              id: "sleek-dark",
              name: "Sleek Dark Slate",
              description: "Default cosmic indigo & slate canvas",
              isDarkMode: true,
              settings: {
                primaryColor: '#3B82F6',
                secondaryColor: '#020617',
                accentColor: '#60A5FA',
                bgStyle: 'slate' as const,
                fontSans: 'Inter',
                fontHeading: 'Space Grotesk',
                borderRadius: 'rounded-2xl',
                cardStyle: 'glass' as const,
                isDarkMode: true
              }
            },
            {
              id: "pure-light",
              name: "Pure Light Ivory",
              description: "Crisp white background with royal indigo and active focus",
              isDarkMode: false,
              settings: {
                primaryColor: '#4F46E5',
                secondaryColor: '#F8FAFC',
                accentColor: '#818CF8',
                bgStyle: 'white' as const,
                fontSans: 'Inter',
                fontHeading: 'Space Grotesk',
                borderRadius: 'rounded-2xl',
                cardStyle: 'bordered' as const,
                isDarkMode: false
              }
            },
            {
              id: "warm-oatmeal",
              name: "Subtle Warm Oatmeal",
              description: "Charcoal gray with cozy warm cream & golden amber",
              isDarkMode: false,
              settings: {
                primaryColor: '#0F172A',
                secondaryColor: '#FAF8F5',
                accentColor: '#D97706',
                bgStyle: 'slate' as const,
                fontSans: 'Inter',
                fontHeading: 'Inter',
                borderRadius: 'rounded-xl',
                cardStyle: 'bordered' as const,
                isDarkMode: false
              }
            },
            {
              id: "emerald-garden",
              name: "Emerald Garden",
              description: "Lively forest green accents and fresh white backgrounds",
              isDarkMode: false,
              settings: {
                primaryColor: '#059669',
                secondaryColor: '#ECFDF5',
                accentColor: '#10B981',
                bgStyle: 'white' as const,
                fontSans: 'Inter',
                fontHeading: 'Space Grotesk',
                borderRadius: 'rounded-2xl',
                cardStyle: 'default' as const,
                isDarkMode: false
              }
            },
            {
              id: "editorial-serif",
              name: "Editorial Serif",
              description: "High-contrast serif typeface and premium ivory paper layout",
              isDarkMode: false,
              settings: {
                primaryColor: '#991B1B',
                secondaryColor: '#FFFDF9',
                accentColor: '#D97706',
                bgStyle: 'white' as const,
                fontSans: 'Playfair Display',
                fontHeading: 'Playfair Display',
                borderRadius: 'rounded-md',
                cardStyle: 'bordered' as const,
                isDarkMode: false
              }
            },
            {
              id: "cyber-cyan",
              name: "Cyber Cyan Matrix",
              description: "Futuristic slate dark mode with neon cyan highlights",
              isDarkMode: true,
              settings: {
                primaryColor: '#06B6D4',
                secondaryColor: '#083344',
                accentColor: '#22D3EE',
                bgStyle: 'dark' as const,
                fontSans: 'JetBrains Mono',
                fontHeading: 'Space Grotesk',
                borderRadius: 'rounded-xl',
                cardStyle: 'bordered' as const,
                isDarkMode: true
              }
            }
          ];

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Site Appearance Customizer</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Design the primary UI identity. Changes reflect instantly over reader views.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Controls Column */}
                <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl dark:border-gray-800 dark:bg-gray-900 space-y-6 shadow-sm">
                  
                  {/* Presets Grid */}
                  <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-extrabold text-gray-450 uppercase tracking-widest flex items-center gap-1.5 dark:text-gray-400">
                      <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                      1-Click Theme Presets
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {themePresets.map((preset) => {
                        const isActive = 
                          themeSettings.primaryColor === preset.settings.primaryColor &&
                          themeSettings.isDarkMode === preset.settings.isDarkMode &&
                          themeSettings.fontSans === preset.settings.fontSans;

                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              updateTheme(preset.settings);
                            }}
                            className={`cursor-pointer rounded-xl border p-3 flex items-start gap-2.5 transition-all text-left ${
                              isActive
                                ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/10'
                                : 'border-gray-150 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-900/30'
                            }`}
                          >
                            <div 
                              className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold border shrink-0 shadow-sm"
                              style={{ 
                                backgroundColor: preset.settings.secondaryColor === '#F8FAFC' ? '#FFFFFF' : preset.settings.secondaryColor,
                                color: preset.settings.primaryColor,
                                borderColor: preset.settings.primaryColor + '25'
                              }}
                            >
                              Aa
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                                  {preset.name}
                                </span>
                                {preset.isDarkMode ? (
                                  <span className="text-[8px] bg-gray-800 text-gray-300 px-1 py-0.2 rounded font-black uppercase">Dark</span>
                                ) : (
                                  <span className="text-[8px] bg-amber-50 text-amber-700 px-1 py-0.2 rounded font-black uppercase dark:bg-amber-950/40 dark:text-amber-400">Light</span>
                                )}
                              </div>
                              <p className="text-[9px] text-gray-400 truncate mt-0.5">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode Selector Toggle */}
                  <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Global Theme Mode</h3>
                    <div className="flex items-center justify-between border border-gray-100 dark:border-gray-800/80 rounded-2xl p-4 bg-gray-50/30 dark:bg-gray-950/10">
                      <div className="space-y-0.5 pr-4">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Active Light/Dark State</span>
                        <p className="text-[9px] text-gray-400 leading-normal">Force the entire inventory layout to toggle.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateTheme({ isDarkMode: !themeSettings.isDarkMode })}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all shadow-sm"
                      >
                        {themeSettings.isDarkMode ? (
                          <>
                            <Icons.Sun className="h-4 w-4 text-amber-500" />
                            <span>Switch to Light</span>
                          </>
                        ) : (
                          <>
                            <Icons.Moon className="h-4 w-4 text-indigo-500" />
                            <span>Switch to Dark</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                
                {/* Brand Colors */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Brand Accent Colorways</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Primary Color</label>
                      <div className="flex items-center space-x-2 border border-gray-200 rounded-xl p-2 bg-white dark:border-gray-800 dark:bg-gray-950">
                        <input
                          type="color"
                          value={themeSettings.primaryColor}
                          onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                          className="h-8 w-8 rounded-lg cursor-pointer outline-none border-0"
                        />
                        <span className="text-xs font-mono font-bold uppercase">{themeSettings.primaryColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Accent Highlights</label>
                      <div className="flex items-center space-x-2 border border-gray-200 rounded-xl p-2 bg-white dark:border-gray-800 dark:bg-gray-950">
                        <input
                          type="color"
                          value={themeSettings.accentColor}
                          onChange={(e) => updateTheme({ accentColor: e.target.value })}
                          className="h-8 w-8 rounded-lg cursor-pointer outline-none border-0"
                        />
                        <span className="text-xs font-mono font-bold uppercase">{themeSettings.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Style */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Global Canvas background</label>
                  <select
                    value={themeSettings.bgStyle}
                    onChange={(e) => updateTheme({ bgStyle: e.target.value as any })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <option value="white">High Contrast Light White</option>
                    <option value="slate">Subtle Warm Slate Gray</option>
                    <option value="dark">Cosmic Deep Obsidian Gray</option>
                  </select>
                </div>

                {/* Typography Selectors */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Google Typography Selection</h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Body Font family</label>
                    <select
                      value={themeSettings.fontSans}
                      onChange={(e) => updateTheme({ fontSans: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <option value="Inter">Inter (Sans-serif, Neutral)</option>
                      <option value="Playfair Display">Playfair Display (Serif, Editorial)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Sleek tech spacing)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Heading Display Typography</label>
                    <select
                      value={themeSettings.fontHeading}
                      onChange={(e) => updateTheme({ fontHeading: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs bg-white outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <option value="Space Grotesk">Space Grotesk (Modern bold geometric)</option>
                      <option value="Inter">Inter (Clean technical editorial)</option>
                      <option value="Playfair Display">Playfair Display (Classy high-contrast Serif)</option>
                    </select>
                  </div>
                </div>

                {/* Border radius and card styling */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Card and Layout Borders</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Border Radius</label>
                      <select
                        value={themeSettings.borderRadius}
                        onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs bg-white outline-none dark:border-gray-800 dark:bg-gray-950"
                      >
                        <option value="rounded-none">Sharp Corners (Brutalist)</option>
                        <option value="rounded-md">Subtle Radius (6px)</option>
                        <option value="rounded-xl">Standard Curved (12px)</option>
                        <option value="rounded-full">Fully Circular Pill-style</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Card Border Style</label>
                      <select
                        value={themeSettings.cardStyle}
                        onChange={(e) => updateTheme({ cardStyle: e.target.value as any })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs bg-white outline-none dark:border-gray-800 dark:bg-gray-950"
                      >
                        <option value="bordered">Subtle Hairline Border</option>
                        <option value="default">Soft Shadows and no borders</option>
                        <option value="flat">Completely flat, solid backgrounds</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time preview card */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Real-Time Interface Mockup</h4>
                
                <div 
                  className={`border border-gray-100 p-5 rounded-2xl space-y-3 ${
                    themeSettings.bgStyle === 'slate' ? 'bg-slate-50' : (themeSettings.bgStyle === 'dark' ? 'bg-gray-950 text-white' : 'bg-white')
                  }`}
                >
                  <span className="inline-block rounded-md px-2 py-0.5 text-[9px] font-black uppercase text-white bg-blue-600" style={{ backgroundColor: themeSettings.primaryColor }}>
                    DIRECTORY TAG
                  </span>
                  <h3 className="text-base font-bold leading-tight" style={{ fontFamily: themeSettings.fontHeading }}>
                    Top 25 AI Tools for High-Performance Students and Researchers
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    A comprehensive, cited overview stressing deep logic models and writing benchmarks.
                  </p>
                  
                  <div className="pt-2 flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100/60 font-semibold">
                    <span>Published 2026-07-05</span>
                    <span className="text-blue-600 hover:underline cursor-pointer" style={{ color: themeSettings.primaryColor }}>Read Review &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* ========================================================
            SUB-PANEL 9: SEO & REDIRECTS MANAGER
            ======================================================== */}
        {currentAdminView === 'seo' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">SEO & Redirect Compliance</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Generate downloadable XML sitemap models and secure 301/302 redirects index.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Sitemap and compliance generation card */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-4">
                <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                  Sitemap & Indexing Robots
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Keeping your XML sitemaps up to date guarantees that Google, Bing, and DuckDuckGo crawls all 30 blog posts and 20 tool indexing sheets automatically.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleGenerateSitemap}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                    style={{ backgroundColor: themeSettings.primaryColor }}
                  >
                    <Download className="h-4 w-4" />
                    Download sitemap.xml
                  </button>
                  <button
                    onClick={() => {
                      const txt = `User-agent: *\nAllow: /\nSitemap: https://ai-inventory.com/sitemap.xml`;
                      const blob = new Blob([txt], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'robots.txt';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                    Download robots.txt
                  </button>
                </div>
              </div>

              {/* Redirect forms submission card */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-4">
                <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white">Active Redirect Rules (301/302)</h3>
                <form onSubmit={handleRedirectSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={redirectForm.source}
                      onChange={(e) => setRedirectForm({ ...redirectForm, source: e.target.value })}
                      placeholder="Source e.g. /old-slug"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none dark:border-gray-800 dark:bg-gray-950"
                    />
                    <input
                      type="text"
                      required
                      value={redirectForm.destination}
                      onChange={(e) => setRedirectForm({ ...redirectForm, destination: e.target.value })}
                      placeholder="Destination e.g. /blog/new-slug"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none dark:border-gray-800 dark:bg-gray-950"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <select
                      value={redirectForm.code}
                      onChange={(e) => setRedirectForm({ ...redirectForm, code: Number(e.target.value) as any })}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white dark:border-gray-800 dark:bg-gray-950"
                    >
                      <option value="301">301 (Permanent Redirect)</option>
                      <option value="302">302 (Temporary Redirect)</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700"
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    >
                      Add Redirect
                    </button>
                  </div>
                </form>

                {/* Redirects lists */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {redirectRules.map(rule => (
                    <div key={rule.id} className="flex justify-between items-center text-[11px] bg-gray-50/50 p-2 rounded-lg dark:bg-gray-950">
                      <div className="font-mono">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{rule.source}</span>
                        <span className="mx-1 text-gray-400">&rarr;</span>
                        <span className="text-blue-500">{rule.destination}</span>
                        <span className="ml-1.5 rounded bg-gray-200 text-gray-500 text-[8px] px-1 font-bold">{rule.code}</span>
                      </div>
                      <button
                        onClick={() => deleteRedirect(rule.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-PANEL 10: BACKUP, RESTORE & SYSTEM SETTINGS
            ======================================================== */}
        {currentAdminView === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-gray-900 dark:text-white">Cms Backups & Defaults Restore</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download the entire database state as a JSON file or restore sample parameters instantly.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900 shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Active Database Backups</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Exporting backups downloads a serialized JSON containing all 30 posts, 20 tools, analytics views, and local comments. You can import this JSON later to recover your CMS database perfectly.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={exportBackup}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-700"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  <Download className="h-4.5 w-4.5" />
                  Download JSON Backup
                </button>

                <button
                  onClick={handleRestoreClick}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Upload className="h-4.5 w-4.5" />
                  Restore From JSON File
                </button>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleRestoreFileChange}
                  className="hidden"
                />
              </div>

              {/* Restore Defaults Warning Block */}
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50/40 p-5 space-y-3 dark:bg-yellow-950/10 dark:border-yellow-900/40">
                <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-400 font-bold text-xs uppercase">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                  <span>DANGER ZONE WARNING</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Restoring default states will wipe any recent manual edits you have made to the publication pages, directory tools, and categories, resetting the site completely to the original sample values.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to restore the entire CMS database back to default sample content? This action is irreversible.")) {
                      resetToDefaults();
                      alert("Database reverted to default sample values successfully!");
                    }
                  }}
                  className="rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2.5 text-xs transition-colors"
                >
                  Reset Entire Database to Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminPanel;
