import type { Profile } from '@/lib/content/types'

export const profile: Profile = {
  name: 'Yuri Oliveira',
  role: 'Automação & Inteligência Artificial',
  tagline: 'Automatizo o trabalho manual que trava a operação.',
  available: true,
  stack: ['n8n', 'Python', 'SQL', 'APIs REST', 'Supabase'],
  email: 'yuri.oliveira.silva.24@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/oliveira-yuri',
  githubUrl: 'https://github.com/oliveira-yuri',
  // Só existe currículo em português por enquanto; o perfil em inglês aponta
  // para este mesmo arquivo de propósito, em vez de oferecer um PDF quebrado.
  cvPath: '/cv/curriculo-pt.pdf',
  experience: [
    {
      role: 'Assistente de Ensino',
      organization: 'Asse Software / IBEIA',
      start: '2025-06',
      end: null,
      description:
        'Produzo conteúdos educacionais e videoaulas sobre ferramentas de IA para imagem, vídeo, áudio e automação — do planejamento e roteiro até a gravação e edição. Também escrevo os materiais de apoio e acompanho as plataformas novas que a contratante indica.',
    },
    {
      role: 'Freelancer em Automações',
      organization: 'Autônomo',
      start: '2025-01',
      end: '2025-06',
      description:
        'Desenvolvi automações sob medida para processos comerciais e operacionais com n8n, WhatsApp API, Google Sheets e integrações com CRM, estruturando os fluxos de captação, organização e qualificação de leads que tiravam trabalho manual do dia a dia das equipes.',
    },
  ],
  education: [
    {
      title: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
      institution: 'Fatec Campinas',
      year: '2025 — 2027',
    },
  ],
  certifications: [
    {
      title: 'Maratona de Programação InterFatecs — 1ª fase, classificado para a final',
      issuer: 'Fatec Garça · Centro Paula Souza',
      year: '2026',
      // O link oficial de verificação carrega o CPF na query string. Deixá-lo
      // aqui publicaria um dado pessoal em página estática e indexável — quem
      // precisar conferir pede o comprovante por e-mail.
    },
    {
      title: 'Estrutura de Dados e Algoritmos',
      issuer: 'Augusto Galego · Hubla',
      year: '2026',
    },
  ],
  skills: [
    {
      label: 'Automação',
      items: ['n8n', 'APIs REST', 'Webhooks', 'Salesforce', 'WhatsApp API', 'Google Sheets'],
    },
    { label: 'Desenvolvimento', items: ['Python', 'SQL', 'Git', 'Supabase'] },
    { label: 'Infraestrutura', items: ['Hetzner', 'DigitalOcean'] },
    {
      label: 'IA aplicada',
      items: ['Google VEO3', 'HeyGen', 'Freepik', 'Adobe Firefly', 'Suno AI', 'Gamma', 'Bardeen'],
    },
    { label: 'Idiomas', items: ['Português (nativo)', 'Inglês (C1)'] },
  ],
  placeholder: false,
}
