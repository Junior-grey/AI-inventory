import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { 
  Search, Sun, Moon, Menu, X, Cpu, LayoutDashboard, BookOpen, 
  Settings, Terminal, HelpCircle, Flame, ArrowRight, Star,
  Palette, Check, Sparkles
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
  const [isThemeOpen, setIsThemeOpen] = useState(false);

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
        primaryColor: '#4F46E5', // Indigo
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
        primaryColor: '#0F172A', // Slate 900
        secondaryColor: '#FAF8F5', // Cream
        accentColor: '#D97706', // Amber
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
        primaryColor: '#059669', // Emerald
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
        primaryColor: '#991B1B', // Burgundy
        secondaryColor: '#FFFDF9', // Paper Ivory
        accentColor: '#D97706', // Gold
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
        primaryColor: '#06B6D4', // Cyan
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

          {/* Custom Theme Picker Popover */}
          {isAdminAuthorized && (
            <div className="relative">
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 transition-colors flex items-center gap-1.5"
                title="Theme Settings & Presets"
              >
                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span className="hidden sm:inline text-xs font-bold text-gray-500 dark:text-gray-400">Appearance</span>
              </button>

              {isThemeOpen && (
                <>
                  {/* Backdrop overlay to dismiss popover on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsThemeOpen(false)} />
                  
                  {/* Theme Selector Popover Card */}
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-slate-950 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-900 mb-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          UI Theme & Font Presets
                        </h4>
                        <p className="text-[10px] text-gray-400">Click to apply instantly. Live-renders in real-time.</p>
                      </div>
                      <span className="text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-black uppercase dark:bg-purple-950/40 dark:text-purple-400">
                        6 Options
                      </span>
                    </div>

                    {/* Scrollable preset list */}
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
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
                            className={`group cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all duration-200 text-left ${
                              isActive
                                ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/15'
                                : 'border-gray-150 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-900/40'
                            }`}
                          >
                            {/* Visual Color Pill preview */}
                            <div className="flex flex-col items-center gap-1 pt-0.5">
                              <div 
                                className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-inner transition-transform group-hover:scale-105"
                                style={{ 
                                  backgroundColor: preset.settings.secondaryColor === '#F8FAFC' ? '#FFFFFF' : preset.settings.secondaryColor,
                                  color: preset.settings.primaryColor,
                                  borderColor: preset.settings.primaryColor + '30'
                                }}
                              >
                                Aa
                              </div>
                              <div className="flex gap-0.5 mt-1">
                                <span className="h-2 w-2 rounded-full border border-gray-200/50" style={{ backgroundColor: preset.settings.primaryColor }} />
                                <span className="h-2 w-2 rounded-full border border-gray-200/50" style={{ backgroundColor: preset.settings.accentColor }} />
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  {preset.name}
                                </span>
                                {preset.isDarkMode ? (
                                  <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-black uppercase dark:bg-slate-900 dark:text-slate-400">Dark</span>
                                ) : (
                                  <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-black uppercase dark:bg-amber-950/30 dark:text-amber-400">Light</span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 leading-normal line-clamp-2 mt-0.5">
                                {preset.description}
                              </p>
                            </div>

                            {/* Checkmark Indicator */}
                            {isActive && (
                              <div className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center animate-in zoom-in-50 duration-200 mt-1">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center text-[10px] text-gray-400">
                      <span>Full font customizer in panel</span>
                      <button 
                        onClick={() => {
                          setIsAdminMode(true);
                          setCurrentAdminView('themes');
                          setIsThemeOpen(false);
                        }}
                        className="text-purple-600 hover:underline dark:text-purple-400 font-bold"
                      >
                        Open CMS appearance
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Dark Mode Toggle */}
          {isAdminAuthorized && (
            <button
              onClick={toggleDarkMode}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 transition-colors"
              title={themeSettings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {themeSettings.isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-blue-600" />}
            </button>
          )}

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
