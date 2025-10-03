import { environment } from '../../../../environments/environment.dev';
import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';
import { globalGetInitials } from '../../../utils/get-profile-initials.utils';
import { TagColor } from '../../../utils/types/tag-component.type';
import { BattleStartDetails } from './interfaces/battle-attempt.interface';

// Get initials for avatar/tag
export function getInitials(name: string): string {
  return globalGetInitials(name);
}

// Map backend question type to display string
export function mapBackendQuestionType(type: string): string {
  switch (type.toLowerCase()) {
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'true_false':
      return 'True/False';
    case 'short_answer':
      return 'Short Answer';
    case 'fill_in_the_blank':
      return 'Fill in the Blank';
    default:
      return type;
  }
}

// Opponent tag config
export function getPlayer2TagConfig(status: 'thinking' | 'answered'): TagInputConfig {
  let backgroundColor: TagColor;
  let textColor: TagColor;

  switch (status) {
    case 'thinking':
      backgroundColor = 'lightYellow';
      textColor = 'yellow';
      break;
    case 'answered':
      backgroundColor = 'lightGreen';
      textColor = 'green';
      break;
  }

  return {
    id: status.toLowerCase(),
    label: status === 'thinking' ? 'Thinking...' : 'Answered',
    type: 'static',
    isSelected: false,
    hasBorder: true,
    backgroundColor,
    textColor,
  };
}

// Player info interface
export interface BattlePlayerInfo {
  mySide: 'player1' | 'player2';
  player1: { id: number; name: string; imageUrl: string; score: number };
  player2: { id: number; name: string; imageUrl: string; score: number };
}

// Resolve which player is "me" and which is opponent
export class BattlePlayerHelper {
  static resolvePlayers(details: BattleStartDetails, currentUserId: number): BattlePlayerInfo {
    const playerProfileId = +details.playerProfile.userId;
    const opponentProfileId = +details.opponentProfile.userId;

    let mySide: 'player1' | 'player2';
    let player1: { id: number; name: string; imageUrl: string; score: number };
    let player2: { id: number; name: string; imageUrl: string; score: number };

    if (currentUserId === playerProfileId) {
      mySide = 'player1';

      player1 = {
        id: playerProfileId,
        name: details.playerProfile.fullName || details.playerProfile.userName,
        imageUrl: mapProfilePic(details.playerProfile.profilePic),
        score: 0,
      };

      player2 = {
        id: opponentProfileId,
        name: details.opponentProfile.fullName || details.opponentProfile.userName,
        imageUrl: mapProfilePic(details.opponentProfile.profilePic),
        score: 0,
      };
    } else {
      mySide = 'player2';

      player1 = {
        id: playerProfileId,
        name: details.playerProfile.fullName || details.playerProfile.userName,
        imageUrl: mapProfilePic(details.playerProfile.profilePic),
        score: 0,
      };

      player2 = {
        id: opponentProfileId,
        name: details.opponentProfile.fullName || details.opponentProfile.userName,
        imageUrl: mapProfilePic(details.opponentProfile.profilePic),
        score: 0,
      };
    }

    return { mySide, player1, player2 };
  }
}

export function mapProfilePic(profilePic: string | null | undefined): string {
  return profilePic ? `${environment.imageBaseUrl}/${profilePic}` : '';
}

export function openFullscreen(): boolean {
  const elem = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => void;
  };
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  return true;
}

export function closeFullscreen(): boolean {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
    msExitFullscreen?: () => void;
  };

  if (typeof doc.exitFullscreen === 'function') doc.exitFullscreen();
  else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
  else if (doc.msExitFullscreen) doc.msExitFullscreen();
  return false;
}

export function saveBattleId(attemptedId: number, ttlMs: number = 60_000): void {
  const expiry = Date.now() + ttlMs;
  localStorage.setItem('battleAttemptId', JSON.stringify({ attemptedId, expiry }));
}

export function getSavedBattleId(): number | null {
  const item = localStorage.getItem('battleAttemptId');
  if (!item) return null;

  try {
    const { attemptedId, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem('battleAttemptId');
      return null; // expired
    }
    return attemptedId;
  } catch {
    localStorage.removeItem('battleAttemptId');
    return null;
  }
}
