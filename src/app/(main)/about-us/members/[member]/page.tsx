import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FaInstagram, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import styles from "./MemberPage.module.css";
import members from "@/constants/members.json";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

type Props = {
  params: {
    member: number;
  };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  const memberData = members.find((mem) => params.member === mem.id);

  if (!memberData) {
    return {
      title: "عضوی یافت نشد!",
      description: "عضوی یافت نشد، لطفا مجددا تلاش کنید!",
    };
  }

  return {
    title: `معرفی ${memberData.name} | فرابک`,
    description: `مشاهده صفحه معرفی ${memberData.name} که عضوی از هیئت مدیره شرکت فرابک هستند و سمت ${memberData.role} را دارند.`,
  };
};

type MemberData = {
  name: string;
  role: string;
  desc: string;
  img: string;
  links: { insta: string; whatsapp: string; phone: string };
};

const MemberPage = ({ params }: Props) => {
  const memberData = members.find((member) => +params.member === member.id);

  if (!memberData) {
    notFound();
  }

  const {
    name,
    role,
    desc,
    img,
    links: { insta, whatsapp, phone },
  }: MemberData = memberData;

  const breadcrumbs = [
    { path: "/" },
    { path: "/about-us" },
    { path: "/about-us/members" },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <section className={styles.section}>
        <div className={styles.content}>
          <h1>{name}</h1>
          <h3>{role}</h3>
          <p>{desc}</p>
          <p>{desc}</p>
          <p>{desc}</p>
        </div>
        <aside>
          <Image src={img} alt={name} width={800} height={800} quality={100} />
          <div className={styles.links}>
            <Link href={insta}>
              <div>اینستاگرام</div>
              <FaInstagram size={20} />
            </Link>
            <Link href={whatsapp}>
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
