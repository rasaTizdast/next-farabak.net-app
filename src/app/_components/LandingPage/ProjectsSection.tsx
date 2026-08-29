import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

async function getProjects(): Promise<
  {
    id: number;
    title: string;
    smallDesc: string;
    mainImg: string;
    date: string;
    location: string;
    slug: string;
  }[]
> {
  try {
    const projects = await prisma.projects.findMany({
      where: { IsActive: true },
      select: {
        ProjectID: true,
        Title: true,
        Description: true,
        Main_img_URL: true,
        date: true,
        city: true,
        Slug: true,
      },
    });

    return projects.map((project) => ({
      id: project.ProjectID,
      title: project.Title,
      smallDesc: project.Description,
      mainImg: project.Main_img_URL,
      date: project.date,
      location: project.city,
      slug: project.Slug,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

const ProjectsSection = async () => {
  const projects = await getProjects();

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-12 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
      <h2 className="border-third mb-12 border-b-3 px-4 py-2 text-center text-[1.7rem] font-extrabold">
        پروژه‌ها
      </h2>
      <div className="flex w-full max-w-[1580px] flex-col gap-8">
        <div className="flex w-full flex-wrap justify-evenly gap-8">
          {projects.length > 0 ? (
            projects.map((p) => (
              <Link
                key={p.id}
                href={`/about-us/projects/${p.slug}`}
                className="w-[30%] max-w-[300px] overflow-hidden rounded-lg bg-white text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-[1.05] md:w-[30%] lg:w-[45%] xl:w-[30%] 2xl:w-[30%]"
              >
                <Image
                  src={`${process.env.LIARA_BUCKET_URL}/${p.mainImg}`}
                  loading="lazy"
                  alt={p.title}
                  height={250}
                  width={700}
                  quality={75}
                  sizes="(max-width: 576px) 100vw, (max-width: 768px) 45vw, (max-width: 992px) 30vw, 30vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <div className="flex flex-col gap-2 p-2 md:p-4">
                  <h4 className="font-bold">{p.title}</h4>
                  <p>{p.location}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center text-red-500">
              <p>هیچ پروژه ای یافت نشد</p>
            </div>
          )}
        </div>
      </div>
      <Link
        href="/about-us/projects"
        className="relative mt-16 inline-block overflow-hidden rounded-lg bg-[#0e6aff] px-8 py-2 text-[0.9rem] font-medium text-white transition-[transform,color,box-shadow] duration-400 after:absolute after:inset-y-0 after:inset-s-[100%] after:inset-e-0 after:z-[-1] after:bg-[#003262] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:inset-s-0 hover:after:inset-e-0"
      >
        مشاهده تمامی پروژه‌های انجام شده
      </Link>
    </div>
  );
};

export default ProjectsSection;
