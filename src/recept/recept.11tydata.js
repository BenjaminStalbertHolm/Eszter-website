// Gemensamma inställningar för alla recept i den här mappen.
// Nytt recept? Kopiera en befintlig .md-fil här och ändra innehållet.

const utanMarkdown = (text) => String(text).replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

export default {
  layout: "layouts/recept.njk",
  tone: "rosa",
  ogType: "article",
  eleventyComputed: {
    description: (data) => data.description || data.subtitle,
    // Strukturerad data så att Google kan visa receptet snyggt i sökresultaten
    jsonLd: (data) => {
      const bild = new URL(data.image || "/assets/img/delning.png", data.site.url).href;
      const recept = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: data.title,
        description: data.subtitle,
        image: [bild],
        author: { "@type": "Person", name: data.site.name, url: data.site.url },
        datePublished: new Date(data.page.date).toISOString().slice(0, 10),
        recipeCategory: data.category,
        recipeCuisine: data.origin,
        recipeYield: data.servings,
        recipeIngredient: (data.ingredients || []).flatMap((g) => g.items || []),
        recipeInstructions: (data.instructions || []).map((del) => ({
          "@type": "HowToSection",
          name: del.group || data.title,
          itemListElement: (del.steps || []).map((steg) => ({ "@type": "HowToStep", text: utanMarkdown(steg) })),
        })),
      };
      if (data.totalTime) recept.totalTime = data.totalTime;
      return recept;
    },
  },
};
