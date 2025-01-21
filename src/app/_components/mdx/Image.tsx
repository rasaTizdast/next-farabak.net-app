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
    width={width || 500}
    height={height || 400}
    quality={100}
    className="rounded-md mx-auto my-10"
    priority
  />
);
