// Site-wide settings shared by the layout, header and footer.

export const SITE = {
  name: 'RAISE Hub',
  fullName: 'Responsible AI Support in Education',
  tagline: 'Responsible AI for Teaching and Learning',
  college: 'HNU–ASU Joint International College (HAIC)',
  // [REVIEW A5] Public contact — pending Annus's confirmation.
  contactEmail: 'annus.azhar@asu.edu',
  description:
    'RAISE Hub helps faculty, students and teaching assistants at HAIC use AI thoughtfully to address real teaching and learning needs.',
} as const;

export const NAV = [
  { href: '/#about', label: 'About' },
  { href: '/#approach', label: 'Approach' },
  { href: '/#workshops', label: 'Workshops' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#resources', label: 'Resources' },
  { href: '/#contact', label: 'Contact' },
] as const;

export const NAV_ZH = [
  { href: '/zh/#about', label: '关于我们' },
  { href: '/zh/#approach', label: '工作方法' },
  { href: '/zh/#workshops', label: '工作坊' },
  { href: '/zh/#projects', label: '项目' },
  { href: '/zh/#resources', label: '资源' },
  { href: '/zh/#contact', label: '联系' },
] as const;

/**
 * Draft mode is ON unless PUBLIC_DRAFT is exactly "false".
 * In draft mode the "Draft for review" banner and ReviewPending notes show.
 */
export const IS_DRAFT = import.meta.env.PUBLIC_DRAFT !== 'false';
