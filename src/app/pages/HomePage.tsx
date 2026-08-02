import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  Calendar,
  Truck,
  Headphones,
  Users,
  Award,
  Trophy,
  Star,
  Heart,
  Sparkles,
  UtensilsCrossed,
  Flame,
  Leaf,
} from 'lucide-react';

import uploadedFoodImg from '../../imports/Minimalistic_simple_food_design_202605251743-1.jpeg';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { FloatingFood3D } from '../components/FloatingFood3D';
import { Hero3DBackground } from '../components/Hero3DBackground';
import { OrbitalRing3D } from '../components/OrbitalRing3D';
import { Tilt3DCard } from '../components/Tilt3DCard';
import { AnimatedWaveDivider } from '../components/AnimatedWaveDivider';
import { WindAndGrass } from '../components/WindAndGrass';
import { InfiniteMarquee } from '../components/ui/InfiniteMarquee';
import { SpotlightBento } from '../components/ui/SpotlightBento';
import { GoldenSpacePortal } from '../components/GoldenSpacePortal';
import { Gallery3DSection } from '../components/Gallery3DSection';

import type { UserProfile } from '../lib/types';

// Keep these values identical to the original App.tsx
const foodImages = [
  "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwc2FsbW9uJTIwZGlzaCUyMHBsYXRlZHxlbnwxfHx8fDE3Nzk2NzM1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  uploadedFoodImg,
  "https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwcGxhdGVkJTIwZGlzaHxlbnwxfHx8fDE3Nzk3MTA1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1673912402587-57ac40f1b4a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF0ZWQlMjBkZXNzZXJ0fGVufDF8fHx8MTc3OTcxMDU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
} as any;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
} as any;


const features = [
  { icon: ChefHat, title: 'Quality Food', desc: 'Fresh ingredients, perfectly cooked.' },
  { icon: Calendar, title: 'Easy Booking', desc: 'Reserve your table in just a few clicks.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Delicious food delivered to you.' },
  { icon: Headphones, title: '24/7 Support', desc: "We're here to help you anytime." },
];

const stats = [
  { icon: Users, value: '10K+', label: 'Happy Customers' },
  { icon: Award, value: '50+', label: 'Delicious Dishes' },
  { icon: Trophy, value: '5+', label: 'Years of Service' },
  { icon: Star, value: '4.8', label: 'Customer Rating' },
];

type HomePageProps = {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
};

