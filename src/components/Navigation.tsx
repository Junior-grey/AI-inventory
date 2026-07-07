import React, { useState, useEffect, useRef } from 'react';
import { useCMS } from '../context/CMSContext';
import { 
  Search, Sun, Moon, Menu, X, Cpu, LayoutDashboard, BookOpen, 
  Settings, Terminal, HelpCircle, Flame, ArrowRight, Star, Clock, Sparkles
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    themeSettings,
    toggleDarkMode,
    updateTheme,
    isAdminMode,
    setIsAdminMode,
    isAdminAuthorized,
    searchQuery,
    setSearchQuery,
    selectedPostId,
    setSelectedPostId,
    selectedToolId,
    setSelectedToolId,
    selectedCategoryId,
    setSelectedCategoryId,
    activeTag,
    setActiveTag,
    currentAdminView,
    setCurrentAdminView,
    posts,
    aiTools
  } = useCMS();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const popularSearches = ['ChatGPT vs Claude', 'best coding assistant', 'Midjourney', 'free tools', 'automation'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActiveSuggestionIndex(-1);
    // If we search, reset individual item detail views to show the grid lists
    if (e.target.value) {
      setSelectedPostId(null);
      setSelectedToolId(null);
    }
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
    setIsSearchFocused(false);
    setSelectedPostId(null);
    setSelectedToolId(null);
    setSelectedCategoryId(null);
    setActiveTag(null);
  };

  const navigateTo = (view: 'home' | 'blog' | 'tools' | 'tutorials' | 'comparisons' | 'about' | 'contact') => {
    setIsAdminMode(false);
    setSelectedPostId(null);
    setSelectedToolId(null);
    setSelectedCategoryId(null);
    setActiveTag(null);
    
    if (view === 'tools') {
      setSelectedCategoryId('all-tools'); // Special key to render tools directory
    } else if (view === 'tutorials') {
      setActiveTag('Tutorial');
    } else if (view === 'comparisons') {
      setActiveTag('Comparison');
    } else if (view === 'about' || view === 'contact') {
      // Special routing
      setActiveTag(view === 'about' ? 'about-view' : 'contact-view');
    } else {
      setSearchQuery('');
    }
    setIsMobileMenuOpen(false);
  };

  // Autocomplete Suggestions Matching Logic (exactly matches the user intent)
  const getSuggestions = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const suggestionsList: Array<{
      id: string;
      type: 'tool' | 'post' | 'keyword';
      label: string;
      subtitle: string;
      icon: 'tool' | 'post' | 'search';
      logo?: string;
      targetId: string;
      score: number;
    }> = [];

    // 1. Tool Matches with precise relevance scoring
    aiTools.forEach(tool => {
      const nameLower = tool.name.toLowerCase();
      const subLower = (tool.subcategory || '').toLowerCase();
      let score = 0;

      if (nameLower === q) {
        score = 1000;
      } else if (nameLower.startsWith(q)) {
        score = 500 + (100 - nameLower.length); // closer length is prioritized
      } else if (nameLower.includes(' ' + q) || nameLower.includes('-' + q)) {
        score = 300;
      } else if (nameLower.includes(q)) {
        score = 150;
      } else if (subLower.includes(q)) {
        score = 50;
      }

      if (score > 0) {
        suggestionsList.push({
          id: `suggest-tool-${tool.id}`,
          type: 'tool',
          label: tool.name,
          subtitle: `AI Tool • ${tool.subcategory || 'General'} • ${tool.pricing.toUpperCase()}`,
          icon: 'tool',
          logo: tool.logo,
          targetId: tool.id,
          score: score
        });
      }
    });

    // 2. Blog/Publication Matches
    posts.filter(p => p.status === 'published').forEach(post => {
      const titleLower = post.title.toLowerCase();
      let score = 0;

      if (titleLower === q) {
        score = 800;
      } else if (titleLower.startsWith(q)) {
        score = 400 + (100 - titleLower.length);
      } else if (titleLower.includes(' ' + q)) {
        score = 200;
      } else if (titleLower.includes(q)) {
        score = 80;
      }

      if (score > 0) {
        suggestionsList.push({
          id: `suggest-post-${post.id}`,
          type: 'post',
          label: post.title,
          subtitle: `Publication • ${post.readingTime} min read`,
          icon: 'post',
          targetId: post.id,
          score: score
        });
      }
    });

    // 3. Keyword/Completions
    popularSearches.forEach(term => {
      const termLower = term.toLowerCase();
      if (termLower.includes(q) && termLower !== q) {
        let score = 30;
        if (termLower.startsWith(q)) score = 120;
        suggestionsList.push({
          id: `suggest-term-${term}`,
          type: 'keyword',
          label: term,
          subtitle: 'Popular search term',
          icon: 'search',
          targetId: term,
          score: score
        });
      }
    });

    // Sort by score descending, then by label length ascending to bubble up the closest matches
    return suggestionsList
      .sort((a, b) => b.score - a.score || a.label.length - b.label.length)
      .slice(0, 8);
  };

  const suggestions = getSuggestions();

  const handleSuggestionSelect = (item: {
    type: 'tool' | 'post' | 'keyword';
    label: string;
    targetId: string;
  }) => {
    if (item.type === 'tool') {
      setSearchQuery(item.label);
      setSelectedToolId(item.targetId);
      setSelectedPostId(null);
    } else if (item.type === 'post') {
      setSelectedPostId(item.targetId);
      setSelectedToolId(null);
    } else {
      setSearchQuery(item.label);
      setSelectedPostId(null);
      setSelectedToolId(null);
    }
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
  };

  // Keyboard navigation handler inside search box
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        handleSuggestionSelect(suggestions[activeSuggestionIndex]);
      } else {
        setIsSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  // Outside click listener to dismiss search dropdowns safely
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md transition-all dark:border-gray-800/80 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div 
          className="flex cursor-pointer items-center space-x-2.5 transition-opacity hover:opacity-90"
          onClick={() => navigateTo('home')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20" style={{ backgroundColor: themeSettings.primaryColor }}>
            <Cpu className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            AI <span className="text-blue-600" style={{ color: themeSettings.primaryColor }}>Inventory</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5">
          <button 
            onClick={() => navigateTo('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(!selectedCategoryId && !activeTag && !selectedPostId && !selectedToolId) ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900'}`}
          >
            Home
          </button>
          <button 
            onClick={() => navigateTo('tools')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(selectedCategoryId === 'all-tools') ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900'}`}
          >
            AI Tools
          </button>
          <button 
            onClick={() => navigateTo('tutorials')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(activeTag === 'Tutorial') ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900'}`}
          >
            Tutorials
          </button>
          <button 
            onClick={() => navigateTo('comparisons')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(activeTag === 'Comparison') ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900'}`}
          >
            Comparisons
          </button>
          <button 
            onClick={() => navigateTo('about')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(activeTag === 'about-view') ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900'}`}
          >
            About
          </button>
          <button 
            onClick={() => navigateTo('contact')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(activeTag === 'contact-view') ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900'}`}
          >
            Contact
          </button>
        </nav>

        {/* Search Bar & Actions */}
        <div className="flex items-center space-x-3.5">
          {/* Instant Search Bar */}
          <div ref={desktopSearchRef} className="relative hidden lg:block w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search AI tools & articles..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-1.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-gray-950"
            />
            {isSearchFocused && (
              <div className="absolute top-11 right-0 w-[28rem] rounded-2xl border border-gray-150 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-slate-950 z-50 animate-in fade-in duration-150">
                {searchQuery.trim().length > 0 ? (
                  /* Autocomplete Suggestions Panel with Active Highlighting */
                  <div className="space-y-1.5">
                    <span className="flex items-center text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 mb-2 uppercase">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                      SUGGESTIONS FOR "{searchQuery.toUpperCase()}"
                    </span>
                    {suggestions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-400">
                        No matches found. Try searching for "chatgpt" or "claude".
                      </div>
                    ) : (
                      <div className="space-y-0.5 max-h-96 overflow-y-auto no-scrollbar">
                        {suggestions.map((item, index) => {
                          const isActive = index === activeSuggestionIndex;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleSuggestionSelect(item)}
                              onMouseEnter={() => setActiveSuggestionIndex(index)}
                              className={`group flex items-center justify-between cursor-pointer rounded-xl p-2.5 transition-all duration-150 ${
                                isActive 
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 translate-x-1' 
                                  : 'hover:bg-gray-50 dark:hover:bg-slate-900/50'
                              }`}
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-colors ${
                                  isActive
                                    ? 'border-blue-200 bg-blue-100/40 text-blue-650 dark:border-blue-900/40 dark:bg-blue-950/60 dark:text-blue-400'
                                    : 'border-gray-100 bg-gray-50 text-gray-500 dark:border-gray-900 dark:bg-gray-900 dark:text-gray-450'
                                }`}>
                                  {item.type === 'tool' && item.logo ? (
                                    <img src={item.logo} alt="" className="h-5 w-5 rounded object-contain" referrerPolicy="no-referrer" />
                                  ) : item.type === 'post' ? (
                                    <BookOpen className="h-4 w-4" />
                                  ) : (
                                    <Clock className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs font-bold truncate ${isActive ? 'text-blue-700 dark:text-blue-350' : 'text-gray-850 dark:text-gray-150'}`}>
                                    {item.label}
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                <span className="text-[9px] text-gray-400 dark:text-gray-550 uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                  {item.type === 'tool' ? 'Launch' : item.type === 'post' ? 'Read' : 'Search'}
                                </span>
                                <ArrowRight className="h-3 w-3 text-gray-400 dark:text-gray-600" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Popular searches helper */
                  <div>
                    <span className="flex items-center text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
                      <Flame className="h-3.5 w-3.5 text-orange-500 mr-1" />
                      POPULAR SEARCHES
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handlePopularSearchClick(term)}
                          className="flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-blue-55 hover:text-blue-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 transition-colors"
            title={themeSettings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {themeSettings.isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-blue-600" />}
          </button>

          {/* CMS Admin Panel Gateway Button (Visible only in Admin Mode to toggle back to Reader Mode) */}
          {isAdminMode && (
            <button
              onClick={() => {
                setIsAdminMode(false);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/10 hover:bg-emerald-600 px-3.5 py-2 text-sm font-semibold transition-all shadow-sm"
            >
              <BookOpen className="h-4.5 w-4.5" />
              <span>Reader Mode</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 md:hidden dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            {isMobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div ref={mobileSearchRef} className="border-t border-gray-200 bg-white px-4 py-4 md:hidden dark:border-gray-800 dark:bg-gray-950 animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="relative mb-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search AI tools & articles..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Autocomplete Suggestions Panel on Mobile (Google-like matches experience) */}
          {searchQuery.trim().length > 0 && (
            <div className="mb-4 rounded-xl border border-gray-150 bg-gray-50/55 p-3 dark:border-gray-850 dark:bg-slate-900/60 max-h-72 overflow-y-auto no-scrollbar">
              <div className="flex items-center text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2.5">
                <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                Suggestions matching your query
              </div>
              {suggestions.length === 0 ? (
                <div className="py-2 text-center text-xs text-gray-400">
                  No matching tools or articles.
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSuggestionSelect(item)}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800/80 active:bg-blue-50 dark:active:bg-blue-950/20 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-gray-50 text-gray-400 dark:bg-gray-950 dark:text-gray-500">
                          {item.type === 'tool' && item.logo ? (
                            <img src={item.logo} alt="" className="h-4.5 w-4.5 rounded object-contain" referrerPolicy="no-referrer" />
                          ) : item.type === 'post' ? (
                            <BookOpen className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {item.label}
                          </p>
                          <p className="text-[9px] text-gray-400 dark:text-gray-550 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-650" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={() => navigateTo('home')}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span>Home</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
            <button 
              onClick={() => navigateTo('tools')}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span>AI Tools</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
            <button 
              onClick={() => navigateTo('tutorials')}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span>Tutorials</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
            <button 
              onClick={() => navigateTo('comparisons')}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span>Comparisons</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
            <button 
              onClick={() => navigateTo('about')}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span>About</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
            <button 
              onClick={() => navigateTo('contact')}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span>Contact</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navigation;
