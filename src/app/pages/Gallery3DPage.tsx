import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowLeft,
  Calendar,
  X,
  ChefHat,
  Eye,
  Award,
  RotateCcw,
  Flame,
  Info
} from 'lucide-react';
import { GoldenSpacePortal } from '../components/GoldenSpacePortal';
import { GoldenEmbersBackground } from '../components/GoldenEmbersBackground';

interface DishItem {
  id: string;
  name: string;
  category: 'signatures' | 'vegetarian' | 'seafood' | 'desserts' | 'cocktails';
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

const GALLERY_DISHES: DishItem[] = [
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

/* ─────────────────────────────────────────────────────────
   Ray-Traced Interactive 3D Card Component
   Multi-depth Z-layering with dynamic specular sheen
   ───────────────────────────────────────────────────────── */
const Professional3DCard: React.FC<{
  dish: DishItem;
  isCenter: boolean;
  onSelect: () => void;
}> = ({ dish, isCenter, onSelect }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Mouse tilt tracking
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [18, -18]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-22, 22]), { stiffness: 300, damping: 25 });

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
      className={`relative w-[290px] sm:w-[360px] rounded-3xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black border border-amber-500/30 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl cursor-pointer group transition-all duration-300 ${
        isCenter
          ? 'border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40'
          : 'opacity-70 blur-[1px]'
      }`}
    >
      {/* Specular Light Reflection Sweep */}
      {isCenter && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
            transform: 'translateZ(1px)',
          }}
        />
      )}

      {/* Layer 1 (Z: 25px) - 3D Image Frame */}
      <div
        className="relative w-full h-[210px] sm:h-[240px] rounded-2xl overflow-hidden mb-4 border border-zinc-800 shadow-2xl"
        style={{ transform: 'translateZ(25px)' }}
      >
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-85" />

        {/* Layer 2 (Z: 50px) - Price Badge */}
        <div
          className="absolute top-3 right-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 text-xs font-black tracking-wider shadow-[0_4px_15px_rgba(245,158,11,0.5)] border border-amber-300/40"
          style={{ transform: 'translateZ(50px)' }}
        >
          {dish.price}
        </div>

        {/* Layer 2 (Z: 50px) - Rating Badge */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full bg-zinc-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-extrabold flex items-center gap-1.5 shadow-lg"
          style={{ transform: 'translateZ(50px)' }}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{dish.rating}</span>
        </div>
      </div>

      {/* Layer 3 (Z: 60px) - Dish Title & Subtitle */}
      <div style={{ transform: 'translateZ(60px)' }}>
        <h3 className="font-display font-bold text-xl text-amber-200 truncate group-hover:text-amber-300 transition-colors">
          {dish.name}
        </h3>
        <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-medium">
          {dish.tagline}
        </p>
      </div>

      {/* Layer 4 (Z: 80px) - Inspect Action Bar */}
      {isCenter && (
        <div
          className="mt-4 flex items-center justify-between text-xs text-amber-400 font-bold border-t border-amber-500/25 pt-3"
          style={{ transform: 'translateZ(80px)' }}
        >
          <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
            <Eye className="w-4 h-4 text-amber-400" /> Inspect 3D Details
          </span>
          <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner">
            Interactive
          </span>
        </div>
      )}
    </motion.div>
  );
};

/* ═════════════════════════════════════════════════════════
   GALLERY 3D PAGE MAIN COMPONENT
   ═════════════════════════════════════════════════════════ */
