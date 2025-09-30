import {
  getInitials,
  mapBackendQuestionType,
  getPlayer2TagConfig,
  BattlePlayerHelper,
  openFullscreen,
  closeFullscreen,
  saveBattleId,
  getSavedBattleId,
} from './battle-atttempt.helper';
import { BattleStartDetails } from './interfaces/battle-attempt.interface';

describe('Battle Utils', () => {
  // ---------- getInitials ----------
  describe('getInitials', () => {
    it('should return empty string if name is empty', () => {
      expect(getInitials('')).toBe('');
    });

    it('should return first letter for single word', () => {
      expect(getInitials('Alice')).toBe('A');
      expect(getInitials('alice')).toBe('A');
    });

    it('should return initials for two words', () => {
      expect(getInitials('Alice Bob')).toBe('AB');
      expect(getInitials('alice bob')).toBe('AB');
    });
  });

  // ---------- mapBackendQuestionType ----------
  describe('mapBackendQuestionType', () => {
    it('should map known types', () => {
      expect(mapBackendQuestionType('multiple_choice')).toBe('Multiple Choice');
      expect(mapBackendQuestionType('true_false')).toBe('True/False');
      expect(mapBackendQuestionType('short_answer')).toBe('Short Answer');
      expect(mapBackendQuestionType('fill_in_the_blank')).toBe('Fill in the Blank');
    });

    it('should return unknown type as-is', () => {
      expect(mapBackendQuestionType('essay')).toBe('essay');
    });

    it('should be case-insensitive', () => {
      expect(mapBackendQuestionType('Multiple_Choice')).toBe('Multiple Choice');
    });

    it('should handle empty string', () => {
      expect(mapBackendQuestionType('')).toBe('');
    });
  });

  // ---------- getPlayer2TagConfig ----------
  describe('getPlayer2TagConfig', () => {
    it('should return correct config for thinking', () => {
      const result = getPlayer2TagConfig('thinking');
      expect(result).toEqual({
        id: 'thinking',
        label: 'Thinking...',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightYellow',
        textColor: 'yellow',
      });
    });

    it('should return correct config for answered', () => {
      const result = getPlayer2TagConfig('answered');
      expect(result).toEqual({
        id: 'answered',
        label: 'Answered',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'lightGreen',
        textColor: 'green',
      });
    });
  });

  // ---------- BattlePlayerHelper ----------
  describe('BattlePlayerHelper.resolvePlayers', () => {
    const mockDetails: BattleStartDetails = {
      playerProfile: {
        userId: 1,
        profilePic: 'player1.png',
        fullName: 'Player One',
        userName: 'p1',
      },
      opponentProfile: {
        userId: 2,
        profilePic: 'player2.png',
        fullName: 'Player Two',
        userName: 'p2',
      },
    } as any;

    it('should resolve current user as player1', () => {
      const result = BattlePlayerHelper.resolvePlayers(mockDetails, 1);
      expect(result.mySide).toBe('player1');
      expect(result.player1.name).toBe('You');
      expect(result.player2.name).toBe('Player Two');
    });

    it('should resolve current user as player2', () => {
      const result = BattlePlayerHelper.resolvePlayers(mockDetails, 2);
      expect(result.mySide).toBe('player2');
      expect(result.player2.name).toBe('You');
      expect(result.player1.name).toBe('Player One');
    });

    it('should fallback to username if fullname missing', () => {
      const details = {
        playerProfile: { userId: 1, profilePic: '', userName: 'p1' },
        opponentProfile: { userId: 2, profilePic: '', userName: 'p2' },
      } as any;
      const result = BattlePlayerHelper.resolvePlayers(details, 1);
      expect(result.player2.name).toBe('p2');
    });

    it('should handle missing profile pics', () => {
      const details = {
        playerProfile: { userId: 1, userName: 'p1' },
        opponentProfile: { userId: 2, userName: 'p2' },
      } as any;
      const result = BattlePlayerHelper.resolvePlayers(details, 1);
      expect(result.player1.imageUrl).toBe('');
      expect(result.player2.imageUrl).toBe('');
    });
  });

  // ---------- fullscreen ----------
  describe('Fullscreen functions', () => {
    let requestFullscreenMock: jest.Mock;
    let exitFullscreenMock: jest.Mock;

    beforeEach(() => {
      requestFullscreenMock = jest.fn();
      exitFullscreenMock = jest.fn();
      (document.documentElement as any).requestFullscreen = requestFullscreenMock;
      (document as any).exitFullscreen = exitFullscreenMock;
    });

    it('openFullscreen should call requestFullscreen', () => {
      expect(openFullscreen()).toBe(true);
      expect(requestFullscreenMock).toHaveBeenCalled();
    });

    it('closeFullscreen should call exitFullscreen', () => {
      expect(closeFullscreen()).toBe(false);
      expect(exitFullscreenMock).toHaveBeenCalled();
    });
  });

  // ---------- saveBattleId & getSavedBattleId ----------
  describe('Battle ID storage', () => {
    beforeEach(() => {
      localStorage.clear();
      jest.useFakeTimers({ now: Date.now() });
    });

    it('should save and retrieve battle ID', () => {
      saveBattleId(123);
      expect(getSavedBattleId()).toBe(123);
    });

    it('should return null if expired', () => {
      saveBattleId(123, 1000); // 1 second TTL
      jest.advanceTimersByTime(2000);
      expect(getSavedBattleId()).toBeNull();
    });

    it('should return null if no item', () => {
      expect(getSavedBattleId()).toBeNull();
    });

    it('should return null if corrupted JSON', () => {
      localStorage.setItem('battleAttemptId', 'invalid');
      expect(getSavedBattleId()).toBeNull();
    });

    it('should use custom TTL', () => {
      saveBattleId(456, 5000);
      jest.advanceTimersByTime(3000);
      expect(getSavedBattleId()).toBe(456);
      jest.advanceTimersByTime(3000);
      expect(getSavedBattleId()).toBeNull();
    });
  });

  describe('Fullscreen functions (vendor-prefixed)', () => {
    let requestFullscreenMock: jest.Mock;
    let webkitRequestFullscreenMock: jest.Mock;
    let msRequestFullscreenMock: jest.Mock;

    let exitFullscreenMock: jest.Mock;
    let webkitExitFullscreenMock: jest.Mock;
    let msExitFullscreenMock: jest.Mock;

    beforeEach(() => {
      requestFullscreenMock = jest.fn();
      webkitRequestFullscreenMock = jest.fn();
      msRequestFullscreenMock = jest.fn();

      exitFullscreenMock = jest.fn();
      webkitExitFullscreenMock = jest.fn();
      msExitFullscreenMock = jest.fn();
    });

    it('should call webkitRequestFullscreen if requestFullscreen not available', () => {
      (document.documentElement as any).requestFullscreen = undefined;
      (document.documentElement as any).webkitRequestFullscreen = webkitRequestFullscreenMock;
      (document.documentElement as any).msRequestFullscreen = msRequestFullscreenMock;

      expect(openFullscreen()).toBe(true);
      expect(webkitRequestFullscreenMock).toHaveBeenCalled();
      expect(msRequestFullscreenMock).not.toHaveBeenCalled();
    });

    it('should call msRequestFullscreen if requestFullscreen and webkitRequestFullscreen not available', () => {
      (document.documentElement as any).requestFullscreen = undefined;
      (document.documentElement as any).webkitRequestFullscreen = undefined;
      (document.documentElement as any).msRequestFullscreen = msRequestFullscreenMock;

      expect(openFullscreen()).toBe(true);
      expect(msRequestFullscreenMock).toHaveBeenCalled();
    });

    it('should call webkitExitFullscreen if exitFullscreen not available', () => {
      (document as any).exitFullscreen = undefined;
      (document as any).webkitExitFullscreen = webkitExitFullscreenMock;
      (document as any).msExitFullscreen = msExitFullscreenMock;

      expect(closeFullscreen()).toBe(false);
      expect(webkitExitFullscreenMock).toHaveBeenCalled();
      expect(msExitFullscreenMock).not.toHaveBeenCalled();
    });

    it('should call msExitFullscreen if exitFullscreen and webkitExitFullscreen not available', () => {
      (document as any).exitFullscreen = undefined;
      (document as any).webkitExitFullscreen = undefined;
      (document as any).msExitFullscreen = msExitFullscreenMock;

      expect(closeFullscreen()).toBe(false);
      expect(msExitFullscreenMock).toHaveBeenCalled();
    });
  });
});
