import Image from "next/image";
import { useMemo } from "react";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  size?: string;
}

export const CustomImage: React.FC<ImageProps> = ({ width, height, src, alt, size = "full" }) => {
  const sizeClass = useMemo(() => {
    switch (size) {
      case "half":
        return "w-1/2";
      case "third":
        return "w-1/3";
      case "custom":
        return "";
      case "full":
      default:
        return "w-full";
    }
  }, [size]);

  const imageStyle = useMemo(() => {
    if (size === "custom" && width) {
      return {
        "--custom-width": `${width}px`,
      } as React.CSSProperties;
    }
    return {};
  }, [size, width]);

  return (
    <div className={sizeClass} style={imageStyle}>
      <Image
        src={src}
        alt={alt}
        width={width || 1000}
        height={height || 1000}
        quality={100}
        className="mx-auto my-4 rounded-md mobile:my-10"
        priority
        sizes={size === "full" ? "100vw" : size === "half" ? "50vw" : "33vw"}
      />
    </div>
  );
};
