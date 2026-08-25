import Link from "next/link";

import supportData from "../../../constants/supportData.json";

const SupportSection = () => {
  return (
    <div className="flex w-full flex-col items-center px-[10rem] py-12 md:px-[6rem] lg:px-[4rem] xl:px-[3rem] 2xl:px-[1.5rem]">
      <h2 className="mb-12 border-b-3 border-[#1e90ff] px-4 py-2 text-center text-[1.7rem] font-extrabold">
        پشتیبانی
      </h2>
      <div className="flex w-full max-w-[calc(1900px-20rem)] flex-wrap items-stretch justify-evenly gap-8">
        {supportData.map((item) => (
          <Card key={item.id} title={item.title} desc={item.desc} link={item.link} />
        ))}
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
    <div className="flex max-w-[300px] flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:p-6">
      <h5 className="border-b-3 border-[#0e6aff] pb-2 text-[1.3rem] font-bold">{title}</h5>
      <p className="text-[1.1rem]">{desc}</p>
      <Link
        href={`support/${link}`}
        className="relative mt-8 inline-block w-full overflow-hidden rounded-lg bg-[#0e6aff] px-8 py-2 text-[0.9rem] text-white transition-[transform,color,box-shadow] duration-300 after:absolute after:start-[100%] after:end-0 after:top-0 after:bottom-0 after:z-[-1] after:bg-[#003262] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:start-0 hover:after:end-0"
      >
        مشاهده
      </Link>
    </div>
  );
};
