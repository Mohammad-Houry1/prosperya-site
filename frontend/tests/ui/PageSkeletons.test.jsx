import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { test, expect, vi } from 'vitest';
import PageLoader from '../../src/components/feedback/PageLoader.jsx';
vi.mock('../../src/i18n/LocaleContext.jsx',()=>({useLocale:()=>({t:key=>`prosperya.${key}`})}));
test.each([
  ['/en','home'],['/fr/about','about'],['/en/approach','approach'],['/en/expertise','expertise'],
  ['/en/expertise/new','expertise-detail'],['/en/solutions','solutions'],['/en/solutions/new','solution-detail'],
  ['/en/work','work'],['/en/work/new','case-study'],['/en/contact','contact'],['/en/insights','insights'],
  ['/en/insights/new','article'],['/en/corporate/new','legal'],
])('loading %s uses its own page layout', (path,kind)=>{
  render(<MemoryRouter initialEntries={[path]}><PageLoader /></MemoryRouter>);
  expect(screen.getByRole('status')).toHaveAttribute('data-skeleton',kind);
  expect(screen.getByRole('status')).toHaveAttribute('aria-busy','true');
});
