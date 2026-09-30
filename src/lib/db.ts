import { supabase } from './supabase';
import { categories as defaultCategories, products as defaultProducts } from './data';

// ==============================================================================
// 1. AUDIT LOGGING HELPER
// ==============================================================================
export async function logActivity(params: {
  admin_name?: string;
  admin_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
}) {
  try {
    await supabase.from('activity_logs').insert([{
      admin_name: params.admin_name || 'Admin',
      admin_id: params.admin_id || null,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id || null,
      details: params.details || {},
    }]);
  } catch (err) {
    console.warn('Audit logging skipped / failed:', err);
  }
}

// ==============================================================================
// 2. CATEGORIES REPOSITORY
// ==============================================================================
export const CategoriesDB = {
  async getAll() {
    let dbCategories: any[] = [];
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        dbCategories = data;
      }
    } catch (err) {
      console.error('CategoriesDB.getAll Error:', err);
    }

    const mappedDbCategories = dbCategories.map((c) => {
      if (c.id === 'mobiles-accessories' || c.name === 'Mobiles & Accessories') {
        return {
          ...c,
          id: 'mobiles',
          name: 'Mobiles',
          sub_categories: ['Flagship Phones', '5G Phones', 'Gaming Phones', 'Budget Phones'],
        };
      }
      if (c.name === 'Fashion & Jewellery' || c.id === 'fashion-jewellery') {
        return {
          ...c,
          id: 'fashion',
          name: 'Fashion',
          sub_categories: ['Handbags & Purses', 'Watches & Chronographs', 'Fashion Accessories', 'Apparel & Bags'],
        };
      }
      return c;
    });

    const dbCategoryIds = new Set(mappedDbCategories.map((c) => String(c.id)));
    const defaultList = defaultCategories.map((c, idx) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      image_url: c.image_url,
      sub_categories: (c as any).sub_categories || [],
      is_active: true,
      display_order: idx + 1,
    }));

    return [
      ...mappedDbCategories,
      ...defaultList.filter((dc) => !dbCategoryIds.has(String(dc.id))),
    ];
  },

  async getById(id: string) {
    try {
      const { data } = await supabase.from('categories').select('*').eq('id', id).single();
      if (data) return data;
    } catch { /* ignore */ }
    const def = defaultCategories.find((c) => c.id === id);
    return def ? { ...def, sub_categories: [], is_active: true } : null;
  },

  async create(category: any, adminName: string = 'Admin') {
    const slug = category.id || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const item = {
      id: slug,
      name: category.name,
      icon: category.icon || '📱',
      image_url: category.image_url || '',
      sub_categories: category.sub_categories || [],
      is_active: category.is_active !== undefined ? category.is_active : true,
      display_order: Number(category.display_order) || 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('categories').insert([item]).select().single();
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'create_category',
      entity_type: 'category',
      entity_id: slug,
      details: { name: item.name }
    });

    return data;
  },

  async update(id: string, updates: any, adminName: string = 'Admin') {
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'update_category',
      entity_type: 'category',
      entity_id: id,
      details: updates
    });

    return data;
  },

  async delete(id: string, adminName: string = 'Admin') {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'delete_category',
      entity_type: 'category',
      entity_id: id
    });

    return true;
  }
};

