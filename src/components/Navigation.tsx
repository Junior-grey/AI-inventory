import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { 
  Search, Sun, Moon, Menu, X, Cpu, LayoutDashboard, BookOpen, 
  Settings, Terminal, HelpCircle, Flame, ArrowRight, Star
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
    setCurrentAdminView
  } = useCMS();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const popularSearches = ['ChatGPT vs Claude', 'best coding assistant', 'Midjourney', 'free tools', 'automation'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
          <div className="relative hidden lg:block w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search AI tools & articles..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-1.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-gray-950"
            />
            {isSearchFocused && (
              <div className="absolute top-11 right-0 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-950 animate-in fade-in duration-100">
                <span className="flex items-center text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
                  <Flame className="h-3.5 w-3.5 text-orange-500 mr-1" />
                  POPULAR SEARCHES
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearchClick(term)}
                      className="flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
                    >
                      {term}
                    </button>
                  ))}
                </div>
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
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden dark:border-gray-800 dark:bg-gray-950 animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="relative mb-4">
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
