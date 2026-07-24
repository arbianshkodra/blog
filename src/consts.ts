import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "arbianshkodra",
  DESCRIPTION:
    "Notes on distributed systems, GitOps, and building messaging infrastructure at scale.",
  EMAIL: "hello@arbianshkodra.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "~",
  DESCRIPTION:
    "Arbian Shkodra — engineering. Distributed systems, GitOps, messaging infrastructure.",
};

export const BLOG: Metadata = {
  TITLE: "blog",
  DESCRIPTION: "Long-form notes on the things I build and break.",
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