// ==============================================================================
// 3. PRODUCTS REPOSITORY
// ==============================================================================
export const ProductsDB = {
  async getAll(filter?: { category?: string; sub_category?: string; search?: string; is_popular?: boolean; is_featured?: boolean; limit?: number }) {
    let dbProducts: any[] = [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbProducts = data;
      }
    } catch (err) {
      console.error('ProductsDB.getAll DB Error:', err);
    }

    // Merge: Live DB products take priority, and all default catalog products are preserved
    const dbProductIds = new Set(dbProducts.map((p) => String(p.id)));
    const merged = [
      ...dbProducts.map(p => ({
        ...p,
        stock_quantity: p.stock_quantity !== undefined && p.stock_quantity !== null && !isNaN(Number(p.stock_quantity)) ? Number(p.stock_quantity) : 25
      })),
      ...defaultProducts.filter((dp) => !dbProductIds.has(String(dp.id))).map(dp => ({
        ...dp,
        stock_quantity: (dp as any).stock_quantity !== undefined && (dp as any).stock_quantity !== null && !isNaN(Number((dp as any).stock_quantity)) ? Number((dp as any).stock_quantity) : 25
      })),
    ];

    let list = merged;
    if (filter?.category && filter.category !== 'all') {
      const catLower = filter.category.toLowerCase();
      list = list.filter((p) =>
        (p.category_id && p.category_id.toLowerCase() === catLower) ||
        (p.category_name && p.category_name.toLowerCase() === catLower) ||
        (p.category && p.category.toLowerCase() === catLower)
      );
    }
    if (filter?.sub_category && filter.sub_category !== 'all') {
      const subLower = filter.sub_category.toLowerCase();
      list = list.filter((p) =>
        p.sub_category && p.sub_category.toLowerCase() === subLower
      );
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      list = list.filter((p) =>
        (p.name && p.name.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s)) ||
        (p.sku && p.sku.toLowerCase().includes(s)) ||
        (p.sub_category && p.sub_category.toLowerCase().includes(s))
      );
    }
    if (filter?.is_popular) {
      list = list.filter((p) => p.is_popular);
    }
    if (filter?.is_featured) {
      list = list.filter((p) => p.is_featured);
    }

    return filter?.limit ? list.slice(0, filter.limit) : list;
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          stock_quantity: data.stock_quantity !== undefined && data.stock_quantity !== null && !isNaN(Number(data.stock_quantity)) ? Number(data.stock_quantity) : 25
        };
      }
    } catch (err) {
      console.error('ProductsDB.getById Error:', err);
    }
    const def = defaultProducts.find((p) => String(p.id) === String(id));
    if (def) {
      return {
        ...def,
        stock_quantity: (def as any).stock_quantity !== undefined && (def as any).stock_quantity !== null && !isNaN(Number((def as any).stock_quantity)) ? Number((def as any).stock_quantity) : 25
      };
    }
    return null;
  },

  async create(product: any, adminName: string = 'Admin') {
    const id = product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: any = {
      id,
      name: product.name || '',
      category_id: product.category_id || 'mobiles-accessories',
      category_name: product.category_name || product.category || '',
      sub_category: product.sub_category || '',
      price: Number(product.price) || 0,
      original_price: Number(product.original_price) || Number(product.price) || 0,
      stock_quantity: Number(product.stock_quantity) || 10,
      sku: product.sku || `SKU-${id.toUpperCase()}`,
      image_url: product.image_url || '',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image_url || ''],
      description: product.description || '',
      unit: product.unit || '',
      is_available: product.is_available !== undefined ? Boolean(product.is_available) : true,
      is_featured: Boolean(product.is_featured),
      is_popular: Boolean(product.is_popular),
      rating: Number(product.rating) || 4.8,
      reviews_count: Number(product.reviews_count) || 0,
      variants: Array.isArray(product.variants) ? product.variants : [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('products').insert([record]).select().single();
    if (error) {
      console.error('ProductsDB.create Supabase Error:', error);
      throw error;
    }

    // Log Inventory initial creation
    try {
      await supabase.from('inventory_logs').insert([{
        product_id: id,
        product_name: record.name,
        change_type: 'initial_stock',
        previous_stock: 0,
        change_amount: record.stock_quantity,
        new_stock: record.stock_quantity,
        reason: 'Product creation',
        admin_name: adminName
      }]);
    } catch { /* ignore log error */ }

    await logActivity({
      admin_name: adminName,
      action: 'create_product',
      entity_type: 'product',
      entity_id: id,
      details: { name: record.name, price: record.price, stock: record.stock_quantity }
    });

    return data;
  },

  async update(id: string, updates: any, adminName: string = 'Admin') {
    // If stock changed, create inventory log
    if (updates.stock_quantity !== undefined) {
      const prev = await this.getById(id);
      if (prev && prev.stock_quantity !== updates.stock_quantity) {
        try {
          await supabase.from('inventory_logs').insert([{
            product_id: id,
            product_name: updates.name || prev.name,
            change_type: 'manual_adjustment',
            previous_stock: prev.stock_quantity || 0,
            change_amount: Number(updates.stock_quantity) - (prev.stock_quantity || 0),
            new_stock: Number(updates.stock_quantity),
            reason: updates.stock_reason || 'Manual Admin Update',
            admin_name: adminName
          }]);
        } catch { /* ignore log error */ }
      }
    }

    const cleanUpdates: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.category_id !== undefined) cleanUpdates.category_id = updates.category_id;
    if (updates.category_name !== undefined) cleanUpdates.category_name = updates.category_name;
    if (updates.sub_category !== undefined) cleanUpdates.sub_category = updates.sub_category;
    if (updates.price !== undefined) cleanUpdates.price = Number(updates.price) || 0;
    if (updates.original_price !== undefined) cleanUpdates.original_price = Number(updates.original_price) || Number(updates.price) || 0;
    if (updates.stock_quantity !== undefined) cleanUpdates.stock_quantity = Number(updates.stock_quantity) || 0;
    if (updates.sku !== undefined) cleanUpdates.sku = updates.sku;
    if (updates.image_url !== undefined) cleanUpdates.image_url = updates.image_url;
    if (updates.images !== undefined) cleanUpdates.images = Array.isArray(updates.images) ? updates.images : [updates.image_url || ''];
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.unit !== undefined) cleanUpdates.unit = updates.unit;
    if (updates.is_available !== undefined) cleanUpdates.is_available = Boolean(updates.is_available);
    if (updates.is_featured !== undefined) cleanUpdates.is_featured = Boolean(updates.is_featured);
    if (updates.is_popular !== undefined) cleanUpdates.is_popular = Boolean(updates.is_popular);
    if (updates.rating !== undefined) cleanUpdates.rating = Number(updates.rating) || 4.8;
    if (updates.reviews_count !== undefined) cleanUpdates.reviews_count = Number(updates.reviews_count) || 0;
    if (updates.variants !== undefined) cleanUpdates.variants = Array.isArray(updates.variants) ? updates.variants : [];

    const { data, error } = await supabase
      .from('products')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('ProductsDB.update Supabase Error:', error);
      throw error;
    }

    await logActivity({
      admin_name: adminName,
      action: 'update_product',
      entity_type: 'product',
      entity_id: id,
      details: cleanUpdates
    });

    return data;
  },

  async delete(id: string, adminName: string = 'Admin') {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('ProductsDB.delete Supabase Error:', error);
      throw error;
    }

    await logActivity({
      admin_name: adminName,
      action: 'delete_product',
      entity_type: 'product',
      entity_id: id
    });

    return true;
  },

  async adjustStock(
    productId: string, 
    quantityChange: number, 
    reason: string, 
    adminName: string = 'System', 
    variantId?: string
  ) {
    const current = await this.getById(productId);
    if (!current) return null;

    let variants = Array.isArray(current.variants) ? [...current.variants] : [];
    let variantName = "";
    let previousVariantStock = 0;
    let newVariantStock = 0;

    if (variantId && variants.length > 0) {
      variants = variants.map(v => {
        if (v.id === variantId || (v.sku && v.sku === variantId)) {
          previousVariantStock = Number(v.stock_quantity) || 0;
          newVariantStock = Math.max(0, previousVariantStock + quantityChange);
          variantName = `${v.storage_label || (v.ram && v.rom ? `${v.ram} + ${v.rom}` : "")} - ${v.color || ""}`.trim();
          return {
            ...v,
            stock_quantity: newVariantStock
          };
        }
        return v;
      });
    }

    const currentStock = current.stock_quantity !== undefined && current.stock_quantity !== null && !isNaN(Number(current.stock_quantity))
      ? Number(current.stock_quantity)
      : (current.is_available !== false ? 25 : 0);
    
    // If product has variants, total stock is sum of active variants
    const newStock = variants.length > 0 
      ? variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
      : Math.max(0, currentStock + quantityChange);
    
    const isAvailable = newStock > 0;

    const cleanRecord: any = {
      id: current.id,
      name: current.name || '',
      category_id: current.category_id || 'mobiles-accessories',
      category_name: current.category_name || current.category || '',
      sub_category: current.sub_category || '',
      price: Number(current.price) || 0,
      original_price: Number(current.original_price) || Number(current.price) || 0,
      stock_quantity: newStock,
      sku: current.sku || `SKU-${String(current.id).toUpperCase()}`,
      image_url: current.image_url || '',
      images: Array.isArray(current.images) && current.images.length > 0 ? current.images : [current.image_url || ''],
      description: current.description || '',
      unit: current.unit || '',
      is_available: isAvailable,
      is_featured: Boolean(current.is_featured),
      is_popular: Boolean(current.is_popular),
      rating: Number(current.rating) || 4.8,
      reviews_count: Number(current.reviews_count) || 0,
      variants: variants,
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase.from('products').upsert([cleanRecord]);
    if (upsertError) {
      console.error('adjustStock Supabase upsert error:', upsertError);
    }

    try {
      await supabase.from('inventory_logs').insert([{
        product_id: current.id,
        product_name: variantName ? `${current.name} (${variantName})` : current.name,
        change_type: quantityChange < 0 ? 'order_deduct' : 'restock',
        previous_stock: variantId ? previousVariantStock : currentStock,
        change_amount: quantityChange,
        new_stock: variantId ? newVariantStock : newStock,
        reason: reason,
        admin_name: adminName
      }]);
    } catch { /* ignore log error */ }

    return { totalStock: newStock, variantStock: newVariantStock, variants };
  },

  async getVariants(productId: string) {
    const product = await this.getById(productId);
    return product ? (Array.isArray(product.variants) ? product.variants : []) : [];
  },

  async addVariant(productId: string, variantData: any, adminName: string = 'Admin') {
    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');

    const variants = Array.isArray(product.variants) ? [...product.variants] : [];
    const ram = variantData.ram || '';
    const rom = variantData.rom || '';
    const storageLabel = variantData.storage_label || (ram && rom ? `${ram} RAM + ${rom} ROM` : (rom ? `${rom} ROM` : 'Standard'));
    
    const newVariant = {
      id: variantData.id || `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ram,
      rom,
      storage_label: storageLabel,
      color: variantData.color || 'Standard',
      color_code: variantData.color_code || '#334155',
      price: Number(variantData.price) || Number(product.price) || 0,
      original_price: Number(variantData.original_price) || Number(product.original_price) || Number(variantData.price) || 0,
      stock_quantity: Number(variantData.stock_quantity) || 0,
      sku: variantData.sku || `${product.sku || product.id}-${(variantData.color || 'STD').toUpperCase().slice(0, 3)}`,
      image_url: variantData.image_url || product.image_url || '',
      is_active: variantData.is_active !== undefined ? Boolean(variantData.is_active) : true,
    };

    variants.push(newVariant);
    const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock_quantity) || 0), 0);

    await this.update(productId, {
      variants,
      stock_quantity: totalStock,
      is_available: totalStock > 0
    }, adminName);

    await logActivity({
      admin_name: adminName,
      action: 'add_variant',
      entity_type: 'product_variant',
      entity_id: newVariant.id,
      details: { product_name: product.name, variant: newVariant }
    });

    return newVariant;
  },

  async updateVariant(productId: string, variantId: string, updates: any, adminName: string = 'Admin') {
    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');

    let variants = Array.isArray(product.variants) ? [...product.variants] : [];
    let updatedVariant: any = null;

    variants = variants.map(v => {
      if (v.id === variantId) {
        const prevStock = v.stock_quantity;
        const newStock = updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : v.stock_quantity;
        
        updatedVariant = {
          ...v,
          ...updates,
          price: updates.price !== undefined ? Number(updates.price) : v.price,
          original_price: updates.original_price !== undefined ? Number(updates.original_price) : v.original_price,
          stock_quantity: newStock,
          is_active: updates.is_active !== undefined ? Boolean(updates.is_active) : v.is_active,
        };

        if (prevStock !== newStock) {
          logActivity({
            admin_name: adminName,
            action: 'variant_stock_update',
            entity_type: 'product_variant',
            entity_id: variantId,
            details: { product_name: product.name, variant: updatedVariant.storage_label, previous: prevStock, new: newStock }
          }).catch(() => {});
        }

        return updatedVariant;
      }
      return v;
    });

    const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock_quantity) || 0), 0);

    await this.update(productId, {
      variants,
      stock_quantity: totalStock,
      is_available: totalStock > 0
    }, adminName);

    return updatedVariant;
  },

  async deleteVariant(productId: string, variantId: string, adminName: string = 'Admin') {
    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');

    const variants = (Array.isArray(product.variants) ? product.variants : []).filter((v: any) => v.id !== variantId);
    const totalStock = variants.reduce((acc: number, v: any) => acc + (Number(v.stock_quantity) || 0), 0);

    await this.update(productId, {
      variants,
      stock_quantity: totalStock,
      is_available: totalStock > 0
    }, adminName);

    await logActivity({
      admin_name: adminName,
      action: 'delete_variant',
      entity_type: 'product_variant',
      entity_id: variantId,
      details: { product_name: product.name, variant_id: variantId }
    });

    return true;
  }
};

// ==============================================================================
// 4. ORDERS REPOSITORY
// ==============================================================================
export const OrdersDB = {
  async getAll(filter?: { status?: string; search?: string }) {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('order_status', filter.status);
      }
      if (filter?.search) {
        query = query.or(`id.ilike.%${filter.search}%,customer_name.ilike.%${filter.search}%,customer_phone.ilike.%${filter.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  async create(orderData: any) {
    const orderId = orderData.id || `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const items = orderData.items || [];

    const record = {
      id: orderId,
      customer_id: orderData.customer_id || null,
      customer_name: orderData.customer_name || 'Customer',
      customer_email: orderData.customer_email || '',
      customer_phone: orderData.customer_phone || '',
      shipping_address: orderData.shipping_address || '',
      items: items,
      subtotal: Number(orderData.subtotal) || Number(orderData.total_amount) || 0,
      discount_amount: Number(orderData.discount_amount) || 0,
      delivery_fee: Number(orderData.delivery_fee) || 0,
      tax_amount: Number(orderData.tax_amount) || 0,
      total_amount: Number(orderData.total_amount) || 0,
      payment_method: orderData.payment_method || 'cod',
      payment_status: orderData.payment_status || (orderData.payment_method === 'cod' ? 'pending' : 'paid'),
      order_status: orderData.order_status || 'pending',
      notes: orderData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('orders').insert([record]).select().single();
    if (error) {
      console.error("Supabase order insert error:", error);
      throw error;
    }

    // 1. Automatically decrease stock for each ordered item
    try {
      for (const item of items) {
        if (item.id || item.product_id) {
          const pId = item.id || item.product_id;
          const qty = Number(item.quantity) || 1;
          const variantId = item.variant_id || (item as any).variantId || undefined;
          await ProductsDB.adjustStock(pId, -qty, `Order placed #${orderId}`, 'Order System', variantId);
        }
      }
    } catch (e) {
      console.warn("Stock auto-adjust warning:", e);
    }

    // 2. Automatically record customer or update total orders & spent
    try {
      if (orderData.customer_phone || orderData.customer_email) {
        await CustomersDB.upsertFromOrder(orderData);
      }
    } catch (e) {
      console.warn("Customer upsert warning:", e);
    }

    // 3. Record payment entry
    try {
      await PaymentsDB.create({
        order_id: orderId,
        customer_name: record.customer_name,
        amount: record.total_amount,
        payment_method: record.payment_method,
        payment_status: record.payment_status,
        transaction_id: orderData.transaction_id || `TXN-${Date.now()}`
      });
    } catch (e) {
      console.warn("Payment log warning:", e);
    }

    try {
      await logActivity({
        admin_name: 'Customer Web Checkout',
        action: 'create_order',
        entity_type: 'order',
        entity_id: orderId,
        details: { total: record.total_amount, customer: record.customer_name }
      });
    } catch (e) {
      console.warn("Activity log warning:", e);
    }

    return data || record;
  },

  async updateStatus(orderId: string, orderStatus: string, paymentStatus?: string, adminName: string = 'Admin') {
    const existing = await this.getById(orderId);
    if (!existing) throw new Error('Order not found');

    const updatePayload: any = {
      order_status: orderStatus,
      updated_at: new Date().toISOString(),
    };
    if (paymentStatus) {
      updatePayload.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // If order was newly CANCELLED, restore product stock!
    if (orderStatus.toLowerCase() === 'cancelled' && existing.order_status.toLowerCase() !== 'cancelled') {
      const items = Array.isArray(existing.items) ? existing.items : [];
      for (const item of items) {
        const pId = item.id || item.product_id;
        const qty = Number(item.quantity) || 1;
        const variantId = item.variant_id || (item as any).variantId || undefined;
        if (pId) {
          await ProductsDB.adjustStock(pId, qty, `Restored from Cancelled Order #${orderId}`, adminName, variantId);
        }
      }
    }

    await logActivity({
      admin_name: adminName,
      action: 'update_order_status',
      entity_type: 'order',
      entity_id: orderId,
      details: { old_status: existing.order_status, new_status: orderStatus, payment_status: paymentStatus }
    });

    return data;
  }
};

// ==============================================================================
// 5. CUSTOMERS REPOSITORY
// ==============================================================================
export const CustomersDB = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async getById(id: string) {
    const { data } = await supabase.from('customers').select('*').eq('id', id).single();
    return data;
  },

  async upsertFromOrder(order: any) {
    try {
      const email = order.customer_email || `user_${order.customer_phone}@myshop.local`;
      const phone = order.customer_phone || '';
      const name = order.customer_name || 'Customer';
      const address = order.shipping_address || '';

      // Check if exists
      const { data: existing } = await supabase
        .from('customers')
        .select('*')
        .or(`email.eq.${email},phone.eq.${phone}`)
        .limit(1)
        .single();

      if (existing) {
        await supabase.from('customers').update({
          total_orders: (existing.total_orders || 0) + 1,
          total_spent: Number(existing.total_spent || 0) + Number(order.total_amount || 0),
          full_name: name || existing.full_name,
          address: address || existing.address,
          updated_at: new Date().toISOString()
        }).eq('id', existing.id);
      } else {
        await supabase.from('customers').insert([{
          email,
          phone,
          full_name: name,
          address: address,
          total_orders: 1,
          total_spent: Number(order.total_amount || 0),
          status: 'active'
        }]);
      }
    } catch (e) {
      console.warn('Customer upsert error:', e);
    }
  }
};

