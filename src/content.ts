// Single source of truth for all site copy and data.
// Edit the text here to change what the site shows. No component code needed.
// Style note: no em dashes and no double hyphens anywhere.

export const site = {
  name: "Min Yi",
  tagline: "Business analyst building toward product management",
  location: "Singapore",
  email: "seetminyi.work@gmail.com",
  // TODO: drop your CV at public/resume.pdf (a placeholder is provided).
  resumeUrl: "/resume.pdf",
  nav: [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Certifications", href: "#certifications" },
    { label: "Contact", href: "#contact" },
  ],
  socials: {
    linkedin: "https://www.linkedin.com/in/seet-min-yi/",
    github: "https://github.com/minmxn",
    telegram: "https://t.me/nomogh_bot",
  },
};

export const hero = {
  headline: "Most analysts write the spec. I also build the thing.",
  subhead:
    "Public sector business analyst on the way to product management. My proof is Nomo, an AI news product I designed, built, and run in production.",
  highlights: ["Business analysis", "Product thinking", "AI and automation"],
  primaryCta: { label: "See my work", href: "#projects" },
  secondaryCta: { label: "View resume", href: "/resume.pdf" },
};

export const about = {
  heading: "About",
  paragraphs: [
    "I am a business analyst working on large scale digital platforms in the public sector. My day to day is turning complex, multi stakeholder requirements into software that teams can actually build, test, and release.",
    "I am growing toward product management, and I learn by building. I taught myself to code and shipped Nomo News Bot, an AI news product that runs in production every day for a real group of users. Along the way I picked up APIs, LLM integration, and cloud deployment.",
    "I care about clear problems, honest tradeoffs, and shipping things people actually use. Right now I am studying for the Claude Certified Architect exam to go deeper on building with AI.",
  ],
  skills: [
    "Business Analysis",
    "Requirements and Documentation",
    "UAT and Test Coordination",
    "Stakeholder Management",
    "Release and Regression Planning",
    "Agile Delivery",
    "Prompt Engineering",
    "APIs and LLM Integration",
  ],
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  href?: string;
  liveUrl?: string;
  liveLabel?: string;
};

export const projects: Project[] = [
  {
    slug: "nomo",
    name: "Nomo News Bot",
    tagline: "An AI news companion, live in production",
    description:
      "A Telegram bot that delivers a curated, AI summarized news digest on a calm daily rhythm: a morning briefing, a poll, a quiz, and a swipeable reader. I designed, built, and operate it end to end.",
    tags: ["Product", "Node.js", "LLM", "Telegram", "Oracle Cloud"],
    href: "/projects/nomo",
    liveUrl: "https://t.me/nomogh_bot",
    liveLabel: "Try the bot",
  },
  {
    slug: "kling",
    name: "Generative video experiments",
    tagline: "Exploring AI video with Kling 3.0",
    description:
      "A set of short clips I created while exploring generative video, looking at how AI media could speed up product storytelling and prototyping.",
    tags: ["Generative AI", "Kling 3.0", "Video"],
    // Gallery coming soon. Add clips or a link here later.
  },
];

export type CaseSection = {
  heading: string;
  body?: string;
  bullets?: string[];
};

export const caseStudy = {
  name: "Nomo News Bot",
  tagline: "An AI news companion I designed, built, and run in production.",
  role: "Product, engineering, and operations (solo)",
  stack: [
    "Node.js",
    "Telegram Bot API",
    "Groq LLM",
    "NewsAPI",
    "Tavily",
    "Oracle Cloud",
    "PM2",
  ],
  liveUrl: "https://t.me/nomogh_bot",
  liveLabel: "Try the bot",
  sections: [
    {
      heading: "The problem",
      body: "My friends and I (a group we call Market Kakis) wanted to keep up with markets, world, and tech news without drowning in noise or doom scrolling. General news apps hand you everything and prioritize nothing, so staying informed felt like a chore.",
    },
    {
      heading: "The idea",
      body: "Deliver a small, curated, AI summarized digest inside a chat app people already open all day. No new app to install and no new habit to build. The news comes to you, in Telegram, on a calm daily rhythm.",
    },
    {
      heading: "What it does",
      bullets: [
        "A morning briefing that summarizes the day's key stories",
        "A daily poll and a short quiz that make the news interactive",
        "A swipeable news reader you tap through, refreshed several times a day",
        "A free text question feature that answers current questions using live web search",
      ],
    },
    {
      heading: "Product decisions and tradeoffs",
      bullets: [
        "Met users where they already are (Telegram) instead of building a separate app, and cut an earlier web reader to keep the experience purely in chat and cheaper to run",
        "Designed the daily schedule as an experience: briefing, then poll, then quiz, then readers, rather than a firehose of alerts",
        "Built entirely on free tiers, which forced real prioritization. To stay under a 100 call per day news quota, I combined three separate queries into one and added caching",
        "Designed for graceful degradation: when the AI hits rate limits, the bot silently falls back to simpler content so users are never left with a blank screen",
        "Migrated hosting from a paid platform to Oracle Cloud's free tier to cut cost to zero, and learned production operations along the way (process management, auto restart on reboot, remote deploys)",
      ],
    },
    {
      heading: "Outcome and learnings",
      body: "Nomo has run daily for a real audience since launch. Building it taught me to treat cost and quotas as product constraints, to scope ruthlessly, and to design for failure so the experience stays intact. It gave me a concrete, shipped example of the product thinking I want to bring to a team.",
    },
    {
      heading: "What is next",
      body: "Add lightweight usage analytics so decisions are driven by data rather than guesses, and broaden the range of trusted sources.",
    },
  ] as CaseSection[],
};

export type Certification = {
  name: string;
  issuer: string;
  status: string;
  detail?: string;
  url?: string;
};

export const certifications: Certification[] = [
  {
    name: "AI Fluency: Framework & Foundations",
    issuer: "Anthropic Academy",
    status: "Completed",
    detail:
      "A practical framework for working with AI effectively and responsibly across everyday and professional tasks.",
    url: "https://verify.skilljar.com/c/c9dkhdprr5tk",
  },
  {
    name: "Building with the Claude API",
    issuer: "Anthropic Academy",
    status: "Completed",
    detail:
      "Building applications on the Claude API, including messages, tool use, and streaming.",
    url: "https://verify.skilljar.com/c/kvp8vg9g6vie",
  },
  {
    name: "Introduction to Model Context Protocol",
    issuer: "Anthropic Academy",
    status: "Completed",
    detail:
      "How MCP connects AI models to external tools and data through a single open standard.",
    url: "https://verify.skilljar.com/c/dtaxkwiq642v",
  },
  {
    name: "Claude 101",
    issuer: "Anthropic Academy",
    status: "Completed",
    detail:
      "Foundations of using Claude well, from prompting basics to practical workflows.",
    url: "https://verify.skilljar.com/c/u9rxicav3qjx",
  },
  {
    name: "Model Context Protocol: Advanced Topics",
    issuer: "Anthropic Academy",
    status: "Ongoing",
    detail:
      "Deeper MCP patterns for building richer, more capable integrations.",
  },
  {
    name: "Claude Certified Architect, Foundations (CCA-F)",
    issuer: "Anthropic",
    status: "In progress",
    detail:
      "Studying tool use, agentic workflow patterns, MCP, and prompt engineering to build reliably with AI.",
  },
];

export const contact = {
  heading: "Let's talk",
  blurb:
    "I am open to product roles and to conversations about building useful things. The fastest way to reach me is email or LinkedIn.",
};