export const Gallery3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDish, setActiveDish] = useState<DishItem | null>(null);
  const [isWarping, setIsWarping] = useState(false);

  const filteredDishes = GALLERY_DISHES.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredDishes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredDishes.length) % filteredDishes.length);
  };

  const handleWarpToStorefront = () => {
    setIsWarping(true);
    setTimeout(() => {
      navigate('/home');
    }, 1100);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* 3D Golden Space Portal Engine Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-85">
        <GoldenSpacePortal isWarping={isWarping} />
        <GoldenEmbersBackground />
      </div>

      {/* Dark Ambient Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,9,11,0.9)_100%)] pointer-events-none z-1" />

      {/* ── HEADER NAVIGATION ── */}
      <header className="relative z-30 px-6 lg:px-12 py-6 flex items-center justify-between border-b border-amber-500/20 backdrop-blur-xl bg-zinc-950/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-amber-400">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-amber-200 tracking-wider leading-none">
              FLAVORÉ
            </h1>
            <p className="text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-semibold mt-0.5">
              3D Cinema Gallery
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/80 border border-amber-500/30 backdrop-blur-md shadow-xl">
          {[
            { id: 'all', label: 'All Creations' },
            { id: 'vegetarian', label: 'Garden Creations' },
            { id: 'seafood', label: 'Seafood' },
            { id: 'signatures', label: 'Signatures' },
            { id: 'desserts', label: 'Desserts' },
            { id: 'cocktails', label: 'Cocktails' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Storefront Navigation Button */}
        <button
          onClick={handleWarpToStorefront}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-zinc-950 text-xs font-black tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Main Storefront</span>
        </button>
      </header>

      {/* ── MAIN 3D CYLINDRICAL GALLERY STAGE ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col items-center justify-center py-6">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wider uppercase mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Ray-Traced 3D Depth Gallery</span>
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 tracking-wide">
            Culinary Masterpieces
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Hover over the active dish to experience interactive 3D perspective depth and light reflection. Click any card to inspect full details.
          </p>
        </div>

        {/* 3D PERSPECTIVE STAGE CONTAINER */}
        <div
          className="relative w-full max-w-[950px] h-[420px] sm:h-[500px] flex items-center justify-center"
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

            let rotateY = normalizeOffset * 38;
            let translateZ = isCenter ? 120 : isLeft || isRight ? -140 : -380;
            let translateX = normalizeOffset * 260;
            let opacity = isCenter ? 1 : isLeft || isRight ? 0.75 : 0.2;
            let scale = isCenter ? 1.1 : 0.82;

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
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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

        {/* Stage Carousel Navigation Bar */}
        <div className="flex items-center gap-5 mt-6">
          <button
            onClick={handlePrev}
            className="p-3.5 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-5 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-black text-amber-300 tracking-widest uppercase">
            {currentIndex + 1} / {filteredDishes.length}
          </div>

          <button
            onClick={handleNext}
            className="p-3.5 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* ── 3D DISH INSPECTION MODAL ── */}
      <AnimatePresence>
        {activeDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 25 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[760px] rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-amber-500/50 p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.25)] overflow-hidden"
            >
              {/* Top Glow Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setActiveDish(null)}
                className="absolute top-5 right-5 p-2.5 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* 3D High-Res Dish View */}
                <div className="w-full md:w-1/2 h-[260px] md:h-[320px] rounded-2xl overflow-hidden border border-amber-500/40 relative shadow-2xl group">
                  <img
                    src={activeDish.image}
                    alt={activeDish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 text-xs font-black shadow-lg">
                    {activeDish.price}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-zinc-950/85 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-500/30">
                    🔥 {activeDish.calories}
                  </div>
                </div>

                {/* Detailed Specifications */}
                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {activeDish.category}
                    </span>
                    <h3 className="font-display font-bold text-2xl md:text-3xl text-amber-200 mt-2">
                      {activeDish.name}
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1.5 font-medium leading-relaxed">
                      {activeDish.description}
                    </p>
                  </div>

                  {/* Ingredients Tags */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ChefHat className="w-3.5 h-3.5" /> Key Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDish.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pairing & Action Trigger */}
                  <div className="pt-3 border-t border-zinc-800 space-y-3">
                    <div className="text-xs text-zinc-400">
                      <span className="font-bold text-amber-400">Sommelier Pairing:</span> {activeDish.pairing}
                    </div>

                    <button
                      onClick={() => navigate('/book-table')}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all cursor-pointer"
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

      {/* ── FOOTER ── */}
      <footer className="relative z-20 px-6 py-4 border-t border-amber-500/10 backdrop-blur-md bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-500">
        <div>© 2026 Flavoré Fine Dining. All Rights Reserved.</div>
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <Award className="w-4 h-4" /> 3 Michelin Star Culinary Standard
        </div>
      </footer>
    </div>
  );
};
