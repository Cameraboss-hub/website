/**
 * One source of truth for the site navigation.
 *
 * The desktop bar keeps the Pixieset shape — Home · About · Info▾ | logo |
 * Blog · Galleries · Videos · Contact — with eight pages tucked behind the
 * Info dropdown. A phone has no hover, so the mobile drawer can't reuse that
 * shape: it promotes the six bar links to a single primary list and shows the
 * Info set below as a labelled secondary group.
 */
export interface NavItem {
  label: string;
  href: string;
}

export const left: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
];

export const info: NavItem[] = [
  { label: "Pricing", href: "/pricing/" },
  { label: "Testimonials", href: "/testimonials/" },
  { label: "Experience", href: "/experience/" },
  { label: "Classes", href: "/classes/" },
  { label: "Aworan", href: "/Aworan/" },
  { label: "MyGears", href: "/MyGears/" },
  { label: "Editorial Shoot", href: "/Editorial-Shoot/" },
  { label: "Area We Cover", href: "/locations/" },
];

export const right: NavItem[] = [
  { label: "Blog", href: "/blog/" },
  { label: "Galleries", href: "/client-area/" },
  { label: "Videos", href: "/Wedding-videos/" },
  { label: "Contact", href: "/contact/" },
];

/** The drawer's top group: every link that sits on the desktop bar itself. */
export const primary: NavItem[] = [...left, ...right];

export const normalisePath = (s: string) =>
  "/" + String(s).replace(/^\/|\/$/g, "") + "/";

export const isCurrent = (current: string, href: string) =>
  normalisePath(current) === normalisePath(href);
