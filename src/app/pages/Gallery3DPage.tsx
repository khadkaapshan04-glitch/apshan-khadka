import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowLeft,
  Utensils,
  Calendar,
  X,
  ChefHat,
  Eye,
  Flame,
  Award
} from 'lucide-react';
import { GoldenSpacePortal } from '../components/GoldenSpacePortal';
import { GoldenEmbersBackground } from '../components/GoldenEmbersBackground';

interface DishItem {
  id: string;
  name: string;
  category: 'signatures' | 'wagyu' | 'seafood' | 'desserts' | 'cocktails';
  price: string;
  rating: number;
  image: string;
  tagline: string;
  description: string;
  ingredients: string[];
  pairing: string;
  prepTime: string;
}

const GALLERY_DISHES: DishItem[] = [
  {
    id: '1',
    name: 'A5 Miyazaki Wagyu Steak',
    category: 'wagyu',
    price: '$120',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    tagline: 'Seared on Binchotan Charcoal with Truffle Glaze',
    description: 'Savor the world’s finest A5 Miyazaki Wagyu, lightly seared on Japanese white oak charcoal and finished with black winter truffle reduction and smoked Maldon salt crystals.',
    ingredients: ['A5 Miyazaki Wagyu', 'Black Winter Truffle', 'Binchotan Charcoal', 'Maldon Salt', 'Fuji Apple Glaze'],
    pairing: 'Cabernet Sauvignon 2018',
    prepTime: '20 mins',
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
  },
  {
    id: '5',
    name: 'Classic Gourmet Beef Burger',
    category: 'signatures',
    price: '$34',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800',
    tagline: 'Prime Dry-Aged Beef with Caramelized Shallots & Brioche',
    description: 'Dry-aged prime beef patty melted with Gruyère cheese, caramelized balsamic shallots, and smoked bacon jam on a toasted brioche bun.',
    ingredients: ['Dry-Aged Beef', 'Gruyère Cheese', 'Balsamic Shallots', 'Smoked Bacon Jam', 'Artisanal Brioche'],
    pairing: 'Bordeaux Blend 2019',
    prepTime: '15 mins',
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
  },
];

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
      {/* Golden Space Portal Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-80">
        <GoldenSpacePortal isWarping={isWarping} />
        <GoldenEmbersBackground />
      </div>

      {/* Dark Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(9,9,11,0.85)_100%)] pointer-events-none z-1" />

      {/* ── HEADER ── */}
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
              3D Luxury Gallery
            </p>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-amber-500/30 backdrop-blur-md">
          {[
            { id: 'all', label: 'All Creations' },
            { id: 'wagyu', label: 'Prime Wagyu' },
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
                  ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Storefront return button */}
        <button
          onClick={handleWarpToStorefront}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-zinc-950 text-xs font-black tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Main Storefront</span>
        </button>
      </header>

      {/* ── 3D GALLERY CAROUSEL ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col items-center justify-center py-6">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive 3D Showcase</span>
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 tracking-wide">
            Culinary Artistry in 3D
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Drag, tilt, and explore our master chef’s signature creations. Click any dish to inspect detail notes and reserve your dining experience.
          </p>
        </div>

        {/* 3D CAROUSEL PERSPECTIVE STAGE */}
        <div
          className="relative w-full max-w-[900px] h-[400px] sm:h-[480px] flex items-center justify-center"
          style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
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

            let rotateY = normalizeOffset * 35;
            let translateZ = isCenter ? 100 : isLeft || isRight ? -120 : -350;
            let translateX = normalizeOffset * 240;
            let opacity = isCenter ? 1 : isLeft || isRight ? 0.75 : 0.25;
            let scale = isCenter ? 1.08 : 0.85;

            return (
              <motion.div
                key={dish.id}
                onClick={() => isCenter && setActiveDish(dish)}
                animate={{
                  rotateY,
                  translateZ,
                  x: translateX,
                  scale,
                  opacity,
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute w-[280px] sm:w-[340px] rounded-3xl bg-zinc-900/90 border border-amber-500/30 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-2xl cursor-pointer group ${
                  isCenter ? 'z-30 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.3)]' : 'z-10'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 3D Dish Artwork */}
                <div className="relative w-full h-[200px] sm:h-[230px] rounded-2xl overflow-hidden mb-4 border border-zinc-800 shadow-inner">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                  {/* Price Tag Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-black tracking-wider shadow-lg">
                    {dish.price}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{dish.rating}</span>
                  </div>
                </div>

                {/* Info Details */}
                <h3 className="font-display font-bold text-lg text-amber-200 truncate">
                  {dish.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-medium">
                  {dish.tagline}
                </p>

                {/* Inspect Button Prompt */}
                {isCenter && (
                  <div className="mt-4 flex items-center justify-between text-xs text-amber-400 font-bold border-t border-amber-500/20 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Inspect 3D Details
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Tap Dish
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
            {currentIndex + 1} / {filteredDishes.length}
          </div>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* ── DISH 3D DETAIL MODAL ── */}
      <AnimatePresence>
        {activeDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[700px] rounded-3xl bg-zinc-900 border border-amber-500/40 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.2)] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveDish(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Artwork */}
                <div className="w-full md:w-1/2 h-[240px] md:h-[300px] rounded-2xl overflow-hidden border border-amber-500/30 relative">
                  <img
                    src={activeDish.image}
                    alt={activeDish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-black">
                    {activeDish.price}
                  </div>
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeDish.category}
                    </span>
                    <h3 className="font-display font-bold text-2xl text-amber-200 mt-2">
                      {activeDish.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 font-medium leading-relaxed">
                      {activeDish.description}
                    </p>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Key Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDish.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pairing & Action Button */}
                  <div className="pt-3 border-t border-zinc-800 flex flex-col gap-3">
                    <div className="text-xs text-zinc-400">
                      <span className="font-bold text-amber-400">Sommelier Pairing:</span> {activeDish.pairing}
                    </div>

                    <button
                      onClick={() => navigate('/book-table')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
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

      {/* ── FOOTER BAR ── */}
      <footer className="relative z-20 px-6 py-4 border-t border-amber-500/10 backdrop-blur-md bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-500">
        <div>© 2026 Flavoré Fine Dining. All Rights Reserved.</div>
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <Award className="w-4 h-4" /> 3 Michelin Star Culinary Standard
        </div>
      </footer>
    </div>
  );
};
