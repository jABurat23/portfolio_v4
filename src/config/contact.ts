export interface ContactItem {
  id: string;
  label: string;
  text: string;
  href: string;
  external: boolean;
}

export interface ContactConfig {
  label: string;
  backToStartLabel: string;
  items: readonly ContactItem[];
}

export const contactConfig: ContactConfig = {
  label: "CONTACT",
  backToStartLabel: "BACK TO START",
  items: [
    {
      id: "email",
      label: "EMAIL",
      text: "kisakitetta852@gmail.com",
      href: "mailto:kisakitetta852@gmail.com",
      external: false,
    },
    {
      id: "github",
      label: "GITHUB",
      text: "jABurat23",
      href: "https://github.com/jABurat23",
      external: true,
    },
    {
      id: "instagram",
      label: "INSTAGRAM",
      text: "@baygusnextdoor",
      href: "https://instagram.com/baygusnextdoor",
      external: true,
    },
  ],
};
