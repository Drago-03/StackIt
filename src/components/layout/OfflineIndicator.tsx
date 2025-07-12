import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center z-50"
        >
          <div className="flex items-center justify-center space-x-2">
            <WifiOff size={16} />
            <span className="text-sm font-medium">
              You're offline. Some features may not work properly.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}