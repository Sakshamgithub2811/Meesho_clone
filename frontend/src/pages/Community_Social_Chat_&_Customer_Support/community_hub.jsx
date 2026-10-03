import React, { useState } from 'react';
import AppBottomNav from '../../components/AppBottomNav';

const INITIAL_GROUPS = [
  {
    id: 'grp-1',
    name: 'Saree Superstars',
    members: '50k members',
    postsToday: '120 posts today',
    isJoined: false,
    category: 'Trending',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-byQJgCrpMdrN2HKDo8Y4evjzqshvzpbh_X4EiazAuoRsqe6FqttxbZoFUrJhU98S4ElrASwALhIj42zeaJ0JJ0k8v8qc4ftfA4CtOb2CoSjSYNn2yXNdDxWkURMifcLmgE3BUk4mq8yuSD6VYUI5VJCUw5rpbJEGe3b_YL0stYmDqtF_CoDswO_LqW0vgv0LYPWXNQx0cA-3O_RH1FdYiGUOork3WM_CcV1by9a9B0ZuKsJUjyI2fdXcFVPg0R0zQTyy0ywn1T0',
  },
  {
    id: 'grp-2',
    name: 'Home Decor Enthusiasts',
    members: '12k members',
    postsToday: '45 posts today',
    isJoined: true,
    category: 'Discover',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Nxx-71wYf2CgfAWyVFyit2Vsj_hrmDe1aPHF7gmlBR7_y1y2e63gX5VzZoUTinawjOoDWxukcaih630NhS6FWtwqVenouQ2xnSlBAYzZjLSJvaK0upBhkMG2h75y7ErBf5JXwk6cX0eo2-3czd8r_-34H_bYwtpAjCZKbyMvfoYHdceheV9qylg-Voip213MWjTiePhOPoNsqNvQYnmqb68_-wAiqkrKyAd8QrlGqCNVJdIUWOV7xFy-yb_3H599Y1PJ9uas6II',
  },
  {
    id: 'grp-3',
    name: 'Jaipur Kurtis & Suits Hub',
    members: '34k members',
    postsToday: '89 posts today',
    isJoined: false,
    category: 'Regional',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
  },
];

