export const categories = [
  { 
    name: "Apple iPhone", 
    icon: "🍎", 
    id: "apple-iphone", 
    image_url: "/products/iphone-16-pro-max.png" 
  },
  { 
    name: "Samsung Galaxy", 
    icon: "📱", 
    id: "samsung-galaxy", 
    image_url: "/products/samsung-galaxy-s25-ultra.png" 
  },
  { 
    name: "Google Pixel", 
    icon: "🤖", 
    id: "google-pixel", 
    image_url: "/products/google-pixel-9-pro-xl.png" 
  },
  { 
    name: "OnePlus Series", 
    icon: "⚡", 
    id: "oneplus", 
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600" 
  },
  { 
    name: "Smartwatches", 
    icon: "⌚", 
    id: "smartwatches", 
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600" 
  },
  { 
    name: "Audio & Accessories", 
    icon: "🎧", 
    id: "accessories", 
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600" 
  },
  { 
    name: "iPads & Tablets", 
    icon: "💻", 
    id: "tablets", 
    image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600" 
  },
  { 
    name: "Budget 5G Mobiles", 
    icon: "🚀", 
    id: "budget-5g", 
    image_url: "/products/google-pixel-9.png" 
  }
];

export const products = [
  {
    id: "1",
    category: "Samsung Galaxy",
    category_id: "samsung-galaxy",
    name: "Samsung Galaxy S25 Ultra 5G",
    unit: "12GB RAM + 512GB • Titanium Silver",
    price: 129999,
    original_price: 139999,
    image_url: "/products/samsung-galaxy-s25-ultra.png",
    is_available: true,
    is_popular: true,
    description: "Snapdragon 8 Elite, 200MP Quad Telephoto AI Camera, Built-in S-Pen, Anti-reflective Gorilla Armor glass with Galaxy AI."
  },
  {
    id: "2",
    category: "Apple iPhone",
    category_id: "apple-iphone",
    name: "Apple iPhone 16 Pro Max",
    unit: "256GB • Desert Titanium",
    price: 139999,
    original_price: 144900,
    image_url: "/products/iphone-16-pro-max.png",
    is_available: true,
    is_popular: true,
    description: "A18 Pro chip with 6-core GPU, 48MP Fusion Camera, Camera Control button, Grade 5 Titanium design with 6.9-inch Super Retina XDR display."
  },
  {
    id: "3",
    category: "Google Pixel",
    category_id: "google-pixel",
    name: "Google Pixel 9 Pro XL 5G",
    unit: "16GB RAM + 256GB • Obsidian Black",
    price: 104999,
    original_price: 114999,
    image_url: "/products/google-pixel-9-pro-xl.png",
    is_available: true,
    is_popular: true,
    description: "Google Tensor G4 with Gemini AI Advanced, 6.8-inch Super Actua 120Hz display, 5x Telephoto zoom with 7 years of OS updates."
  },
  {
    id: "4",
    category: "Google Pixel",
    category_id: "google-pixel",
    name: "Google Pixel 9 5G",
    unit: "12GB RAM + 128GB • Porcelain White",
    price: 69999,
    original_price: 79999,
    image_url: "/products/google-pixel-9.png",
    is_available: true,
    is_popular: false,
    description: "6.3-inch Actua display, 50MP Main camera + 48MP Ultrawide with Macro Focus, Magic Eraser and Best Take AI."
  },
  {
    id: "5",
    category: "Samsung Galaxy",
    category_id: "samsung-galaxy",
    name: "Samsung Galaxy S24 FE 5G",
    unit: "8GB RAM + 256GB • Blue",
    price: 54999,
    original_price: 59999,
    image_url: "/hero/hero-samsung-ultra.png",
    is_available: true,
    is_popular: true,
    description: "Exynos 2400e flagship chip, Dynamic AMOLED 2X 120Hz display, Galaxy AI Photo Assist and 4,700mAh all-day battery."
  },
  {
    id: "6",
    category: "Apple iPhone",
    category_id: "apple-iphone",
    name: "Apple iPhone 16",
    unit: "128GB • Ultramarine Blue",
    price: 74999,
    original_price: 79900,
    image_url: "/products/iphone-16-pro-max.png",
    is_available: true,
    is_popular: true,
    description: "A18 chip with Apple Intelligence, 48MP 2-in-1 Fusion camera, Action button, Ceramic Shield and Dynamic Island."
  },
  {
    id: "7",
    category: "OnePlus Series",
    category_id: "oneplus",
    name: "OnePlus 12 5G",
    unit: "16GB RAM + 512GB • Silky Black",
    price: 64999,
    original_price: 69999,
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600",
    is_available: true,
    is_popular: false,
    description: "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System with 64MP Periscope Telephoto, and 100W SUPERVOOC charging."
  },
  {
    id: "8",
    category: "Smartwatches",
    category_id: "smartwatches",
    name: "Apple Watch Ultra 2",
    unit: "49mm Titanium Case • GPS + Cellular",
    price: 84900,
    original_price: 89900,
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
    is_available: true,
    is_popular: true,
    description: "Rugged aerospace titanium case, precision dual-frequency GPS, up to 36 hours normal battery life, and 3000 nits display."
  },
  {
    id: "9",
    category: "Audio & Accessories",
    category_id: "accessories",
    name: "Apple AirPods Pro (2nd Gen)",
    unit: "Type-C MagSafe Case • Active Noise Cancellation",
    price: 21999,
    original_price: 24900,
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
    is_available: true,
    is_popular: true,
    description: "Apple H2 chip, up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, and USB-C charging."
  },
  {
    id: "10",
    category: "Smartwatches",
    category_id: "smartwatches",
    name: "Samsung Galaxy Watch 7",
    unit: "44mm Bluetooth • Armor Aluminum",
    price: 27999,
    original_price: 32999,
    image_url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600",
    is_available: true,
    is_popular: false,
    description: "BioActive sensor with Galaxy AI health insights, dual-frequency GPS tracking, and advanced sleep monitoring."
  }
];
