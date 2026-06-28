import { useEffect } from "react";
import { seoSettingsApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";

export default function SEOHead({ pageName, lang = "de" }) {
  const { data: seoSettings } = useQuery({
    queryKey: ["seo", pageName],
    queryFn: async () => {
      return seoSettingsApi.getSettingByPage(pageName);
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  useEffect(() => {
    if (!seoSettings) return;

    // Set title
    const title = seoSettings[`meta_title_${lang}`] || seoSettings.meta_title_de || "EinStein Institut";
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Meta description
    const description = seoSettings[`meta_description_${lang}`] || seoSettings.meta_description_de;
    setMeta("description", description);

    // Keywords
    const keywords = seoSettings[`keywords_${lang}`] || seoSettings.keywords_de;
    setMeta("keywords", keywords);

    // Open Graph
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    if (seoSettings.og_image) {
      setMeta("og:image", seoSettings.og_image, true);
    }
    setMeta("og:type", "website", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (seoSettings.og_image) {
      setMeta("twitter:image", seoSettings.og_image);
    }

    // Canonical URL
    if (seoSettings.canonical_url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", seoSettings.canonical_url);
    }

    // Robots
    if (seoSettings.no_index) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow");
    }

    // Language
    document.documentElement.lang = lang;

  }, [seoSettings, lang]);

  return null;
}