// ==============================================================================
// 6. COUPONS REPOSITORY
// ==============================================================================
export const CouponsDB = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async validateCoupon(code: string, subtotal: number, items: any[] = []) {
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        return { valid: false, message: 'Invalid or expired coupon code' };
      }

      const today = new Date().toISOString().split('T')[0];
      if (coupon.start_date && today < coupon.start_date) {
        return { valid: false, message: 'This coupon is not active yet' };
      }
      if (coupon.end_date && today > coupon.end_date) {
        return { valid: false, message: 'This coupon has expired' };
      }
      if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
        return { valid: false, message: `Minimum order amount of ₹${coupon.min_order_value} required` };
      }
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, message: 'Coupon usage limit reached' };
      }

      // Check category specification
      if (coupon.applicable_category && coupon.applicable_category !== 'all' && items && items.length > 0) {
        const matchesCategory = items.some((item: any) => 
          item.category_id === coupon.applicable_category || 
          (item.category_name && item.category_name.toLowerCase() === coupon.applicable_category.toLowerCase()) ||
          (item.category && item.category.toLowerCase() === coupon.applicable_category.toLowerCase())
        );
        if (!matchesCategory) {
          return { valid: false, message: `This coupon is only valid for items in the specified category (${coupon.applicable_category})` };
        }
      }

      // Check product specification
      if (coupon.applicable_product_id && coupon.applicable_product_id !== 'all' && items && items.length > 0) {
        const matchesProduct = items.some((item: any) => 
          String(item.id) === String(coupon.applicable_product_id) || 
          String(item.product_id) === String(coupon.applicable_product_id)
        );
        if (!matchesProduct) {
          return { valid: false, message: `This coupon is only valid for ${coupon.applicable_product_name || 'the specified product'}` };
        }
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (subtotal * Number(coupon.discount_value)) / 100;
        if (coupon.max_discount_amount && discount > Number(coupon.max_discount_amount)) {
          discount = Number(coupon.max_discount_amount);
        }
      } else {
        discount = Number(coupon.discount_value);
      }

      return {
        valid: true,
        discount: Math.min(discount, subtotal),
        coupon: coupon,
        message: `Applied ${coupon.code}! Saved ₹${discount.toFixed(0)}`
      };
    } catch {
      return { valid: false, message: 'Unable to validate coupon' };
    }
  },

  async create(data: any, adminName: string = 'Admin') {
    const record: any = {
      code: data.code.toUpperCase().trim(),
      discount_type: data.discount_type || 'percentage',
      discount_value: Number(data.discount_value),
      min_order_value: Number(data.min_order_value) || 0,
      max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      applicable_category: data.applicable_category || 'all',
      applicable_product_id: data.applicable_product_id || 'all',
      applicable_product_name: data.applicable_product_name || '',
    };

    let result;
    try {
      const { data: res, error } = await supabase.from('coupons').insert([record]).select().single();
      if (error) throw error;
      result = res;
    } catch (err: any) {
      if (err?.message?.includes('column') || err?.code === 'PGRST204' || err?.code === '42703') {
        const { applicable_category, applicable_product_id, applicable_product_name, ...baseRecord } = record;
        const { data: res, error: retryError } = await supabase.from('coupons').insert([baseRecord]).select().single();
        if (retryError) throw retryError;
        result = { ...res, applicable_category, applicable_product_id, applicable_product_name };
      } else {
        throw err;
      }
    }

    await logActivity({
      admin_name: adminName,
      action: 'create_coupon',
      entity_type: 'coupon',
      entity_id: record.code,
      details: record
    });

    return result;
  },

  async update(id: string, updates: any, adminName: string = 'Admin') {
    let result;
    try {
      const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
      if (error) throw error;
      result = data;
    } catch (err: any) {
      if (err?.message?.includes('column') || err?.code === 'PGRST204' || err?.code === '42703') {
        const { applicable_category, applicable_product_id, applicable_product_name, ...baseUpdates } = updates;
        const { data, error: retryError } = await supabase.from('coupons').update(baseUpdates).eq('id', id).select().single();
        if (retryError) throw retryError;
        result = { ...data, applicable_category, applicable_product_id, applicable_product_name };
      } else {
        throw err;
      }
    }

    await logActivity({
      admin_name: adminName,
      action: 'update_coupon',
      entity_type: 'coupon',
      entity_id: id,
      details: updates
    });

    return result;
  },

  async delete(id: string, adminName: string = 'Admin') {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'delete_coupon',
      entity_type: 'coupon',
      entity_id: id
    });

    return true;
  }
};

