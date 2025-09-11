import {
  mapQuizToCardConfig,
  mapSortingEnumToDropdown,
  mapDropdownToTags,
  getTabCount,
  updateTabLabels,
  tabToTypeMap,
} from './browse-quizzes.mapper';
import { BrowseQuizResponse } from './interfaces/browse-quiz-response.interface';
import {
  BrowseQuizzesSorting,
  BrowseQuizzesFilterByType,
} from '../../../shared/enums/browse-quiz.enum';
import { QuizCardConfig } from './interfaces/browsr-quiz-request.interface';

describe('BrowseQuizzes Mapper', () => {
  describe('mapQuizToCardConfig', () => {
    it('should map API quiz response to QuizCardConfig', () => {
      const apiQuiz: BrowseQuizResponse = {
        id: 1,
        name: 'Test Quiz',
        description: 'Quiz description',
        categoryName: 'Science',
        difficultyLevel: 'Easy',
        isPaid: true,
        price: 50,
        tags: ['Physics', 'Math'],
        totalTime: 30,
        totalQuestions: 10,
        totalParticipates: 100,
        rating: 4.5,
        isFeatured: true,
        isAttempted: false,
      };

      const card: QuizCardConfig = mapQuizToCardConfig(apiQuiz);

      expect(card.title).toBe(apiQuiz.name);
      expect(card.description).toBe(apiQuiz.description);
      expect(card.category.label).toBe('Science');
      expect(card.difficulty.label).toBe('Easy');
      expect(card.priceTag?.label).toBe('₹ 50');
      expect(card.tags?.length).toBe(2);
      expect(card.duration).toBe('30m');
      expect(card.questions).toBe(10);
      expect(card.participants).toBe(100);
      expect(card.rating).toBe(4.5);
      expect(card.isFeatured).toBe(true);
      expect(card.isPaid).toBe(true);
      expect(card.buttonConfig.label).toBe('Play ₹50');
    });

    it('should handle free quiz without priceTag', () => {
      const apiQuiz: BrowseQuizResponse = {
        id: 2,
        name: 'Free Quiz',
        description: 'Free quiz',
        categoryName: 'Math',
        difficultyLevel: 'Medium',
        isPaid: false,
        price: 0,
        tags: [],
        totalTime: 20,
        totalQuestions: 5,
        totalParticipates: 50,
        rating: 4,
        isFeatured: false,
        isAttempted: false,
      };

      const card = mapQuizToCardConfig(apiQuiz);
      expect(card.priceTag).toBeUndefined();
      expect(card.buttonConfig.label).toBe('Play Free');
    });

    it('should set button label to "Show Result" if quiz is attempted', () => {
      const apiQuiz: BrowseQuizResponse = {
        id: 3,
        name: 'Attempted Quiz',
        description: 'Already attempted quiz',
        categoryName: 'History',
        difficultyLevel: 'Hard',
        isPaid: true,
        price: 100,
        tags: ['Ancient', 'Modern'],
        totalTime: 40,
        totalQuestions: 15,
        totalParticipates: 200,
        rating: 4.8,
        isFeatured: false,
        isAttempted: true,
      };

      const card = mapQuizToCardConfig(apiQuiz);
      expect(card.buttonConfig.label).toBe('Show Result');
      expect(card.buttonConfig.matIcon).toBe('visibility');
    });
  });

  describe('mapSortingEnumToDropdown', () => {
    it('should map sorting enum to dropdown array', () => {
      const dropdown = mapSortingEnumToDropdown();
      expect(dropdown).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: BrowseQuizzesSorting.MostPopular, name: 'Most Popular' }),
          expect.objectContaining({ id: BrowseQuizzesSorting.HighestRated, name: 'Highest Rated' }),
          expect.objectContaining({ id: BrowseQuizzesSorting.Newest, name: 'Newest' }),
          expect.objectContaining({
            id: BrowseQuizzesSorting.PriceLowToHigh,
            name: 'Price Low To High',
          }),
        ]),
      );
    });
  });

  describe('mapDropdownToTags', () => {
    it('should map dropdowns to TagInputConfig', () => {
      const dropdowns = [
        { id: 1, name: 'Science' },
        { id: 2, name: 'Math' },
      ];
      const tags = mapDropdownToTags(dropdowns);
      expect(tags.length).toBe(2);
      expect(tags[0].label).toBe('Science');
      expect(tags[1].label).toBe('Math');
    });
  });

  describe('getTabCount', () => {
    const counts = { featured: 5, allQuizzes: 10, free: 3, premium: 2 };

    it('should return correct count for each tab', () => {
      expect(getTabCount('featured', counts)).toBe(5);
      expect(getTabCount('all-quizzes', counts)).toBe(10);
      expect(getTabCount('free', counts)).toBe(3);
      expect(getTabCount('premium', counts)).toBe(2);
    });

    it('should return 0 for unknown tab', () => {
      expect(getTabCount('unknown', counts)).toBe(0);
    });
  });

  describe('updateTabLabels', () => {
    it('should update tab labels with counts', () => {
      const counts = {
        featured: 0,
        'all-quizzes': 10,
        free: 3,
        premium: 2,
      };

      const updatedTabs = updateTabLabels({
        featured: counts['featured'],
        allQuizzes: counts['all-quizzes'],
        free: counts['free'],
        premium: counts['premium'],
      });

      updatedTabs.forEach((updatedTab) => {
        const originalLabel = updatedTab.label.split(' (')[0];
        const expectedCount = counts[updatedTab.id as keyof typeof counts] ?? 0;
        expect(updatedTab.label).toBe(`${originalLabel} (${expectedCount})`);
      });
    });
  });

  describe('tabToTypeMap', () => {
    it('should have correct mapping for tabs', () => {
      expect(tabToTypeMap['featured']).toBe(BrowseQuizzesFilterByType.Featured);
      expect(tabToTypeMap['all-quizzes']).toBeNull();
      expect(tabToTypeMap['free']).toBe(BrowseQuizzesFilterByType.Free);
      expect(tabToTypeMap['premium']).toBe(BrowseQuizzesFilterByType.Premium);
    });
  });
});
