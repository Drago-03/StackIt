import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Bell, LogOut } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { AuthModal } from '@/components/auth/AuthModal';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onAskQuestion: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ onAskQuestion, searchQuery, onSearchChange }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Use debounced search query for actual search
  React.useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchQuery, onSearchChange]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StackIt</span>
            </motion.div>

            {/* Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button onClick={onAskQuestion} className="flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Ask Question</span>
                  </Button>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                    >
                      <Bell size={20} />
                      {/* Notification badge */}
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>
                    <NotificationDropdown 
                      isOpen={showNotifications} 
                      onClose={() => setShowNotifications(false)} 
                    />
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {profile && <Avatar seed={profile.avatar_seed} size="sm" />}
                      <span className="text-sm font-medium text-gray-700">
                        {profile?.display_name}
                      </span>
                    </button>

                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                      >
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthModalOpen(true);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthModalOpen(true);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}