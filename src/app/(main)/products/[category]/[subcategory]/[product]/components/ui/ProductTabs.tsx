"use client";



// Scroll function with offset
function scrollToSection(id: string) {
  const element = document.getElementById(id);
  const navHeight = document.querySelector<HTMLElement>(".productTabs")?.offsetHeight || 140; // Default to 70px if not found

  if (element) {
    const yOffset = -navHeight - 10; // Offset by nav height + some margin
    const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({
      top: yPosition,
      behavior: "smooth",
    });
  }
}

const ProductTabs = () => {
  return (
    <nav className="flex items-center justify-center w-full mt-4 rounded bg-[2774c0] shadow-[0_4px_10px_4px_rgba(0,0,0,0.2)] z-5 sticky top-20">
      <ul>
        <li>
          <button
            type="button"
            className="text-[clamp(0.8rem,1.7vw,1rem)] py-2 px-5 transition-colors cursor-pointer"
            onClick={() => scrollToSection("overview")}
          >
            توضیحات
          </button>
        </li>
        <li>
          <button
            type="button"
            className="text-[clamp(0.8rem,1.7vw,1rem)] py-2 px-5 transition-colors cursor-pointer"
            onClick={() => scrollToSection("blog")}
          >
            توضیحات تکمیلی
          </button>
        </li>
        <li>
          <button
            type="button"
            className="text-[clamp(0.8rem,1.7vw,1rem)] py-2 px-5 transition-colors cursor-pointer"
            onClick={() => scrollToSection("specs")}
          >
            مشخصات
          </button>
        </li>
        <li>
          <button type="button" className="text-[clamp(0.8rem,1.7vw,1rem)] py-2 px-5 transition-colors cursor-pointer" onClick={() => scrollToSection("faq")}>
            سوالات
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ProductTabs;
