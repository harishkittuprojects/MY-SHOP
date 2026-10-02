"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilter, 
  faSearch, 
  faTimes, 
  faBox, 
  faChevronLeft, 
  faChevronRight, 
  faArrowRight, 
  faList, 
  faTableCells,
  faStar,
  faCheck,
  faSliders,
  faRotateLeft,
  faShieldHalved,
  faWandMagicSparkles,
  faBolt,
  faMobileAlt,
  faMobileScreen,
  faCheckCircle,
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";

function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className || "object-cover"}
      onError={() => setImgSrc("/placeholder.png")}
      unoptimized
    />
  );
}

function Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFilter = searchParams.get("category");
  const urlSearchTerm = searchParams.get("search") || "";
  const urlBrandParam = searchParams.get("brand") || "all";
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  
  // Faceted Filters (Amazon-style)
  const [selectedBrand, setSelectedBrand] = useState<string>(urlBrandParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    urlBrandParam && urlBrandParam !== "all" ? urlBrandParam.split(",") : []
  );
  const [brandSearchTerm, setBrandSearchTerm] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [cashbackOnly, setCashbackOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showBrandGrid, setShowBrandGrid] = useState(false);
  const [isBrandsModalOpen, setIsBrandsModalOpen] = useState(false);
  const [brandModalSearch, setBrandModalSearch] = useState("");

  // View Style & Grid Column Controls
  const [viewStyle, setViewStyle] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [listCols, setListCols] = useState<1 | 2>(1);

  const normalizeImageUrl = (url: string) => {
    if (!url) return "/mobile-logo.png";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categoryList"),
          fetch("/api/productList")
        ]);
        
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        
        setCategories(Array.isArray(catData) ? catData : []);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  useEffect(() => {
    if (urlBrandParam) {
      setSelectedBrand(urlBrandParam);
    }
  }, [urlBrandParam]);

  useEffect(() => {
    setSelectedSubCategory("all");
    if (!urlBrandParam || urlBrandParam === "all") {
      setSelectedBrand("all");
    }
  }, [categoryFilter]);

  // Helper for smart brand recognition
  const getProductBrand = (p: any): string => {
    if (p.brand && typeof p.brand === "string" && p.brand.trim()) {
      return p.brand.trim();
    }
    const name = (p.name || "").toLowerCase();
    if (name.includes("samsung") || name.includes("galaxy")) return "Samsung";
    if (name.includes("motorola") || name.includes("moto")) return "Motorola";
    if (name.includes("oneplus") || name.includes("nord")) return "OnePlus";
    if (name.includes("redmi")) return "Redmi";
    if (name.includes("realme") || name.includes("narzo")) return "realme";
    if (name.includes("iqoo")) return "iQOO";
    if (name.includes("poco")) return "POCO";
    if (name.includes("iphone") || name.includes("apple") || name.includes("airpods") || name.includes("ipad") || name.includes("macbook")) return "Apple";
    if (name.includes("pixel") || name.includes("google")) return "Google";
    if (name.includes("vivo")) return "Vivo";
    if (name.includes("xiaomi") || name.includes(" mi ")) return "Xiaomi";
    if (name.includes("nothing") || name.includes("cmf")) return "Nothing";
    if (name.includes("levi")) return "Levi's";
    if (name.includes("tommy")) return "Tommy Hilfiger";
    if (name.includes("nike")) return "Nike";
    if (name.includes("zara")) return "Zara";
    if (name.includes("polo")) return "US Polo Assn";
    if (name.includes("manyavar")) return "Manyavar";
    if (name.includes("biba")) return "Biba";
    if (name.includes("raymond")) return "Raymond";
    if (name.includes("puma")) return "Puma";
    if (name.includes("calvin") || name.includes(" ck ")) return "Calvin Klein";
    if (name.includes("adidas")) return "Adidas";
    if (name.includes("fabindia")) return "FabIndia";
    if (name.includes("boat")) return "boAt";
    if (name.includes("sony")) return "Sony";
    if (name.includes("sandisk")) return "SanDisk";
    if (name.includes("noise")) return "Noise";
    if (name.includes("jbl")) return "JBL";
    if (name.includes("anker")) return "Anker";
    if (name.includes("portronics")) return "Portronics";
    
    const firstWord = (p.name || "").split(" ")[0];
    return firstWord && firstWord.length > 2 ? firstWord : "Other";
  };

  const isMobilesOnlyFilter =
    categoryFilter?.toLowerCase() === "mobiles";

  const isAccessoryOnlyFilter =
    categoryFilter?.toLowerCase() === "mobile accessories" ||
    categoryFilter?.toLowerCase() === "mobile-accessories";

  const isMobileAndAccessoriesFilter = 
    categoryFilter?.toLowerCase() === "mobiles & accessories" || 
    categoryFilter?.toLowerCase() === "mobiles-accessories";

  const activeCategoryObj = categories.find(
    (c) =>
      c.name.toLowerCase() === categoryFilter?.toLowerCase() ||
      c.id.toLowerCase() === categoryFilter?.toLowerCase()
  );

  const activeSubcategories = useMemo(() => {
    if (categoryFilter?.toLowerCase() === "fashion") {
      return [
        "Jeans & Trousers",
        "Men's Shirts & Polos",
        "T-Shirts & Sportswear",
        "Women's Dresses & Kurtis",
        "Ethnic & Kurta Sets",
        "Jackets & Outerwear",
        "Handbags & Purses",
        "Watches & Chronographs"
      ];
    }
    if (categoryFilter?.toLowerCase() === "jewellery") {
      return [
        "Gold & Diamond Jewellery",
        "Silver & Moissanite",
        "Necklace Sets & Chokers",
        "Rings & Bangles"
      ];
    }
    if (isMobilesOnlyFilter) {
      return [
        "Flagship Phones",
        "5G Phones",
        "Gaming Phones",
        "Budget Phones"
      ];
    }
    if (isAccessoryOnlyFilter) {
      return [
        "Chargers & Adapters",
        "Cases & Covers",
        "Tempered Glass",
        "Power Banks",
        "Cables",
        "Storage"
      ];
    }
    if (isMobileAndAccessoriesFilter) {
      return [
        "Flagship Phones",
        "5G Phones",
        "Chargers & Adapters",
        "Power Banks",
        "Cases & Covers",
        "Tempered Glass",
        "Storage",
        "Cables"
      ];
    }
    if (activeCategoryObj?.sub_categories && Array.isArray(activeCategoryObj.sub_categories)) {
      return activeCategoryObj.sub_categories;
    }
    const catProds = categoryFilter
      ? products.filter(
          (p) =>
            (p.category_name && p.category_name.toLowerCase() === categoryFilter.toLowerCase()) ||
            (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase()) ||
            (p.category_id && p.category_id.toLowerCase() === categoryFilter.toLowerCase())
        )
      : products;
    const subs = Array.from(new Set(catProds.map((p) => p.sub_category).filter(Boolean)));
    return subs;
  }, [activeCategoryObj, categoryFilter, isMobileAndAccessoriesFilter, products]);

  // Extract available brands with counts for current category
  const categoryBaseProducts = useMemo(() => {
    if (!categoryFilter || categoryFilter.toLowerCase() === "all" || categoryFilter.toLowerCase() === "all products") {
      return products;
    }
    return products.filter((product) => {
      const prodCategoryName = product.category_name || product.categories?.name || product.category || "";
      const prodCategoryId = product.category_id || "";
      const prodSubCategory = (product.sub_category || "").toLowerCase();

      if (isMobilesOnlyFilter) {
        return (
          (prodCategoryName.toLowerCase().includes("mobile") || prodCategoryId.toLowerCase().includes("mobile") || (product.category && product.category.toLowerCase().includes("mobile"))) &&
          !prodSubCategory.includes("case") &&
          !prodSubCategory.includes("cover") &&
          !prodSubCategory.includes("charger") &&
          !prodSubCategory.includes("adapter") &&
          !prodSubCategory.includes("glass") &&
          !prodSubCategory.includes("cable") &&
          !prodSubCategory.includes("power") &&
          !prodSubCategory.includes("storage")
        );
      } else if (isAccessoryOnlyFilter) {
        return (
          prodCategoryName.toLowerCase().includes("accessories") ||
          prodCategoryId.toLowerCase().includes("accessories") ||
          prodSubCategory.includes("charger") ||
          prodSubCategory.includes("adapter") ||
          prodSubCategory.includes("case") ||
          prodSubCategory.includes("cover") ||
          prodSubCategory.includes("glass") ||
          prodSubCategory.includes("power") ||
          prodSubCategory.includes("cable") ||
          prodSubCategory.includes("storage")
        );
      } else if (categoryFilter.toLowerCase() === "fashion") {
        const isSmartTech = prodCategoryName.toLowerCase().includes("smart") || prodCategoryId.toLowerCase().includes("smart") || (product.category && product.category.toLowerCase().includes("smart"));
        const isJewellery = prodCategoryName.toLowerCase().includes("jewel") || prodCategoryId.toLowerCase().includes("jewel") || (product.category && product.category.toLowerCase().includes("jewel"));
        return !isSmartTech && !isJewellery && (
          prodCategoryName.toLowerCase() === "fashion" ||
          prodCategoryId.toLowerCase() === "fashion" ||
          prodSubCategory.includes("handbag") ||
          prodSubCategory.includes("apparel") ||
          prodSubCategory.includes("clothing") ||
          prodSubCategory.includes("shirt") ||
          prodSubCategory.includes("polo") ||
          prodSubCategory.includes("jeans") ||
          prodSubCategory.includes("trouser") ||
          prodSubCategory.includes("dress") ||
          prodSubCategory.includes("kurta") ||
          prodSubCategory.includes("jacket") ||
          prodSubCategory.includes("fashion") ||
          prodSubCategory.includes("bag") ||
          prodSubCategory.includes("watch")
        );
      } else if (categoryFilter.toLowerCase() === "jewellery" || categoryFilter.toLowerCase() === "jewelry") {
        return (
          prodCategoryName.toLowerCase() === "jewellery" ||
          prodCategoryName.toLowerCase() === "jewelry" ||
          prodCategoryId.toLowerCase() === "jewellery" ||
          prodCategoryId.toLowerCase() === "jewelry" ||
          prodSubCategory.includes("jewellery") ||
          prodSubCategory.includes("gold") ||
          prodSubCategory.includes("silver") ||
          prodSubCategory.includes("moissanite") ||
          prodSubCategory.includes("necklace") ||
          prodSubCategory.includes("ring")
        );
      } else if (isMobileAndAccessoriesFilter) {
        return (
          prodCategoryName.toLowerCase().includes("mobile") ||
          prodCategoryId.toLowerCase().includes("mobile")
        );
      } else {
        return (
          prodCategoryName.toLowerCase() === categoryFilter.toLowerCase() ||
          prodCategoryId.toLowerCase() === categoryFilter.toLowerCase() ||
          prodCategoryName.toLowerCase().includes(categoryFilter.toLowerCase())
        );
      }
    });
  }, [categoryFilter, isMobilesOnlyFilter, isAccessoryOnlyFilter, isMobileAndAccessoriesFilter, products]);

  const availableBrandsWithCount = useMemo(() => {
    const brandMap = new Map<string, number>();
    categoryBaseProducts.forEach((p) => {
      const brand = getProductBrand(p);
      brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
    });

    return Array.from(brandMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [categoryBaseProducts]);

  const POPULAR_MOBILE_BRANDS = [
    "Samsung",
    "Motorola",
    "OnePlus",
    "Redmi",
    "realme",
    "iQOO",
    "POCO",
    "Apple",
    "Vivo",
    "Google",
    "Xiaomi",
    "Nothing"
  ];

  // Map of counts for every brand
  const brandProductCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const b = getProductBrand(p);
      map.set(b.toLowerCase(), (map.get(b.toLowerCase()) || 0) + 1);
    });
    return map;
  }, [products]);

  // Combined full mobile brands list
  const allMobileBrandsList = useMemo(() => {
    const list = [...POPULAR_MOBILE_BRANDS];
    products.forEach((p) => {
      const cat = (p.category_name || p.categories?.name || p.category || "").toLowerCase();
      if (cat.includes("mobile") || cat.includes("phone")) {
        const b = getProductBrand(p);
        if (b && b !== "Other" && !list.some(existing => existing.toLowerCase() === b.toLowerCase())) {
          list.push(b);
        }
      }
    });
    return list;
  }, [products]);

  const toggleBrand = (brandName: string) => {
    setSelectedBrands((prev) => {
      const isAlready = prev.some((b) => b.toLowerCase() === brandName.toLowerCase());
      let next: string[];
      if (isAlready) {
        next = prev.filter((b) => b.toLowerCase() !== brandName.toLowerCase());
      } else {
        next = [...prev, brandName];
      }
      setSelectedBrand(next.length === 0 ? "all" : next[0]);
      return next;
    });
  };

  const isBrandChecked = (brandName: string) => {
    return selectedBrands.some(b => b.toLowerCase() === brandName.toLowerCase()) || 
      (selectedBrand !== "all" && selectedBrand.toLowerCase() === brandName.toLowerCase());
  };

  // Filtered brands for sidebar search
  const displayedBrandsInSidebar = useMemo(() => {
    if (!brandSearchTerm.trim()) return allMobileBrandsList;
    return allMobileBrandsList.filter((b) =>
      b.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
  }, [allMobileBrandsList, brandSearchTerm]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSubCategory !== "all") count++;
    if (selectedBrand !== "all" || selectedBrands.length > 0) count++;
    if (priceRange !== "all") count++;
    if (selectedColor !== "all") count++;
    if (minRating > 0) count++;
    if (conditionFilter !== "all") count++;
    if (inStockOnly) count++;
    if (cashbackOnly) count++;
    return count;
  }, [selectedSubCategory, selectedBrand, selectedBrands, priceRange, selectedColor, minRating, conditionFilter, inStockOnly, cashbackOnly]);

  const resetFilters = () => {
    setSelectedSubCategory("all");
    setSelectedBrand("all");
    setSelectedBrands([]);
    setPriceRange("all");
    setSelectedColor("all");
    setMinRating(0);
    setConditionFilter("all");
    setInStockOnly(false);
    setCashbackOnly(false);
    setSearchTerm("");
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().replace(/\s/g, "");
    
    let result = products.filter((product) => {
      const prodCategoryName = product.category_name || product.categories?.name || product.category || "";
      const prodCategoryId = product.category_id || "";
      const prodSubCategory = (product.sub_category || "").toLowerCase();
      
      // 1. Category Filter
      let matchesCategory = true;
      if (categoryFilter) {
        if (isMobilesOnlyFilter) {
          // Strictly smartphones only
          const isPhone = 
            (prodCategoryName.toLowerCase().includes("mobile") || prodCategoryId.toLowerCase().includes("mobile") || (product.category && product.category.toLowerCase().includes("mobile"))) &&
            !prodSubCategory.includes("case") &&
            !prodSubCategory.includes("cover") &&
            !prodSubCategory.includes("charger") &&
            !prodSubCategory.includes("adapter") &&
            !prodSubCategory.includes("glass") &&
            !prodSubCategory.includes("cable") &&
            !prodSubCategory.includes("power") &&
            !prodSubCategory.includes("storage");
          matchesCategory = isPhone;
        } else if (isAccessoryOnlyFilter) {
          matchesCategory = 
            prodCategoryName.toLowerCase().includes("accessories") ||
            prodCategoryId.toLowerCase().includes("accessories") ||
            prodSubCategory.includes("charger") ||
            prodSubCategory.includes("adapter") ||
            prodSubCategory.includes("case") ||
            prodSubCategory.includes("cover") ||
            prodSubCategory.includes("glass") ||
            prodSubCategory.includes("power") ||
            prodSubCategory.includes("cable") ||
            prodSubCategory.includes("storage");
        } else if (categoryFilter.toLowerCase() === "fashion") {
          const isSmartTech = prodCategoryName.toLowerCase().includes("smart") || prodCategoryId.toLowerCase().includes("smart") || (product.category && product.category.toLowerCase().includes("smart"));
          const isJewellery = prodCategoryName.toLowerCase().includes("jewel") || prodCategoryId.toLowerCase().includes("jewel") || (product.category && product.category.toLowerCase().includes("jewel"));
          matchesCategory = !isSmartTech && !isJewellery && (
            prodCategoryName.toLowerCase() === "fashion" ||
            prodCategoryId.toLowerCase() === "fashion" ||
            prodSubCategory.includes("handbag") ||
            prodSubCategory.includes("apparel") ||
            prodSubCategory.includes("clothing") ||
            prodSubCategory.includes("shirt") ||
            prodSubCategory.includes("polo") ||
            prodSubCategory.includes("jeans") ||
            prodSubCategory.includes("trouser") ||
            prodSubCategory.includes("dress") ||
            prodSubCategory.includes("kurta") ||
            prodSubCategory.includes("jacket") ||
            prodSubCategory.includes("fashion") ||
            prodSubCategory.includes("bag") ||
            prodSubCategory.includes("watch")
          );
        } else if (categoryFilter.toLowerCase() === "jewellery" || categoryFilter.toLowerCase() === "jewelry") {
          matchesCategory = 
            prodCategoryName.toLowerCase() === "jewellery" ||
            prodCategoryName.toLowerCase() === "jewelry" ||
            prodCategoryId.toLowerCase() === "jewellery" ||
            prodCategoryId.toLowerCase() === "jewelry" ||
            prodSubCategory.includes("jewellery") ||
            prodSubCategory.includes("gold") ||
            prodSubCategory.includes("silver") ||
            prodSubCategory.includes("moissanite") ||
            prodSubCategory.includes("necklace") ||
            prodSubCategory.includes("ring") ||
            Boolean(product.name && (product.name.toLowerCase().includes("necklace") || product.name.toLowerCase().includes("ring") || product.name.toLowerCase().includes("gold") || product.name.toLowerCase().includes("diamond") || product.name.toLowerCase().includes("moissanite") || product.name.toLowerCase().includes("kundan")));
        } else if (isMobileAndAccessoriesFilter) {
          matchesCategory = 
            prodCategoryName.toLowerCase().includes("mobile") ||
            prodCategoryId.toLowerCase().includes("mobile");
        } else {
          matchesCategory = 
            prodCategoryName.toLowerCase() === categoryFilter.toLowerCase() ||
            prodCategoryId.toLowerCase() === categoryFilter.toLowerCase() ||
            prodCategoryName.toLowerCase().includes(categoryFilter.toLowerCase());
        }
      }

      // 2. Subcategory Filter (Fuzzy & Smart matching)
      let matchesSubCategory = true;
      if (selectedSubCategory !== "all") {
        const subLow = selectedSubCategory.toLowerCase();
        matchesSubCategory = Boolean(
          prodSubCategory === subLow ||
          prodSubCategory.includes(subLow) ||
          subLow.includes(prodSubCategory) ||
          (subLow.includes("charger") && (prodSubCategory.includes("charger") || prodSubCategory.includes("adapter"))) ||
          (subLow.includes("adapter") && (prodSubCategory.includes("adapter") || prodSubCategory.includes("charger"))) ||
          (subLow.includes("power") && prodSubCategory.includes("power")) ||
          (subLow.includes("case") && (prodSubCategory.includes("case") || prodSubCategory.includes("cover"))) ||
          (subLow.includes("glass") && prodSubCategory.includes("glass")) ||
          (subLow.includes("cable") && prodSubCategory.includes("cable")) ||
          (subLow.includes("storage") && (prodSubCategory.includes("storage") || product.name.toLowerCase().includes("storage") || product.name.toLowerCase().includes("microsd") || product.name.toLowerCase().includes("gb"))) ||
          (subLow.includes("phone") || subLow === "mobile" ? (product.category.toLowerCase() === "mobiles" || prodSubCategory.includes("phone")) : false)
        );
      }

      // 3. Brand Filter
      const prodBrand = getProductBrand(product);
      let matchesBrand = true;
      if (selectedBrands.length > 0) {
        matchesBrand = selectedBrands.some(
          (b) =>
            prodBrand.toLowerCase() === b.toLowerCase() ||
            (product.name || "").toLowerCase().includes(b.toLowerCase()) ||
            (product.brand && product.brand.toLowerCase().includes(b.toLowerCase()))
        );
      } else if (selectedBrand !== "all") {
        matchesBrand =
          prodBrand.toLowerCase() === selectedBrand.toLowerCase() ||
          (product.name || "").toLowerCase().includes(selectedBrand.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(selectedBrand.toLowerCase()));
      }

      // 4. Price Range Filter
      let matchesPrice = true;
      const price = Number(product.price) || 0;
      if (priceRange === "under-10k") matchesPrice = price < 10000;
      else if (priceRange === "10k-25k") matchesPrice = price >= 10000 && price <= 25000;
      else if (priceRange === "25k-50k") matchesPrice = price > 25000 && price <= 50000;
      else if (priceRange === "50k-100k") matchesPrice = price > 50000 && price <= 100000;
      else if (priceRange === "above-100k") matchesPrice = price > 100000;

      // 5. Rating Filter
      const rating = Number(product.rating) || 4.5;
      const matchesRating = minRating > 0 ? rating >= minRating : true;

      // 6. Condition Filter
      let matchesCondition = true;
      if (conditionFilter === "refurbished") {
        matchesCondition = Boolean(product.condition || (prodCategoryName.toLowerCase().includes("refurbished")));
      } else if (conditionFilter === "new") {
        matchesCondition = !product.condition && !prodCategoryName.toLowerCase().includes("refurbished");
      }

      // 7. In Stock Only
      const matchesStock = inStockOnly ? !product.is_out_of_stock : true;

      // 8. Cashback Only
      const matchesCashback = cashbackOnly ? Boolean(product.cashback_amount && product.cashback_amount > 0) : true;

      // 9. Color Filter
      let matchesColor = true;
      if (selectedColor && selectedColor !== "all") {
        const target = selectedColor.toLowerCase();
        const hasVariantMatch = Array.isArray(product.variants) && product.variants.some((v: any) => 
          (v.color && v.color.toLowerCase().includes(target)) ||
          (v.color_name && v.color_name.toLowerCase().includes(target))
        );
        const hasDirectColorMatch = product.color && typeof product.color === 'string' && product.color.toLowerCase().includes(target);
        const hasNameMatch = (product.name || "").toLowerCase().includes(target);
        const hasDescMatch = (product.description || "").toLowerCase().includes(target);
        const hasUnitMatch = (product.unit || "").toLowerCase().includes(target);
        matchesColor = hasVariantMatch || hasDirectColorMatch || hasNameMatch || hasDescMatch || hasUnitMatch;
      }

      // 10. Search Term
      const cleanName = (product.name || "").toLowerCase().replace(/\s/g, "");
      const cleanProductCategory = (prodCategoryName || "").toLowerCase().replace(/\s/g, "");
      const cleanSub = (product.sub_category || "").toLowerCase().replace(/\s/g, "");
      const matchesSearch = cleanName.includes(cleanSearch) ||
                           cleanProductCategory.includes(cleanSearch) ||
                           cleanSub.includes(cleanSearch);
                           
      return (
        matchesCategory && 
        matchesSubCategory && 
        matchesBrand && 
        matchesPrice && 
        matchesRating && 
        matchesCondition && 
        matchesStock && 
        matchesCashback && 
        matchesColor &&
        matchesSearch
      );
    });

    // Apply Sorting (Amazon style)
    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else {
      // Featured / Popularity
      result.sort((a, b) => (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0));
    }

    return result;
  }, [
    categoryFilter, 
    selectedSubCategory, 
    selectedBrand, 
    priceRange, 
    selectedColor,
    minRating, 
    conditionFilter, 
    inStockOnly, 
    cashbackOnly, 
    searchTerm, 
    sortBy, 
    products
  ]);

  const isMobileCategory = !categoryFilter || 
    categoryFilter.toLowerCase().includes("mobile") || 
    categoryFilter.toLowerCase() === "mobiles & accessories";

  // Layout Grid class
  const getLayoutGridClass = () => {
    if (viewStyle === "list") {
      if (listCols === 2) {
        return "grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 md:gap-5";
      }
      return "grid grid-cols-1 gap-3 sm:gap-4";
    }

    if (gridCols === 2) {
      return "grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5";
    }
    if (gridCols === 3) {
      return "grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5";
    }
    return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5";
  };

  return (
    <div className="w-full md:container px-0 md:px-4 py-2 sm:py-6 md:py-8">
      {/* Best Selling Carousel (When on Mobiles or All Products) */}
      {isMobileCategory && !categoryFilter && (
        <section className="mb-8 sm:mb-10 px-3 md:px-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FontAwesomeIcon icon={faBolt} className="text-amber-500 text-sm" />
              Best Selling Smartphones &amp; Gadgets
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const el = document.getElementById("best-selling-carousel");
                  if (el) el.scrollBy({ left: -300, behavior: "smooth" });
                }}
                className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs cursor-pointer active:scale-90 transition-transform"
                aria-label="Scroll left"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("best-selling-carousel");
                  if (el) el.scrollBy({ left: 300, behavior: "smooth" });
                }}
                className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs cursor-pointer active:scale-90 transition-transform"
                aria-label="Scroll right"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>
          </div>

          <div 
            id="best-selling-carousel"
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
          >
            {products
              .filter(p => (p.category || "").toLowerCase().includes("mobile") || p.is_popular)
              .slice(0, 8)
              .map((product) => {
                const origPrice = product.original_price || Math.round(product.price * 1.18);
                const discount = Math.round(((origPrice - product.price) / origPrice) * 100);

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="w-[160px] sm:w-[185px] md:w-[200px] flex-shrink-0 bg-white rounded-2xl border border-slate-200/80 p-3 group flex flex-col justify-between shadow-xs hover:shadow-md transition-all hover:border-secondary"
                  >
                    <div className="relative aspect-square w-full bg-white flex items-center justify-center p-2 mb-2">
                      <Image
                        src={product.image_url || product.image || "/mobile-logo.png"}
                        alt={product.name}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-secondary line-clamp-1 mb-1 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between gap-1 mt-auto">
                      <span className="text-xs sm:text-sm font-black text-emerald-700">
                        ₹{Math.floor(product.price).toLocaleString("en-IN")}
                      </span>
                      {discount > 0 && (
                        <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                          {discount}%
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {/* Main Filter & Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* ======================= LEFT FACETED FILTERS SIDEBAR (DESKTOP) ======================= */}
        <div className="hidden lg:block space-y-6 sticky top-28 self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-2 no-scrollbar">
          {/* Header & Reset Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-secondary text-sm" />
              Filter By
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" />
                Reset ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* 1. Category Tree */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Department
            </h4>
            <div className="space-y-1 text-xs">
              <Link 
                href="/products"
                className={`block px-3 py-2 rounded-xl font-bold transition-all ${
                  !categoryFilter ? "bg-secondary text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`block px-3 py-2 rounded-xl font-semibold transition-all ${
                    categoryFilter?.toLowerCase() === cat.name.toLowerCase() 
                      ? "bg-secondary text-white font-bold shadow-xs" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 2. Brand Filter (Exact match with user screenshot) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-black tracking-tight">
                Brands
              </h4>
              {(selectedBrands.length > 0 || selectedBrand !== "all") && (
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedBrand("all");
                  }}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-800 underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Brand Search Input if many brands */}
            <div className="mb-2.5 relative">
              <input
                type="text"
                value={brandSearchTerm}
                onChange={(e) => setBrandSearchTerm(e.target.value)}
                placeholder="Search brands..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 outline-none focus:border-secondary"
              />
              {brandSearchTerm && (
                <button
                  onClick={() => setBrandSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 select-none">
              {displayedBrandsInSidebar.map((brandName) => {
                const isChecked = isBrandChecked(brandName);
                const count = brandProductCounts.get(brandName.toLowerCase()) || 0;

                return (
                  <label
                    key={brandName}
                    className="flex items-center gap-2.5 cursor-pointer py-0.5 hover:text-blue-600 transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBrand(brandName)}
                      className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 accent-[#2874f0] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-900 group-hover:text-black">
                      {brandName}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-slate-400 ml-auto font-mono">
                        ({count})
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Price Range Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Price
            </h4>
            <div className="space-y-1 text-xs">
              {[
                { id: "all", label: "Any Price" },
                { id: "under-10k", label: "Under ₹10,000" },
                { id: "10k-25k", label: "₹10,000 – ₹25,000" },
                { id: "25k-50k", label: "₹25,000 – ₹50,000" },
                { id: "50k-100k", label: "₹50,000 – ₹1,00,000" },
                { id: "above-100k", label: "Above ₹1,00,000" },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setPriceRange(range.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors ${
                    priceRange === range.id ? "bg-slate-100 text-secondary font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{range.label}</span>
                  {priceRange === range.id && <FontAwesomeIcon icon={faCheck} className="text-secondary text-xs" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Customer Rating Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Avg. Customer Review
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setMinRating(0)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  minRating === 0 ? "bg-slate-100 text-secondary font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Ratings
              </button>
              {[4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    minRating === stars ? "bg-slate-100 font-bold" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={`text-[10px] ${i < stars ? "text-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                    <span className="text-xs text-slate-600 ml-1">&amp; Up</span>
                  </div>
                  {minRating === stars && <FontAwesomeIcon icon={faCheck} className="text-secondary text-xs" />}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Condition Filter (New vs Refurbished) */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Condition
            </h4>
            <div className="space-y-1 text-xs">
              {[
                { id: "all", label: "All Items" },
                { id: "new", label: "Brand New Sealed" },
                { id: "refurbished", label: "Certified Refurbished" },
              ].map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setConditionFilter(cond.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors ${
                    conditionFilter === cond.id ? "bg-slate-100 text-secondary font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{cond.label}</span>
                  {conditionFilter === cond.id && <FontAwesomeIcon icon={faCheck} className="text-secondary text-xs" />}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Colour Filter (All Categories) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Colour
              </h4>
              {selectedColor !== "all" && (
                <button
                  onClick={() => setSelectedColor("all")}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-800 underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { name: "all", label: "All", bg: "bg-slate-200", border: "border-slate-300" },
                { name: "black", label: "Black", bg: "bg-slate-900", border: "border-slate-900" },
                { name: "white", label: "White", bg: "bg-white", border: "border-slate-300" },
                { name: "blue", label: "Blue", bg: "bg-blue-600", border: "border-blue-600" },
                { name: "red", label: "Red", bg: "bg-red-600", border: "border-red-600" },
                { name: "green", label: "Green", bg: "bg-emerald-600", border: "border-emerald-600" },
                { name: "silver", label: "Silver", bg: "bg-slate-300", border: "border-slate-400" },
                { name: "gold", label: "Gold", bg: "bg-amber-400", border: "border-amber-400" },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                    selectedColor === c.name
                      ? "border-emerald-600 bg-emerald-50/60 font-bold shadow-xs scale-105"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                  title={c.label}
                >
                  <span className={`w-4 h-4 rounded-full ${c.bg} ${c.border} border shadow-xs`} />
                  <span className="text-[10px] text-slate-700 leading-none">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 7. Availability & Perks Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-secondary focus:ring-secondary/30 accent-[#2874f0]"
              />
              <span>In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-emerald-800 font-medium">
              <input
                type="checkbox"
                checked={cashbackOnly}
                onChange={(e) => setCashbackOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="flex items-center gap-1">
                ✨ Eligible for Cashback
              </span>
            </label>
          </div>
        </div>

        {/* ======================= RIGHT MAIN CATALOG AREA ======================= */}
        <div className="lg:col-span-3">
          
          {/* Subcategory Pills Bar */}
          {activeSubcategories.length > 0 && (
            <div className="mb-4 overflow-x-auto no-scrollbar px-3 md:px-0 pb-1">
              <div className="flex items-center gap-2 min-w-max">
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedSubCategory === "all"
                      ? "bg-secondary text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  All {categoryFilter || "Items"}
                </button>
                {activeSubcategories.map((sub: string) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${
                      selectedSubCategory.toLowerCase() === sub.toLowerCase()
                        ? "bg-secondary text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top Brands Toggle & Quick Selector Bar */}
          {availableBrandsWithCount.length > 1 && (
            <div className="mb-4 px-3 md:px-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowBrandGrid(!showBrandGrid)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <svg className="w-3 h-3 fill-current text-slate-600" viewBox="0 0 16 16">
                    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                  </svg>
                  <span>{showBrandGrid ? "Hide Brands Grid" : `Brands Grid (${availableBrandsWithCount.length})`}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{showBrandGrid ? "▲" : "▼"}</span>
                </button>
                {selectedBrand !== "all" && (
                  <span className="text-xs font-semibold text-slate-500">
                    Active: <strong className="text-secondary">{selectedBrand}</strong>
                  </span>
                )}
              </div>

              {showBrandGrid && (
                <div className="overflow-x-auto no-scrollbar pb-1 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-1.5 min-w-max flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedBrand("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedBrand === "all"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      All Brands
                    </button>
                    {availableBrandsWithCount.map((brandObj) => {
                      const isSelected = selectedBrand.toLowerCase() === brandObj.name.toLowerCase();
                      return (
                        <button
                          key={brandObj.name}
                          type="button"
                          onClick={() => setSelectedBrand(isSelected ? "all" : brandObj.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-secondary text-white shadow-md shadow-secondary/20 font-black"
                              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          <span>{brandObj.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            {brandObj.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls & Sorting Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 mb-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mx-3 md:mx-0">
            {/* Left: Product count + active pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {filteredProducts.length} Results
              </span>
              {categoryFilter && (
                <span className="text-[11px] font-bold text-secondary bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  {categoryFilter}
                </span>
              )}
              {selectedBrand !== "all" && (
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand("all")} className="text-slate-400 hover:text-slate-700">×</button>
                </span>
              )}
              {priceRange !== "all" && (
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  Price Filtered
                  <button onClick={() => setPriceRange("all")} className="text-slate-400 hover:text-slate-700">×</button>
                </span>
              )}
            </div>

            {/* Right: Sort By Dropdown + View Controls */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer active:scale-95"
              >
                <FontAwesomeIcon icon={faSliders} className="text-xs" />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
              </button>

              {/* Available Brands in Mobiles Trigger Button (Opens Brand List) */}
              <button
                type="button"
                onClick={() => setIsBrandsModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 shadow-xs ${
                  selectedBrand !== "all"
                    ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/20"
                    : "bg-emerald-50 hover:bg-emerald-100/90 text-secondary border-emerald-200"
                }`}
                title="Show all available brands in Mobiles"
              >
                <FontAwesomeIcon icon={faList} className="text-xs" />
                <span className="font-extrabold whitespace-nowrap">
                  {selectedBrand !== "all" ? selectedBrand : "Mobile Brands"}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  selectedBrand !== "all" ? "bg-white/25 text-white" : "bg-secondary/15 text-secondary"
                }`}>
                  {allMobileBrandsList.length}
                </span>
              </button>

              {/* Sort By Dropdown (Amazon style) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Avg. Customer Review</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              {/* View Switcher & Brand List Icon Button */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setViewStyle("grid")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    viewStyle === "grid" && !isBrandsModalOpen
                      ? "bg-secondary text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Grid View"
                >
                  <FontAwesomeIcon icon={faTableCells} className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsBrandsModalOpen(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isBrandsModalOpen || selectedBrand !== "all" || viewStyle === "list"
                      ? "bg-secondary text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Show all available brands in Mobiles"
                >
                  <FontAwesomeIcon icon={faList} className="text-xs" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Items Display */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-3 md:px-0">
               {[...Array(6)].map((_, i) => <div key={i} className="h-44 md:h-80 bg-gray-100 animate-pulse rounded-2xl"></div>)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={`bg-white md:bg-transparent rounded-2xl md:rounded-none overflow-hidden px-0 md:px-0 ${getLayoutGridClass()}`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} viewMode={viewStyle} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 md:py-20 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 mx-3 md:mx-0">
              <div className="text-4xl md:text-5xl mb-3 opacity-25">📦</div>
              <h3 className="text-base md:text-lg font-black text-slate-900 mb-1">No matching products found</h3>
              <p className="text-slate-500 mb-6 text-xs md:text-sm max-w-sm mx-auto">
                Try clearing some filters or searching with a different brand name.
              </p>
              <button 
                onClick={resetFilters}
                className="bg-secondary text-white font-black px-6 py-2.5 rounded-xl shadow-md hover:bg-[#255732] transition-all text-xs"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================= MOBILE FILTER MODAL DRAWER ======================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-secondary" />
                Filters &amp; Refinements
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-4 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Brand Filter (Exact match with user screenshot) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-black tracking-tight">Brands</h4>
                  {(selectedBrands.length > 0 || selectedBrand !== "all") && (
                    <button
                      onClick={() => {
                        setSelectedBrands([]);
                        setSelectedBrand("all");
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-700 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allMobileBrandsList.map((brandName) => {
                    const isChecked = isBrandChecked(brandName);
                    const count = brandProductCounts.get(brandName.toLowerCase()) || 0;

                    return (
                      <label
                        key={brandName}
                        className="flex items-center gap-2.5 cursor-pointer py-0.5 hover:text-blue-600 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brandName)}
                          className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 accent-[#2874f0] cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-900">
                          {brandName}
                        </span>
                        {count > 0 && (
                          <span className="text-[10px] text-slate-400 ml-auto font-mono">
                            ({count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="font-black uppercase tracking-wider text-slate-700 mb-2">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "all", label: "Any Price" },
                    { id: "under-10k", label: "< ₹10k" },
                    { id: "10k-25k", label: "₹10k – ₹25k" },
                    { id: "25k-50k", label: "₹25k – ₹50k" },
                    { id: "50k-100k", label: "₹50k – ₹100k" },
                    { id: "above-100k", label: "> ₹100k" },
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setPriceRange(range.id)}
                      className={`p-2 rounded-xl font-bold border transition-all text-center ${
                        priceRange === range.id
                          ? "border-secondary bg-emerald-50 text-secondary"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-black uppercase tracking-wider text-slate-700 mb-2">Minimum Rating</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMinRating(0)}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                      minRating === 0 ? "border-secondary bg-emerald-50 text-secondary" : "border-slate-200 text-slate-700"
                    }`}
                  >
                    All
                  </button>
                  {[3, 4].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1 ${
                        minRating === stars ? "border-secondary bg-emerald-50 text-secondary" : "border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{stars}★</span>
                      <span className="text-[10px] text-slate-400">&amp; Up</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <h4 className="font-black uppercase tracking-wider text-slate-700 mb-2">Condition</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "all", label: "All" },
                    { id: "new", label: "New" },
                    { id: "refurbished", label: "Refurbished" },
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      onClick={() => setConditionFilter(cond.id)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        conditionFilter === cond.id
                          ? "border-secondary bg-emerald-50 text-secondary"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black uppercase tracking-wider text-slate-700">Colour</h4>
                  {selectedColor !== "all" && (
                    <button
                      onClick={() => setSelectedColor("all")}
                      className="text-xs text-slate-400 font-bold underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "all", label: "All", bg: "bg-slate-200", border: "border-slate-300" },
                    { name: "black", label: "Black", bg: "bg-slate-900", border: "border-slate-900" },
                    { name: "white", label: "White", bg: "bg-white", border: "border-slate-300" },
                    { name: "blue", label: "Blue", bg: "bg-blue-600", border: "border-blue-600" },
                    { name: "red", label: "Red", bg: "bg-red-600", border: "border-red-600" },
                    { name: "green", label: "Green", bg: "bg-emerald-600", border: "border-emerald-600" },
                    { name: "silver", label: "Silver", bg: "bg-slate-300", border: "border-slate-400" },
                    { name: "gold", label: "Gold", bg: "bg-amber-400", border: "border-amber-400" },
                  ].map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        selectedColor === c.name
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${c.bg} ${c.border} border shadow-xs`} />
                      <span className="text-[11px] leading-none">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-secondary"
                  />
                  <span>In Stock Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={cashbackOnly}
                    onChange={(e) => setCashbackOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>✨ Eligible for Cashback Only</span>
                </label>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="w-1/3 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-2/3 py-3 bg-secondary text-white rounded-xl font-black shadow-md hover:bg-[#255732] transition-colors text-center"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================= BRANDS CHECKBOX MODAL (EXACT MATCH WITH USER SCREENSHOT) ======================= */}
      {isBrandsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div 
            className="fixed inset-0"
            onClick={() => setIsBrandsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-[320px] sm:max-w-[360px] rounded-2xl shadow-2xl z-10 overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                Brands
              </h3>
              <button
                type="button"
                onClick={() => setIsBrandsModalOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="px-5 pt-3 pb-2">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={brandModalSearch}
                  onChange={(e) => setBrandModalSearch(e.target.value)}
                  placeholder="Search brands..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 outline-none focus:border-secondary"
                  autoFocus
                />
              </div>
            </div>

            {/* Checkbox List (Exact visual format of screenshot) */}
            <div className="px-5 py-2 max-h-72 overflow-y-auto space-y-2 select-none">
              {allMobileBrandsList
                .filter(b => !brandModalSearch.trim() || b.toLowerCase().includes(brandModalSearch.toLowerCase()))
                .map((brandName) => {
                  const isChecked = isBrandChecked(brandName);
                  const count = brandProductCounts.get(brandName.toLowerCase()) || 0;

                  return (
                    <label
                      key={brandName}
                      className="flex items-center gap-3 cursor-pointer py-1 hover:text-blue-600 transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBrand(brandName)}
                        className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 accent-[#2874f0] cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-900 group-hover:text-black">
                        {brandName}
                      </span>
                      {count > 0 && (
                        <span className="text-xs text-slate-400 ml-auto font-mono">
                          ({count})
                        </span>
                      )}
                    </label>
                  );
                })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedBrands([]);
                  setSelectedBrand("all");
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsBrandsModalOpen(false)}
                className="px-4 py-1.5 bg-secondary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-secondary/90 transition-colors cursor-pointer"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsContent() {
  return (
    <Suspense fallback={
      <div className="container py-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <Content />
    </Suspense>
  );
}

