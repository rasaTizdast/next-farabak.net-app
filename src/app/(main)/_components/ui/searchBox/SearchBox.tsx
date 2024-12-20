"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { escape } from "validator";
import { CgSearch } from "react-icons/cg";
import styles from "./SearchBox.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Utility function to normalize Persian text
const normalizePersianText = (text: string) => {
  return text
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ؤ/g, "و")
    .replace(/أ/g, "ا")
    .replace(/إ/g, "ا")
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim();
};

// Types for the product and the API response
interface Product {
  productId: number;
  name: string;
  Type: string;
  description: string;
  img1: string;
  Slug: string;
  link: string;
  productSlug: string;
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
      const response = await fetch(
        `/api/products/search?q=${normalizedSearchTerm}&limit=150`
      );

      if (!response.ok) {
        throw new Error("مشکلی در دریافت محصولات به وجود آمده است.");
      }

      // Extract the data from the response, assuming API returns { products, pagination }
      const { data: products } = await response.json();

      // Set the results to the products data from the API response
      setResults(products);
    } catch (error) {
      console.error(error);
      setResults([]); // If there's an error, return no results
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
  inputRef: React.RefObject<HTMLInputElement>;
}) => (
  <div className={styles.search_input}>
    <input
      type="text"
      placeholder="جستجو"
      onChange={inputChangeHandler}
      value={searchValue}
      ref={inputRef}
      onKeyDown={onKeyDown}
    />
    <button onClick={onSearchClick}>
      <CgSearch />
    </button>
  </div>
);

// Component for rendering search results
const SearchResults = ({
  searchResults,
  hasSearched,
  closeSearchBox,
}: {
  searchResults: Product[]; // No longer allowing undefined, ensures it's always an array
  hasSearched: boolean;
  closeSearchBox: () => void;
}) => {
  console.log(process.env.LIARA_BUCKET_URL);
  return (
    <div className={styles.results}>
      {/* Display results only if there are search results */}
      {searchResults.length > 0 ? (
        searchResults.map((product) => (
          <Link
            key={product.productId}
            href={`products/${product.link}`}
            className={styles.result}
            onClick={() => {
              closeSearchBox();
            }}
          >
            <Image
              width={280}
              height={280}
              quality={100}
              src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/productImages/${product.productSlug}/${product.productSlug}-mini.webp`}
              alt={product.name}
            />
            <p>{product.Type}</p>
          </Link>
        ))
      ) : hasSearched ? (
        <p style={{ color: "#fff", fontWeight: 600 }}>
          نتیجه ای یافت نشد، مجددا تلاش کنید.
        </p>
      ) : null}
    </div>
  );
};

// Component for rendering loading skeletons
const LoadingSkeletons = () => (
  <div
    className="w-full grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mt-8"
    style={{ maxWidth: "calc(1900px - 20rem)" }}
  >
    {Array.from({ length: 12 }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col items-center animate-pulse p-4 bg-gray-200 rounded-lg shadow-lg"
      >
        <div className="bg-gray-300 h-56 w-full rounded-lg mb-4"></div>
        <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
      </div>
    ))}
  </div>
);

// Main SearchBox component
const SearchBox = () => {
  const [searchVis, setSearchVis] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  const closeSearchBox = useCallback(() => {
    setSearchVis(false);
    setSearchValue("");
    setSearchResults([]);
    setIsLoading(false);
    setHasSearched(false);
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        closeSearchBox();
      }
    },
    [closeSearchBox]
  );

  useEffect(() => {
    if (searchVis && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchVis]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={styles.search}>
      <CgSearch
        className={styles.search_icon}
        strokeWidth={1}
        onClick={(event) => toggleSearchBox(event)}
      />
      {searchVis && (
        <div className={styles.search_box}>
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
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
