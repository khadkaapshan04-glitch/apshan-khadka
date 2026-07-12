import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { db } from '../lib/supabaseDb';
import { Reservation, UserProfile, RestaurantTable, toRestaurantTableWithPosition } from '../lib/types';
import { FloatingFood3D } from '../components/FloatingFood3D';
import { TableLayout } from '../components/TableLayout';

interface BookTablePageProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export function BookTablePage({ currentUser, onOpenAuth }: BookTablePageProps) {
  // Reservation Form States
  const [resName, setResName] = useState(currentUser?.fullName || '');
  const [resEmail, setResEmail] = useState(currentUser?.email || '');
  const [resPhone, setResPhone] = useState('');
  const [resGuests, setResGuests] = useState(2);
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('18:00');
  const [resSuccess, setResSuccess] = useState<any | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Table Selection States
  const [allTables, setAllTables] = useState<any[]>([]);
  const [availableTableIds, setAvailableTableIds] = useState<string[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await db.getTables();
        setAllTables(data.map(toRestaurantTableWithPosition));
      } catch (e) {
        console.error('Error fetching tables on BookTablePage:', e);
      }
    };
    fetchTables();
  }, []);

  useEffect(() => {
    const fetchAvailable = async () => {
      if (resDate && resTime && resGuests) {
        try {
          const available = await db.getAvailableTables(resDate, resTime, resGuests);
          setAvailableTableIds(available.map(t => t.id));

          // If previously selected table is no longer available, deselect it
          if (selectedTableId && !available.some(t => t.id === selectedTableId)) {
            setSelectedTableId(null);
          }
        } catch (e) {
          console.error('Error fetching available tables:', e);
        }
      }
    };
    fetchAvailable();
  }, [resDate, resTime, resGuests, selectedTableId]);

  useEffect(() => {
    if (currentUser) {
      setResName(currentUser.fullName);
      setResEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleJoinWaitlist = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!resName || !resPhone) {
      alert('Please provide your name and phone number to join the waitlist.');
      return;
    }
    const entry = await db.joinWaitlist({ name: resName, phone: resPhone, party_size: resGuests });
    if (entry) {
      setWaitlistSuccess(true);
    } else {
      alert('Failed to join waitlist. Please try again.');
    }
  };

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!resName || !resEmail || !resPhone || !resDate || !resTime) {
      alert('Please fill out all table booking fields.');
      return;
    }

    if (!selectedTableId) {
      alert('Please select an available table from the layout.');
      return;
    }

    try {
      const reservation = await db.createReservation({
        name: resName,
        email: resEmail,
        phone: resPhone,
        guests: resGuests,
        date: resDate,
        time: resTime,
        tableId: selectedTableId
      });

      if (reservation) {
        const list = await db.getReservations();
        setResSuccess(list.find((r: any) => r.id === reservation.id) || reservation);
      }
      setResPhone('');
      setResGuests(2);
      setResDate(new Date().toISOString().split('T')[0]);
      setResTime('18:00');
      setSelectedTableId(null);
    } catch (e) {
      console.error('Error booking table:', e);
      alert('Failed to book table. Please try again.');
    }
  };

  if (!allTables || allTables.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading Seating Layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-[72px] relative overflow-hidden">
      {/* Background 3D Elements */}
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=600"
        size={180}
        className="absolute -left-12 top-20 opacity-40 hidden lg:block"
        initialRotation={{ x: 20, y: -20, z: 10 }}
      />
      <FloatingFood3D
        src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600"
        size={150}
        className="absolute -right-10 bottom-20 opacity-40 hidden lg:block"
        initialRotation={{ x: -20, y: 20, z: -10 }}
      />

      {/* ── Table Reservation Section ── */}
      <section id="reservation-section" className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2 block">Table Booking</span>
            <h2 className="font-display text-3xl font-bold text-foreground">Reserve A Dining Table</h2>
            <div className="w-12 h-0.5 bg-accent/40 mx-auto mt-4" />
          </div>

          <div className="bg-card border border-border/20 shadow-xl rounded-2xl overflow-hidden p-6 md:p-8">
            {waitlistSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">You're on the Waitlist!</h3>
                  <p className="text-xs text-muted-foreground mt-1">We will notify you when a table becomes available.</p>
                </div>
                <div>
                  <button
                    onClick={() => { setWaitlistSuccess(false); setResPhone(''); }}
                    className="px-6 py-2 mt-4 bg-accent text-white text-xs font-semibold rounded-full hover:shadow-md transition-all cursor-pointer"
                  >
                    Back to Booking
                  </button>
                </div>
              </motion.div>
            ) : resSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Reservation Request Submitted</h3>
                  <p className="text-xs text-muted-foreground mt-1">We will review your booking and assign a table shortly.</p>
                </div>
                <div className="inline-block bg-secondary/80 rounded-xl p-4 text-left max-w-sm w-full border border-border/30 text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Guest Name:</span> <span className="font-semibold text-foreground">{resSuccess.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Guests Count:</span> <span className="font-semibold text-foreground">{resSuccess.guests} People</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date:</span> <span className="font-semibold text-foreground">{resSuccess.date}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time:</span> <span className="font-semibold text-foreground">{resSuccess.time}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200 uppercase text-[9px] tracking-wider">Pending Confirmation</span></div>
                </div>
                <div>
                  <button
                    onClick={() => setResSuccess(null)}
                    className="px-6 py-2 bg-accent text-white text-xs font-semibold rounded-full hover:shadow-md transition-all cursor-pointer"
                  >
                    Book Another Table
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleBookTable} className="space-y-6">
                {!currentUser && (
                  <div className="bg-accent/5 border border-accent/25 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-3">Please sign in to make and track table reservations easily.</p>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-5 py-2 bg-accent text-white text-[11px] font-bold rounded-lg hover:shadow-sm"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={resName} 
                      onChange={e => setResName(e.target.value)} 
                      placeholder="Your Name"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs text-foreground focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={resEmail} 
                      onChange={e => setResEmail(e.target.value)} 
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs text-foreground focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={resPhone} 
                      onChange={e => setResPhone(e.target.value)} 
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs text-foreground focus:outline-none focus:border-accent/40"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Guests Count</label>
                    <select
                      value={resGuests}
                      onChange={e => setResGuests(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs text-foreground focus:outline-none focus:border-accent/40"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      required
                      value={resDate} 
                      onChange={e => setResDate(e.target.value)} 
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs text-foreground focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">Preferred Time</label>
                    <select
                      value={resTime}
                      onChange={e => setResTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs text-foreground focus:outline-none focus:border-accent/40"
                    >
                      {['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="pt-4 border-t border-border/10">
                    <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px]">4</span>
                      Select Your Table
                    </h3>

                    <TableLayout
                      tables={allTables}
                      availableTableIds={availableTableIds}
                      selectedTableId={selectedTableId}
                      onSelectTable={setSelectedTableId}
                      guestCount={resGuests}
                    />
                    
                    {availableTableIds.length === 0 && (
                      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 p-5 rounded-xl text-center">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-3">No tables are currently available for {resGuests} guests at {resTime}.</p>
                        <button
                          type="button"
                          onClick={handleJoinWaitlist}
                          className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Join Waitlist Instead
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-6 border-t border-border/10">
                    <button
                      type="submit"
                      disabled={!selectedTableId}
                      className="px-8 py-3 bg-accent text-white text-xs font-bold tracking-wider uppercase rounded-full hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-all cursor-pointer"
                    >
                      {!currentUser ? 'Login to Confirm' : (selectedTableId ? 'Confirm Table Booking' : 'Select a Table to Continue')}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