const INITIAL_STORIES = [
  {
    id: 'story-1',
    author: 'Ananya Sharma',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQYMTNVYt0zeSF9IKh9X4yYoYYefEnBaXiHdyfvIYsfFgU8Jh9qCuoPK-FSvhBZFM7wgDnjLEq283e04Oxg4awuwOVuNF4zY-jt324MxemxDQ4qTkQSujNnB9gD_FqNeuNS0KS_eLNVVeomAztdumMm6S2vlXJfzXhIGNMqKaYYb72NQ0wLCAH3iO1lnaI6EY13gBkQaW2wMZ4KeML26wFw8LWuWEtw385WgXidYHrsj8pzncBpFRx8iQzx1LhMNBqbTSE3OJ2Qew',
    badge: 'Gold Reseller • 2h ago',
    tag: '#DailyPicks',
    content:
      'My #DailyPicks for the upcoming wedding season! These Kundan sets are moving so fast. Sold 15 units just this morning! ✨ Resellers are earning ₹300-₹500 margin easily per set.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvVhgja6OoGzqIzuW5dClQL-q1t8tFQ1AoK7dNswiCOe5504lPVi-y5a80O-1ASm7m7Rinqrrb6sKkpsLrhHV2PNdgzroh3MqCxFCOTG6apPvOCWWA4o5eXTQxpeVnKdb0JSkV3JN22WyTLBx8fuBDBfK48Js2NQ3tav279CD92HE8FP9lHNeKL73bG12rQtwYFwY_mOfoDmPI_B5HQs87jPWXHLIlmHb4EAvFKLpH8J0jz9C4KbQMm4i6DVGfe3YxDrU2FiFP0g0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAmyuIlhDQmyZSkF8XaTGl34R_SMA1FTIDEH_kxJa7Rjts7aUQB4GUlCOmHva8FDHiw9GZISOPdT96p0ADzrMZxV1gOLQJgiq2sT0Yy-EVKTWfeQbw7wyPxwXhWU3d30K9t0zUGPd7l3wThp-YOdhRUoNuO9PMjvjkNYmXsgVcD9a76wrI1RYpJ1WUjHVtJujQcev-M2zpkkT7_zrp3uQOev6LOVpxelThF-QYHNGrRkCaqwmonLjBqbKIioa9sXOPYrjuQnU0-0-o',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDX5XDYzY8q5LG2q3ID09pvkJKsS8XuTmBoToZi6F2zf4AJSjThDSJgw-jlMxK0XX6nVayiR1FLn5qVgqlnCkhp8sgHWueEGQslIj7S6owUfFAkaEkSMLEVGN2_WwsDaK0-vOFxr4guubXYK0ATaFA_5bRromR6ihbm1epBoaLYJsEMG31UY-s2yfsd8Gh6VuH41Nu1I0rnTyv_y9NwbCnmyGh1BSUBJ0hv9nJsEdTNJUAz4uawhkObvQ8VMoxPdjlYQD3IjSXJOVU',
    ],
    likes: 1240,
    isLiked: false,
    comments: [
      { author: 'Meena K.', text: 'Catalog code please! Would love to share with my WhatsApp group.' },
      { author: 'Ritu Verma', text: 'Stunning designs Ananya! Margin is really good.' },
    ],
    category: 'Trending',
  },
  {
    id: 'story-2',
    author: 'Priya Das',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBed20qnhEvWD4u-5J9MYrO6pRG4_GoyR5NhZksE7_2t_qJ4eiJ3Jl5mwOiQ4ArJPmXGo0ZQp7KxBxpFAxugYEFXkXDzV5yF_e5h-AhiTlJFkwbfDefUY5-xdxxKgchyUTI3bCew8oBkMj0JSelOXA9WSgIs0OT4XsTUUfjuYoVqOk0Z5p4EmWaYWKUvJiDXu1zeMmj_FOTHKn1SNp0v3xZLE2BKxJP2RyHmorpThgAINOUZCNNBeJK_Nj8VmpUWv9an-uYNHGuV1Q',
    badge: 'Rising Star • 5h ago',
    storyType: 'Success Story',
    content:
      "Just reached my first ₹50,000 earnings milestone this month! Grateful for this amazing community and the supplier support. Here's a quick peek at my workspace setup where all the magic happens 💻🚀",
    singleImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD23QE3CbgyFzW9VxTG28GnWLQ1uWrDzaVfj-MrICKU2KR8y1dgGGObradimiJGj2npgv2XUMk8LgD-pRIbiHr76oqUMYZz7gUJIKc1HjooZCtfutgp4cs9V7B1tcwAjpKPjcAcCPKMjZDsgePHLMkvTMVovqRvnRDpQ-fAboSI-K-e4g25nWGs1w6pbQszwaOh6g5IlLFvVhdM00l58V_gM7DmbRnI6c1fmHIJ-Ii1MWCqRZ5NuAsYd-fum4On-D5klinKLN-JTMI',
    likes: 3500,
    isLiked: false,
    comments: [
      { author: 'Sunita Roy', text: 'Huge congratulations Priya! Very inspiring for new sellers.' },
    ],
    category: 'Discover',
  },
];

