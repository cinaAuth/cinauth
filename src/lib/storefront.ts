export type BlockType =
  | "announcement"
  | "hero"
  | "products"
  | "text"
  | "features"
  | "faq"
  | "cta";

export type StorefrontBlock = {
  id: string;
  type: BlockType;
  visible: boolean;
  data: any;
};

export type StorefrontSettings = {
  accent: string;
  radius: "none" | "md" | "xl";
  width: "narrow" | "wide";
  showSearch: boolean;
  showCategories: boolean;
};

export const DEFAULT_SETTINGS: StorefrontSettings = {
  accent: "#F97316",
  radius: "xl",
  width: "wide",
  showSearch: true,
  showCategories: true,
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  announcement: "Announcement bar",
  hero: "Hero",
  products: "Product grid",
  text: "Rich text",
  features: "Feature list",
  faq: "FAQ",
  cta: "Call to action",
};

export function newBlock(type: BlockType): StorefrontBlock {
  const id = Math.random().toString(36).slice(2, 10);
  const base = { id, type, visible: true };
  switch (type) {
    case "announcement":
      return { ...base, data: { text: "Instant delivery · 24/7 support" } };
    case "hero":
      return {
        ...base,
        data: {
          eyebrow: "Digital goods",
          title: "",
          subtitle: "",
          buttonLabel: "Browse products",
          align: "center",
        },
      };
    case "products":
      return { ...base, data: { title: "Products", columns: 3 } };
    case "text":
      return { ...base, data: { title: "About this store", body: "Tell your customers who you are." } };
    case "features":
      return {
        ...base,
        data: {
          title: "Why buy here",
          items: [
            { title: "Instant delivery", body: "Your order arrives in seconds." },
            { title: "Secure payments", body: "Encrypted, fraud-protected checkout." },
            { title: "Real support", body: "We answer every ticket." },
          ],
        },
      };
    case "faq":
      return {
        ...base,
        data: {
          title: "FAQ",
          items: [
            { title: "How do I receive my order?", body: "By email and in your account, right after payment." },
            { title: "Do you offer refunds?", body: "Contact us and we'll look at your case." },
          ],
        },
      };
    case "cta":
      return { ...base, data: { title: "Need something custom?", body: "Get in touch and we'll help.", buttonLabel: "Contact us", buttonUrl: "" } };
  }
}

export function defaultBlocks(storeName: string, storeDescription?: string | null): StorefrontBlock[] {
  const hero = newBlock("hero");
  hero.data.title = storeName;
  hero.data.subtitle = storeDescription ?? "";
  return [newBlock("announcement"), hero, newBlock("products"), newBlock("features"), newBlock("faq")];
}
