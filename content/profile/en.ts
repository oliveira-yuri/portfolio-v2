import type { Profile } from '@/lib/content/types'

export const profile: Profile = {
  name: 'Yuri Oliveira',
  role: 'Automation & Artificial Intelligence',
  tagline: 'I automate the manual work that slows an operation down.',
  available: true,
  stack: ['n8n', 'Python', 'SQL', 'REST APIs', 'Supabase'],
  email: 'yuri.oliveira.silva.24@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/oliveira-yuri',
  githubUrl: 'https://github.com/oliveira-yuri',
  // There is no English résumé yet, so this deliberately points at the
  // Portuguese PDF rather than shipping a broken download.
  cvPath: '/cv/curriculo-pt.pdf',
  experience: [
    {
      role: 'Teaching Assistant',
      organization: 'Asse Software / IBEIA',
      start: '2025-06',
      end: null,
      description:
        'I produce educational content and video lessons on AI tools for image, video, audio and automation — from planning and scripting through recording and editing. I also write the supporting material and keep up with the new platforms the client asks us to cover.',
    },
    {
      role: 'Automation Freelancer',
      organization: 'Self-employed',
      start: '2025-01',
      end: '2025-06',
      description:
        'I built custom automations for sales and operations processes with n8n, the WhatsApp API, Google Sheets and CRM integrations, structuring the lead capture, organisation and qualification flows that took manual work out of the teams’ day.',
    },
  ],
  education: [
    {
      title: 'Technologist in Systems Analysis and Development',
      institution: 'Fatec Campinas',
      year: '2025 — 2027',
    },
  ],
  certifications: [
    {
      title: 'InterFatecs Programming Marathon — first round, qualified for the final',
      issuer: 'Fatec Garça · Centro Paula Souza',
      year: '2026',
      // The official verification link carries a national ID number in the
      // query string; see the note in pt.ts. Omitted on purpose.
    },
    {
      title: 'Data Structures and Algorithms',
      issuer: 'Augusto Galego · Hubla',
      year: '2026',
    },
  ],
  skills: [
    {
      label: 'Automation',
      items: ['n8n', 'REST APIs', 'Webhooks', 'Salesforce', 'WhatsApp API', 'Google Sheets'],
    },
    { label: 'Development', items: ['Python', 'SQL', 'Git', 'Supabase'] },
    { label: 'Infrastructure', items: ['Hetzner', 'DigitalOcean'] },
    {
      label: 'Applied AI',
      items: ['Google VEO3', 'HeyGen', 'Freepik', 'Adobe Firefly', 'Suno AI', 'Gamma', 'Bardeen'],
    },
    { label: 'Languages', items: ['Portuguese (native)', 'English (C1)'] },
  ],
  placeholder: false,
}
