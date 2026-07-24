import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "arbianshkodra",
  DESCRIPTION:
    "Builder & experimenter working at the edge of AI agents and infrastructure. Notes on agents, LLM tooling, distributed systems, and the things I can't stop poking at.",
  EMAIL: "arbianshkodra@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "~",
  DESCRIPTION:
    "Arbian Shkodra — builder & experimenter. AI agents, LLM tooling, distributed systems, and messaging infrastructure at scale.",
};

export const BLOG: Metadata = {
  TITLE: "blog",
  DESCRIPTION:
    "Experiments and long-form notes — AI agents, LLM tooling, and the infrastructure underneath.",
};

export const PROJECTS: Metadata = {
  TITLE: "projects",
  DESCRIPTION: "Things I've shipped, open-sourced, or am still tinkering with.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/arbianshkodra",
  },
  {
    NAME: "X",
    HREF: "https://twitter.com/arbianshkodra",
  },
  {
    NAME: "accelero",
    HREF: "https://accelero.sh",
  },
];
