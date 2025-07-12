import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  maxTags?: number;
}

export function TagSelector({ selectedTagIds, onChange, maxTags = 5 }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    // Update selected tags when selectedTagIds changes
    const selected = tags.filter(tag => selectedTagIds.includes(tag.id));
    setSelectedTags(selected);
  }, [selectedTagIds, tags]);

  useEffect(() => {
    // Filter tags based on search query
    const filtered = tags
      .filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedTagIds.includes(tag.id)
      )
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10);
    
    setFilteredTags(filtered);
  }, [searchQuery, tags, selectedTagIds]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const addTag = (tag: Tag) => {
    if (selectedTagIds.length >= maxTags) return;
    
    const newTagIds = [...selectedTagIds, tag.id];
    onChange(newTagIds);
    setSearchQuery('');
    setIsOpen(false);
  };

  const removeTag = (tagId: string) => {
    const newTagIds = selectedTagIds.filter(id => id !== tagId);
    onChange(newTagIds);
  };

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <motion.span
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {/* Tag Search */}
      {selectedTagIds.length < maxTags && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <AnimatePresence>
            {isOpen && searchQuery && filteredTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      <span className="text-xs text-gray-500">{tag.usage_count}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <p className="text-sm text-gray-500">
        {selectedTagIds.length}/{maxTags} tags selected
      </p>
    </div>
  );
}