// ==============================================================================
// 7. HERO & HOMEPAGE BANNERS REPOSITORY
// ==============================================================================
export const HeroSlidesDB = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async create(slide: any, adminName: string = 'Admin') {
    const { data, error } = await supabase.from('hero_slides').insert([slide]).select().single();
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'create_banner',
      entity_type: 'banner',
      entity_id: data.id,
      details: { title: slide.title }
    });

    return data;
  },

  async update(id: string, updates: any, adminName: string = 'Admin') {
    const { data, error } = await supabase.from('hero_slides').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'update_banner',
      entity_type: 'banner',
      entity_id: id,
      details: updates
    });

    return data;
  },

  async delete(id: string, adminName: string = 'Admin') {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'delete_banner',
      entity_type: 'banner',
      entity_id: id
    });

    return true;
  }
};

// ==============================================================================
// 8. PAYMENTS REPOSITORY
// ==============================================================================
export const PaymentsDB = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async create(payment: any) {
    try {
      const { data, error } = await supabase.from('payments').insert([payment]).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Payment insert skipped/failed:', e);
      return null;
    }
  },

  async updateStatus(id: string, status: string, adminName: string = 'Admin') {
    const { data, error } = await supabase
      .from('payments')
      .update({ payment_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'update_payment_status',
      entity_type: 'payment',
      entity_id: id,
      details: { status }
    });

    return data;
  }
};

