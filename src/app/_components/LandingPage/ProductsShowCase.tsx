import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

function getRowClass(index: number) {
  if (index === 0) return "flex-1 flex-[1_1_45%]";
  if (index === 1) return "flex-2 flex-[2_1_55%]";
  if (index === 2) return "flex-2 flex-[2_1_55%]";
  if (index === 3) return "flex-1 flex-[1_1_45%]";
  return "flex-1 flex-[1_1_50%]";
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
    <div className="flex w-full flex-col items-center justify-center px-[10rem] py-12 md:px-[6rem] lg:px-[4rem] xl:px-[3rem] 2xl:px-[1.5rem]">
      <h2 className="mb-12 border-b-3 border-[#1e90ff] px-4 py-2 text-center text-[1.7rem] font-extrabold">
        محصولات رئولینک
      </h2>
      <div className="flex w-full max-w-[calc(1900px-20rem)] flex-col gap-8">
        {Array.from({ length: Math.ceil(products.length / 2) }, (_, rowIndex) => (
          <div className="flex w-full gap-8" key={rowIndex}>
            {products.slice(rowIndex * 2, rowIndex * 2 + 2).map((product, cardIndex) => (
              <Link
                key={product.id}
                href={product.link}
                className={`${getRowClass(rowIndex * 2 + cardIndex)} relative flex h-auto flex-col items-center overflow-hidden rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-[1.05]`}
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
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <div className="absolute bottom-0 flex w-full flex-col justify-center bg-black/70 p-2 text-center text-white">
                  <h3 className="text-base font-medium">{product.title}</h3>
                  <p className="text-[0.9rem] font-light">{product.description}</p>
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