export function CommunityHub({ onNavigate }) {
  const [activeChip, setActiveChip] = useState('Discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [toastMessage, setToastMessage] = useState(null);

  // New Post Modal State
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  // Comment Modal State
  const [activeCommentStoryId, setActiveCommentStoryId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleJoinGroup = (groupId, name) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const nextState = !g.isJoined;
          showToast(nextState ? `Joined "${name}" group!` : `Left "${name}"`);
          return { ...g, isJoined: nextState };
        }
        return g;
      })
    );
  };

  const toggleLikeStory = (storyId) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const nextLiked = !s.isLiked;
          return {
            ...s,
            isLiked: nextLiked,
            likes: nextLiked ? s.likes + 1 : s.likes - 1,
          };
        }
        return s;
      })
    );
  };

  const handleAddComment = (storyId) => {
    if (!newCommentText.trim()) return;
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          return {
            ...s,
            comments: [...s.comments, { author: 'You (Reseller)', text: newCommentText.trim() }],
          };
        }
        return s;
      })
    );
    setNewCommentText('');
    showToast('Comment posted!');
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newStory = {
      id: `story-${Date.now()}`,
      author: 'You (Reseller)',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCQYMTNVYt0zeSF9IKh9X4yYoYYefEnBaXiHdyfvIYsfFgU8Jh9qCuoPK-FSvhBZFM7wgDnjLEq283e04Oxg4awuwOVuNF4zY-jt324MxemxDQ4qTkQSujNnB9gD_FqNeuNS0KS_eLNVVeomAztdumMm6S2vlXJfzXhIGNMqKaYYb72NQ0wLCAH3iO1lnaI6EY13gBkQaW2wMZ4KeML26wFw8LWuWEtw385WgXidYHrsj8pzncBpFRx8iQzx1LhMNBqbTSE3OJ2Qew',
      badge: 'Active Reseller • Just now',
      tag: '#CommunityShare',
      content: newPostText.trim(),
      likes: 1,
      isLiked: true,
      comments: [],
      category: 'Discover',
    };

    setStories([newStory, ...stories]);
    setNewPostText('');
    setIsCreatePostOpen(false);
    showToast('Story published to Community Hub!');
  };

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeChip === 'Discover') return true;
    if (activeChip === 'My Groups') return true;
    if (activeChip === 'Trending') return story.category === 'Trending' || story.likes > 1500;
    if (activeChip === 'Regional') return story.category === 'Regional';
    return true;
  });

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#b90041] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-xl">forum</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md shadow-xs font-['Plus_Jakarta_Sans',sans-serif] border-b border-slate-100">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('home')}
              className="p-2 hover:bg-rose-50 text-[#FF3F6C] transition-colors active:scale-95 duration-200 rounded-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <img src="/mshoppy-logo.png" alt="MShoppy" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
              <div>
                <h1 className="font-headline font-black text-xl tracking-tight text-[#FF3F6C]">
                  MShoppy Community
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">150,000+ Active Resellers</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatePostOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF3F6C] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#e0355e] cursor-pointer transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span className="hidden sm:inline">Create Post</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Search focused. Type below to filter posts!')}
              className="p-2 hover:bg-rose-50 text-[#FF3F6C] transition-colors active:scale-95 duration-200 rounded-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-6 pb-28 max-w-screen-xl mx-auto px-4 w-full">
        {/* Search & Filter Section */}
        <section className="mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full h-13 pl-12 pr-4 bg-white border border-slate-200/70 rounded-2xl focus:ring-2 focus:ring-[#FF3F6C] placeholder:text-slate-400 text-slate-800 text-sm shadow-xs"
              placeholder="Find 'Jewellery Resellers' or 'Ethnic Wear Experts'..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2.5 mt-5 overflow-x-auto pb-1">
            {['Discover', 'My Groups', 'Trending', 'Regional'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveChip(chip)}
                className={`px-5 py-2 rounded-full font-bold text-xs whitespace-nowrap cursor-pointer transition-all ${
                  activeChip === chip
                    ? 'bg-[#b90041] text-white shadow-sm scale-105'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Groups (Horizontal Bento) */}
        <section className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="font-headline font-bold text-xl text-slate-900 font-['Plus_Jakarta_Sans']">
                Featured Reseller Groups
              </h2>
              <p className="text-xs text-slate-500">Connect with specialized category sellers</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Displaying top 3 active reseller clubs')}
              className="text-[#b90041] hover:underline font-bold text-xs cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex gap-4 items-center hover:shadow-md transition-shadow"
              >
                <div className="w-18 h-18 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                  <img
                    className="w-full h-full object-cover"
                    src={group.imageUrl}
                    alt={group.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                    {group.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-2.5">
                    {group.members} • {group.postsToday}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleJoinGroup(group.id, group.name)}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      group.isJoined
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#df2457] text-white hover:bg-[#b90041] shadow-xs active:scale-95'
                    }`}
                  >
                    {group.isJoined ? 'Joined ✓' : 'Join Group'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Post Prompt Card */}
        <section className="mb-8">
          <div
            onClick={() => setIsCreatePostOpen(true)}
            className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-3 cursor-pointer hover:border-pink-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#b90041] flex-shrink-0 font-bold">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <div className="flex-1 text-xs text-slate-400 font-medium">
              Share your margin tip, wedding pick, or milestone story with community...
            </div>
            <button
              type="button"
              className="px-4 py-1.5 bg-rose-50 text-[#b90041] font-bold text-xs rounded-xl hover:bg-rose-100"
            >
              Post
            </button>
          </div>
        </section>

        {/* Community Feed (Recent Stories) */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline font-bold text-xl text-slate-900 font-['Plus_Jakarta_Sans']">
              Recent Stories & Tips
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredStories.length} updates
            </span>
          </div>

          <div className="space-y-6">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100 hover:shadow-md transition-shadow"
              >
                {/* Author Bar */}
                <div className="p-4 flex items-center justify-between border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#b90041] p-0.5 overflow-hidden flex-shrink-0">
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={story.avatar}
                        alt={story.author}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 leading-none">
                          {story.author}
                        </p>
                        {story.storyType && (
                          <span className="bg-indigo-50 text-[#4d41df] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {story.storyType}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                        {story.badge}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Post options menu')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    {story.content}
                  </p>

                  {/* Multi-Image Grid */}
                  {story.images && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {story.images.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group cursor-pointer"
                          onClick={() => showToast(`Enlarged catalog photo ${i + 1}`)}
                        >
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            src={imgUrl}
                            alt="Catalog product showcase"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Single Image Banner */}
                  {story.singleImage && (
                    <div className="rounded-xl overflow-hidden h-52 bg-slate-100 mb-4 border border-slate-100">
                      <img
                        className="w-full h-full object-cover"
                        src={story.singleImage}
                        alt="Story banner"
                      />
                    </div>
                  )}

                  {/* Post Actions Bar */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => toggleLikeStory(story.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold ${
                          story.isLiked
                            ? 'text-[#FF3F6C]'
                            : 'text-slate-500 hover:text-[#FF3F6C]'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{
                            fontVariationSettings: story.isLiked ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          favorite
                        </span>
                        <span>{story.likes.toLocaleString()}</span>
                      </button>

                      {/* Comment button */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCommentStoryId(
                            activeCommentStoryId === story.id ? null : story.id
                          )
                        }
                        className="flex items-center gap-1.5 text-slate-500 hover:text-[#FF3F6C] transition-colors cursor-pointer text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-xl">chat_bubble</span>
                        <span>{story.comments.length}</span>
                      </button>
                    </div>

                    {/* Share to WhatsApp */}
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`WhatsApp share message generated for ${story.author}'s post!`)
                      }
                      className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">share</span>
                      <span>Share to WhatsApp</span>
                    </button>
                  </div>

                  {/* Expandable Comments Drawer */}
                  {activeCommentStoryId === story.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl space-y-3">
                      <div className="space-y-2">
                        {story.comments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No comments yet. Be the first!</p>
                        ) : (
                          story.comments.map((comment, cIdx) => (
                            <div key={cIdx} className="text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                              <span className="font-bold text-slate-800">{comment.author}: </span>
                              <span className="text-slate-600">{comment.text}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input for new comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Write a supportive comment..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#b90041]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(story.id)}
                          className="px-3 py-1.5 bg-[#b90041] text-white text-xs font-bold rounded-xl hover:bg-[#df2457] cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Universal Responsive Bottom Navigation Bar */}
      <AppBottomNav activeNav="home" onNavigate={onNavigate} />

      {/* Create Story Modal */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF3F6C]">post_add</span>
                <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Share with Community
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePostOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Your Reseller Story or Pick
                </label>
                <textarea
                  rows="4"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Tell fellow resellers about a winning product, high-converting WhatsApp message, or your milestone!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-[#b90041] outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePostOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#b90041] hover:bg-[#df2457] text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityHub;
