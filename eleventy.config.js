import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";

const md = markdownIt({ html: true, typographer: true });

// Typsnitten installeras via npm (@fontsource) och kopieras in i sajten vid bygget,
// så att vi slipper ladda något från Google (bra för både fart och GDPR).
const fonts = {
  "@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2": "fraunces-latin.woff2",
  "@fontsource-variable/fraunces/files/fraunces-latin-ext-full-normal.woff2": "fraunces-latin-ext.woff2",
  "@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2": "fraunces-latin-italic.woff2",
  "@fontsource-variable/fraunces/files/fraunces-latin-ext-full-italic.woff2": "fraunces-latin-ext-italic.woff2",
  "@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2": "nunito-latin.woff2",
  "@fontsource-variable/nunito/files/nunito-latin-ext-wght-normal.woff2": "nunito-latin-ext.woff2",
  "@fontsource-variable/nunito/files/nunito-latin-wght-italic.woff2": "nunito-latin-italic.woff2",
  "@fontsource/caveat/files/caveat-latin-600-normal.woff2": "caveat-latin-600.woff2",
  "@fontsource/caveat/files/caveat-latin-ext-600-normal.woff2": "caveat-latin-ext-600.woff2",
};

/** Bygger en SVG-path för en cirkel med bågade kanter – som en tårtbricka eller spetsduk. */
function scallopPath(cx, cy, r, count, depth) {
  const step = (Math.PI * 2) / count;
  const point = (angle, radius) => [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  const fmt = (n) => Math.round(n * 100) / 100;
  let [x, y] = point(-Math.PI / 2, r);
  let d = `M${fmt(x)},${fmt(y)}`;
  for (let i = 0; i < count; i++) {
    const a0 = -Math.PI / 2 + i * step;
    const [qx, qy] = point(a0 + step / 2, r + depth * 2);
    const [ex, ey] = point(a0 + step, r);
    d += ` Q${fmt(qx)},${fmt(qy)} ${fmt(ex)},${fmt(ey)}`;
  }
  return d + "Z";
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  for (const [from, to] of Object.entries(fonts)) {
    eleventyConfig.addPassthroughCopy({ [`node_modules/${from}`]: `assets/fonts/${to}` });
  }

  // Recepten ligger som markdown-filer i src/recept/ – nyast först.
  eleventyConfig.addCollection("recept", (api) =>
    api.getFilteredByGlob("src/recept/*.md").sort((a, b) => b.date - a.date)
  );

  const datum = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  eleventyConfig.addFilter("datum", (d) => datum.format(new Date(d)));
  eleventyConfig.addFilter("isoDatum", (d) => new Date(d).toISOString().slice(0, 10));
  const kronor = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
  eleventyConfig.addFilter("kr", (n) => kronor.format(Number(n) || 0));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("where", (arr, key, value) => (arr || []).filter((item) => item[key] === value));
  eleventyConfig.addFilter("md", (text) => md.render(String(text ?? "")));
  eleventyConfig.addFilter("mdInline", (text) => md.renderInline(String(text ?? "")));
  eleventyConfig.addFilter("stripHtml", (html) => String(html ?? "").replace(/<[^>]+>/g, "").trim());
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("absoluteUrl", (path, base) => new URL(path, base).href);
  eleventyConfig.addFilter("flatIngredients", (groups) =>
    (groups || []).flatMap((g) => g.items || [])
  );
  eleventyConfig.addFilter("slugify", (s) =>
    String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addShortcode("scallop", (cx, cy, r, count, depth) => scallopPath(cx, cy, r, count, depth));
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  eleventyConfig.setLibrary("md", md);

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
