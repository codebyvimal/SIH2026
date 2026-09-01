import { render } from '@testing-library/react';
import GapChart from '@/components/dashboard/GapChart';
import type { SkillGap } from '@/types/schemas';
import { Domain, SkillLevel } from '@/types/schemas';

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

const mockGaps: SkillGap[] = [
  { skill: 'Python for Data Analysis', domain: Domain.DIGITAL_TOOLS, required: SkillLevel.PROFICIENT, current: SkillLevel.BASIC, gap: 2 },
];

test('renders without crashing given gaps', () => {
  const { container } = render(<GapChart gaps={mockGaps} />);
  expect(container.firstChild).not.toBeNull();
});
