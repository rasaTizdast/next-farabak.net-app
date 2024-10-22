import { useState, useRef, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { escape } from "validator";
import Skeleton from "react-loading-skeleton";
import { CgSearch } from "react-icons/cg";
import "react-loading-skeleton/dist/skeleton.css";
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
  type: string;
  description: string;
  img1: string;
}

interface ProductApiResponse {
  ProductId: number;
  Name: string;
  Type: string;
  Description: string;
  img1: string;
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
        `/api/products/search?q=${normalizedSearchTerm}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const apiData: ProductApiResponse[] = await response.json();

      // Map the API response to the Product interface format
      const mappedData: Product[] = apiData.map((item) => ({
        productId: item.ProductId,
        name: item.Name,
        type: item.Type,
        description: item.Description,
        img1: item.img1,
      }));

      console.log("Mapped API Data:", mappedData); // Log the mapped data for debugging
      setResults(mappedData); // Set the results using the mapped data
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
  console.log(searchResults);
  return (
    <div className={styles.results}>
      {/* Display results only if there are search results */}
      {searchResults.length > 0 ? (
        searchResults.map((product) => (
          <Link
            key={product.productId}
            href={`products/${product.productId}`}
            className={styles.result}
            onClick={() => {
              closeSearchBox();
            }}
          >
            <Image
              width={280}
              height={280}
              src={`/productImages/${product.img1}`}
              alt={product.name}
            />
            <p>{product.type}</p>
          </Link>
        ))
      ) : hasSearched ? (
        <p>No results found</p>
      ) : null}
    </div>
  );
};

// Component for rendering loading skeletons
const LoadingSkeletons = () => (
  <div className={styles.skeletons}>
    <Skeleton direction="rtl" className={styles.first} />
    <Skeleton direction="rtl" />
    <Skeleton direction="rtl" />
    <Skeleton direction="rtl" />
    <Skeleton direction="rtl" className={styles.last} />
  </div>
);

// Main SearchBox component
const SearchBox = () => {
  const [searchVis, setSearchVis] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if the user has searched
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle search input changes
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = e.target.value;
    setSearchValue(result);

    if (result.trim().length <= 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true); // Mark that the user has searched
    debouncedSearchHandler(result.trim(), setSearchResults, setIsLoading);
  };

  // Handle search button click
  const onSearchClick = () => {
    if (searchValue.trim().length > 0) {
      const sanitizedSearchValue = escape(searchValue.trim());
      const safeSearchValue = encodeURIComponent(sanitizedSearchValue);
      router.push(`/products/search?q=${safeSearchValue}`);
      closeSearchBox(); // Close search box after clicking search
    }
  };

  // Handle "Enter" key press for search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchClick();
    }
  };

  // Toggle search box visibility
  const toggleSearchBox = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling up
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

  // Close search box and reset values
  const closeSearchBox = useCallback(() => {
    setSearchVis(false);
    setSearchValue("");
    setSearchResults([]);
    setIsLoading(false);
    setHasSearched(false); // Reset search state when closing the search box
  }, []);

  // Handle clicks outside the search box
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

  // Focus on the input when the search box opens
  useEffect(() => {
    if (searchVis && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchVis]); // Watch for changes in searchVis

  // Add event listener for clicks outside the search box
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
        onClick={(event) => toggleSearchBox(event)} // Pass event to toggleSearchBox
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
