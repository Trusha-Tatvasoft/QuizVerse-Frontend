import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicChartComponent } from './dynamic-chart.component';

jest.mock('chart.js');
jest.mock('ng2-charts');

describe('DynamicChartComponent', () => {
  let component: DynamicChartComponent;
  let fixture: ComponentFixture<DynamicChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
