// Structured résumé content — single source of truth for the page.

export const profile = {
  name: 'Matteo Catalano',
  first: 'Matteo',
  last: 'Catalano',
  role: 'Full-Stack Software Engineer',
  tagline: 'I build production systems where the web meets the factory floor.',
  location: 'Fort Wayne, IN',
  email: 'matteo598.catalano@gmail.com',
  phone: '(260) 289-9949',
  linkedin: 'https://www.linkedin.com/in/matteo-catalano/',
  summary:
    'Full-stack engineer with 7+ years delivering production systems across industrial automation and enterprise web platforms. Specialized in .NET, Angular, distributed systems, and real-time data integration — currently leading platform modernization and AI-assisted development at Steel Dynamics.',
};

export const stats = [
  { value: 7, suffix: '+', label: 'Years shipping production systems' },
  { value: 4, suffix: '', label: 'Microservices architected for reporting' },
  { value: 5, suffix: '', label: 'Developers mentored & leveled up' },
  { value: 99.9, suffix: '%', label: 'Uptime on field-to-datacenter pipelines', decimals: 1 },
];

export interface Job {
  no: string;
  company: string;
  role: string;
  location: string;
  period: string;
  current?: boolean;
  bullets: string[];
  stack: string[];
}

export const experience: Job[] = [
  {
    no: '01',
    company: 'Steel Dynamics',
    role: 'Software Engineer',
    location: 'Fort Wayne, IN',
    period: 'Jun 2024 — Present',
    current: true,
    bullets: [
      'Lead architecture for replacing a legacy reporting system — 4 new microservices generating hundreds of internal reports and customer-facing documents (bills of lading, order acknowledgments).',
      'Built an in-house serverless C# script-execution platform — an on-prem equivalent to AWS Lambda — to run the non-visual report logic previously locked inside the legacy system.',
      'Mentor 5 developers, driving code-review, testing, and design standards for higher quality and faster delivery.',
      'Lead the team’s adoption of AI-assisted development, partnering with management to define guardrails and risk-management practices.',
      'Integrated Azure Entra ID for authentication and role-based access across internal systems; ship full-stack features with .NET APIs and Angular.',
    ],
    stack: ['C#', '.NET', 'Angular', 'Azure', 'Microservices', 'Entra ID'],
  },
  {
    no: '02',
    company: 'Ivy Tech Community College',
    role: 'Computer Lab Assistant — Developer & Tutor',
    location: 'Fort Wayne, IN',
    period: 'Jan 2023 — Jan 2024',
    bullets: [
      'Developed an iOS app for assignment tracking and student motivation, plus a writing planner that computes an optimal schedule to finish projects on time.',
      'Led a redesign of the department website and tutored students daily across software development and STEM.',
    ],
    stack: ['Swift', 'iOS', 'Web', 'Mentoring'],
  },
  {
    no: '03',
    company: 'Sirius',
    role: 'Software Developer & System Integrator',
    location: 'Turin, Italy',
    period: 'Mar 2018 — May 2022',
    bullets: [
      'Designed, delivered, and maintained SCADA applications for real-time monitoring and control of wind and solar installations, with technical support throughout.',
      'Built and maintained field-to-datacenter pipelines (99.9% uptime) over IEC 104, OPC, and other industrial protocols.',
      'Developed services to process operational data, automate reporting, and deploy across hundreds of sites.',
      'Applied ML models to estimate wind-turbine output during curtailment events — production data used to claim grid refunds.',
    ],
    stack: ['C#', 'Python', 'JavaScript', 'SCADA', 'IEC 104', 'OPC', 'ML'],
  },
  {
    no: '04',
    company: 'Deliveriamo (formerly Pony Zero)',
    role: 'Full-Stack Web Developer',
    location: 'Turin, Italy',
    period: 'Oct 2017 — Mar 2018',
    bullets: [
      'Delivered the company’s business-management web app end-to-end to support internal operations.',
    ],
    stack: ['PHP', 'Laravel', 'Eloquent', 'JavaScript', 'MySQL'],
  },
];

export const capabilities = [
  {
    title: 'Languages & Frameworks',
    items: ['C#', '.NET', 'TypeScript', 'Angular', 'Node.js', 'JavaScript', 'Python', 'PHP', 'Swift', 'SQL', 'Entity Framework'],
  },
  {
    title: 'Cloud & DevOps',
    items: ['Azure DevOps', 'AWS', 'CI/CD', 'Docker', 'Kubernetes', 'GitHub Actions'],
  },
  {
    title: 'Databases',
    items: ['SQL Server', 'MySQL', 'NoSQL', 'Oracle', 'MongoDB'],
  },
  {
    title: 'Engineering Practice',
    items: ['Microservices', 'REST APIs', 'Agile Scrum', 'Unit & Integration Testing', 'Design Patterns', 'SOLID'],
  },
  {
    title: 'AI in the SDLC',
    items: ['AI-Assisted Development', 'LLM Integration', 'Risk & Guardrails'],
  },
  {
    title: 'Industrial Automation',
    items: ['Wonderware', 'Siemens SICAM', 'PLC Programming', 'IEC 104', 'IEC 61850', 'Modbus'],
  },
];

export interface Highlight {
  no: string;
  kicker: string;
  title: string;
  body: string;
  tags: string[];
}

export const highlights: Highlight[] = [
  {
    no: 'H1',
    kicker: 'Platform',
    title: 'On-prem serverless C# runtime',
    body: 'An in-house equivalent to AWS Lambda that executes non-visual report logic on-premises — freeing hundreds of reports from a legacy system without moving sensitive data off-site.',
    tags: ['C#', '.NET', 'Distributed Systems'],
  },
  {
    no: 'H2',
    kicker: 'Architecture',
    title: 'Legacy reporting, re-imagined',
    body: 'Four purpose-built microservices generating hundreds of internal reports and customer-facing documents — bills of lading, order acknowledgments — with modern auth via Azure Entra ID.',
    tags: ['Microservices', 'Angular', 'Azure'],
  },
  {
    no: 'H3',
    kicker: 'Machine Learning',
    title: 'Recovering revenue from the wind',
    body: 'ML models estimating wind-turbine output during curtailment events, producing the data used to claim refunds from the national grid across hundreds of renewable sites.',
    tags: ['Python', 'ML', 'SCADA'],
  },
  {
    no: 'H4',
    kicker: 'Reliability',
    title: 'Field to datacenter, 99.9% up',
    body: 'Real-time pipelines moving operational data from wind and solar installations to the datacenter over IEC 104 and OPC — engineered for relentless uptime across hundreds of sites.',
    tags: ['IEC 104', 'OPC', 'Real-time'],
  },
];

export const education = [
  { school: 'Western Governors University', detail: 'B.S. Software Engineering', year: 'May 2024' },
  { school: 'Ivy Tech Community College', detail: 'A.A.S. Software Development — 4.0 GPA', year: 'Dec 2023' },
];

export const certifications = [
  'CompTIA Project+',
  'AWS Certified Cloud Practitioner',
  'Microsoft Technology Associate 98-361',
];
