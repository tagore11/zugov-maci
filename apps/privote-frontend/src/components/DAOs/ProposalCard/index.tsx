'use client';
import React from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageSquare,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './index.module.css';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  type: 'onchain' | 'offchain';
  visibility: 'public' | 'private';
  startDate: string;
  endDate: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  currentQuorum: number;
  isEligible: boolean;
  eligibilityReason: string;
  hasVoted: boolean;
  votingPower: string;
  address?: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: string) => void;
  onDiscuss: (proposalId: string, proposalTitle: string) => void;
  children?: React.ReactNode;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onVote, onDiscuss, children }) => {
  const getStatusIcon = () => {
    switch (proposal.status) {
      case 'active':
        return <Clock className='w-4 h-4 text-blue-500' />;
      case 'passed':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'rejected':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'pending':
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;
  const quorumPercentage = (proposal.currentQuorum / proposal.quorum) * 100;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{proposal.title}</h3>
          <div className={styles.metadata}>
            <span className={`${styles.status} ${getStatusColor()}`}>
              {getStatusIcon()}
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </span>
            <span className={styles.type}>{proposal.type === 'onchain' ? 'On-chain' : 'Off-chain'}</span>
            {proposal.visibility === 'private' && <span className={styles.private}>Private</span>}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className={styles.description}>{proposal.description}</p>

      {/* Voting Progress */}
      <div className={styles.votingSection}>
        <div className={styles.progressBar}>
          <div className={styles.progressContainer}>
            <div className={styles.progressFor} style={{ width: `${forPercentage}%` }} />
            <div className={styles.progressAgainst} style={{ width: `${againstPercentage}%` }} />
            <div className={styles.progressAbstain} style={{ width: `${abstainPercentage}%` }} />
          </div>
        </div>

        <div className={styles.voteBreakdown}>
          <div className={styles.voteItem}>
            <ThumbsUp className='w-4 h-4 text-green-500' />
            <span>{proposal.votesFor.toLocaleString()}</span>
          </div>
          <div className={styles.voteItem}>
            <ThumbsDown className='w-4 h-4 text-red-500' />
            <span>{proposal.votesAgainst.toLocaleString()}</span>
          </div>
          <div className={styles.voteItem}>
            <Minus className='w-4 h-4 text-gray-500' />
            <span>{proposal.votesAbstain.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.quorumSection}>
          <div className={styles.quorumInfo}>
            <span className={styles.quorumLabel}>Quorum</span>
            <span className={styles.quorumValue}>
              {proposal.currentQuorum.toLocaleString()} / {proposal.quorum.toLocaleString()}
            </span>
          </div>
          <div className={styles.quorumBar}>
            <div className={styles.quorumProgress} style={{ width: `${Math.min(quorumPercentage, 100)}%` }} />
          </div>
        </div>

        <div className={styles.actions}>
          {children && <div className={styles.joinPollContainer}>{children}</div>}
          <div className={styles.votingPower}>
            <span className={styles.votingPowerLabel}>Your Power:</span>
            <span className={styles.votingPowerValue}>{proposal.votingPower}</span>
          </div>

          {proposal.isEligible && proposal.status === 'active' && !proposal.hasVoted && (
            <Button onClick={() => onVote(proposal.id)} className={styles.voteButton}>
              Vote Now
            </Button>
          )}

          {proposal.hasVoted && (
            <span className={styles.votedBadge}>
              <CheckCircle className='w-4 h-4' />
              Voted
            </span>
          )}

          {!proposal.isEligible && (
            <div className={styles.eligibilityInfo}>
              <span className={styles.eligibilityText} title={proposal.eligibilityReason}>
                Not Eligible
              </span>
            </div>
          )}

          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDiscuss(proposal.id, proposal.title)}
            className={styles.discussButton}
          >
            <MessageSquare className='w-4 h-4' />
            Discuss
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProposalCard;
