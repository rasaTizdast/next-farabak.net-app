import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";

type Props = {
  params: Promise<{
    member: string;
  }>;
};

const getMemberData = async (slug: string) => {
  const response = await fetch(`${process.env.BASE_URL}/api/members/memberPage/${slug}`, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const memberData = await getMemberData(params.member);

  if (!memberData) {
    return {
      title: "عضوی یافت نشد!",
      description: "عضوی یافت نشد، لطفا مجددا تلاش کنید!",
    };
  }

  return {
    title: `معرفی ${memberData.Name} | فرابک`,
    description: `مشاهده صفحه معرفی ${memberData.Name} که عضوی از هیئت مدیره شرکت فرابک هستند و سمت ${memberData.Role} را دارند.`,
    robots: {
      index: true,
      follow: true,
    },
  };
};

const memberBreadcrumbs = ["/", "/about-us", "/about-us/members"];

const MemberPage = async (props: Props) => {
  const params = await props.params;
  const memberData = await getMemberData(params.member);

  if (!memberData) {
    notFound();
  }

  const {
    Name: name,
    Role: role,
    main_description: desc,
    main_pic: img,
    phonenumber: phone,
  } = memberData;

  return (
    <>
      <Breadcrumb breadcrumbs={memberBreadcrumbs} />
      <section className="flex w-full max-w-[calc(1900px-20rem)] flex-wrap items-stretch justify-between gap-8">
        <div className="w-[60%] max-w-[1000px] rounded-lg bg-white p-8 text-justify text-base leading-[2.2rem] shadow-[0_3px_8px_rgba(0,0,0,0.1)]">
          <h1 className="mb-2 text-[1.4rem] font-extrabold">{name}</h1>
          <h3 className="mb-8 font-normal">{role}</h3>
          {desc ? (
            <p>{desc}</p>
          ) : (
            <p className="w-full rounded-lg bg-blue-100 p-3 text-center">
              برای این عضو اطلاعاتی یافت نشد، مجددا بعدا تلاش کنید
            </p>
          )}
        </div>
        <aside className="sticky top-[100px] flex h-fit w-[35%] max-w-[500px] flex-col items-center gap-8 rounded-lg bg-white p-8 shadow-[0_3px_8px_rgba(0,0,0,0.1)] md:w-[35%] lg:w-[35%] xl:w-[35%] 2xl:w-[35%]">
          {img ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${img}`}
              alt={name}
              width={400}
              height={300}
              quality={75}
              className="h-[90%] w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center rounded-lg bg-blue-100 p-3">
              تصویری برای این عضو یافت نشد
            </div>
          )}
          <div className="flex w-full flex-col gap-6 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-6">
            <Link
              href={`https://wa.me/${phone}`}
              className="relative z-[1] flex w-full items-center justify-between overflow-hidden rounded-lg bg-[#7bdeff33] p-4 text-inherit no-underline shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-[color,box-shadow] duration-300 after:absolute after:start-[100%] after:end-0 after:top-0 after:bottom-0 after:z-[-1] after:bg-[#318ce7] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:start-0 hover:after:end-0"
            >
              <div>واتس‌آپ</div>
              <FaWhatsapp size={20} />
            </Link>
            <Link
              href={`tel:${phone}`}
              className="relative z-[1] flex w-full items-center justify-between overflow-hidden rounded-lg bg-[#7bdeff33] p-4 text-inherit no-underline shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-[color,box-shadow] duration-300 after:absolute after:start-[100%] after:end-0 after:top-0 after:bottom-0 after:z-[-1] after:bg-[#318ce7] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:start-0 hover:after:end-0"
            >
              <div>شماره تماس</div>
              <FaPhoneAlt size={20} />
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
};

export default MemberPage;
