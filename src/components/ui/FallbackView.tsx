import Image from "next/image";
import { aboutConfig } from "@/config/about";
import { contactConfig } from "@/config/contact";
import { siteConfig } from "@/config/site";
import { worksConfig } from "@/config/works";
import {
  CONTACT_ROW_ARROW_CLASS,
  CONTACT_ROW_LABEL_CLASS,
  CONTACT_ROW_LINK_CLASS,
  CONTACT_ROW_VALUE_CLASS,
  OUTLINED_BUTTON_CLASS,
} from "@/lib/interactive";
import { AsciiFrame } from "./AsciiFrame";
import { resolveLocalWorkImage } from "./ProjectCard";

export default function FallbackView() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16">
      <header className="flex flex-col gap-3 border-b border-line pb-6">
        <h1 className="font-mono text-4xl font-bold tracking-[0.24em] text-ink uppercase sm:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          3D VIEW UNAVAILABLE ON THIS DEVICE
        </p>
      </header>

      <section aria-label={aboutConfig.label}>
        <AsciiFrame label={aboutConfig.label}>
          <p className="font-sans text-sm leading-relaxed text-ink sm:text-base">
            {aboutConfig.body}
          </p>
        </AsciiFrame>
      </section>

      <section aria-label="Works">
        <AsciiFrame label="WORKS">
          <ul className="flex flex-col divide-y divide-line">
            {worksConfig.items.map((item, index) => {
              const numLabel = `[ ${String(index + 1).padStart(2, "0")} ]`;
              const localImage = resolveLocalWorkImage(item.image);
              const hasDescription = Boolean(
                item.description && item.description.trim().length > 0,
              );
              const hasUrl = Boolean(item.url && item.url.trim().length > 0);

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-xs tracking-[0.18em] uppercase">
                    <div className="flex items-baseline gap-3">
                      <span className="text-muted">{numLabel}</span>
                      <span className="font-bold text-ink">{item.title}</span>
                    </div>
                    <span className="text-muted">{item.caption}</span>
                  </div>

                  {localImage ? (
                    <div className="relative aspect-video w-full overflow-hidden border border-line bg-background">
                      <Image
                        src={localImage}
                        alt={item.title}
                        fill
                        loading="eager"
                        sizes="(min-width: 640px) 600px, 90vw"
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  {hasDescription ? (
                    <p className="font-sans text-sm leading-relaxed text-ink">
                      {item.description}
                    </p>
                  ) : null}

                  {hasUrl && item.url ? (
                    <div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={OUTLINED_BUTTON_CLASS}
                      >
                        VIEW PROJECT
                      </a>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </AsciiFrame>
      </section>

      <section aria-label={contactConfig.label}>
        <AsciiFrame label={contactConfig.label}>
          <ul className="flex flex-col divide-y divide-line">
            {contactConfig.items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={CONTACT_ROW_LINK_CLASS}
                >
                  <span className={CONTACT_ROW_LABEL_CLASS}>{item.label}</span>
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className={CONTACT_ROW_VALUE_CLASS}>{item.text}</span>
                    {item.external ? (
                      <span aria-hidden="true" className={CONTACT_ROW_ARROW_CLASS}>
                        ↗
                      </span>
                    ) : null}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </AsciiFrame>
      </section>
    </div>
  );
}
