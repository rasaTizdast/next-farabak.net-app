import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import styles from "./MemberPage.module.css";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

type Props = {
  params: {
    member: string;
  };
};

const getMemberData = async (slug: string) => {
  const response = await fetch(
    `${process.env.BASE_URL}/api/members/memberPage/${slug}`,
    {
      next: { revalidate: 120 },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
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
  };
};

const MemberPage = async ({ params }: Props) => {
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

  const breadcrumbs = ["/", "/about-us", "/about-us/members"];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <section className={styles.section}>
        <div className={styles.content}>
          <h1>{name}</h1>
          <h3>{role}</h3>
          {desc ? (
            <p>{desc}</p>
          ) : (
            <p className="p-3 bg-blue-100 w-full text-center rounded-lg">
              برای این عضو اطلاعاتی یافت نشد، مجددا بعدا تلاش کنید
            </p>
          )}
        </div>
        <aside>
          {img ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/member-images/${img}`}
              alt={name}
              width={400}
              height={300}
              quality={100}
            />
          ) : (
            <div className="h-96 w-full p-3 bg-blue-100 rounded-lg flex items-center justify-center">
              تصویری برای این عضو یافت نشد
            </div>
          )}
          <div className={styles.links}>
            <Link href={`https://wa.me/${phone}`}>
              <div>واتس‌آپ</div>
              <FaWhatsapp size={20} />
            </Link>
            <Link href={`tel:${phone}`}>
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
