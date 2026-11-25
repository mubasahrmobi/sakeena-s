/** Free-to-use Unsplash photos (https://unsplash.com/license). Swap any of these for your own photos later. */
const u = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HERO_SLIDES = [
  { src: u("1708534419572-6e6614a53ca1", 1000), caption: "Embroidered Lawn", sub: "Everyday elegance" },
  { src: u("1773439878338-c61b0fe9ed48", 1000), caption: "Printed Suits", sub: "Soft, breathable, graceful" },
  { src: u("1747847470930-4b672079da40", 1000), caption: "Formal Wear", sub: "Made for celebrations" },
  { src: u("1571908599407-cdb918ed83bf", 1000), caption: "New Season", sub: "Fresh arrivals, just landed" },
];

export const SECTION_IMAGES = {
  embroidery: u("1792397471843-a2a4963088ad", 1000),
  fabric: u("1720982892402-5380e855320c", 800),
  sewing: u("1606501126768-b78d4569d3f9", 800),
  boutique: u("1767968037382-8eb9c564339f", 800),
};
