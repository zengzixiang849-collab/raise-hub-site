// Every internal link and asset goes through url(), so the site works both at
// "/" (local preview) and under a GitHub Pages sub-path such as "/raise-hub/".
const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/** url('/about/') → '/about/' locally, '/raise-hub/about/' on GitHub Pages. */
export function url(path = '/'): string {
  return BASE + path.replace(/^\/+/, '');
}

/** Removes the base from a pathname: '/raise-hub/about/' → '/about/'. */
export function stripBase(pathname: string): string {
  if (BASE !== '/' && pathname.startsWith(BASE)) {
    return `/${pathname.slice(BASE.length)}`;
  }
  return pathname;
}
