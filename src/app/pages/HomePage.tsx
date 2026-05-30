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
} from 'lucide-react';

import uploadedFoodImg from '../../imports/Minimalistic_simple_food_design_202605251743-1.jpeg';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';

import { mockDb, UserProfile, type Reservation, type Order } from '../utils/mockDb';

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

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-[72px] min-h-screen">
      <section className="relative min-h-screen flex items-center">
        <div className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none overflow-hidden">
          <svg viewBox="0 0 400 400" className="w-full h-full opacity-[0.07]">
            <circle cx="400" cy="0" r="310" fill="none" stroke="#d4a574" strokeWidth="90" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-2 items-center gap-8 py-14 lg:py-20">
            <motion.div
              style={{ opacity: heroOpacity }}
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="relative z-10"
            >
              <motion.div
                className="w-12 h-[3px] bg-accent rounded-full mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
              />

              <motion.h1 variants={fadeUp} className="font-display leading-[1.08] mb-5">
                <span className="block text-[3.1rem] lg:text-[4rem] font-semibold text-foreground">Delicious Food,</span>
                <span className="block text-[3.1rem] lg:text-[4rem] font-semibold text-foreground">
                  Perfect <span className="text-accent italic">Experience</span>
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-[0.93rem] text-muted-foreground leading-relaxed max-w-[390px] mb-10"
              >
                Good food brings people together. We serve flavors that stay with you, moments that bring you back.
              </motion.p>

              <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-[600px]">
                {features.map((f) => (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    whileHover={{ y: -5, scale: 1.025 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => {
                      if (f.title.includes("Booking")) {
                        navigate('/book-table');
                      } else if (f.title.includes("Food") || f.title.includes("Delivery")) {
                        navigate('/menu');
                      }
                    }}
                    className="bg-white/75 backdrop-blur-sm border border-border/35 rounded-2xl p-4 cursor-pointer group hover:border-accent/30 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors duration-300">
                      <f.icon className="w-[18px] h-[18px] text-accent" strokeWidth={1.5} />
                    </div>
                    <div className="text-[11px] font-semibold text-foreground mb-0.5 leading-tight">{f.title}</div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              style={{ scale: heroScale }}
              initial={{ opacity: 0, x: 55 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="relative flex items-center justify-center"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 65% at 55% 50%, rgba(212,165,116,0.13) 0%, transparent 70%)',
                }}
              />

              <div className="absolute left-[4%] top-1/2 -translate-y-[48%] w-44 h-60 pointer-events-none z-10">
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

              <motion.div
                className="relative z-20 w-[400px] h-[400px] lg:w-[490px] lg:h-[490px]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute top-0 left-0 w-full h-full"
                  >
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
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.82, x: 18 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.06 }}
                className="absolute right-0 top-[38%] z-30 bg-white/96 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg cursor-pointer flex items-center gap-2"
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

      <section className="border-t border-border/35 py-14 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} whileHover={{ y: -6 }} className="text-center group cursor-pointer">
                <motion.div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-3 group-hover:bg-accent/20 transition-colors duration-300"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <s.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 + 0.3, type: 'spring', stiffness: 180 }}
                >
                  <div className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-1">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

