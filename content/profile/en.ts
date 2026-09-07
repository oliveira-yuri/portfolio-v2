import type { Profile } from '@/lib/content/types'

export const profile: Profile = {
  name: 'Yuri Oliveira',
  role: 'Data & Artificial Intelligence',
  tagline: 'I turn messy data into decisions.',
  available: true,
  stack: ['Python', 'SQL', 'pandas', 'scikit-learn'],
  email: 'yuri.oliveira.silva.24@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/oliveira-yuri',
  githubUrl: 'https://github.com/oliveira-yuri',
  cvPath: '/cv/curriculo-en.pdf',
  experience: [
    {
      role: 'Example role',
      organization: 'Example organization',
      start: '2025-01',
      end: null,
      description: 'Replace with real experience: what you did and what changed because of it.',
    },
  ],
  education: [
    {
      title: 'Example programme',
      institution: 'Example institution',
      year: '2026',
    },
  ],
  certifications: [
    {
      title: 'Example certification',
      issuer: 'Example issuer',
      year: '2026',
    },
  ],
  skills: [
    { label: 'Languages', items: ['Python', 'SQL'] },
    { label: 'Analysis', items: ['pandas', 'NumPy'] },
    { label: 'Tooling', items: ['Git', 'Jupyter'] },
  ],
  placeholder: true,
}
