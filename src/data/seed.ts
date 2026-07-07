export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  stock: number;
  ingredients: string;
  benefits: string;
  usage: string;
  safetyNotes: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  paymentIntentId?: string;
  paymentMethod?: 'CARD' | 'COD';
  createdAt: string;
}

export interface AdminUser {
  email: string;
  passwordHash: string;
  name: string;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-lotion",
    name: "Baby Lotion",
    slug: "baby-lotion",
    description: "Ayurvedic daily hydrators enriched with organic saffron and cold-pressed sweet almond oil.",
    image: "/product-kesar.png"
  },
  {
    id: "cat-wash",
    name: "Baby Wash & Shampoo",
    slug: "baby-wash",
    description: "Gentle tear-free cleansers made with pure cold-pressed coconut oil and soothing calendula.",
    image: "/product-coconut.png"
  },
  {
    id: "cat-cream",
    name: "Moisturising Cream",
    slug: "moisturising-cream",
    description: "Intense barrier repair creams infused with therapeutic turmeric (Haldi) and rich shea butter.",
    image: "/product-turmeric.png"
  },
  {
    id: "cat-oil",
    name: "Massage Oil",
    slug: "massage-oil",
    description: "Traditional nourishing massage oils crafted with organic neem and cold-pressed sesame.",
    image: "/product-neem.png"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-kesar-lotion",
    name: "Kesar & Sweet Almond Nourishing Baby Lotion",
    slug: "kesar-sweet-almond-nourishing-baby-lotion",
    categoryId: "cat-lotion",
    description: "A premium Ayurvedic baby lotion infused with Kashmiri Kesar (Saffron) and sweet almond oil to keep your baby's skin soft, glowing, and moisturised for 24 hours.",
    price: 499.00,
    rating: 4.8,
    reviewCount: 34,
    images: [
      "/product-kesar.png"
    ],
    stock: 45,
    ingredients: "Kashmiri Kesar (Saffron Extract), Cold-Pressed Sweet Almond Oil, Organic Aloe Vera Leaf Juice, Pure Coconut Milk, Organic Shea Butter, Rose Water, Vitamin E, Olive Oil derivative emulsifier.",
    benefits: "Improves skin texture, locks in moisture, restores natural suppleness, and leaves a gentle natural floral aroma.",
    usage: "Take a few drops and gently massage all over baby's body after bathing or before bedtime.",
    safetyNotes: "15-free clean formulation. Dermatologist tested. Hypoallergenic. Free from mineral oils, parabens, silicones, and synthetic colors.",
    isFeatured: true,
    createdAt: "2026-01-15T10:00:00Z"
  },
  {
    id: "prod-coconut-wash",
    name: "Cold-Pressed Coconut & Calendula Wash",
    slug: "cold-pressed-coconut-calendula-wash",
    categoryId: "cat-wash",
    description: "A pH-balanced, tear-free cleansing formula enriched with virgin coconut oil and marigold (Calendula) to gently cleanse delicate hair and baby skin without causing dryness.",
    price: 399.00,
    rating: 4.9,
    reviewCount: 52,
    images: [
      "/product-coconut.png"
    ],
    stock: 60,
    ingredients: "Virgin Coconut Oil, Organic Calendula Extract, Chamomile Flower Water, Vegetable Glycerin, Oat Kernel Extract, Coco-glucoside (Mild Cleansing Surfactant), Purified Aqua.",
    benefits: "Gently cleanses cradle cap, preserves skin natural oils, keeps hair smooth and tangle-free.",
    usage: "Lather a small amount between wet hands, gently massage onto baby's damp scalp and body, then rinse with warm water.",
    safetyNotes: "100% Tear-free. Paediatrician approved. Clinically tested safe for newborns. External use only.",
    isFeatured: true,
    createdAt: "2026-02-10T12:00:00Z"
  },
  {
    id: "prod-turmeric-cream",
    name: "Haldi & Shea Butter Eczema Soothing Cream",
    slug: "haldi-shea-butter-eczema-soothing-cream",
    categoryId: "cat-cream",
    description: "An ultra-rich botanical cream combining organic Haridra (Turmeric) and raw Shea Butter to instantly soothe redness, dry eczema patches, and cradle cap in baby's sensitive skin.",
    price: 549.00,
    rating: 4.7,
    reviewCount: 28,
    images: [
      "/product-turmeric.png"
    ],
    stock: 25,
    ingredients: "Organic Turmeric (Haridra Extract), Pure Shea Butter, Cold-Pressed Jojoba Oil, Colloidal Oat Flour (1%), Calendula flower oil, Beeswax, Tea Tree oil extract.",
    benefits: "Forms a defensive barrier, reduces itchiness, fights bacterial eczema, speeds up skin healing.",
    usage: "Smooth a thin layer over dry or irritated skin patches thrice daily or after bathing. Focus on joints, cheeks, and neck creases.",
    safetyNotes: "Steroid-free. Fragrance-free. 100% hypoallergenic. Safe for babies with extreme skin sensitivities.",
    isFeatured: true,
    createdAt: "2026-03-01T09:00:00Z"
  },
  {
    id: "prod-neem-oil",
    name: "Neem & Sesame Ayurvedic Massage Oil",
    slug: "neem-sesame-ayurvedic-massage-oil",
    categoryId: "cat-oil",
    description: "A traditional baby massage oil containing organic Neem (to keep infections at bay) and rich cold-pressed Sesame (Til) oil to strengthen bones and improve blood flow.",
    price: 449.00,
    rating: 5.0,
    reviewCount: 19,
    images: [
      "/product-neem.png"
    ],
    stock: 35,
    ingredients: "Cold-Pressed Sesame (Til) Oil, Virgin Neem Seed Oil, Cold-Pressed Sweet Almond Oil, Organic Sunflower Seed Oil, Vitamin E.",
    benefits: "Strengthens bones and muscles, antimicrobial shield against rashes, hydrates deeply, promotes deeper sleep.",
    usage: "Pour some oil on your palms, rub to warm it, and massage the baby using gentle, long upward strokes.",
    safetyNotes: "100% Ayurvedic formulation. Free from mineral oils, hexane, and artificial fragrances. Carry out a patch test before first use.",
    isFeatured: false,
    createdAt: "2026-03-20T14:00:00Z"
  },
  {
    id: "prod-brahmi-rash",
    name: "Brahmi & Aloe Soothing Diaper Cream",
    slug: "brahmi-aloe-soothing-diaper-cream",
    categoryId: "cat-cream",
    description: "A protective Ayurvedic diaper barrier cream with zinc oxide, cooling Aloe Vera, and organic Brahmi to instantly calm diaper friction, red bumps, and painful friction rashes.",
    price: 349.00,
    rating: 4.6,
    reviewCount: 41,
    images: [
      "/product-brahmi.png"
    ],
    stock: 50,
    ingredients: "Non-Nano Zinc Oxide (15%), Organic Brahmi extract, Organic Aloe Vera gel, Castor Oil, Beeswax, Calendula oil, Vitamin E.",
    benefits: "Creates a waterproof barrier that locks out wetness, reduces diaper irritation, repairs damaged skin folds.",
    usage: "Apply a generous layer during every diaper change, especially after cleaning the area and letting it dry completely.",
    safetyNotes: "Dye-free, synthetic fragrance-free. Safe for newborn diaper areas. For external application only.",
    isFeatured: false,
    createdAt: "2026-04-05T11:00:00Z"
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-kesar-lotion",
    userName: "Ananya Sharma",
    rating: 5,
    comment: "This has done wonders for my daughter's dry skin! The saffron smell is very soft and beautiful. Love it.",
    createdAt: "2026-05-10T14:30:00Z"
  },
  {
    id: "rev-2",
    productId: "prod-kesar-lotion",
    userName: "Rohan Mukherjee",
    rating: 4,
    comment: "Extremely moisturizing and absorbs super fast. Docked one star only because the pump is a bit stiff.",
    createdAt: "2026-05-20T10:15:00Z"
  },
  {
    id: "rev-3",
    productId: "prod-coconut-wash",
    userName: "Priya Nair",
    rating: 5,
    comment: "Absolutely tear-free. Doesn't dry out my newborn's skin at all. Smells of pure coconut oil.",
    createdAt: "2026-06-01T17:45:00Z"
  },
  {
    id: "rev-4",
    productId: "prod-turmeric-cream",
    userName: "Amit Verma",
    rating: 5,
    comment: "My son had dry red patches on his cheeks. This Haridra/Turmeric cream cleared it up in 2 days! Brilliant.",
    createdAt: "2026-06-15T08:20:00Z"
  }
];

