export type BlackwonderProduct = {
  slug: string;
  name: string;
  image: string;
  href: string;
};

const categoryPath = "/products/industrial-cctv-camera/black-wonder";
const imageBase = "https://s3.farabak.net/productImages";
const localImages = new Set(["bwd-m8", "bwd-m8x", "sgc-ex-sh"]);

const product = (slug: string, name: string): BlackwonderProduct => ({
  slug,
  name,
  image: localImages.has(slug)
    ? `/landing/blackwonder-products/${slug}.webp`
    : `${imageBase}/${slug}/${slug}-mini.webp`,
  href: `${categoryPath}/${slug}`,
});

export const blackwonderProducts = [
  product("bwd-m8", "BWD-M8"),
  product("bwd-m8x", "BWD-M8x"),
  product("sgc-ex-sh", "SGC-EX-SH"),
  product("sgc-ex-sh-x36c-network", "SGC-EX-SH-X36C NETWORK"),
  product("sgc-ex-sh-x36c-hdmi", "SGC-EX-SH-X36C HDMI"),
  product("sgc-ex-sh-x36c-sdi", "SGC-EX-SH-X36C 12G-SDI"),
  product("srg-x36c-network", "SRG-X36C NETWORK"),
  product("srg-x36c-hdmi", "SRG-X36C HDMI"),
  product("srg-x36c-sdi", "SRG-X36C 12G-SDI"),
  product("sgx-ex-sd1", "SGX-EX-SD1"),
  product("junction-box", "جعبه اتصال S316"),
  product("universal-joint", "اتصال SGA-S909"),
  product("wall-bracket", "پایه دیواری SGA-S512"),
  product("flexibility-pipe", "لوله منعطف SGA-EX-BNG"),
] as const satisfies readonly BlackwonderProduct[];

export const blackwonderCategoryHref = categoryPath;
export const blackwonderHeroSrc = "/landing/blackwonder-range-v6.webp";