// ==============================================================================
// 9. ADMIN USERS & PERMISSIONS REPOSITORY
// ==============================================================================
export const AdminUsersDB = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('admin_users').select('id, name, email, role, permissions, is_active, last_login, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return [{
        id: 'super-admin-id',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: 'superadmin',
        permissions: ['products', 'categories', 'orders', 'customers', 'inventory', 'reports', 'coupons', 'settings', 'banners', 'gallery', 'logs', 'users'],
        is_active: true,
      }];
    }
  },

  async verifyCredentials(email: string, password: string) {
    const cleanEmail = (email || '').toLowerCase().trim();
    // Default fallback superadmin credentials
    if (['admin@example.com', 'admin@myshop.com', 'admin', 'superadmin@example.com'].includes(cleanEmail) && password === 'admin123') {
      return {
        id: 'super-admin-id',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: 'superadmin',
        permissions: ['products', 'categories', 'orders', 'customers', 'inventory', 'reports', 'coupons', 'settings', 'banners', 'gallery', 'logs', 'users']
      };
    }

    try {
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password_hash', password)
        .eq('is_active', true)
        .single();

      if (error || !user) return null;

      // Update last login
      await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      };
    } catch {
      return null;
    }
  },

  async create(user: any, adminName: string = 'Super Admin') {
    const { data, error } = await supabase.from('admin_users').insert([{
      name: user.name,
      email: user.email.toLowerCase().trim(),
      password_hash: user.password,
      role: user.role || 'admin',
      permissions: user.permissions || ['products', 'orders', 'customers', 'inventory'],
      is_active: user.is_active !== undefined ? user.is_active : true,
    }]).select().single();

    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'create_admin_user',
      entity_type: 'admin_user',
      entity_id: data.id,
      details: { email: user.email, role: user.role }
    });

    return data;
  },

  async update(id: string, updates: any, adminName: string = 'Super Admin') {
    const payload: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.password) {
      payload.password_hash = updates.password;
      delete payload.password;
    }

    const { data, error } = await supabase.from('admin_users').update(payload).eq('id', id).select().single();
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'update_admin_user',
      entity_type: 'admin_user',
      entity_id: id,
      details: { email: data.email }
    });

    return data;
  },

  async delete(id: string, adminName: string = 'Super Admin') {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;

    await logActivity({
      admin_name: adminName,
      action: 'delete_admin_user',
      entity_type: 'admin_user',
      entity_id: id
    });

    return true;
  }
};

