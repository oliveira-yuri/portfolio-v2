import type { Lang } from '@/lib/content/types'

export type Dictionary = {
  nav: { projects: string; newsletter: string; contact: string }
  home: {
    availableNow: string
    featuredProjects: string
    experience: string
    education: string
    certifications: string
    skills: string
    latestPosts: string
    allPosts: string
    contact: string
    downloadCv: string
    present: string
    viewCaseStudy: string
  }
  post: { readingTime: string; backToNewsletter: string; subscribeRss: string }
  project: { result: string; stack: string; repository: string; demo: string }
  translationMissing: { title: string; body: string; cta: string }
  languageSwitch: { label: string; pt: string; en: string }
}

const pt: Dictionary = {
  nav: {
    projects: 'Projetos',
    // Deliberately identical to the English value: "Newsletter" is the term
    // used in Portuguese too, and is the exact word the project owner used
    // when specifying this feature. Do not "fix" this back to a translation.
    newsletter: 'Newsletter',
    contact: 'Contato',
  },
  home: {
    availableNow: 'disponível para oportunidades',
    featuredProjects: 'Projetos',
    experience: 'Experiência',
    education: 'Formação',
    certifications: 'Certificações',
    skills: 'Habilidades',
    latestPosts: 'Últimos artigos',
    allPosts: 'Ver todos os artigos',
    contact: 'Contato',
    downloadCv: 'Baixar currículo',
    present: 'atual',
    viewCaseStudy: 'Ver estudo de caso',
  },
  post: {
    readingTime: 'min de leitura',
    backToNewsletter: 'Voltar para a newsletter',
    subscribeRss: 'Assinar por RSS',
  },
  project: { result: 'Resultado', stack: 'Stack', repository: 'Repositório', demo: 'Demonstração' },
  translationMissing: {
    title: 'Sem tradução',
    body: 'Este conteúdo está disponível apenas em inglês.',
    cta: 'Ler em inglês',
  },
  languageSwitch: { label: 'Idioma', pt: 'PT', en: 'EN' },
}

const en: Dictionary = {
  nav: { projects: 'Projects', newsletter: 'Newsletter', contact: 'Contact' },
  home: {
    availableNow: 'available for opportunities',
    featuredProjects: 'Projects',
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    skills: 'Skills',
    latestPosts: 'Latest articles',
    allPosts: 'See all articles',
    contact: 'Contact',
    downloadCv: 'Download résumé',
    present: 'present',
    viewCaseStudy: 'View case study',
  },
  post: {
    readingTime: 'min read',
    backToNewsletter: 'Back to the newsletter',
    subscribeRss: 'Subscribe via RSS',
  },
  project: { result: 'Result', stack: 'Stack', repository: 'Repository', demo: 'Demo' },
  translationMissing: {
    title: 'No translation',
    body: 'This content is available in Portuguese only.',
    cta: 'Read in Portuguese',
  },
  languageSwitch: { label: 'Language', pt: 'PT', en: 'EN' },
}

const DICTIONARIES: Record<Lang, Dictionary> = { pt, en }

export function getDictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang]
}
