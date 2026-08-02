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
    { label: "The Story", href: "#story" },
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
  kicker: "Front page",
  headline: "Most analysts write the spec. I also build the thing.",
  subhead:
    "Public sector business analyst on the way to product management. My proof is Nomo, an AI news product I designed, built, and run in production.",
  byline: "By Min Yi · Business analyst · Singapore",
  lede:
    "I turn messy, multi stakeholder requirements into software that teams can build, test, and ship. Then I go one step further and build my own products to prove the thinking. The clearest evidence is Nomo, an AI news companion I designed, built, and run in production every day.",
  highlights: ["Business analysis", "Product thinking", "AI and automation"],
  primaryCta: { label: "See my work", href: "#projects" },
  secondaryCta: { label: "View resume", href: "/resume.pdf" },
};

// Newspaper styling and chrome. Edit these to rename the paper, change the
// motto, or relabel the kicker above each section. No component code changes.
export const edition = {
  paper: "The Min Yi Dispatch",
  motto: "Business analysis · Product thinking · Things that ship",
  location: "Singapore",
  volume: "Vol. I · No. 1",
  sections: {
    about: {
      kicker: "The profile",
      title: "About",
      dek: "Who is behind the byline, and how she works.",
    },
    projects: {
      kicker: "Selected works",
      title: "The Work",
      dek: "A few things I have built, shipped, and explored.",
    },
    certifications: {
      kicker: "On the record",
      title: "Credentials on File",
      dek: "What I have earned, and what I am studying for now.",
    },
    contact: {
      kicker: "Correspondence",
      title: "Letters and Commissions",
      dek: "Open to product roles and to building useful things together.",
    },
  },
  colophon:
    "Set in Playfair Display and Newsreader. Composed and published in Singapore with Next.js.",
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
      "A short film I made with Kling 3.0, and the process behind it. Character reference sheets, prompts as artifacts, and the finished piece.",
    tags: ["Generative AI", "Kling 3.0", "Video"],
    href: "/projects/kling",
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

export type CaseStudyKling = {
  name: string;
  tagline: string;
  role: string;
  tool: string;
  duration: string;
  intent: string;
  references: {
    row: "prince" | "fox";
    src: string;
    alt: string;
    caption: string;
  }[];
  prompts: {
    style: { text: string; caption: string };
    scenes: { title: string; text: string; caption: string }[];
  };
  patternExplainer: string;
  video: {
    src: string;
    poster: string;
    caption: string;
  };
  learnings: {
    surprised: string;
    limits: string;
    useFor: string;
  };
  metaCredit: string;
};

export const caseStudyKling: CaseStudyKling = {
  name: "Generative video experiments",
  tagline: "A Little Prince, made with Kling 3.0.",
  role: "Direction, prompt writing, edit",
  tool: "Kling 3.0",
  duration: "About 60 seconds",
  intent:
    "I picked The Little Prince because it is a beloved painterly world, and because it is a real test of what generative video can and cannot do yet. Keeping one character consistent across multiple shots is the hard part. Framing this as a challenge up front turns the experiment into a product thinking exercise, not just a demo.",
  references: [
    {
      row: "prince",
      src: "/kling/prince-front.png",
      alt: "The Little Prince, front view, blond hair, green suit, yellow flowing scarf, painterly watercolor",
      caption: "Prince, front. The seed that every other shot references.",
    },
    {
      row: "prince",
      src: "/kling/prince-side.png",
      alt: "The Little Prince, side view",
      caption: "Prince, side. Checks silhouette against the front seed.",
    },
    {
      row: "prince",
      src: "/kling/prince-back.png",
      alt: "The Little Prince, back view",
      caption: "Prince, back. The hardest angle to keep on model.",
    },
    {
      row: "fox",
      src: "/kling/fox-front.png",
      alt: "A small fox, front view, painterly watercolor",
      caption: "Fox, front. The Prince's companion in the story.",
    },
    {
      row: "fox",
      src: "/kling/fox-side.png",
      alt: "A small fox, side view, painterly watercolor",
      caption: "Fox, side. Same energy at a different angle.",
    },
  ],
  prompts: {
    style: {
      text: "Cinematic painterly storybook watercolor and soft 3D, shallow depth of field, gentle film grain, muted warm golds and deep starry blues.",
      caption:
        "This is the visual DNA. It defines the aesthetic; every scene prompt inherits it.",
    },
    scenes: [
      {
        title: "Prince on the asteroid",
        text: "Prince stands on a tiny asteroid in star-filled space, his golden-yellow scarf drifting weightlessly, looking up at the stars with quiet wonder. Slow orbital camera drift, gentle push-in. Cool starlight rim-light on his hair. Ambient: soft cosmic hum, faint chimes, tender piano.",
        caption:
          "One shot's fuller prompt. Beat, camera move, lighting, and audio bed layered on top of the pinned style.",
      },
    ],
  },
  patternExplainer:
    "The pattern is a fixed style prompt plus varying scene prompts. The style prompt keeps every shot on the same visual grammar, so cuts between scenes feel like the same film. The scene prompts change the beat, the camera, the lighting, and the audio bed. This is the how a hiring reader wants to see, not just the what.",
  video: {
    src: "/kling/the-little-prince.mp4",
    poster: "/kling/prince-front.png",
    caption: "Sound on for the ambience.",
  },
  learnings: {
    surprised:
      "Pending. Min Yi to fill in what Kling did well, in two or three sentences.",
    limits:
      "Pending. Min Yi to fill in Kling's failure modes, in two or three sentences.",
    useFor:
      "Pending. Min Yi to fill in how she would use generative video in a product management context, in two or three sentences.",
  },
  metaCredit:
    "Made with Kling 3.0. Style: painterly watercolor plus soft 3D. 2026.",
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

// The scroll-told story. Each beat pins to the screen and reveals as you
// scroll. Edit the copy here to change what the journey says.
export type StoryBeat = {
  kicker: string;
  label: string;
  title: string;
  lines: string[];
  skills?: string[];
  /** Optional tag row rendered as small pill badges (e.g. tech stack). */
  spec?: string[];
  cta?: { label: string; href: string; external?: boolean };
};

export const story: StoryBeat[] = [
  {
    kicker: "Chapter 01",
    label: "What I do",
    title:
      "I turn tangled, multi stakeholder requirements into software that teams can build, test, and ship.",
    lines: [
      "For the last few years I have worked on large scale public sector digital platforms as a business analyst.",
      "My job is to make the messy parts clear, so engineers, testers, and stakeholders can move as one team.",
    ],
  },
  {
    kicker: "Chapter 02",
    label: "What drives me",
    title: "I am happiest building the thing, not just writing the spec for it.",
    lines: [
      "I taught myself to code to close the gap between a good idea and a working product.",
      "So I built Nomo: an AI news companion, live in production, running on free-tier infrastructure at zero cost.",
    ],
    spec: ["Node.js", "Groq LLM", "NewsAPI", "Telegram Bot API", "Oracle Cloud", "PM2"],
    cta: { label: "Try Nomo", href: "https://t.me/nomogh_bot", external: true },
  },
  {
    kicker: "Chapter 03",
    label: "My toolkit",
    title: "An analyst's discipline, with a builder's hands.",
    lines: [
      "Years of requirements, UAT, releases, and stakeholder work, plus the engineering I picked up to ship my own products.",
    ],
    skills: [...about.skills, "Generative AI (Kling 3.0)"],
    spec: ["Business Analysis", "Product Thinking", "AI and Automation", "Generative Video (Kling 3.0)"],
  },
  {
    kicker: "Chapter 04",
    label: "What is next",
    title: "Now I am growing into a product manager who can build.",
    lines: [
      "I am studying for the Claude Certified Architect exam to go deeper on building with AI.",
      "And I am looking for a product role where I can turn clear problems into things people use.",
    ],
    cta: { label: "Get in touch", href: "#contact" },
  },
];
