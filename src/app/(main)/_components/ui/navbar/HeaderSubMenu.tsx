import Link from "next/link";

interface SubMenuItem {
  id: number;
  title: string;
  link: string;
}

interface MenuItem {
  id: number;
  title: string;
  link: string;
  subMenu?: SubMenuItem[];
}

interface HeaderSubMenuProps {
  data: MenuItem;
}

const HeaderSubMenu = ({ data }: HeaderSubMenuProps) => {
  return (
    <li className="group relative">
      <Link
        href={data.link}
        className="inline-block rounded-t-lg px-4 py-3 text-[#ddd] transition-colors duration-300 group-hover:bg-[#6363634d] group-hover:px-8"
      >
        {data.title}
      </Link>
      <ul className="pointer-events-none invisible absolute top-full right-[-25%] z-1000 m-0 flex w-[150%] translate-y-3 flex-col overflow-hidden rounded-b-lg bg-white p-0 opacity-0 shadow-[0_4px_10px_4px_rgba(0,0,0,0.1)] transition-[opacity,visibility,translate] duration-300 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {data.subMenu?.map((item, subIndex) => (
          <li
            key={item.id}
            className="border-b border-[#ddd] transition-colors duration-200 last:border-none hover:bg-[#caf2ff]"
          >
            <Link
              href={item.link}
              style={{ transitionDelay: `${subIndex * 50}ms` }}
              className="block px-4 py-[15px] text-center text-[0.9rem] leading-normal text-[#333] opacity-0 transition-[color,opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:pr-4 hover:text-[#007bff] md:text-[1.1rem] 2xl:text-[1.1rem]"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default HeaderSubMenu;
