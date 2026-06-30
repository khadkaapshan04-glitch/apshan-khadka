// Supabase Database Service for Flavoré Restaurant Management System
// Drop-in async replacement for the old mockDb (localStorage-based)

import { supabase } from './supabaseClient';
import { mockDb as localDb } from '../utils/mockDb';
import type {
  MenuItem, Order, OrderItem, OrderStatus, OrderType,
  Reservation, RestaurantTable, UserProfile
} from './types';

// Re-export types for backward compatibility
export type { MenuItem, Order, OrderItem, OrderStatus, OrderType, Reservation, RestaurantTable, UserProfile };

// ─────────────────────────────────────────────
// In-memory storage wrapper for Cart (ephemeral, stays in localStorage)
// ─────────────────────────────────────────────
const inMemoryStorage: Record<string, string> = {};
const StorageWrapper = {
  getItem: (key: string): string | null => {
    try { return window.localStorage.getItem(key); } catch { return inMemoryStorage[key] || null; }
  },
  setItem: (key: string, value: string): void => {
    try { window.localStorage.setItem(key, value); } catch { inMemoryStorage[key] = value; }
  },
  removeItem: (key: string): void => {
    try { window.localStorage.removeItem(key); } catch { delete inMemoryStorage[key]; }
  }
};

const getAuthErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  const maybeError = error as { status?: unknown; code?: unknown };
  const status = Number(maybeError.status ?? maybeError.code);
  return Number.isFinite(status) ? status : undefined;
};

const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') return fallback;
  const maybeError = error as { message?: unknown; error_description?: unknown; name?: unknown };
  const message = [maybeError.message, maybeError.error_description, maybeError.name]
    .find(value => typeof value === 'string' && value.trim().length > 0);

  return typeof message === 'string' ? message : fallback;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const SUPABASE_READ_TIMEOUT_MS = 2500;

const withReadTimeout = async <T,>(request: PromiseLike<T>, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`${label} timed out after ${SUPABASE_READ_TIMEOUT_MS}ms`)),
          SUPABASE_READ_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const getLocalMenu = (): MenuItem[] => localDb.getMenu().map(item => ({ ...item }));

const getLocalTables = (): RestaurantTable[] => localDb.getTables().map(table => ({
  id: table.id,
  number: table.number,
  capacity: table.capacity,
  type: table.type,
  position_x: table.position.x,
  position_y: table.position.y,
}));

const normalizeOrder = (order: any): any => ({
  id: order.id,
  customer_name: order.customer_name ?? order.customerName,
  customerName: order.customerName ?? order.customer_name,
  customer_email: order.customer_email ?? order.customerEmail,
  customerEmail: order.customerEmail ?? order.customer_email,
  items: order.items ?? [],
  status: order.status as OrderStatus,
  total: Number(order.total),
  type: order.type as OrderType,
  table_number: order.table_number ?? order.tableNumber ?? undefined,
  tableNumber: order.tableNumber ?? order.table_number ?? undefined,
  delivery_address: order.delivery_address ?? order.deliveryAddress ?? undefined,
  deliveryAddress: order.deliveryAddress ?? order.delivery_address ?? undefined,
  delivery_phone: order.delivery_phone ?? order.deliveryPhone ?? undefined,
  deliveryPhone: order.deliveryPhone ?? order.delivery_phone ?? undefined,
  delivery_notes: order.delivery_notes ?? order.deliveryNotes ?? undefined,
  deliveryNotes: order.deliveryNotes ?? order.delivery_notes ?? undefined,
  estimated_delivery: order.estimated_delivery ?? order.estimatedDelivery ?? undefined,
  estimatedDelivery: order.estimatedDelivery ?? order.estimated_delivery ?? undefined,
  payment_method: order.payment_method ?? order.paymentMethod ?? 'cash',
  paymentMethod: order.paymentMethod ?? order.payment_method ?? 'cash',
  payment_status: order.payment_status ?? order.paymentStatus ?? 'pending',
  paymentStatus: order.paymentStatus ?? order.payment_status ?? 'pending',
  user_id: order.user_id ?? undefined,
  created_at: order.created_at,
});

