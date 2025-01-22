import Image from "next/image";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export const CustomImage: React.FC<ImageProps> = ({
  width,
  height,
  src,
  alt,
}) => (
  <Image
    src={src}
    alt={alt}
    width={width || 1000}
    height={height || 1000}
    quality={100}
    className="rounded-md mx-auto my-4 mobile:my-10"
    priority
  />
);
