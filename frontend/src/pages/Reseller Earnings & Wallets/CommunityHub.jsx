import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';

const initialGroups = [
  {
    id: 1,
    name: "Saree Superstars",
    members: "50k members • 120 posts today",
    joined: false,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Home Decor Enthusiasts",
    members: "12k members • 45 posts today",
    joined: true,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80"
  }
];

export default function CommunityHub() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Discover");
  const [groups, setGroups] = useState(initialGroups);

  const toggleJoinGroup = (groupId) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined: !g.joined } : g));
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-32">
      {/* TopAppBar - Full Width without side gaps */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-10 lg:px-16 h-16 w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              type="button"
              onClick={() => setIsDrawerOpen(true)} 
              className="p-1.5 hover:bg-rose-50 transition-colors active:scale-95 duration-200 rounded-full cursor-pointer"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-rose-600 text-2xl">menu</span>
            </button>
            <h1 className="font-headline font-bold text-lg sm:text-xl tracking-tight text-rose-600">
              Community Hub
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => navigate('/messenger')}
              className="p-2 hover:bg-rose-50 transition-colors active:scale-95 duration-200 rounded-full cursor-pointer text-slate-700 dark:text-slate-200"
              title="Reseller Messenger"
            >
              <span className="material-symbols-outlined text-2xl">chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Single Column Vertical Flow Preserved */}
      <main className="pt-20 pb-24 max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* 1. Search & Filter Section */}
        <section>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/20 placeholder:text-outline text-on-surface outline-none"
              placeholder="Find 'Jewellery Resellers' or 'Ethnic Wear Experts'..."
              type="text"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2.5 mt-4 overflow-x-auto no-scrollbar pb-1">
            {["Discover", "My Groups", "Trending", "Regional"].map(chip => (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                className={`px-6 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  activeChip === chip
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Featured Groups (Horizontal Bento) */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-headline font-bold text-xl text-on-surface">Featured Groups</h2>
            <button className="text-primary font-bold text-sm hover:underline cursor-pointer">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map(grp => (
              <div
                key={grp.id}
                className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex gap-4 items-center border border-gray-100"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-low">
                  <img className="w-full h-full object-cover" alt={grp.name} src={grp.image} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface leading-tight mb-1 truncate">{grp.name}</h3>
                  <p className="text-xs text-outline mb-3 truncate">{grp.members}</p>
                  <button
                    onClick={() => toggleJoinGroup(grp.id)}
                    className={`w-full py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform cursor-pointer ${
                      grp.joined
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    {grp.joined ? '✓ Joined' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Community Feed: Recent Stories */}
        <section>
          <h2 className="font-headline font-bold text-xl text-on-surface mb-6">Recent Stories</h2>
          <div className="space-y-8">
            {/* Feed Post 1 */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.06)] border border-gray-100">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary p-0.5">
                    <img
                      className="w-full h-full object-cover rounded-full"
                      alt="Priya Sharma"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Priya Sharma</h3>
                    <p className="text-[11px] text-outline">Gold Reseller • 2h ago</p>
                  </div>
                </div>
                <button className="text-outline p-1 rounded-full hover:bg-surface-container-low cursor-pointer">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="px-4 pb-3">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  "Just completed 500 saree orders this festive season! My biggest tip: always share WhatsApp status videos rather than just photos. Conversion jumps 3x! 🚀✨"
                </p>
              </div>
              <div className="aspect-[16/9] w-full bg-surface-container-low overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  alt="Ethnic Festive Collection"
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
                />
              </div>
              <div className="p-4 flex items-center justify-between border-t border-surface-container-low">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-xl">favorite</span>
                    <span className="text-xs font-bold">1.2k</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                    <span className="text-xs font-bold">84</span>
                  </button>
                </div>
                <button 
                  onClick={() => navigate('/share-earn-config')}
                  className="flex items-center gap-1 text-primary font-bold text-xs hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                  Share Post
                </button>
              </div>
            </div>

            {/* Feed Post 2 */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(25,28,30,0.06)] border border-gray-100">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-secondary p-0.5">
                    <img
                      className="w-full h-full object-cover rounded-full"
                      alt="Rajesh Mehra"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Rajesh Mehra</h3>
                    <p className="text-[11px] text-outline">Home Decor Reseller • 5h ago</p>
                  </div>
                </div>
                <button className="text-outline p-1 rounded-full hover:bg-surface-container-low cursor-pointer">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="px-4 pb-3">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  "Tips on setting margins: Keep home decor items at 25-30% profit margin and customers don't mind paying slightly more for bundled items. Happy reselling everyone!"
                </p>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-surface-container-low">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-xl">favorite</span>
                    <span className="text-xs font-bold">540</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                    <span className="text-xs font-bold">32</span>
                  </button>
                </div>
                <button 
                  onClick={() => navigate('/share-earn-config')}
                  className="flex items-center gap-1 text-primary font-bold text-xs hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                  Share Post
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" />

      {/* Navigation Drawer */}
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
