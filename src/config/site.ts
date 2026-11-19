export interface SiteConfig {
  name: string;
  title: string;
  tagline: string | null;
  description: string;
  url: string;
  ogImage: string;
}

export const siteConfig: SiteConfig = {
  name: "AGUSTIN",
  title: "Agustin | IT student and builder",
  tagline: null,
  description:
    "Portfolio of Agustin, an IT student at Cebu Technological University who likes building things.",
  url: "https://agustinportfolio.vercel.app",
  ogImage: "/og.png",
};
