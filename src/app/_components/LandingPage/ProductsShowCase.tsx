import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

function getRowClass(index: number) {
  if (index === 0)
    return "flex-1 flex-[1_1_45%] max-[576px]:flex-[1_1_100%] max-[768px]:flex-[1_1_100%]";
  if (index === 1)
    return "flex-2 flex-[2_1_55%] max-[576px]:flex-[1_1_100%] max-[768px]:flex-[1_1_100%]";
  if (index === 2)
    return "flex-2 flex-[2_1_55%] max-[576px]:flex-[1_1_100%] max-[768px]:flex-[1_1_100%]";
  if (index === 3)
    return "flex-1 flex-[1_1_45%] max-[576px]:flex-[1_1_100%] max-[768px]:flex-[1_1_100%]";
  return "flex-1 flex-[1_1_50%] max-[576px]:flex-[1_1_100%] max-[768px]:flex-[1_1_100%]";
}

async function getProducts() {
  try {
    const products = await prisma.showcase_products.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching showcase products:", error);
    throw new Error("Failed to fetch showcase products");
  }
}

const ProductsShowCase = async () => {
  const products = await getProducts();

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-8 min-[576px]:px-12 min-[992px]:px-20 min-[1200px]:px-24 md:px-16 2xl:px-40">
      <h2 className="border-third mb-12 border-b-3 px-4 py-2 text-center text-[1.7rem] font-extrabold">
        محصولات رئولینک
      </h2>
      <div className="flex w-full max-w-[1580px] flex-col gap-8">
        {Array.from({ length: Math.ceil(products.length / 2) }, (_, rowIndex) => (
          <div className="flex w-full flex-row gap-8 max-[768px]:flex-col" key={rowIndex}>
            {products.slice(rowIndex * 2, rowIndex * 2 + 2).map((product, cardIndex) => (
              <Link
                key={product.id}
                href={product.link}
                className={`${getRowClass(rowIndex * 2 + cardIndex)} relative flex h-auto flex-col items-center overflow-hidden rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:scale-[1.02]`}
              >
                <Image
                  src={`${process.env.LIARA_BUCKET_URL}/${product.image}`}
                  alt={product.title}
                  loading="lazy"
                  height={780}
                  width={1340}
                  quality={75}
                  sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, (max-width: 992px) 50vw, (max-width: 1199px) 33vw, 25vw"
                  placeholder="blur"
                  className="h-auto max-h-[300px] w-full object-cover max-[768px]:h-auto max-[768px]:max-h-none"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <div className="absolute bottom-0 flex w-full flex-col justify-center bg-black/70 p-2 text-center text-white">
                  <h3 className="text-base font-medium max-[992px]:text-[0.9rem]">
                    {product.title}
                  </h3>
                  <p className="text-[0.9rem] font-light max-[992px]:text-[0.8rem]">
                    {product.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsShowCase;
