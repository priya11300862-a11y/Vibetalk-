import React, { useState } from 'react';
import { X, Search, Plus, Check, Sparkles, Tag } from 'lucide-react';
import {
  PRESET_INTEREST_CATEGORIES,
  getInterestIcon,
} from '../../services/interestTags';

interface InterestTagPickerModalProps {
  isOpen: boolean;
  initialInterests: string[];
  onSave: (interests: string[]) => void;
  onClose: () => void;
}

export const InterestTagPickerModal: React.FC<InterestTagPickerModalProps> = ({
  isOpen,
  initialInterests,
  onSave,
  onClose,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customTagInput, setCustomTagInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const MAX_TAGS = 12;

  const handleToggleTag = (tagName: string) => {
    if (selectedInterests.some((t) => t.toLowerCase() === tagName.toLowerCase())) {
      setSelectedInterests((prev) =>
        prev.filter((t) => t.toLowerCase() !== tagName.toLowerCase())
      );
    } else {
      if (selectedInterests.length >= MAX_TAGS) {
        return;
      }
      setSelectedInterests((prev) => [...prev, tagName]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (
      !selectedInterests.some((t) => t.toLowerCase() === trimmed.toLowerCase()) &&
      selectedInterests.length < MAX_TAGS
    ) {
      setSelectedInterests((prev) => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleSave = () => {
    onSave(selectedInterests);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  // Filter tags across categories
  const filteredCategories = PRESET_INTEREST_CATEGORIES.map((cat) => {
    const tags = cat.tags.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchCat = activeCategory === 'all' || activeCategory === cat.id;
      return matchSearch && matchCat;
    });
    return { ...cat, tags };
  }).filter((cat) => cat.tags.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0F172A] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#131D31]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#FF4F9A] flex items-center justify-center text-white text-xs">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Profile Interest Tags
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Select interests to power smart discovery matching ({selectedInterests.length}/{MAX_TAGS})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Tags Preview Pill Box */}
        <div className="p-4 bg-[#0A0F1D] border-b border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Your Active Tags ({selectedInterests.length})</span>
            {selectedInterests.length > 0 && (
              <button
                onClick={() => setSelectedInterests([])}
                className="text-[10px] text-rose-400 hover:underline normal-case font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {selectedInterests.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-1">
              No interests selected yet. Tap tags below or add your own!
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-0.5">
              {selectedInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#7C5CFF]/30 to-[#FF4F9A]/30 border border-[#7C5CFF]/50 text-white text-xs font-semibold shadow-sm animate-in zoom-in-95"
                >
                  <span>{getInterestIcon(interest)}</span>
                  <span>{interest}</span>
                  <button
                    onClick={() => handleToggleTag(interest)}
                    className="hover:text-rose-400 text-slate-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Search & Custom Tag Input */}
        <div className="p-4 space-y-3 bg-[#111927]">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search passions & tags (e.g. Coffee, Music, Travel)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#7C5CFF]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add custom tag row */}
          <form onSubmit={handleAddCustomTag} className="flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              maxLength={24}
              placeholder="+ Add a custom interest tag..."
              className="flex-1 px-3.5 py-1.5 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#FF4F9A]"
            />
            <button
              type="submit"
              disabled={!customTagInput.trim() || selectedInterests.length >= MAX_TAGS}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF4F9A] hover:bg-[#e01479] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {PRESET_INTEREST_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#7C5CFF] text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Selection Browsing List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <p>No matching tags found for &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    handleToggleTag(searchQuery.trim());
                    setSearchQuery('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF] font-bold"
              >
                + Add &quot;{searchQuery}&quot; as custom tag
              </button>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag) => {
                    const isSelected = selectedInterests.some(
                      (t) => t.toLowerCase() === tag.name.toLowerCase()
                    );
                    return (
                      <button
                        key={tag.name}
                        onClick={() => handleToggleTag(tag.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#7C5CFF] to-[#FF4F9A] text-white border-transparent shadow-md shadow-purple-500/25 ring-1 ring-white/30'
                            : 'bg-[#141C2E] text-slate-300 hover:bg-[#1C273E] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.name}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Save Action */}
        <div className="p-4 border-t border-white/10 bg-[#131D31] flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Shared tags boost Discovery compatibility scores!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] via-[#A855F7] to-[#FF4F9A] hover:brightness-110 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Interests</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
