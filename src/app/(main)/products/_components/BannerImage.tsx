import SmartImage from "@/components/ui/SmartImage";

export default function BannerImage({ src, alt }: { src: string; alt?: string }) {
  return (
    <div
      key={src}
      className="mobile:mb-12 relative mb-8 w-full"
      style={{ aspectRatio: "1920 / 600" }}
    >
      <SmartImage
        src={src}
        alt={alt || "Category banner"}
        fill
        sizes="100vw"
        priority
        className="rounded-md object-cover"
      />
      <div className="pointer-events-none absolute -inset-2 rounded-md border-2 border-dotted border-gray-400" />
    </div>
  );
}
