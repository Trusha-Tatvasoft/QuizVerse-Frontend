import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { TagComponent } from './tag.component';

const meta: Meta<TagComponent> = {
    title: 'Components/Tag',
    component: TagComponent,
    decorators: [
        moduleMetadata({
            imports: [CommonModule, TagComponent],
        }),
    ],
    tags: ['autodocs'],
    argTypes: {
        onSelect: { action: 'Tag selected' },
        onClose: { action: 'Tag closed' },
    },
};

export default meta;
type Story = StoryObj<TagComponent>;


export const SelectableTagExample: Story = {
    name: 'Selectable Tag',
    args: {
        id: 'select-1',
        label: 'Selectable',
        type: 'selectable',
        selected: false,
        color: 'lightGrey',
        textColor: 'black',
    },
};

export const ClosableTagExample: Story = {
    name: 'Closable Tag',
    args: {
        id: 'close-1',
        label: 'Closable',
        type: 'closable',
        color: 'lightRed',
        textColor: 'red',
    },
};

export const StaticTagExample: Story = {
    name: 'Static Tag',
    args: {
        id: 'static-1',
        label: 'Static',
        type: 'static',
        color: 'black',
        textColor: 'white',
    },
};

export const HoverableTagExample: Story = {
    name: 'Hoverable Tag',
    args: {
        id: 'hover-1',
        label: 'Hoverable',
        type: 'hoverable',
        color: 'lightYellow',
        textColor: 'brown',
    },
};


export const TagVariantsByDifficulty: Story = {
    name: 'Tag Variants by Difficulty',
    render: () => ({
        template: `
        <div class="story-container">
          <div class="story-header">
            <h2 class="story-title">Difficulty Level Tags</h2>
            <p class="story-description">Visual showcase of different difficulty levels with appropriate color coding</p>
          </div>
          
          <div class="tags-section">
            <div class="section-group">
              <h3 class="section-title">Skill Levels</h3>
              <div class="tags-row">
                <div class="tag-item">
                  <app-tag id="easy" label="Easy" type="static" color="lightGreen" textColor="green"></app-tag>
                  <span class="tag-description">Beginner friendly</span>
                </div>
                <div class="tag-item">
                  <app-tag id="medium" label="Medium" type="static" color="lightYellow" textColor="brown"></app-tag>
                  <span class="tag-description">Intermediate level</span>
                </div>
                <div class="tag-item">
                  <app-tag id="hard" label="Hard" type="static" color="lightRed" textColor="red"></app-tag>
                  <span class="tag-description">Advanced challenge</span>
                </div>
              </div>
            </div>
  
            <div class="section-group">
              <h3 class="section-title">Expert Levels</h3>
              <div class="tags-row">
                <div class="tag-item">
                  <app-tag id="advanced" label="Advanced" type="static" color="lightOrange" textColor="brown"></app-tag>
                  <span class="tag-description">Expert knowledge required</span>
                </div>
                <div class="tag-item">
                  <app-tag id="expert" label="Expert" type="static" color="lightPurple" textColor="purple"></app-tag>
                  <span class="tag-description">Master level</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
        styles: [`
        .story-container {
          padding: 32px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
  
        .story-header {
          text-align: center;
          margin-bottom: 40px;
        }
  
        .story-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
  
        .story-description {
          font-size: 1rem;
          color: #718096;
          font-weight: 400;
        }
  
        .tags-section {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
  
        .section-group {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
  
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
  
        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-start;
        }
  
        .tag-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
          min-width: 120px;
        }
  
        .tag-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background: #f1f5f9;
        }
  
        .tag-description {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
          font-weight: 500;
        }
  
        @media (max-width: 768px) {
          .story-container {
            padding: 20px;
          }
          
          .story-title {
            font-size: 1.5rem;
          }
          
          .tags-row {
            justify-content: center;
          }
          
          .tag-item {
            min-width: 100px;
          }
        }
      `]
    }),
};

