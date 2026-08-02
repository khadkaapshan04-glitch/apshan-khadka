import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  X,
  ChefHat,
  Eye,
} from 'lucide-react';

export interface DishItem {
  id: string;
  name: string;
  category: 'signatures' | 'vegetarian' | 'seafood' | 'desserts' | 'cocktails' | 'nepali';
  price: string;
  rating: number;
  image: string;
  tagline: string;
  description: string;
  ingredients: string[];
  pairing: string;
  prepTime: string;
  calories: string;
}

export const GALLERY_DISHES: DishItem[] = [
  {
    id: 'n1',
    name: 'Authentic Himalayan Steamed Momo',
    category: 'nepali',
    price: '$18',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800',
    tagline: 'Hand-Crafted Dumplings with Timur Chutney & Sesame Dip',
    description: 'Traditional Nepali steamed momos stuffed with minced herbs and spiced filling, served with fiery Sichuan pepper timur tomato achaar and rich roasted sesame dipping broth.',
    ingredients: ['Hand-folded Wrapper', 'Fresh Herb Mince', 'Timur Sichuan Pepper', 'Roasted Sesame', 'Tomato Achaar'],
    pairing: 'Himalayan Khukri Spiced Ale',
    prepTime: '20 mins',
    calories: '420 kcal',
  },
  {
    id: 'n2',
    name: 'Royal Thakali Dal Bhat Platter',
    category: 'nepali',
    price: '$32',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    tagline: 'Organic Mustang Jimbu Lentils, Basmati Rice & Curries',
    description: 'The pinnacle of traditional Nepali cuisine — aromatic fragrant basmati rice served alongside slow-simmered black lentils tempered with wild Jimbu herb, fresh mustard greens, and spiced seasonal curries.',
    ingredients: ['Mustang Jimbu Herb', 'Black Lentils (Kalo Dal)', 'Aromatic Basmati Rice', 'Gundruk Fermented Greens', 'Ghee'],
    pairing: 'Fresh Mint Lassi',
    prepTime: '25 mins',
    calories: '650 kcal',
  },
  {
    id: 'n3',
    name: 'Pokhara Style Fish Curry',
    category: 'nepali',
    price: '$36',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    tagline: 'Phewa Lake Inspired Spiced Trout with Mustard Oil',
    description: 'Tender fresh trout fillets infused with Pokhara-style mustard seed broth, ground turmeric, fresh garlic, coriander, and pan-fried to rich aromatic perfection.',
    ingredients: ['Fresh Trout', 'Mustard Seed Paste', 'Turmeric & Cumin', 'Garlic Ginger Blend', 'Mustard Oil'],
    pairing: 'Gurkha Premium Lager',
    prepTime: '18 mins',
    calories: '490 kcal',
  },
  {
    id: 'n4',
    name: 'Kothey Crispy Pan-Fried Momo',
    category: 'nepali',
    price: '$20',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800',
    tagline: 'Pan-Seared Half-Crisp Dumplings with Spiced Tomato Broth',
    description: 'Half-steamed and half-pan-fried dumplings with a golden crispy bottom, served alongside signature Kathmandu chili-garlic tomato chutney.',
    ingredients: ['Artisan Flour Dough', 'Fresh Spiced Vegetables', 'Chili Garlic Achaar', 'Spring Onions'],
    pairing: 'Nepali Organic Himalayan Tea',
    prepTime: '15 mins',
    calories: '440 kcal',
  },
  {
    id: '1',
    name: 'Truffle Mushroom Risotto',
    category: 'signatures',
    price: '$52',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800',
    tagline: 'Arborio Rice with Wild Porcini & Black Truffle Shavings',
    description: 'Slow-stirred Carnaroli rice enriched with wild porcini mushroom stock, finished with aged Parmigiano-Reggiano, hand-shaved black Périgord truffle, and a drizzle of cold-pressed truffle oil.',
    ingredients: ['Carnaroli Arborio Rice', 'Wild Porcini Mushrooms', 'Black Périgord Truffle', 'Parmigiano-Reggiano 36mo', 'Cold-Pressed Truffle Oil'],
    pairing: 'Barolo DOCG 2017',
    prepTime: '28 mins',
    calories: '580 kcal',
  },
  {
    id: '2',
    name: 'Gourmet Pan-Seared Salmon',
    category: 'seafood',
    price: '$48',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800',
    tagline: 'Crispy Skin Salmon with Saffron Butter & Asparagus',
    description: 'Wild-caught Norwegian Atlantic salmon, pan-seared to crispy perfection over lemon thyme infusion, served atop saffron beurre blanc and roasted asparagus spears.',
    ingredients: ['Norwegian Atlantic Salmon', 'Spanish Saffron', 'Organic Asparagus', 'Lemon Thyme', 'French Butter'],
    pairing: 'Chardonnay Reserve 2020',
    prepTime: '15 mins',
    calories: '480 kcal',
  },
  {
    id: '3',
    name: 'Crispy Artisanal Fries & Dips',
    category: 'signatures',
    price: '$24',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800',
    tagline: 'Triple-Cooked Hand Cut Fries with Truffle Aioli',
    description: 'Gold Yukon potatoes hand-cut and triple-cooked in duck fat, tossed with rosemary salt and served alongside house-made black truffle garlic aioli.',
    ingredients: ['Yukon Gold Potatoes', 'Duck Fat', 'Black Truffle Aioli', 'Fresh Rosemary', 'Sea Salt'],
    pairing: 'Craft Amber Ale',
    prepTime: '12 mins',
    calories: '420 kcal',
  },
  {
    id: '4',
    name: 'Glazed Gourmet Salmon Bowl',
    category: 'signatures',
    price: '$42',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=800',
    tagline: 'Honey-Glazed Atlantic Salmon with Organic Greens',
    description: 'Delicately roasted salmon glazed with wildflower honey and soy reduction, accompanied by heirloom wild rice and micro-greens.',
    ingredients: ['Wild Salmon', 'Wildflower Honey', 'Heirloom Rice', 'Micro Greens', 'Sesame Seeds'],
    pairing: 'Pinot Noir 2021',
    prepTime: '18 mins',
    calories: '510 kcal',
  },
  {
    id: '5',
    name: 'Roasted Heirloom Vegetable Plate',
    category: 'signatures',
    price: '$38',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    tagline: 'Seasonal Garden Harvest with Burrata & Balsamic Glaze',
    description: 'A stunning artist\'s palette of oven-roasted heirloom vegetables — tri-color carrots, golden beets, rainbow chard, and charred broccolini — served with velvety burrata and aged balsamic reduction.',
    ingredients: ['Heirloom Carrots', 'Golden Beets', 'Fresh Burrata', 'Rainbow Chard', 'Aged Balsamic Glaze'],
    pairing: 'Biodynamic Pinot Grigio 2022',
    prepTime: '22 mins',
    calories: '360 kcal',
  },
  {
    id: '6',
    name: 'Gold Saffron Chocolate Sphere',
    category: 'desserts',
    price: '$28',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
    tagline: 'Valrhona Dark Chocolate with Warm Caramel Pour',
    description: 'Handcrafted Valrhona 70% dark chocolate sphere filled with passionfruit mousse and edible 24k gold leaf, melted tableside with warm salted caramel sauce.',
    ingredients: ['Valrhona Dark Chocolate', '24k Gold Leaf', 'Passionfruit Mousse', 'Salted Caramel', 'Hazelnut Crunch'],
    pairing: 'Tawny Port 20 Year',
    prepTime: '10 mins',
    calories: '390 kcal',
  },
  {
    id: '7',
    name: 'Artisanal Berry Tartlet',
    category: 'desserts',
    price: '$22',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    tagline: 'Fresh Forest Berries with Vanilla Bean Custard',
    description: 'Crisp buttery pastry shell filled with Madagascar vanilla bean pastry cream, crowned with wild raspberries, blackberries, and mint syrup.',
    ingredients: ['Forest Berries', 'Madagascar Vanilla Bean', 'Pastry Crust', 'Organic Mint', 'Pistachio Dust'],
    pairing: 'Moscato d’Asti 2022',
    prepTime: '8 mins',
    calories: '310 kcal',
  },
  {
    id: '8',
    name: 'Flavoré Smoked Old Fashioned',
    category: 'cocktails',
    price: '$26',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=800',
    tagline: 'Single Barrel Bourbon Smoked with Hickory Wood',
    description: 'Small-batch bourbon stirred with Angostura bitters and organic maple syrup, infused tableside with hickory smoke and hand-carved ice sphere.',
    ingredients: ['Single Barrel Bourbon', 'Hickory Wood Smoke', 'Angostura Bitters', 'Organic Maple', 'Luxardo Cherry'],
    pairing: 'Fine Cigar Selection',
    prepTime: '5 mins',
    calories: '180 kcal',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Creations', tag: '01' },
  { id: 'nepali', label: 'Nepali Cuisine', tag: '02' },
  { id: 'signatures', label: 'Signatures', tag: '03' },
  { id: 'seafood', label: 'Seafood', tag: '04' },
  { id: 'vegetarian', label: 'Garden', tag: '05' },
  { id: 'desserts', label: 'Desserts', tag: '06' },
  { id: 'cocktails', label: 'Cocktails', tag: '07' },
];

const Professional3DCard: React.FC<{
  dish: DishItem;
  isCenter: boolean;
  onSelect: () => void;
}> = ({ dish, isCenter, onSelect }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [16, -16]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-20, 20]), { stiffness: 300, damping: 25 });

  const sheenX = useSpring(useTransform(rawX, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 20 });
  const sheenY = useSpring(useTransform(rawY, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isCenter) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(x);
    rawY.set(y);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      style={{
        rotateX: isCenter ? rotateX : 0,
        rotateY: isCenter ? rotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      className={`relative w-[280px] sm:w-[350px] rounded-3xl bg-card border p-5 shadow-xl backdrop-blur-xl cursor-pointer group transition-all duration-300 ${
        isCenter
          ? 'border-accent shadow-[0_15px_40px_rgba(212,165,116,0.25)] ring-1 ring-accent/30 scale-100'
          : 'border-border/40 opacity-60 blur-[1px]'
      }`}
    >
      {/* Specular Light Reflection Sweep */}
      {isCenter && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-30 overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(212,165,116,0.4) 0%, transparent 60%)`,
            transform: 'translateZ(1px)',
          }}
        />
      )}

      {/* Layer 1 (Z: 25px) - 3D Image Frame */}
      <div
        className="relative w-full h-[200px] sm:h-[230px] rounded-2xl overflow-hidden mb-4 border border-border/40 shadow-inner"
        style={{ transform: 'translateZ(25px)' }}
      >
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />

        {/* Price Badge */}
        <div
          className="absolute top-3 right-3 px-3.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-md"
          style={{ transform: 'translateZ(50px)' }}
        >
          {dish.price}
        </div>

        {/* Rating Badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground text-[11px] font-bold flex items-center gap-1.5 shadow-sm"
          style={{ transform: 'translateZ(50px)' }}
        >
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span>{dish.rating}</span>
        </div>
      </div>

      {/* Layer 3 (Z: 60px) - Dish Title & Subtitle */}
      <div style={{ transform: 'translateZ(60px)' }}>
        <h3 className="font-display font-semibold text-xl text-foreground truncate group-hover:text-accent transition-colors">
          {dish.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1 font-medium">
          {dish.tagline}
        </p>
      </div>

      {/* Layer 4 (Z: 80px) - Inspect Action Bar */}
      {isCenter && (
        <div
          className="mt-4 flex items-center justify-between text-xs text-accent font-semibold border-t border-border/40 pt-3"
          style={{ transform: 'translateZ(80px)' }}
        >
          <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
            <Eye className="w-4 h-4 text-accent" /> Inspect 3D Details
          </span>
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            Interactive
          </span>
        </div>
      )}
    </motion.div>
  );
};

export function Gallery3DSection() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDish, setActiveDish] = useState<DishItem | null>(null);

  const filteredDishes = GALLERY_DISHES.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredDishes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredDishes.length) % filteredDishes.length);
  };

  return (
    <section id="gallery-3d" className="relative py-20 bg-background text-foreground overflow-hidden select-none">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,165,116,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Experience</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-semibold text-3xl sm:text-5xl text-foreground tracking-wide"
          >
            Culinary Masterpieces
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm mt-3"
          >
            Explore our artisanal creations in full 3D interactive depth. Click any dish to inspect its ingredients and pairing details.
          </motion.p>
        </div>

        {/* Premium Layout: Left Vertical Category Scrub + Center 3D Stage */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Elegant Vertical Category Navigation */}
          <div className="lg:col-span-3 flex lg:flex-col flex-row flex-wrap justify-center gap-3 z-20">
            <div className="hidden lg:block text-xs font-bold uppercase tracking-[0.2em] text-accent/80 mb-2 pl-4 border-l-2 border-accent">
              Categories
            </div>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentIndex(0);
                  }}
                  className={`group relative flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-accent/15 text-accent font-semibold border border-accent/30 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground/60'}`}>
                      {cat.tag}
                    </span>
                    <span>{cat.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeCatIndicator"
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* 3D Cylindrical Stage */}
          <div className="lg:col-span-9 relative flex flex-col items-center justify-center min-h-[440px] sm:min-h-[500px]">
            <div
              className="relative w-full max-w-[850px] h-[400px] sm:h-[460px] flex items-center justify-center"
              style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
            >
              {filteredDishes.map((dish, i) => {
                const offset = (i - currentIndex + filteredDishes.length) % filteredDishes.length;
                let normalizeOffset = offset;
                if (offset > filteredDishes.length / 2) {
                  normalizeOffset = offset - filteredDishes.length;
                }

                const isCenter = normalizeOffset === 0;
                const isLeft = normalizeOffset === -1 || (currentIndex === 0 && i === filteredDishes.length - 1);
                const isRight = normalizeOffset === 1 || (currentIndex === filteredDishes.length - 1 && i === 0);

                let rotateY = normalizeOffset * 36;
                let translateZ = isCenter ? 120 : isLeft || isRight ? -130 : -360;
                let translateX = normalizeOffset * 250;
                let opacity = isCenter ? 1 : isLeft || isRight ? 0.75 : 0.15;
                let scale = isCenter ? 1.05 : 0.82;

                return (
                  <motion.div
                    key={dish.id}
                    animate={{
                      rotateY,
                      translateZ,
                      x: translateX,
                      scale,
                      opacity,
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Professional3DCard
                      dish={dish}
                      isCenter={isCenter}
                      onSelect={() => isCenter && setActiveDish(dish)}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Stage Navigation */}
            <div className="flex items-center gap-4 mt-6 z-20">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-card border border-border hover:border-accent text-foreground hover:text-accent transition-all cursor-pointer shadow-sm hover:scale-105"
                aria-label="Previous dish"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="px-4 py-1.5 rounded-full bg-secondary text-xs font-semibold text-muted-foreground tracking-wider">
                {currentIndex + 1} / {filteredDishes.length}
              </div>

              <button
                onClick={handleNext}
                className="p-3 rounded-full bg-card border border-border hover:border-accent text-foreground hover:text-accent transition-all cursor-pointer shadow-sm hover:scale-105"
                aria-label="Next dish"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dish Inspection Modal */}
      <AnimatePresence>
        {activeDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[720px] rounded-3xl bg-card border border-border p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveDish(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Image */}
                <div className="w-full md:w-1/2 h-[240px] md:h-[300px] rounded-2xl overflow-hidden border border-border relative shadow-md">
                  <img
                    src={activeDish.image}
                    alt={activeDish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-md">
                    {activeDish.price}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-background/90 text-foreground text-[11px] font-bold border border-border shadow-xs">
                    🔥 {activeDish.calories}
                  </div>
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20">
                      {activeDish.category}
                    </span>
                    <h3 className="font-display font-semibold text-2xl text-foreground mt-2">
                      {activeDish.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {activeDish.description}
                    </p>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-accent" /> Key Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDish.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border/50"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pairing & Reserve CTA */}
                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Sommelier Pairing:</span> {activeDish.pairing}
                    </div>

                    <button
                      onClick={() => {
                        setActiveDish(null);
                        navigate('/book-table');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-xs uppercase tracking-wider shadow-md hover:bg-accent/90 transition-all cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Reserve Table for This Dish</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
