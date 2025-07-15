import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { CardInputConfig } from '../../interfaces/card-component.interface';
import { TagComponent } from '../tag/tag.component';
import { By } from '@angular/platform-browser';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  const mockConfig: CardInputConfig = {
    title: 'Revenue',
    value: '$18,420',
    subtitle: 'Monthly Income',
    icon: 'star',
    tag: {
      id: '1',
      label: 'Live',
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor: 'lightPurple',
      textColor: 'purple',
    },
    subtitleColor: 'purple',
    valueColor: 'black',
    iconColor: 'purple',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent, TagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Rendering content', () => {
    it('should display the provided title and value on the card', () => {
      component.cardConfig = {
        ...mockConfig,
        title: 'Revenue',
        value: '$18,420',
      };
      fixture.detectChanges();

      const titleEl = fixture.nativeElement.querySelector('.card-title');
      const valueEl = fixture.nativeElement.querySelector('.card-value');

      expect(titleEl.textContent).toContain('Revenue');
      expect(valueEl.textContent).toContain('$18,420');
    });

    it('should display the subtitle with the correct color when provided', () => {
      component.cardConfig = {
        ...mockConfig,
        subtitle: 'Monthly Income',
        subtitleColor: 'green',
      };
      fixture.detectChanges();

      const subtitleEl = fixture.nativeElement.querySelector('.card-subtitle');
      expect(subtitleEl).toBeTruthy();
      expect(subtitleEl.textContent).toContain('Monthly Income');
      expect(subtitleEl.classList).toContain('text-green');
    });

    it('should not display subtitle element if no subtitle is set', () => {
      component.cardConfig = {
        ...mockConfig,
        subtitle: '',
      };
      fixture.detectChanges();

      const subtitleEl = fixture.nativeElement.querySelector('.card-subtitle');
      expect(subtitleEl).toBeNull();
    });

    it('should render the <app-tag> when tag is provided', () => {
      component.cardConfig = {
        ...mockConfig,
        tag: {
          id: '123',
          label: 'Featured',
          type: 'static',
          isSelected: false,
          hasBorder: false,
          backgroundColor: 'lightPurple',
          textColor: 'purple',
        },
      };
      fixture.detectChanges();

      const tagEl = fixture.debugElement.query(By.css('app-tag'));
      expect(tagEl).toBeTruthy();
    });

    it('should not render the <app-tag> when tag is null', () => {
      component.cardConfig = {
        ...mockConfig,
        tag: null as any,
      };
      fixture.detectChanges();

      const tagEl = fixture.debugElement.query(By.css('app-tag'));
      expect(tagEl).toBeNull();
    });
  });

  describe('Icon and Tag visibility logic', () => {
    it('should show the icon when icon is set and tag is not provided', () => {
      component.cardConfig = {
        ...mockConfig,
        icon: 'star',
        tag: null as any,
      };
      fixture.detectChanges();

      const iconEl = fixture.nativeElement.querySelector('mat-icon');
      expect(component.showIcon).toBe(true);
      expect(iconEl).toBeTruthy();
      expect(iconEl.textContent).toContain('star');
    });

    it('should hide the icon when tag is provided', () => {
      component.cardConfig = {
        ...mockConfig,
        icon: 'star',
        tag: {
          id: '1',
          label: 'Live',
          type: 'static',
          isSelected: false,
          hasBorder: false,
          backgroundColor: 'lightPurple',
          textColor: 'purple',
        },
      };
      fixture.detectChanges();

      const iconEl = fixture.nativeElement.querySelector('mat-icon');
      expect(component.showIcon).toBe(false);
      expect(iconEl).toBeNull();
    });

    it('should correctly determine hasRightElement when icon is present', () => {
      component.cardConfig = {
        ...mockConfig,
        icon: 'info',
        tag: null as any,
      };
      fixture.detectChanges();

      expect(component.hasRightElement).toBe(true);
    });

    it('should correctly determine hasRightElement when tag is present', () => {
      component.cardConfig = {
        ...mockConfig,
        icon: '',
        tag: {
          id: '2',
          label: 'Beta',
          type: 'static',
          isSelected: false,
          hasBorder: false,
          backgroundColor: 'lightPurple',
          textColor: 'purple',
        },
      };
      fixture.detectChanges();

      expect(component.hasRightElement).toBe(true);
    });

    it('should return false for hasRightElement when both icon and tag are missing', () => {
      component.cardConfig = {
        ...mockConfig,
        icon: '',
        tag: null as any,
      };
      fixture.detectChanges();

      expect(component.hasRightElement).toBe(false);
    });
  });

  describe('Color class logic', () => {
    it('should compute the correct CSS class for subtitle color', () => {
      component.cardConfig = {
        ...mockConfig,
        subtitleColor: 'green',
      };
      fixture.detectChanges();

      expect(component.subtitleColorClass).toBe('text-green');
    });

    it('should compute the correct CSS class for value color', () => {
      component.cardConfig = {
        ...mockConfig,
        valueColor: 'red',
      };
      fixture.detectChanges();

      expect(component.valueColorClass).toBe('text-red');
    });

    it('should compute the correct CSS class for icon color', () => {
      component.cardConfig = {
        ...mockConfig,
        iconColor: 'blue',
      };
      fixture.detectChanges();

      expect(component.iconColorClass).toBe('text-blue');
    });
  });
});
