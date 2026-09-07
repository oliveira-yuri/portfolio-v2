import type { Profile } from '@/lib/content/types'

export const profile: Profile = {
  name: 'Yuri Oliveira',
  role: 'Dados & Inteligência Artificial',
  tagline: 'Transformo dados confusos em decisões.',
  available: true,
  stack: ['Python', 'SQL', 'pandas', 'scikit-learn'],
  email: 'yuri.oliveira.silva.24@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/oliveira-yuri',
  githubUrl: 'https://github.com/oliveira-yuri',
  cvPath: '/cv/curriculo-pt.pdf',
  experience: [
    {
      role: 'Cargo de exemplo',
      organization: 'Organização de exemplo',
      start: '2025-01',
      end: null,
      description:
        'Substituir por experiência real: o que você fez e qual foi o efeito disso.',
    },
  ],
  education: [
    {
      title: 'Curso de exemplo',
      institution: 'Instituição de exemplo',
      year: '2026',
    },
  ],
  certifications: [
    {
      title: 'Certificação de exemplo',
      issuer: 'Emissor de exemplo',
      year: '2026',
    },
  ],
  skills: [
    { label: 'Linguagens', items: ['Python', 'SQL'] },
    { label: 'Análise', items: ['pandas', 'NumPy'] },
    { label: 'Ferramentas', items: ['Git', 'Jupyter'] },
  ],
  placeholder: true,
}
