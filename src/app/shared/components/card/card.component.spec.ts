import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function hexToRgb(hex: string): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  describe('Rendering content', () => {
    it('should display the provided title and value on the card', () => {
      component.title = 'Revenue';
      component.value = '$18,420';
      fixture.detectChanges();

      const titleEl = fixture.nativeElement.querySelector('.card-title');
      const valueEl = fixture.nativeElement.querySelector('.card-value');

      expect(titleEl.textContent).toContain('Revenue');
      expect(valueEl.textContent).toContain('$18,420');
    });

    it('should display the subtitle with the correct color when provided', () => {
      component.subtitle = 'Monthly Income';
      component.subtitleColor = 'green';
      fixture.detectChanges();

      const subtitleEl = fixture.nativeElement.querySelector('.card-subtitle');
      expect(subtitleEl.textContent).toContain('Monthly Income');
      expect(subtitleEl.style.color).toBe(hexToRgb(component.resolvedSubtitleColor));
    });

    it('should not display subtitle element if no subtitle is set', () => {
      component.subtitle = '';
      fixture.detectChanges();

      const subtitleEl = fixture.nativeElement.querySelector('.card-subtitle');
      expect(subtitleEl).toBeNull();
    });

    it('should display the status text when status is set', () => {
      component.status = 'Live';
      fixture.detectChanges();

      const statusEl = fixture.nativeElement.querySelector('.card-status');
      expect(statusEl.textContent).toContain('Live');
    });
  });

  describe('Icon and status visibility logic', () => {
    it('should show the icon when an icon is set and no status is provided', () => {
      component.icon = 'star';
      component.status = '';
      fixture.detectChanges();

      const iconEl = fixture.nativeElement.querySelector('mat-icon');
      expect(component.showIcon).toBe(true);
      expect(iconEl).toBeTruthy();
      expect(iconEl.textContent).toContain('star');
    });

    it('should hide the icon if a status is provided', () => {
      component.icon = 'star';
      component.status = 'active';
      fixture.detectChanges();

      const iconEl = fixture.nativeElement.querySelector('mat-icon');
      expect(component.showIcon).toBe(false);
      expect(iconEl).toBeNull();
    });

    it('should correctly determine whether the card has a right-side element (icon or status)', () => {
      component.icon = 'info';
      expect(component.hasRightElement).toBe(true);

      component.icon = '';
      component.status = 'active';
      expect(component.hasRightElement).toBe(true);

      component.status = '';
      expect(component.hasRightElement).toBe(false);
    });
  });

  describe('Color logic and resolution', () => {
    it('should resolve subtitle color correctly from the predefined color map', () => {
      const colorName = 'blue';
      component.subtitleColor = colorName;

      const expectedColor = component['colorMap'][colorName];
      expect(component.resolvedSubtitleColor).toBe(expectedColor);
    });

    it('should use the default subtitle color if an invalid color name is provided', () => {
      component.subtitleColor = 'invalid' as any;
      const fallbackColor = component['colorMap']['purple'];
      expect(component.resolvedSubtitleColor).toBe(fallbackColor);
    });

    it('should resolve valueColor and backgroundColor using the color map', () => {
      component.valueColor = 'red';
      component.backgroundColor = 'yellow';

      const colorMap = component['colorMap'];

      expect(component.resolvedValueColor).toBe(colorMap['red']);
      expect(component.resolvedBackgroundColor).toBe(colorMap['yellow']);
    });

    it('should convert subtitle color into rgba format with 10% opacity for status background', () => {
      component.subtitleColor = 'green';

      const expectedHex = component['colorMap']['green'];
      const rgb = hexToRgb(expectedHex).replace(/^rgb\(|\)$/g, '');
      const expectedRgba = `rgba(${rgb}, 0.1)`;

      const actualRgba = component.getStatusBackgroundColor();
      expect(actualRgba).toBe(expectedRgba);
    });

    it('should apply background color to the card element based on resolved background color', () => {
      component.backgroundColor = 'purple';
      fixture.detectChanges();

      const cardEl = fixture.nativeElement.querySelector('mat-card');
      const computedStyle = getComputedStyle(cardEl);
      const expectedRgb = hexToRgb(component.resolvedBackgroundColor);

      expect(computedStyle.backgroundColor).toBe(expectedRgb);
    });
  });
});