// ==============================================================================
// 10. SITE SETTINGS REPOSITORY
// ==============================================================================
export const SiteSettingsDB = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error || !data || data.length === 0) {
        return {
          store_name: 'MY SHOP',
          contact_email: 'support@myshop.com',
          contact_phone: '+91 9876543210',
          whatsapp_number: '+91 9876543210',
          store_address: '123 Tech Park, Electronics City, Bengaluru, Karnataka 560100',
          delivery_fee: '49',
          free_delivery_threshold: '999',
          tax_rate: '18',
          currency_symbol: '₹',
          announcement_text: '🚀 Mega Festival Sale: Flat 20% OFF on all 5G Smartphones! Use code: FESTIVAL20',
          enable_cod: 'true',
          enable_online_payment: 'true'
        };
      }
      const map: Record<string, string> = {};
      data.forEach(item => {
        map[item.key] = item.value;
      });
      return map;
    } catch {
      return {
        store_name: 'MY SHOP',
        contact_email: 'support@myshop.com',
        contact_phone: '+91 9876543210',
        whatsapp_number: '+91 9876543210',
        store_address: '123 Tech Park, Electronics City, Bengaluru',
        delivery_fee: '49',
        free_delivery_threshold: '999',
        tax_rate: '18',
        currency_symbol: '₹',
        announcement_text: '🚀 Mega Festival Sale: Flat 20% OFF on all 5G Smartphones! Use code: FESTIVAL20',
        enable_cod: 'true',
        enable_online_payment: 'true'
      };
    }
  },

  async updateMany(settings: Record<string, string>, adminName: string = 'Admin') {
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      await supabase.from('site_settings').upsert({
        key,
        value: String(value),
        updated_at: new Date().toISOString()
      });
    }

    await logActivity({
      admin_name: adminName,
      action: 'update_settings',
      entity_type: 'setting',
      details: settings
    });

    return true;
  }
};

