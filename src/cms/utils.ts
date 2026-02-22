export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s/-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\/+|\/+$/g, "");

export const pathToSlug = (pathname: string) => {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  return clean === "" ? "home" : clean;
};

export const slugToPath = (slug: string) => {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return clean === "home" ? "/" : `/${clean}`;
};

export const initialsFromName = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((x) => x[0]?.toUpperCase() || "").join("") || "U";
};
