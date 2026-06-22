-- ================================================================
-- Flavoré Restaurant: Seed Data
-- Run this AFTER supabase_schema.sql
-- ================================================================

-- ─── Seed Menu Items ───
insert into public.menu_items (name, description, price, category, image_url, is_available) values
  ('Truffle Parmesan Fries', 'Crispy hand-cut fries tossed in white truffle oil, grated parmesan cheese, and fresh parsley, served with garlic aioli.', 12.00, 'Starters', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600', true),
  ('Heirloom Tomato Bruschetta', 'Grilled sourdough rubbed with garlic, topped with diced heirloom tomatoes, fresh basil, balsamic glaze, and extra virgin olive oil.', 14.00, 'Starters', 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=600', true),
  ('Pan-Seared Atlantic Salmon', 'Crispy skin salmon served over creamy saffron risotto, roasted asparagus, and finished with a lemon-herb butter sauce.', 32.00, 'Mains', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=600', true),
  ('Prime Grilled Ribeye Steak', '12oz prime ribeye steak grilled to perfection, served with garlic mashed potatoes, roasted broccolini, and red wine reduction.', 38.00, 'Mains', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600', true),
  ('Classic Espresso Tiramisu', 'Layers of espresso-soaked ladyfingers, velvety mascarpone cream, and dark cocoa powder dusting.', 10.00, 'Desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=600', true),
  ('Warm Chocolate Lava Cake', 'Rich chocolate cake with a molten liquid center, served with vanilla bean gelato and fresh raspberry compote.', 11.00, 'Desserts', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600', true),
  ('Artisanal Blackberry Lemonade', 'Freshly squeezed lemon juice, muddled wild blackberries, organic simple syrup, and sparkling water.', 6.50, 'Beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600', true),
  ('Hibiscus Peach Iced Tea', 'Cold-brewed organic hibiscus tea infused with fresh peach puree and mint leaves.', 6.00, 'Beverages', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=600', true)
on conflict do nothing;


-- ─── Seed Restaurant Tables ───
insert into public.restaurant_tables (number, capacity, type, position_x, position_y) values
  ('1', 2, 'standard', 20, 20),
  ('2', 2, 'standard', 40, 20),
  ('3', 4, 'booth', 60, 20),
  ('4', 4, 'booth', 80, 20),
  ('5', 6, 'standard', 20, 50),
  ('6', 4, 'standard', 40, 50),
  ('7', 2, 'standard', 60, 50),
  ('8', 2, 'standard', 80, 50),
  ('9', 8, 'booth', 20, 80),
  ('10', 4, 'standard', 50, 80),
  ('11', 2, 'outdoor', 80, 80),
  ('12', 2, 'outdoor', 90, 80)
on conflict do nothing;


-- ─── Note on Demo Users ───
-- Demo users must be created via Supabase Auth (not direct SQL inserts).
-- After running this seed, sign up the following users through the app
-- or via the Supabase Dashboard → Authentication → Users → Add User:
--
--   1. admin@flavore.com    (password: Flavore123!)
--   2. staff@flavore.com    (password: Flavore123!)
--   3. customer@flavore.com (password: Flavore123!)
--
-- Then update their roles in the profiles table:
--   UPDATE public.profiles SET role = 'admin', full_name = 'General Manager (Admin)' WHERE email = 'admin@flavore.com';
--   UPDATE public.profiles SET role = 'staff', full_name = 'Chef de Cuisine (Staff)' WHERE email = 'staff@flavore.com';
--   UPDATE public.profiles SET role = 'customer', full_name = 'John Doe' WHERE email = 'customer@flavore.com';