export function HomePage({ currentUser, onOpenAuth }: HomePageProps) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.96]);

  // Parallax transforms for scroll depth
  const parallaxY1 = useTransform(scrollY, [0, 600], [0, -80]);
  const parallaxY2 = useTransform(scrollY, [0, 600], [0, -40]);
  const parallaxY3 = useTransform(scrollY, [0, 600], [0, -120]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isWarping, setIsWarping] = React.useState(false);

  const handleEnterGallery = () => {
    setIsWarping(true);
    setTimeout(() => {
      navigate('/gallery');
      setTimeout(() => setIsWarping(false), 500);
    }, 1500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 20,
      y: (clientY / innerHeight - 0.5) * 20,
    });
  };

  return (
    <div className="pt-[72px] min-h-screen overflow-x-hidden" onMouseMove={handleMouseMove}>
      <section className="relative min-h-screen flex items-center">
        {/* ── 3D Animated Background ── */}
        <Hero3DBackground mousePos={mousePos} />

        {/* ── Wind (Air) and Swaying Grass ── */}
        <WindAndGrass />

        {/* ── Animated corner arc ── */}
        <div className="absolute top-0 right-0 w-[280px] md:w-[480px] h-[280px] md:h-[480px] pointer-events-none overflow-hidden">
          <motion.svg
            viewBox="0 0 400 400"
            className="w-full h-full opacity-[0.07]"
            animate={{ rotate: [0, 3, -2, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="400" cy="0" r="310" fill="none" stroke="#d4a574" strokeWidth="90" />
          </motion.svg>
        </div>

        {/* ── Floating accent lines (parallax depth) ── */}
        <motion.div
          className="absolute top-[15%] left-[8%] w-24 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none"
          style={{ y: parallaxY1 }}
          animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[35%] right-[12%] w-16 h-[1px] bg-gradient-to-r from-transparent via-accent/15 to-transparent pointer-events-none"
          style={{ y: parallaxY2 }}
          animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[22%] w-20 h-[1px] bg-gradient-to-r from-transparent via-accent/10 to-transparent pointer-events-none"
          style={{ y: parallaxY3 }}
          animate={{ scaleX: [0.7, 1, 0.7], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-2 items-center gap-6 md:gap-8 py-8 md:py-14 lg:py-20">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="relative z-10"
            >
              {/* Animated accent bar */}
              <motion.div
                className="w-12 h-[3px] bg-accent rounded-full mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
              />

              <motion.h1 variants={fadeUp} className="font-display leading-[1.08] mb-5">
                <motion.span
                  className="block text-[2rem] sm:text-[2.6rem] md:text-[3.1rem] lg:text-[4rem] font-semibold text-foreground"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, var(--foreground) 0%, #d4a574 50%, var(--foreground) 100%)',
                    backgroundSize: '200% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Delicious Food,
                </motion.span>
                <span className="block text-[2rem] sm:text-[2.6rem] md:text-[3.1rem] lg:text-[4rem] font-semibold text-foreground">
                  Perfect <span className="text-accent italic">Experience</span>
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-[0.93rem] text-muted-foreground leading-relaxed max-w-[390px] mb-10"
              >
                Good food brings people together. We serve flavors that stay with you, moments that bring you back.
              </motion.p>

              {/* ── 3D Tilt Feature Cards ── */}
              <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 max-w-[600px]">
                {features.map((f) => (
                  <Tilt3DCard
                    key={f.title}
                    tiltIntensity={12}
                      onClick={() => {
                        if (f.title.includes("Booking")) {
                          navigate('/book-table');
                        } else if (f.title.includes("Food") || f.title.includes("Delivery")) {
                          navigate('/menu');
                        } else if (f.title.includes("Support")) {
                          navigate('/about');
                        }
                      }}
                  >
                    <motion.div
                      variants={fadeUp}
                      whileHover={{ y: -5, scale: 1.025 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-white/75 backdrop-blur-sm border border-border/35 rounded-2xl p-4 cursor-pointer group hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
                    >
                      <motion.div
                        className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors duration-300"
                        whileHover={{
                          rotateY: [0, 180, 360],
                        }}
                        transition={{ duration: 0.6 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <f.icon className="w-[18px] h-[18px] text-accent" strokeWidth={1.5} />
                      </motion.div>
                      <div className="text-[11px] font-semibold text-foreground mb-0.5 leading-tight">{f.title}</div>
                      <div className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</div>
                    </motion.div>
                  </Tilt3DCard>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Hero Image with 3D Orbital Rings ── */}
            <motion.div
              style={{ scale: heroScale }}
              initial={{ opacity: 0, x: 55 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="relative flex items-center justify-center"
            >
              {/* Radial glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 65% at 55% 50%, rgba(212,165,116,0.13) 0%, transparent 70%)',
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Animated botanical/plant SVG */}
              <div className="absolute left-[4%] top-1/2 -translate-y-[48%] w-28 md:w-44 h-40 md:h-60 pointer-events-none z-10 hidden sm:block">
                <svg viewBox="0 0 200 300" className="w-full h-full" fill="none">
                  <motion.g
                    animate={{ rotate: [0, 1.8, -1, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: '100px 285px' }}
                  >
                    <path d="M100 285 Q97 230 104 170 Q100 110 91 52" stroke="#6a9459" strokeWidth="2.4" strokeLinecap="round" />
                    <motion.path
                      d="M101 182 Q145 155 162 118 Q136 148 103 178"
                      fill="#88b874"
                      animate={{ rotate: [0, 3, 0] }}
                      transition={{ duration: 4.2, repeat: Infinity, delay: 0.4 }}
                      style={{ transformOrigin: '101px 182px' }}
                    />
                    <motion.path
                      d="M101 145 Q150 112 168 72 Q140 104 103 142"
                      fill="#79aa65"
                      animate={{ rotate: [0, 4, 0] }}
                      transition={{ duration: 3.8, repeat: Infinity, delay: 0.1 }}
                      style={{ transformOrigin: '101px 145px' }}
                    />
                    <motion.path
                      d="M98 105 Q135 72 148 40 Q124 70 96 102"
                      fill="#6ba058"
                      animate={{ rotate: [0, 2.5, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, delay: 0.6 }}
                      style={{ transformOrigin: '98px 105px' }}
                    />
                    <motion.path
                      d="M101 182 Q57 150 36 112 Q66 143 100 178"
                      fill="#93c07e"
                      animate={{ rotate: [0, -2.5, 0] }}
                      transition={{ duration: 4.6, repeat: Infinity, delay: 0.9 }}
                      style={{ transformOrigin: '101px 182px' }}
                    />
                    <motion.path
                      d="M101 145 Q54 108 32 68 Q63 100 100 142"
                      fill="#82b46c"
                      animate={{ rotate: [0, -3, 0] }}
                      transition={{ duration: 4.0, repeat: Infinity, delay: 0.7 }}
                      style={{ transformOrigin: '101px 145px' }}
                    />
                    <motion.path
                      d="M98 105 Q64 70 50 36 Q74 66 96 102"
                      fill="#73a35f"
                      animate={{ rotate: [0, -2, 0] }}
                      transition={{ duration: 3.9, repeat: Infinity, delay: 0.3 }}
                      style={{ transformOrigin: '98px 105px' }}
                    />
                    <path d="M91 55 Q97 36 88 16 Q93 36 90 54" fill="#5f8f4e" />
                  </motion.g>
                </svg>
              </div>

              {/* ── 3D Orbital Rings around food ── */}
              <OrbitalRing3D />

              <motion.div
                className="relative z-20 w-[250px] h-[250px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] lg:w-[490px] lg:h-[490px] mx-auto md:mx-0"
                animate={{
                  y: [0, -10, 0],
                  rotateX: -mousePos.y,
                  rotateY: mousePos.x
                }}
                transition={{
                  y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
                  rotateX: { type: 'spring', stiffness: 100, damping: 30 },
                  rotateY: { type: 'spring', stiffness: 100, damping: 30 }
                }}
                style={{ perspective: 1000 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, y: 15, rotateY: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, rotateY: 20, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute top-0 left-0 w-full h-full"
                  >
                    <div className="relative w-full h-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]">
                      <ImageWithFallback
                        src={foodImages[currentImageIndex]}
                        alt="Gourmet food plate"
                        className="w-full h-full object-cover"
                        style={{
                          maskImage:
                            'radial-gradient(ellipse 58% 56% at 52% 50%, black 28%, rgba(0,0,0,0.55) 46%, transparent 68%)',
                          WebkitMaskImage:
                            'radial-gradient(ellipse 58% 56% at 52% 50%, black 28%, rgba(0,0,0,0.55) 46%, transparent 68%)',
                        }}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* ── "Made with love" badge with 3D pop ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.82, x: 18, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.06, rotateY: 10, z: 30 }}
                className="absolute right-0 top-[38%] z-30 bg-white/96 backdrop-blur-sm rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg cursor-pointer flex items-center gap-2 hidden sm:flex"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                </motion.div>
                <span className="text-xs font-semibold text-foreground font-body">Made with love</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Animated Wave Divider ── */}
      <AnimatedWaveDivider />
      <section className="py-12 border-t border-b border-border/30 bg-card/10 overflow-hidden">
        <InfiniteMarquee
          items={[
            "✦ Artisan Ingredients",
            "✦ Michelin-star Chefs",
            "✦ Fast & Fresh Delivery",
            "✦ Exquisite Dining Experience",
            "✦ Organic & Local",
            "✦ 24/7 Support"
          ]}
          speed={25}
          itemClassName="text-lg md:text-2xl font-display font-semibold text-foreground/80"
        />
      </section>

      {/* ── Embedded 3D Gallery Section ── */}
      <Gallery3DSection />

      {/* ── "The Flavoré Experience" / Crafted for the Senses (End Section) ── */}
      <section id="experience" className="py-20 md:py-32 relative bg-background border-t border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">The Flavoré Experience</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Crafted for the senses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every dish is a masterpiece designed to delight your palate. Experience dining elevated by passion, precision, and the finest ingredients.
            </p>
          </motion.div>

          <SpotlightBento
            items={[
              {
                title: 'Signature Wood-Fired',
                description: 'Our pizzas and roasted specialties are cooked to perfection in an authentic imported wood-fired oven.',
                icon: <Flame className="w-6 h-6" />,
                colSpan: 2,
                bgImage: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMG92ZW58ZW58MXx8fHwxNzc5NzEwNTYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
              },
              {
                title: 'Farm to Table',
                description: 'We source 100% of our organic produce directly from local farms every morning.',
                icon: <Leaf className="w-6 h-6" />,
                colSpan: 1,
              },
              {
                title: 'Gourmet Selection',
                description: 'Explore a curated menu of contemporary classics and daring new flavor combinations.',
                icon: <UtensilsCrossed className="w-6 h-6" />,
                colSpan: 1,
              },
              {
                title: 'Award-Winning Chefs',
                description: 'Our kitchen is helmed by culinary artists with decades of experience at Michelin-starred venues globally.',
                icon: <Award className="w-6 h-6" />,
                colSpan: 2,
                bgImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmfGVufDF8fHx8MTc3OTcxMDU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
              },
            ]}
          />
        </div>
      </section>

      {/* ── Bottom Wave ── */}
      <AnimatedWaveDivider flip />
    </div>
  );
}