export const ADMIN_USER: AdminUser = {
  email: "admin@babyskin.com",
  passwordHash: "admin123",
  name: "Victoria Harrison"
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1001",
    customerName: "Karan Johar",
    customerEmail: "karan@dharmaprod.in",
    shippingAddress: {
      address: "Carters Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400050",
      country: "India"
    },
    total: 898.00,
    status: "Delivered",
    items: [
      {
        productId: "prod-kesar-lotion",
        productName: "Kesar & Sweet Almond Nourishing Baby Lotion",
        price: 499.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"
      },
      {
        productId: "prod-coconut-wash",
        productName: "Cold-Pressed Coconut & Calendula Wash",
        price: 399.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      }
    ],
    paymentIntentId: "pi_mock_123456789",
    createdAt: "2026-06-25T15:30:00Z"
  },
  {
    id: "ord-1002",
    customerName: "Deepika Padukone",
    customerEmail: "deepika@82e.co.in",
    shippingAddress: {
      address: "Bungalow No 5, Cunningham Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560052",
      country: "India"
    },
    total: 1098.00,
    status: "Paid",
    items: [
      {
        productId: "prod-turmeric-cream",
        productName: "Haldi & Shea Butter Eczema Soothing Cream",
        price: 549.00,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600"
      }
    ],
    paymentIntentId: "pi_mock_987654321",
    createdAt: "2026-07-01T10:45:00Z"
  }
];
