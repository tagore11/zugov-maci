'use client';
import React, { useState } from 'react';
import { MessageSquare, User, Clock, ArrowLeft, Search, Plus, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Proposal } from '../ProposalCard';
import styles from './index.module.css';

interface ForumProps {
  daoName: string;
  selectedProposal?: { id: string; title: string } | null;
  proposals: Proposal[];
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  replies: number;
  likes: number;
  category: string;
  proposalId?: string;
}

const Forum: React.FC<ForumProps> = ({ daoName, selectedProposal, proposals }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);

  // Mock forum posts
  const mockPosts: ForumPost[] = [
    {
      id: '1',
      title: 'Welcome to ZuKas Residency Forum',
      content:
        'This is the official discussion forum for ZuKas Residency DAO. Feel free to share your thoughts, ask questions, and engage with the community.',
      author: 'DAO Moderator',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
      timestamp: '2 days ago',
      replies: 24,
      likes: 156,
      category: 'announcement'
    },
    {
      id: '2',
      title: 'Proposal: Treasury Diversification Strategy',
      content:
        'I wanted to open a discussion about the recent proposal for treasury diversification. What are your thoughts on the suggested asset allocation?',
      author: 'Alice Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop',
      timestamp: '5 hours ago',
      replies: 18,
      likes: 89,
      category: 'proposal-discussion',
      proposalId: '1'
    },
    {
      id: '3',
      title: 'Community Call Notes - Dec 15, 2024',
      content:
        'Here are the key takeaways from our latest community call. We discussed upcoming proposals, governance improvements, and community initiatives.',
      author: 'Bob Wilson',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
      timestamp: '1 day ago',
      replies: 12,
      likes: 234,
      category: 'community-call'
    },
    {
      id: '4',
      title: 'How can we improve DAO participation?',
      content:
        "I've noticed participation rates have been declining. What ideas do you have for increasing engagement and making it easier for members to contribute?",
      author: 'Carol Martinez',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
      timestamp: '3 days ago',
      replies: 45,
      likes: 178,
      category: 'general'
    },
    {
      id: '5',
      title: 'Grant Program Implementation Feedback',
      content:
        "Now that the grant program has been active for a month, I'd love to hear feedback from both applicants and reviewers. What's working well and what could be improved?",
      author: 'David Kim',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
      timestamp: '6 hours ago',
      replies: 8,
      likes: 67,
      category: 'grant-program',
      proposalId: '2'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'proposal-discussion', label: 'Proposal Discussion' },
    { value: 'community-call', label: 'Community Calls' },
    { value: 'grant-program', label: 'Grant Program' },
    { value: 'general', label: 'General' }
  ];

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesProposal = !selectedProposal || post.proposalId === selectedProposal.id;

    return matchesSearch && matchesCategory && matchesProposal;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'proposal-discussion':
        return 'bg-purple-100 text-purple-800';
      case 'community-call':
        return 'bg-green-100 text-green-800';
      case 'grant-program':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={styles.forum}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <MessageSquare className={styles.headerIcon} />
            <div>
              <h2 className={styles.title}>
                {daoName} Forum
                {selectedProposal && <span className={styles.proposalContext}>- {selectedProposal.title}</span>}
              </h2>
              <p className={styles.subtitle}>Community discussions and governance conversations</p>
            </div>
          </div>

          <Button onClick={() => setShowNewPost(true)} className={styles.newPostButton}>
            <Plus className='w-4 h-4' />
            New Post
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type='text'
            placeholder='Search discussions...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className={styles.categorySelect}
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Posts List */}
      <div className={styles.postsList}>
        {filteredPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare className={styles.emptyIcon} />
            <h3>No discussions found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className={styles.post}>
              {/* Post Header */}
              <div className={styles.postHeader}>
                <div className={styles.authorInfo}>
                  <img src={post.authorAvatar} alt={post.author} className={styles.authorAvatar} />
                  <div>
                    <div className={styles.authorName}>{post.author}</div>
                    <div className={styles.timestamp}>
                      <Clock className='w-3 h-3' />
                      {post.timestamp}
                    </div>
                  </div>
                </div>

                <span className={`${styles.category} ${getCategoryColor(post.category)}`}>
                  {categories.find(c => c.value === post.category)?.label}
                </span>
              </div>

              {/* Post Content */}
              <div className={styles.postContent}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postText}>{post.content}</p>
              </div>

              {/* Post Actions */}
              <div className={styles.postActions}>
                <div className={styles.stats}>
                  <button className={styles.statButton}>
                    <Reply className='w-4 h-4' />
                    {post.replies} replies
                  </button>
                  <button className={styles.statButton}>
                    <MessageSquare className='w-4 h-4' />
                    {post.likes} likes
                  </button>
                </div>

                <Button variant='outline' size='sm'>
                  View Discussion
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create New Post</h3>
              <Button variant='ghost' size='sm' onClick={() => setShowNewPost(false)}>
                ×
              </Button>
            </div>

            <div className={styles.modalBody}>
              <input type='text' placeholder='Post title...' className={styles.titleInput} />

              <select className={styles.categoryInput}>
                {categories.slice(1).map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <textarea placeholder='Write your post content...' className={styles.contentInput} rows={6} />
            </div>

            <div className={styles.modalFooter}>
              <Button variant='outline' onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
              <Button>Publish Post</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
