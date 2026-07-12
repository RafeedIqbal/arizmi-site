import {
  ButtonLink,
  buttonClassName,
  disabledCtaClassName,
} from "@/components/ui/Button";
import MetaLabel from "@/components/ui/MetaLabel";
import type { Build } from "@/lib/content/builds";

/**
 * Single source of truth for how a build's CTA renders across the Builds page
 * (featured detail, compact archive, base list). Server-safe.
 *
 * The discriminated `Build["cta"]` union guarantees a protected build can only
 * carry the non-navigational "Details protected" status, so this component can
 * never emit an outbound link for protected work. External destinations stay
 * disabled until D-06 supplies verified URLs — a visibly disabled control with
 * a reason, never a "#" href.
 */
export default function BuildCta({ cta }: { cta: Build["cta"] }) {
  if (cta.kind === "internal") {
    return (
      <ButtonLink href={cta.href} variant="solid">
        {cta.label}
      </ButtonLink>
    );
  }

  if (cta.kind === "external") {
    return cta.url ? (
      <a href={cta.url} className={buttonClassName("solid")}>
        {cta.label}
      </a>
    ) : (
      <span aria-disabled="true" className={disabledCtaClassName()}>
        {cta.label}
        <span className="font-meta text-xs uppercase tracking-wider">
          Link coming soon
        </span>
      </span>
    );
  }

  // Protected: non-navigational status text only.
  return <MetaLabel tone="muted">{cta.label}</MetaLabel>;
}
