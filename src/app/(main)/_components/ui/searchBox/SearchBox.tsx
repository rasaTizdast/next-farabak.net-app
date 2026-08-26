"use client";

import debounce from "lodash/debounce";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CgSearch } from "react-icons/cg";
import { escape } from "validator";

import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

// Utility function to normalize Persian text
const normalizePersianText = (text: string) => {
  return text
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ؤ/g, "و")
    .replace(/أ/g, "ا")
    .replace(/إ/g, "ا")
    .replace(/\s+/g, " ")
    .trim();
};

// Format price function that uses a pre-fetched exchange rate
const formatPriceWithRate = (price: number, exchangeRate: number | null): string => {
  if (!price) return "بدون قیمت";
  if (!exchangeRate || isNaN(exchangeRate) || exchangeRate <= 0) {
    return "برای دریافت قیمت تماس بگیرید";
  }
  const updatedPrice = price * exchangeRate;
  return updatedPrice.toLocaleString("fa-IR") + " تومان";
};

// Types for the product and the API response
interface Product {
  productId: number;
  name: string;
  Type: string;
  img1: string;
  productSlug: string;
  Slug?: string;
  link: string;
  Available: boolean;
  Price: string;
  Discount: string;
}

// Debounced search handler for API requests
const debouncedSearchHandler = debounce(
  async (
    searchTerm: string,
    setResults: (results: Product[]) => void,
    setLoading: (loading: boolean) => void
  ) => {
    if (searchTerm.length === 0) return;

    try {
      const sanitizedSearchTerm = escape(searchTerm);
      const normalizedSearchTerm = normalizePersianText(sanitizedSearchTerm);
      const response = await fetch(`/api/products/search?q=${normalizedSearchTerm}&limit=150`);

      if (!response.ok) {
        throw new Error("مشکلی در دریافت محصولات به وجود آمده است.");
      }

      const { data: products } = await response.json();

      const availableProducts = products.filter((product: Product) => product.Available);

      setResults(availableProducts);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  },
  300
);

// Component for the search input field
const SearchInput = ({
  inputChangeHandler,
  searchValue,
  onSearchClick,
  onKeyDown,
  inputRef,
}: {
  inputChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchValue: string;
  onSearchClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => (
  <div className="flex w-full max-w-[calc(1900px-20rem)]">
    <input
      type="text"
      placeholder="جستجو"
      aria-label="جستجو"
      onChange={inputChangeHandler}
      value={searchValue}
      ref={inputRef}
      onKeyDown={onKeyDown}
      className="h-full w-full rounded-tr-lg rounded-br-lg border-none bg-white px-4 py-4 text-base focus:outline-none"
    />
    <button
      type="button"
      onClick={onSearchClick}
      aria-label="جستجو"
      className="flex cursor-pointer items-center justify-center rounded-tl-lg rounded-bl-lg border-none bg-white px-4 py-4 text-[1.2rem]"
    >
      <CgSearch />
    </button>
  </div>
);

// Component for rendering search results
const SearchResults = ({
  searchResults,
  hasSearched,
  closeSearchBox,
  exchangeRate,
}: {
  searchResults: Product[];
  hasSearched: boolean;
  closeSearchBox: () => void;
  exchangeRate: number | null;
}) => {
  return (
    <div className="mt-8 flex h-full w-full max-w-[1580px] flex-wrap justify-start gap-[1.2rem] text-center font-normal">
      {searchResults.length > 0 ? (
        searchResults.map((product) => (
          <Link
            key={product.productId}
            href={`/products/${product.link}`}
            className="flex min-h-[150px] w-[25%] max-w-[300px] flex-col items-center gap-4 rounded-[6px] bg-white p-4"
            onClick={() => {
              closeSearchBox();
            }}
          >
            <Image
              width={280}
              height={280}
              quality={75}
              src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/productImages/${product.img1}`}
              alt={product.Slug!}
            />
            <p>{product.Type}</p>
            <div className="mt-3 font-extralight">
              {product.Price === null || product.Price === undefined || +product.Price === 0 ? (
                <span className="text-gray-600">برای ثبت سفارش با بخش فروش تماس بگیرید</span>
              ) : product.Discount && +product.Discount > 0 ? (
                <div className="flex flex-col items-center gap-1 text-lg">
                  <span className="font-light text-gray-500 line-through">
                    {formatPriceWithRate(+product.Price, exchangeRate)}
                  </span>
                  <span className="font-semibold">
                    {formatPriceWithRate(+product.Price - +product.Discount, exchangeRate)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-white">
                  {formatPriceWithRate(+product.Price, exchangeRate)}
                </span>
              )}
            </div>
          </Link>
        ))
      ) : hasSearched ? (
        <p className="font-semibold text-white">نتیجه ای یافت نشد، مجددا تلاش کنید.</p>
      ) : null}
    </div>
  );
};

// Component for rendering loading skeletons
const LoadingSkeletons = () => (
  <div
    className="mt-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    style={{ maxWidth: "calc(1900px - 20rem)" }}
  >
    {Array.from({ length: 12 }).map((_, index) => (
      <div
        key={index}
        className="flex animate-pulse flex-col items-center rounded-lg bg-gray-200 p-4 shadow-lg"
      >
        <div className="mb-4 h-56 w-full rounded-lg bg-gray-300"></div>
        <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
        <div className="h-4 w-3/4 rounded bg-gray-300"></div>
      </div>
    ))}
  </div>
);

async function fetchExchangeRate(
  exchangeRate: number | null,
  isExchangeRateLoading: boolean,
  setIsExchangeRateLoading: (v: boolean) => void,
  setExchangeRate: (v: number | null) => void
) {
  if (exchangeRate === null && !isExchangeRateLoading) {
    setIsExchangeRateLoading(true);
    try {
      const rate = await fetchUsdToRialRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
    } finally {
      setIsExchangeRateLoading(false);
    }
  }
}

// Main SearchBox component
const SearchBox = () => {
  const [searchVis, setSearchVis] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchExchangeRate(
      exchangeRate,
      isExchangeRateLoading,
      setIsExchangeRateLoading,
      setExchangeRate
    );
  }, [exchangeRate, isExchangeRateLoading]);

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = e.target.value;
    setSearchValue(result);

    if (result.trim().length <= 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    debouncedSearchHandler(result.trim(), setSearchResults, setIsLoading);
  };

  const onSearchClick = () => {
    if (searchValue.trim().length > 0) {
      const sanitizedSearchValue = escape(searchValue.trim());
      const safeSearchValue = encodeURIComponent(sanitizedSearchValue);
      router.push(`/products/search?q=${safeSearchValue}`);
      closeSearchBox();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchClick();
    }
  };

  const toggleSearchBox = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (searchVis) {
      closeSearchBox();
    } else {
      setSearchVis(true);
      setSearchValue("");
      setSearchResults([]);
      setIsLoading(false);
      setHasSearched(false);
    }
  };

  const closeSearchBox = () => {
    setSearchVis(false);
    setSearchValue("");
    setSearchResults([]);
    setIsLoading(false);
    setHasSearched(false);
  };

  useEffect(() => {
    if (searchVis && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchVis]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setSearchVis(false);
        setSearchValue("");
        setSearchResults([]);
        setIsLoading(false);
        setHasSearched(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="me-6" ref={searchBoxRef}>
      <button type="button" onClick={(event) => toggleSearchBox(event)} aria-label="جستجو">
        <CgSearch
          className="relative mb-2 inline-block h-full cursor-pointer self-start border-none text-[2rem] text-[#ddd] md:text-[2.5rem] lg:text-[1.6rem] xl:text-[1.8rem] 2xl:text-[2.5rem]"
          strokeWidth={1}
        />
      </button>
      {searchVis && (
        <div className="absolute start-0 top-full max-h-[75vh] w-screen overflow-y-auto bg-gradient-to-r from-[#003e9b] via-[#0047b3] to-[#0056d8] ps-[10rem] pe-[10rem] pt-4 pb-12 shadow-[0_4px_20px_rgba(0,0,0,0.3)] md:ps-[6rem] md:pe-[6rem] lg:ps-[4rem] lg:pe-[4rem] xl:ps-[3rem] xl:pe-[3rem] 2xl:ps-[1.5rem] 2xl:pe-[1.5rem]">
          <SearchInput
            inputChangeHandler={inputChangeHandler}
            searchValue={searchValue}
            onSearchClick={onSearchClick}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
          />
          {isLoading ? (
            <LoadingSkeletons />
          ) : (
            <SearchResults
              searchResults={searchResults}
              hasSearched={hasSearched}
              closeSearchBox={closeSearchBox}
              exchangeRate={exchangeRate}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
