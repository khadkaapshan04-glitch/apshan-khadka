import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { MenuItem } from '../lib/types';
import { db } from '../lib/supabaseDb';
import { useAuth } from '../context/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, menuItem, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  if (!isOpen || !menuItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to leave a review.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await db.submitReview({
      menu_item_id: menuItem.id,
      user_id: user.id,
      rating,
      comment
    });

    setLoading(false);

    if (result) {
      setRating(5);
      setComment('');
      onReviewSubmitted();
      onClose();
    } else {
      setError('Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-accent/10 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="font-display text-2xl font-bold mb-1 text-foreground">
              Review {menuItem.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Share your thoughts about this dish!
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-2 text-center">Rating</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think of the flavor?..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/30 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 text-foreground transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
