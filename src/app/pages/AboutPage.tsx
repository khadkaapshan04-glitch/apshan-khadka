import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, 
  Leaf, Utensils, Award, Sparkles, Instagram, Facebook, Twitter
} from 'lucide-react';
import { Tilt3DCard } from '../components/Tilt3DCard';

export function AboutPage() {
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="pt-[72px] min-h-screen pb-16 bg-background relative overflow-hidden">
      
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* ── HERO BANNER ── */}
      <section className="py-12 md:py-20 relative border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent text-xs font-bold uppercase tracking-[0.25em] mb-3 block">
              Discover Our Heritage
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
              About <span className="bg-gradient-to-r from-accent via-[#f3d0a8] to-accent bg-clip-text text-transparent">Flavoré</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto mt-4 leading-relaxed">
              A Culinary Journey Crafted with Passion, Dedicated to Serving Perfection in Every Single Detail.
            </p>
            <div className="w-16 h-0.5 bg-accent/40 mx-auto mt-6" />
          </motion.div>
        </div>
      </section>

      {/* ── OUR STORY SECTION ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid lg:grid-cols-12 gap-12 items-center"
        >
          {/* Story Narrative */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Since 2018</span>
            </div>
            
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              A Fusion of Tradition & Gastronomic Innovation
            </h2>
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Flavoré was founded on the belief that dining is not merely about sustenance, but a multisensory art form. 
              Our journey began in a boutique kitchen with a team of culinary artisans who shared a single, non-negotiable principle: 
              to source the absolute finest ingredients and treat them with profound respect.
            </p>
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Over the years, we have refined our craft, marrying classical cooking disciplines with cutting-edge textures and flavors. 
              Every plate we serve is a canvas reflecting our chefs' creativity, combining warm gold-accented styling with the vibrant 
              freshness of seasonal, locally harvested produce. We invite you to lose yourself in an ambiance of understated luxury 
              and taste.
            </p>

            <blockquote className="border-l-2 border-accent pl-4 italic text-sm text-foreground/90 font-display py-1 bg-accent/5 rounded-r-lg pr-2">
              "Gastronomy is the art of using food to create happiness. At Flavoré, we formulate memories, one course at a time."
              <cite className="block text-[10px] font-sans font-bold uppercase tracking-wider text-accent mt-1 not-italic">
                — Chef de Cuisine
              </cite>
            </blockquote>
          </motion.div>

          {/* Story Image Panel */}
          <motion.div variants={itemVariants} className="lg:col-span-5 relative group">
            <div className="absolute inset-0 border border-accent/20 rounded-2xl translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-all duration-300 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/40 aspect-4/3">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" 
                alt="Flavoré Dining Room Ambiance"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CULINARY PHILOSOPHY ── */}
      <section className="py-16 bg-card/25 border-y border-border/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-accent text-[10px] font-bold uppercase tracking-[0.25em] mb-2 block">Our Pillars</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">The Culinary Philosophy</h2>
            <div className="w-12 h-0.5 bg-accent/40 mx-auto mt-4" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Leaf,
                title: "100% Organic & Fresh",
                desc: "We partner exclusively with sustainable local micro-farms to deliver pristine, pesticide-free ingredients that burst with clean, unadulterated flavor."
              },
              {
                icon: Utensils,
                title: "Artisanal Technique",
                desc: "Our culinary staff employs slow-cooking, wood-fire roasting, and precise emulsification to respect the ingredients while unlocking deep profiles."
              },
              {
                icon: Award,
                title: "Impeccable Service",
                desc: "From the moment you step through our doors, your experience is tailored with discretion, warmth, and a genuine passion for hospitality."
              }
            ].map((item, index) => (
              <Tilt3DCard key={index} tiltIntensity={6} glareEnabled={true}>
                <motion.div 
                  variants={itemVariants}
                  className="bg-card/40 backdrop-blur-md border border-border/40 p-8 rounded-2xl h-full flex flex-col items-center text-center hover:border-accent/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-grow">{item.desc}</p>
                </motion.div>
              </Tilt3DCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT & LOCATION SECTION ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Info & Map Mockup */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-accent text-[10px] font-bold uppercase tracking-[0.25em] mb-2 block">Reach Us</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Contact & Location</h2>
              <p className="text-xs text-muted-foreground mt-2">
                Have questions or need special banquet accommodations? We are always here to assist you.
              </p>
            </div>

            {/* Quick Contact Specs */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/30 border border-border/40 hover:border-accent/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Our Location</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    128 Gourmet Avenue, Culinary District<br />New York, NY 10001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/30 border border-border/40 hover:border-accent/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Reservations & Inquiries</h4>
                  <p className="text-xs text-muted-foreground hover:text-accent transition-colors font-medium">
                    <a href="tel:+15558392910">+1 (555) 839-2910</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/30 border border-border/40 hover:border-accent/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Email Correspondence</h4>
                  <p className="text-xs text-muted-foreground hover:text-accent transition-colors font-medium">
                    <a href="mailto:info@flavore.com">info@flavore.com</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/30 border border-border/40 hover:border-accent/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Opening Hours</h4>
                  <div className="text-[11px] text-muted-foreground space-y-1 mt-0.5">
                    <div className="flex justify-between gap-6">
                      <span>Lunch Service:</span>
                      <span className="font-semibold">11:30 AM – 3:00 PM</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span>Dinner Service:</span>
                      <span className="font-semibold text-accent">5:30 PM – 11:00 PM</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 italic mt-0.5">Kitchen orders close 45 minutes prior.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium CSS-Mockup Map Component */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-secondary/35 p-4 aspect-[16/10] flex flex-col justify-between">
              {/* Map gridlines mock */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-foreground" />
                ))}
              </div>
              
              {/* Abstract Roads Mockup */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-1/2 left-0 right-0 h-4 bg-foreground/40 rotate-6" />
                <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-foreground/40 -rotate-12" />
                <div className="absolute top-1/4 bottom-0 right-1/4 w-3 bg-foreground/40 rotate-45" />
              </div>

              {/* Glowing Location Pins */}
              <div className="absolute top-1/2 left-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-accent shadow-lg shadow-accent/50 border border-white/20"></span>
                </span>
                <div className="mt-1 bg-background/90 backdrop-blur-xs border border-accent/35 rounded-md px-2 py-0.5 shadow-md">
                  <span className="text-[8px] font-bold text-accent uppercase tracking-wider">Flavoré</span>
                </div>
              </div>

              {/* Map UI overlays */}
              <div className="z-10 bg-background/80 backdrop-blur-md border border-border/30 rounded-lg p-2.5 max-w-[200px] shadow-sm self-start">
                <span className="text-[9px] font-bold text-foreground block">Flavoré Bistro & Grill</span>
                <span className="text-[8px] text-muted-foreground block mt-0.5 leading-tight">128 Gourmet Ave, Culinary District</span>
              </div>

              <div className="z-10 flex justify-between items-center w-full">
                <span className="text-[9px] font-semibold text-muted-foreground bg-background/60 backdrop-blur-xs px-2 py-1 rounded-md border border-border/30">
                  © OpenMap Mock
                </span>
                <div className="flex gap-1.5">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-6 h-6 rounded-md bg-background/80 hover:bg-accent/15 border border-border/40 hover:border-accent/40 flex items-center justify-center transition-all">
                    <Instagram className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-6 h-6 rounded-md bg-background/80 hover:bg-accent/15 border border-border/40 hover:border-accent/40 flex items-center justify-center transition-all">
                    <Facebook className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-6 h-6 rounded-md bg-background/80 hover:bg-accent/15 border border-border/40 hover:border-accent/40 flex items-center justify-center transition-all">
                    <Twitter className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-card/25 backdrop-blur-lg border border-border/40 rounded-3xl p-6 md:p-10 shadow-2xl relative">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-1">Send a Message</h3>
                      <p className="text-xs text-muted-foreground">Fill in the fields below and our staff will respond within 24 hours.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 text-xs bg-background/55 border rounded-xl focus:outline-hidden focus:border-accent/60 focus:ring-1 focus:ring-accent/15 transition-all text-foreground ${
                            errors.name ? 'border-red-400' : 'border-border/60'
                          }`}
                          placeholder="Your name"
                        />
                        {errors.name && <span className="text-[10px] text-red-400 block font-medium mt-0.5">{errors.name}</span>}
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 text-xs bg-background/55 border rounded-xl focus:outline-hidden focus:border-accent/60 focus:ring-1 focus:ring-accent/15 transition-all text-foreground ${
                            errors.email ? 'border-red-400' : 'border-border/60'
                          }`}
                          placeholder="you@example.com"
                        />
                        {errors.email && <span className="text-[10px] text-red-400 block font-medium mt-0.5">{errors.email}</span>}
                      </div>
                    </div>

                    {/* Subject input */}
                    <div className="space-y-1.5">
                      <label htmlFor="subject" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-xs bg-background/55 border rounded-xl focus:outline-hidden focus:border-accent/60 focus:ring-1 focus:ring-accent/15 transition-all text-foreground ${
                          errors.subject ? 'border-red-400' : 'border-border/60'
                        }`}
                        placeholder="Inquiry topic (e.g. Banquet booking, dietary info)"
                      />
                      {errors.subject && <span className="text-[10px] text-red-400 block font-medium mt-0.5">{errors.subject}</span>}
                    </div>

                    {/* Message input */}
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-xs bg-background/55 border rounded-xl focus:outline-hidden focus:border-accent/60 focus:ring-1 focus:ring-accent/15 transition-all text-foreground resize-none ${
                          errors.message ? 'border-red-400' : 'border-border/60'
                        }`}
                        placeholder="Write your message here..."
                      />
                      {errors.message && <span className="text-[10px] text-red-400 block font-medium mt-0.5">{errors.message}</span>}
                    </div>

                    {/* Submit button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-accent text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Transmit Message</span>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-message"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="py-12 text-center flex flex-col items-center justify-center space-y-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                    
                    <h3 className="font-display text-2xl font-bold text-foreground">Message Transmitted!</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting Flavoré. A member of our hospitality team has received your inquiry and will follow up with you shortly via email.
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 rounded-xl border border-border/80 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-accent/5 transition-all mt-4 cursor-pointer"
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
