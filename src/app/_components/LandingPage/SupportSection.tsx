import Link from "next/link";

import supportData from "../../../constants/supportData.json";

const SupportSection = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-4 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
      <div className="mx-auto flex w-full max-w-[1580px] flex-col items-center">
        <h2 className="border-third mb-12 border-b-3 px-4 py-2 text-center text-[1.7rem] font-extrabold">
          پشتیبانی
        </h2>
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {supportData.map((item) => (
            <Card key={item.id} title={item.title} desc={item.desc} link={item.link} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportSection;

type card = {
  title: string;
  desc: string;
  link: string;
};

const Card = ({ title, desc, link }: card) => {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:scale-[1.05] md:p-6 lg:max-w-[420px]">
      <h5 className="border-fourth border-b-3 pb-2 text-[1.3rem] font-bold">{title}</h5>
      <p className="text-[1.1rem]">{desc}</p>
      <Link
        href={`support/${link}`}
        className="bg-fourth after:bg-dark-blue relative mt-8 inline-block w-full overflow-hidden rounded-lg px-8 py-2 text-[0.9rem] text-white transition-[transform,color,box-shadow] duration-300 after:absolute after:inset-y-0 after:inset-s-[100%] after:inset-e-0 after:z-[-1] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:inset-s-0 hover:after:inset-e-0"
      >
        مشاهده
      </Link>
    </div>
  );
};
