import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';
import { LoaderService } from '../../services/loader/loader.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;
  let loaderSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    loaderSubject = new BehaviorSubject<boolean>(false);
    const mockLoaderService = {
      isLoading$: loaderSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
      providers: [{ provide: LoaderService, useValue: mockLoaderService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not show loader initially when isLoading$ is false', () => {
    const loaderDiv = fixture.debugElement.query(By.css('.overlay-loader'));
    expect(loaderDiv).toBeNull();
  });

  it('should show loader when isLoading$ is true', async () => {
    loaderSubject.next(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const loaderDiv = fixture.debugElement.query(By.css('.overlay-loader'));
    expect(loaderDiv).toBeTruthy();
    const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should hide loader again when isLoading$ becomes false', async () => {
    loaderSubject.next(true);
    fixture.detectChanges();
    await fixture.whenStable();
    loaderSubject.next(false);
    fixture.detectChanges();
    await fixture.whenStable();
    const loaderDiv = fixture.debugElement.query(By.css('.overlay-loader'));
    expect(loaderDiv).toBeNull();
  });
});