// ==============================================================================
// 11. MEDIA GALLERY REPOSITORY (CLOUDINARY INTEGRATION)
// ==============================================================================
export const MediaGalleryDB = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('media_gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async save(media: any) {
    try {
      const { data, error } = await supabase.from('media_gallery').insert([media]).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Media save error:', e);
      return media;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('media_gallery').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ==============================================================================
// 12. ACTIVITY LOGS REPOSITORY
// ==============================================================================
export const ActivityLogsDB = {
  async getAll(limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  }
};

// ==============================================================================
// 13. INVENTORY LOGS REPOSITORY
// ==============================================================================
export const InventoryLogsDB = {
  async getAll(productId?: string) {
    try {
      let query = supabase
        .from('inventory_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (!error && data) return data;
    } catch { /* ignore */ }
    return [];
  },

  async logChange(
    productId: string,
    productName: string,
    changeAmount: number,
    previousStock: number,
    newStock: number,
    reason: string,
    adminName: string = 'Admin'
  ) {
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .insert([{
          product_id: productId,
          product_name: productName,
          change_amount: changeAmount,
          previous_stock: previousStock,
          new_stock: newStock,
          reason,
          created_by: adminName,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (!error && data) return data;
    } catch { /* ignore */ }
    return null;
  }
};

// ==============================================================================
// 14. SERVICE BOOKINGS REPOSITORY (Mobile Display Replacement & Installation)
// ==============================================================================
export const ServiceBookingsDB = {
  async getAll(filter?: { status?: string; search?: string }) {
    try {
      let query = supabase.from('service_bookings').select('*').order('created_at', { ascending: false });
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      if (filter?.search) {
        query = query.or(`id.ilike.%${filter.search}%,customer_name.ilike.%${filter.search}%,customer_phone.ilike.%${filter.search}%,device_model.ilike.%${filter.search}%`);
      }
      const { data, error } = await query;
      if (!error && data) return data;
    } catch { /* fallback */ }
    return [];
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('service_bookings').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch { /* fallback */ }
    return null;
  },

  async create(bookingData: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    address?: string;
    city?: string;
    pincode?: string;
    device_brand: string;
    device_model: string;
    screen_type: string;
    estimated_price: number;
    preferred_date: string;
    preferred_time?: string;
    notes?: string;
  }) {
    const bookingId = `SRV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const record = {
      id: bookingId,
      customer_name: bookingData.customer_name || 'Customer',
      customer_phone: bookingData.customer_phone || '',
      customer_email: bookingData.customer_email || '',
      address: bookingData.address || '',
      city: bookingData.city || 'Tech City',
      pincode: bookingData.pincode || '',
      device_brand: bookingData.device_brand || 'Smartphone',
      device_model: bookingData.device_model || 'Standard Model',
      screen_type: bookingData.screen_type || 'Original OLED Display',
      estimated_price: Number(bookingData.estimated_price) || 2499,
      preferred_date: bookingData.preferred_date || new Date().toISOString().split('T')[0],
      preferred_time: bookingData.preferred_time || '10:00 AM - 01:00 PM',
      notes: bookingData.notes || '',
      status: 'pending',
      admin_notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from('service_bookings').insert([record]).select().single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('ServiceBookings insert warning:', e);
    }

    await logActivity({
      admin_name: 'Customer Online',
      action: 'book_display_service',
      entity_type: 'service_booking',
      entity_id: bookingId,
      details: { model: record.device_model, price: record.estimated_price }
    });

    return record;
  },

  async updateStatus(id: string, status: string, adminNotes?: string, adminName: string = 'Admin') {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        await logActivity({
          admin_name: adminName,
          action: 'update_service_status',
          entity_type: 'service_booking',
          entity_id: id,
          details: updates
        });
        return data;
      }
    } catch (e) {
      console.warn('ServiceBookings update status warning:', e);
    }
    return { id, ...updates };
  },

  async delete(id: string, adminName: string = 'Admin') {
    try {
      await supabase.from('service_bookings').delete().eq('id', id);
      await logActivity({
        admin_name: adminName,
        action: 'delete_service_booking',
        entity_type: 'service_booking',
        entity_id: id
      });
    } catch { /* ignore */ }
    return true;
  }
};

export default {
  CategoriesDB,
  ProductsDB,
  OrdersDB,
  CustomersDB,
  CouponsDB,
  HeroSlidesDB,
  PaymentsDB,
  AdminUsersDB,
  SiteSettingsDB,
  MediaGalleryDB,
  ActivityLogsDB,
  InventoryLogsDB,
  ServiceBookingsDB,
};
