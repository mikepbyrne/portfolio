export type ResumeRole = {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

export const resume = {
  name: 'Mike Byrne',
  title: 'Creative Technologist · Senior Photo & Video Producer',
  contact: {
    phone: '(415) 797-9915',
    email: 'mikepbyrne@icloud.com',
    linkedin: 'linkedin.com/in/mikebyrneproducer',
    linkedinUrl: 'https://www.linkedin.com/in/mikebyrneproducer/',
  },
  summary: `Senior producer with 15 years of end-to-end production experience across major brand campaigns, recently focused on the intersection of creative production and AI. I work the seam between the creative team and the operational reality of getting work made, holding timelines and partners together so creative leads can stay focused on the work itself. Calm under pressure. Known for reading a production early, finding where the risk actually lives before it becomes a problem, and removing friction without making a fuss about it.`,
  experience: [
    {
      title: 'Creative Technologist (Contract)',
      company: 'Apple Marcom, Media Production Operations',
      location: 'Sunnyvale, CA',
      period: 'Feb 2025 – Mar 2026',
      bullets: [
        "Recruited into Apple's Media Production Operations team as a Creative Technologist, working on Apple's major creative productions. Brought in specifically for my production background, given the freedom to develop a technical practice around AI inside a large media production operation, with safe and confidential use of LLMs as a non-negotiable constraint throughout.",
        "Built AI-assisted workflow tools in Python and prototyped internal systems to support production scheduling, status tracking, and creative review across concurrent project streams.",
        "Authored a proposal to overhaul internal production architecture using agentic AI, retrieval-augmented generation for institutional memory, and Model Context Protocol integrations with the team's existing tools. Designed to surface risks and provide continuous oversight across a project's full timeline.",
        "Worked inside major hardware and software launches throughout the year, including live events in New York and London, WWDC 2025 at Apple Park, and concurrent projects across iPad & Services, iPhone, and SoIP. Operated under Apple's full confidentiality requirements throughout.",
      ],
    },
    {
      title: 'Senior Photo & Video Producer, Owner',
      company: 'WHPLSH Media',
      location: 'Bay Area, CA',
      period: '2018 – 2025',
      bullets: [
        "Built and ran a commercial production company delivering integrated photo, video, and social campaigns for PepsiCo, Toyota USA, Ford, GMC, American Giant, Instacart, Casper, KerryGold, and Condé Nast. Budgets from $10K to $2M.",
        "Owned the full production lifecycle: brief, schedule, location scouting and permitting, crew and talent hiring, vendor management, on-set direction, and final asset handoff. Crews from small editorial teams to 100+ on multi-day shoots in SF, LA, NY, and on location internationally.",
        "Coordinated across creative directors, agencies, freelance crews, audio post houses, and other external partners. Built vendor rosters across multiple markets, negotiated rates, and managed labor compliance and usage rights.",
        "Made the call dozens of times on when to push a creative idea forward and when to pause and refine. The productions that ran clean were the ones where the risk was found early in pre-production, before it became a problem on the day.",
        "Built scalable production playbooks, documentation, and templates that allowed consistent, calm execution across very different budgets, timelines, and crew sizes.",
      ],
    },
    {
      title: 'Senior Photo & Video Producer',
      company: 'Form & Fiction Films',
      location: 'San Francisco, CA',
      period: '2021 – 2022',
      bullets: [
        "Produced full-lifecycle video and photo campaigns for Salesforce as primary client, alongside other technology companies. Worked in-house alongside the agency's creative leads, managing brief through delivery.",
      ],
    },
    {
      title: 'Founder & CEO',
      company: 'Crucial Crew',
      location: 'Bay Area, CA',
      period: '2017 – 2021',
      bullets: [
        "Founded and built a production-industry web application. Worked directly with the engineering team, scoped product requirements, and learned how creative teams and software teams talk to each other, which has shaped how I work with technical partners ever since.",
      ],
    },
    {
      title: 'Freelance Digital Tech & 1st Assistant',
      company: 'Commercial Advertising',
      location: 'SF / LA / NY / International',
      period: '2015 – 2018',
      bullets: [
        "Built a freelance career across the San Francisco, Los Angeles, and New York markets, working on-set across major brand advertising productions. Traveled extensively, establishing the crew and vendor relationships that later anchored WHPLSH Media's production network.",
      ],
    },
    {
      title: '1st Assistant & Digital Tech',
      company: 'Erik Almas Photography',
      location: 'San Francisco, CA',
      period: '2012 – 2015',
      bullets: [
        "Worked full-time for renowned photographer and director Erik Almas across major brand campaigns. Three years in a working studio learning the craft from the ground up: tethered capture, lighting, file handling, color review, and the operational rhythm of professional production.",
      ],
    },
  ] as ResumeRole[],
  skills: {
    Production: [
      'End-to-end photo and video production',
      'Pre-production planning',
      'On-set direction',
      'Crew management',
      'Multi-stakeholder coordination',
      'Vendor and agency management',
      'Budget construction and tracking',
      'Labor compliance and usage rights',
      'Scalable workflow and playbook development',
      'Live event production environments',
    ],
    'AI & Technology': [
      'Claude',
      'GPT',
      'Model Context Protocol (MCP)',
      'Retrieval-Augmented Generation (RAG)',
      'Agentic AI system design',
      'Prompt engineering',
      'Generative image and video model evaluation',
      'Local LLM inference',
      'Security-conscious LLM workflow design',
      'Python',
      'Git',
      'Linux',
      'API integration',
    ],
  },
  education: [
    { school: 'Edinburgh Napier University', location: 'Scotland, UK', year: '2011', degree: 'BA Photography & Film, with Distinction' },
    { school: 'Virginia Commonwealth University', location: 'Richmond, VA, USA', year: '2010', degree: 'Photography Exchange Program · GPA 4.0' },
  ],
  certificates: [
    { name: 'Big Data, Artificial Intelligence, and Ethics', issuer: 'Coursera & UC Davis', year: '2025' },
    { name: 'A.I. Advertising / Image Making Tools', issuer: 'Curious Refuge', year: '2024' },
  ],
};