const normalizeReservation = (res: any): any => ({
  id: res.id,
  name: res.name,
  email: res.email,
  phone: res.phone,
  date: res.date,
  time: res.time,
  guests: res.guests,
  status: res.status as Reservation['status'],
  table_id: res.table_id ?? res.tableId ?? undefined,
  tableId: res.tableId ?? res.table_id ?? undefined,
  table_number: res.table_number ?? res.tableNumber ?? undefined,
  tableNumber: res.tableNumber ?? res.table_number ?? undefined,
  user_id: res.user_id ?? res.userId ?? undefined,
  userId: res.userId ?? res.user_id ?? undefined,
  created_at: res.created_at,
  createdAt: res.createdAt ?? res.created_at,
});

const getLoginErrorMessage = (error: unknown): string => {
  const message = getAuthErrorMessage(error, 'Unable to sign in. Please try again.');
  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'No confirmed account matches that email and password. Check the email spelling, sign up first, or confirm the account email.';
  }

  return message;
};

export type SignupResult = {
  profile: UserProfile;
  needsEmailConfirmation: boolean;
};

const profileFromAuthUser = (user: any): UserProfile => ({
  id: user.id,
  email: user.email ?? '',
  full_name:
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Customer',
  role: 'customer',
});

// ─────────────────────────────────────────────
// Database Service
// ─────────────────────────────────────────────
export const db = {

  // ── Auth Service ──

  getCurrentUser: async (): Promise<UserProfile | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      if (error) console.error('Error fetching current user profile:', error);
      return profileFromAuthUser(session.user);
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role as UserProfile['role'],
    };
  },

  login: async (email: string, password: string): Promise<UserProfile | null> => {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error || !data.user) {
      if (error) {
        console.error('Error signing in:', error);
        throw new Error(getLoginErrorMessage(error));
      }
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      if (profileError) console.error('Error fetching login profile:', profileError);
      return profileFromAuthUser(data.user);
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role as UserProfile['role'],
    };
  },

  signup: async (email: string, password: string, fullName: string): Promise<SignupResult | null> => {
    const normalizedEmail = normalizeEmail(email);
    const emailRedirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo,
        data: { full_name: fullName }
      }
    });
    if (error || !data.user) {
      if (error) {
        console.error('Error signing up:', error);
        const status = getAuthErrorStatus(error);

        if (status === 500) {
          throw new Error(
            'Account was not created because Supabase could not send the confirmation email. Use the verified test recipient email or fix Resend/SMTP sender settings, then sign up again.'
          );
        }

        throw new Error(getAuthErrorMessage(error, 'Signup failed. Please try again.'));
      }

      return null;
    }

    // The trigger will auto-create the profile row,
    // but we need to wait briefly for it to propagate
    await new Promise(resolve => setTimeout(resolve, 500));

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      return {
        profile: {
          id: data.user.id,
          email: normalizedEmail,
          full_name: fullName,
          role: 'customer',
        },
        needsEmailConfirmation: !data.session,
      };
    }

    return {
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role as UserProfile['role'],
      },
      needsEmailConfirmation: !data.session,
    };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },


  // ── Menu CRUD ──

  getMenu: async (): Promise<MenuItem[]> => {
    const { data, error } = await withReadTimeout(
      supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true }),
      'Fetching menu'
    ).catch(error => ({ data: null, error }));

    if (error) {
      console.warn('Using local menu because Supabase menu fetch failed:', error);
      return getLocalMenu();
    }

    if (!data || data.length === 0) {
      console.warn('Using local menu because Supabase returned no menu items.');
      return getLocalMenu();
    }

    return (data ?? []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      category: item.category as MenuItem['category'],
      image_url: item.image_url,
      is_available: item.is_available,
    }));
  },

  saveMenuItem: async (item: MenuItem): Promise<void> => {
    const { error } = await supabase
      .from('menu_items')
      .upsert({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image_url: item.image_url,
        is_available: item.is_available,
      });

    if (error) {
      console.warn('Saving menu item locally because Supabase save failed:', error);
      localDb.saveMenuItem(item as any);
    }
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Deleting menu item locally because Supabase delete failed:', error);
      localDb.deleteMenuItem(id);
    }
  },


  // ── Order Services ──

  getOrders: async (): Promise<any[]> => {
    const { data, error } = await withReadTimeout(
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false }),
      'Fetching orders'
    ).catch(error => ({ data: null, error }));

    if (error) {
      console.warn('Using local orders because Supabase orders fetch failed:', error);
      return localDb.getOrders().map(normalizeOrder);
    }
    return (data ?? []).map(order => {
      const items = ((order.items as unknown as any[]) || []).map(it => ({
        ...it,
        menuItem: it.menuItem ?? {
          id: it.menu_item_id ?? it.menuItem?.id ?? '',
          name: it.name ?? it.menuItem?.name ?? '',
          price: Number(it.price ?? it.menuItem?.price ?? 0),
          description: it.description ?? it.menuItem?.description ?? '',
          image_url: it.image_url ?? it.menuItem?.image_url ?? '',
          is_available: true
        }
      }));
      return {
        id: order.id,
        customer_name: order.customer_name,
        customerName: order.customer_name,
        customer_email: order.customer_email,
        customerEmail: order.customer_email,
        items,
        status: order.status as OrderStatus,
        total: Number(order.total),
        type: order.type as OrderType,
        table_number: order.table_number ?? undefined,
        tableNumber: order.table_number ?? undefined,
        delivery_address: order.delivery_address ?? undefined,
        deliveryAddress: order.delivery_address ?? undefined,
        delivery_phone: order.delivery_phone ?? undefined,
        deliveryPhone: order.delivery_phone ?? undefined,
        delivery_notes: order.delivery_notes ?? undefined,
        deliveryNotes: order.delivery_notes ?? undefined,
        estimated_delivery: order.estimated_delivery ?? undefined,
        estimatedDelivery: order.estimated_delivery ?? undefined,
        user_id: order.user_id ?? undefined,
        created_at: order.created_at,
      };
    });
  },

  placeOrder: async (orderData: any): Promise<any | null> => {
    const { data: { session } } = await supabase.auth.getSession();

    const now = new Date();
    // Prepare items, storing standard fields as flat and keeping menuItem wrapper for compatibility
    const savedItems = (orderData.items || []).map((it: any) => {
      const menuItemId = it.menu_item_id ?? it.menuItem?.id ?? '';
      const name = it.name ?? it.menuItem?.name ?? '';
      const price = Number(it.price ?? it.menuItem?.price ?? 0);
      const imageUrl = it.image_url ?? it.menuItem?.image_url ?? '';
      return {
        menu_item_id: menuItemId,
        name,
        price,
        quantity: it.quantity,
        image_url: imageUrl,
        menuItem: {
          id: menuItemId,
          name,
          price,
          description: it.menuItem?.description ?? '',
          image_url: imageUrl,
          is_available: true
        }
      };
    });

    const insertData: Record<string, unknown> = {
      customer_name: orderData.customer_name ?? orderData.customerName,
      customer_email: orderData.customer_email ?? orderData.customerEmail,
      items: savedItems,
      status: 'pending',
      total: orderData.total,
      type: orderData.type,
      table_number: orderData.table_number ?? orderData.tableNumber ?? null,
      delivery_address: orderData.delivery_address ?? orderData.deliveryAddress ?? null,
      delivery_phone: orderData.delivery_phone ?? orderData.deliveryPhone ?? null,
      delivery_notes: orderData.delivery_notes ?? orderData.deliveryNotes ?? null,
      payment_method: orderData.payment_method ?? orderData.paymentMethod ?? 'cash',
      payment_status: orderData.payment_method === 'cash' ? 'pending' : 'paid',
      user_id: session?.user?.id || null,
    };

    if (orderData.type === 'delivery') {
      insertData.estimated_delivery = new Date(
        now.getTime() + (30 + Math.floor(Math.random() * 15)) * 60000
      ).toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      console.warn('Placing order locally because Supabase insert failed:', error);
      return normalizeOrder(localDb.placeOrder(orderData));
    }

    const items = ((data.items as unknown as any[]) || []).map(it => ({
      ...it,
      menuItem: it.menuItem ?? {
        id: it.menu_item_id ?? it.menuItem?.id ?? '',
        name: it.name ?? it.menuItem?.name ?? '',
        price: Number(it.price ?? it.menuItem?.price ?? 0),
        description: it.description ?? it.menuItem?.description ?? '',
        image_url: it.image_url ?? it.menuItem?.image_url ?? '',
        is_available: true
      }
    }));

    return {
      id: data.id,
      customer_name: data.customer_name,
      customerName: data.customer_name,
      customer_email: data.customer_email,
      customerEmail: data.customer_email,
      items,
      status: data.status as OrderStatus,
      total: Number(data.total),
      type: data.type as OrderType,
      table_number: data.table_number ?? undefined,
      tableNumber: data.table_number ?? undefined,
      delivery_address: data.delivery_address ?? undefined,
      deliveryAddress: data.delivery_address ?? undefined,
      delivery_phone: data.delivery_phone ?? undefined,
      deliveryPhone: data.delivery_phone ?? undefined,
      delivery_notes: data.delivery_notes ?? undefined,
      deliveryNotes: data.delivery_notes ?? undefined,
      estimated_delivery: data.estimated_delivery ?? undefined,
      estimatedDelivery: data.estimated_delivery ?? undefined,
      payment_method: data.payment_method ?? 'cash',
      paymentMethod: data.payment_method ?? 'cash',
      payment_status: data.payment_status ?? 'pending',
      paymentStatus: data.payment_status ?? 'pending',
      user_id: data.user_id ?? undefined,
      created_at: data.created_at,
    };
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<any | null> => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.warn('Updating order status locally because Supabase failed:', error);
      const localUpdated = localDb.updateOrderStatus(id, status);
      return localUpdated ? normalizeOrder(localUpdated) : null;
    }

    const items = ((data.items as unknown as any[]) || []).map(it => ({
      ...it,
      menuItem: it.menuItem ?? {
        id: it.menu_item_id ?? it.menuItem?.id ?? '',
        name: it.name ?? it.menuItem?.name ?? '',
        price: Number(it.price ?? it.menuItem?.price ?? 0),
        description: it.description ?? it.menuItem?.description ?? '',
        image_url: it.image_url ?? it.menuItem?.image_url ?? '',
        is_available: true
      }
    }));

    return {
      id: data.id,
      customer_name: data.customer_name,
      customerName: data.customer_name,
      customer_email: data.customer_email,
      customerEmail: data.customer_email,
      items,
      status: data.status as OrderStatus,
      total: Number(data.total),
      type: data.type as OrderType,
      table_number: data.table_number ?? undefined,
      tableNumber: data.table_number ?? undefined,
      created_at: data.created_at,
    };
  },


  // ── Reservation Services ──

  getReservations: async (): Promise<any[]> => {
    const { data, error } = await withReadTimeout(
      supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false }),
      'Fetching reservations'
    ).catch(error => ({ data: null, error }));

    if (error) {
      console.warn('Using local reservations because Supabase reservations fetch failed:', error);
      return localDb.getReservations().map(normalizeReservation);
    }
    return (data ?? []).map(res => ({
      id: res.id,
      name: res.name,
      email: res.email,
      phone: res.phone,
      date: res.date,
      time: res.time,
      guests: res.guests,
      status: res.status as Reservation['status'],
      table_id: res.table_id ?? undefined,
      tableId: res.table_id ?? undefined,
      table_number: res.table_number ?? undefined,
      tableNumber: res.table_number ?? undefined,
      user_id: res.user_id ?? undefined,
      userId: res.user_id ?? undefined,
      created_at: res.created_at,
      createdAt: res.created_at,
    }));
  },

  createReservation: async (resData: any): Promise<any | null> => {
    const { data: { session } } = await supabase.auth.getSession();

    const tableId = resData.table_id ?? resData.tableId;
    let tableNumber = resData.table_number ?? resData.tableNumber;

    if (tableId && !tableNumber) {
      const { data: table } = await supabase
        .from('restaurant_tables')
        .select('number')
        .eq('id', tableId)
        .single();
      if (table) tableNumber = table.number;
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        name: resData.name,
        email: resData.email,
        phone: resData.phone,
        date: resData.date,
        time: resData.time,
        guests: resData.guests,
        status: 'pending',
        table_id: tableId || null,
        table_number: tableNumber || null,
        user_id: session?.user?.id || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('Creating reservation locally because Supabase insert failed:', error);
      return normalizeReservation(localDb.createReservation(resData));
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      time: data.time,
      guests: data.guests,
      status: data.status as Reservation['status'],
      table_id: data.table_id ?? undefined,
      tableId: data.table_id ?? undefined,
      table_number: data.table_number ?? undefined,
      tableNumber: data.table_number ?? undefined,
      user_id: data.user_id ?? undefined,
      userId: data.user_id ?? undefined,
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },

  updateReservation: async (id: string, updates: any): Promise<any | null> => {
    const tableId = updates.table_id ?? updates.tableId;
    const updateData: Record<string, unknown> = {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      date: updates.date,
      time: updates.time,
      guests: updates.guests,
      status: updates.status,
    };

    if (tableId) {
      updateData.table_id = tableId;
      const { data: table } = await supabase
        .from('restaurant_tables')
        .select('number')
        .eq('id', tableId)
        .single();
      if (table) updateData.table_number = table.number;
    }

    // Clean up undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating reservation:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      time: data.time,
      guests: data.guests,
      status: data.status as Reservation['status'],
      table_id: data.table_id ?? undefined,
      tableId: data.table_id ?? undefined,
      table_number: data.table_number ?? undefined,
      tableNumber: data.table_number ?? undefined,
      user_id: data.user_id ?? undefined,
      userId: data.user_id ?? undefined,
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },

  updateReservationStatus: async (
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled',
    tableId?: string
  ): Promise<any | null> => {
    const updateData: Record<string, unknown> = { status };

    if (tableId) {
      updateData.table_id = tableId;
      const { data: table } = await supabase
        .from('restaurant_tables')
        .select('number')
        .eq('id', tableId)
        .single();
      if (table) updateData.table_number = table.number;
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating reservation status:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      time: data.time,
      guests: data.guests,
      status: data.status as Reservation['status'],
      table_id: data.table_id ?? undefined,
      tableId: data.table_id ?? undefined,
      table_number: data.table_number ?? undefined,
      tableNumber: data.table_number ?? undefined,
      user_id: data.user_id ?? undefined,
      userId: data.user_id ?? undefined,
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },


  // ── Table Services ──

  getTables: async (): Promise<RestaurantTable[]> => {
    const { data, error } = await withReadTimeout(
      supabase
        .from('restaurant_tables')
        .select('*')
        .order('number', { ascending: true }),
      'Fetching tables'
    ).catch(error => ({ data: null, error }));

    if (error) {
      console.warn('Using local tables because Supabase tables fetch failed:', error);
      return getLocalTables();
    }

    if (!data || data.length === 0) {
      console.warn('Using local tables because Supabase returned no restaurant tables.');
      return getLocalTables();
    }

    return (data ?? []).map(t => ({
      id: t.id,
      number: t.number,
      capacity: t.capacity,
      type: t.type as RestaurantTable['type'],
      position_x: Number(t.position_x),
      position_y: Number(t.position_y),
    }));
  },

  saveTable: async (table: any): Promise<void> => {
    const posX = table.position_x ?? table.position?.x ?? 0;
    const posY = table.position_y ?? table.position?.y ?? 0;
    const { error } = await supabase
      .from('restaurant_tables')
      .upsert({
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        type: table.type,
        position_x: posX,
        position_y: posY,
      });

    if (error) {
      console.warn('Saving table locally because Supabase save failed:', error);
      localDb.saveTable({
        id: table.id || `t_${Math.random().toString(36).slice(2, 9)}`,
        number: table.number,
        capacity: table.capacity,
        type: table.type,
        position: { x: posX, y: posY },
      });
    }
  },

  deleteTable: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('restaurant_tables')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Deleting table locally because Supabase delete failed:', error);
      localDb.deleteTable(id);
    }
  },

  getAvailableTables: async (date: string, time: string, guests: number): Promise<RestaurantTable[]> => {
    // Get all tables with sufficient capacity
    const tables = await db.getTables();
    const suitableTables = tables.filter(t => t.capacity >= guests);

    // Get reservations for the given date that aren't cancelled
    const { data: reservations, error } = await withReadTimeout(
      supabase
        .from('reservations')
        .select('table_id, time')
        .eq('date', date)
        .neq('status', 'cancelled'),
      'Fetching reserved tables'
    ).catch(error => ({ data: null, error }));

    if (error) {
      console.warn('Using local table availability because Supabase reservation lookup failed:', error);
      return getLocalTables().filter(table =>
        localDb.getAvailableTables(date, time, guests).some(localTable => localTable.id === table.id)
      );
    }

    const reqHour = parseInt(time.split(':')[0], 10) || 0;
    
    const reservedTableIds = new Set(
      (reservations ?? [])
        .filter(r => {
          if (!r.time) return true;
          const resHour = parseInt(r.time.split(':')[0], 10) || 0;
          return Math.abs(resHour - reqHour) < 2; // Block table if booked within 2 hours
        })
        .map(r => r.table_id)
        .filter(Boolean)
    );

    return suitableTables.filter(t => !reservedTableIds.has(t.id));
  },


  // ── Cart Services (stays in localStorage) ──

  getCart: (): { menuItem: MenuItem; quantity: number }[] => {
    return JSON.parse(StorageWrapper.getItem('flavore_cart') || '[]');
  },

  setCart: (cart: { menuItem: MenuItem; quantity: number }[]): void => {
    StorageWrapper.setItem('flavore_cart', JSON.stringify(cart));
  },

  getAllProfiles: async (): Promise<UserProfile[]> => {
    const { data, error } = await withReadTimeout(
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      'Fetching profiles'
    ).catch(error => ({ data: null, error }));

    if (error || !data) {
      console.warn('Failed to fetch profiles:', error);
      return [];
    }

    return data.map(p => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      role: p.role,
      createdAt: p.created_at,
    }));
  },

  updateProfileRole: async (userId: string, newRole: string): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update profile role:', error);
      return false;
    }
    return true;
  },

  // ── Password Reset Services ──

  sendPasswordResetEmail: async (email: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[Password Reset] Sending reset link to:', email);
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined;

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      console.log('[Password Reset] Response data:', data);
      if (error) {
        const status = getAuthErrorStatus(error);
        console.error('[Password Reset] Error details:', {
          message: error.message,
          status,
          name: error.name,
          full: JSON.stringify(error),
        });

        if (status === 500) {
          return {
            success: false,
            error: 'Supabase could not send the recovery email. Check Auth SMTP settings: the current SMTP username/login is being rejected.',
          };
        }

        return {
          success: false,
          error: getAuthErrorMessage(error, 'Failed to send reset link. Please try again.'),
        };
      }
      console.log('[Password Reset] Email sent successfully');
      return { success: true };
    } catch (err: any) {
      console.error('[Password Reset] Unexpected error:', err);
      return { success: false, error: err.message || 'Unexpected error occurred' };
    }
  },

  updatePassword: async (password: string): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('Error updating password: no active password recovery session');
      return false;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error('Error updating password:', error);
      return false;
    }
    return true;
  },

  verifyResetOtp: async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    console.log('[OTP Verify] Verifying OTP for:', email);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      if (error) {
        console.error('[OTP Verify] Error:', error);
        return { success: false, error: error.message };
      }
      console.log('[OTP Verify] Success, session:', data.session ? 'created' : 'none');
      return { success: true };
    } catch (err: any) {
      console.error('[OTP Verify] Unexpected error:', err);
      return { success: false, error: err.message || 'Unexpected error occurred' };
    }
  }
};
