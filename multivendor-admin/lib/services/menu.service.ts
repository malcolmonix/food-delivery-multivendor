import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Unsubscribe,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getMenuverseFirestore, getMenuverseStorage } from '../firebase/menuverse';

// Enhanced interfaces for menu management
export interface MenuItemVariation {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
  category: string;
  isRequired?: boolean;
  maxSelections?: number;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[]; // Multiple images support
  variations?: MenuItemVariation[];
  addons?: MenuItemAddon[];
  nutritionalInfo?: NutritionalInfo;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  spiceLevel?: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  preparationTime?: number; // in minutes
  isAvailable: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  discountPrice?: number;
  discountPercentage?: number;
  tags?: string[];
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuStats {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  categoriesCount: number;
  popularItems: number;
  featuredItems: number;
  averagePrice: number;
  vegetarianItems: number;
  veganItems: number;
}

class MenuService {
  private db = getMenuverseFirestore();
  private storage = getMenuverseStorage();

  // Menu Categories CRUD
  async createCategory(category: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const categoryData = {
      ...category,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(this.db, 'menuCategories'), categoryData);
    return docRef.id;
  }

  async updateCategory(id: string, updates: Partial<MenuCategory>): Promise<void> {
    const categoryRef = doc(this.db, 'menuCategories', id);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  async deleteCategory(id: string): Promise<void> {
    // First, delete all menu items in this category
    const itemsQuery = query(
      collection(this.db, 'menuItems'),
      where('categoryId', '==', id)
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    
    const batch = writeBatch(this.db);
    itemsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the category
    batch.delete(doc(this.db, 'menuCategories', id));
    await batch.commit();
  }

  async getCategoriesByRestaurant(restaurantId: string): Promise<MenuCategory[]> {
    const q = query(
      collection(this.db, 'menuCategories'),
      where('restaurantId', '==', restaurantId),
      orderBy('sortOrder', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuCategory));
  }

  async reorderCategories(restaurantId: string, categoryIds: string[]): Promise<void> {
    const batch = writeBatch(this.db);
    
    categoryIds.forEach((categoryId, index) => {
      const categoryRef = doc(this.db, 'menuCategories', categoryId);
      batch.update(categoryRef, { sortOrder: index });
    });
    
    await batch.commit();
  }

  // Menu Items CRUD
  async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const itemData = {
      ...item,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(this.db, 'menuItems'), itemData);
    return docRef.id;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    const itemRef = doc(this.db, 'menuItems', id);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  async deleteMenuItem(id: string): Promise<void> {
    const itemRef = doc(this.db, 'menuItems', id);
    
    // Get the item to delete associated images
    const itemDoc = await getDoc(itemRef);
    if (itemDoc.exists()) {
      const item = itemDoc.data() as MenuItem;
      
      // Delete main image if exists
      if (item.image) {
        try {
          await this.deleteMenuItemImage(item.image);
        } catch (error) {
          console.warn('Failed to delete main image:', error);
        }
      }
      
      // Delete additional images if exist
      if (item.images && item.images.length > 0) {
        for (const imageUrl of item.images) {
          try {
            await this.deleteMenuItemImage(imageUrl);
          } catch (error) {
            console.warn('Failed to delete image:', error);
          }
        }
      }
    }
    
    await deleteDoc(itemRef);
  }

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    const itemDoc = await getDoc(doc(this.db, 'menuItems', id));
    
    if (!itemDoc.exists()) {
      return null;
    }
    
    return {
      id: itemDoc.id,
      ...itemDoc.data()
    } as MenuItem;
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    const q = query(
      collection(this.db, 'menuItems'),
      where('categoryId', '==', categoryId),
      orderBy('sortOrder', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
  }

  async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    const q = query(
      collection(this.db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      orderBy('sortOrder', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
  }

  async getPopularItems(restaurantId: string, limit: number = 10): Promise<MenuItem[]> {
    const q = query(
      collection(this.db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      where('isPopular', '==', true),
      where('isAvailable', '==', true),
      orderBy('sortOrder', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
  }

  async getFeaturedItems(restaurantId: string, limit: number = 5): Promise<MenuItem[]> {
    const q = query(
      collection(this.db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      where('isFeatured', '==', true),
      where('isAvailable', '==', true),
      orderBy('sortOrder', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
  }

  async searchMenuItems(restaurantId: string, searchTerm: string): Promise<MenuItem[]> {
    // Note: Firestore doesn't support full-text search, so we'll do client-side filtering
    // In production, consider using Algolia or Elasticsearch for better search
    const items = await this.getMenuItemsByRestaurant(restaurantId);
    const term = searchTerm.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(term))) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }

  async updateItemAvailability(id: string, isAvailable: boolean): Promise<void> {
    await this.updateMenuItem(id, { isAvailable, updatedAt: new Date() });
  }

  async toggleItemPopularity(id: string): Promise<void> {
    const item = await this.getMenuItemById(id);
    if (item) {
      await this.updateMenuItem(id, { 
        isPopular: !item.isPopular,
        updatedAt: new Date()
      });
    }
  }

  async toggleItemFeatured(id: string): Promise<void> {
    const item = await this.getMenuItemById(id);
    if (item) {
      await this.updateMenuItem(id, { 
        isFeatured: !item.isFeatured,
        updatedAt: new Date()
      });
    }
  }

  // Image management
  async uploadMenuItemImage(file: File, itemId: string, isMain: boolean = true): Promise<string> {
    const timestamp = Date.now();
    const fileName = `menu-items/${itemId}/${isMain ? 'main' : timestamp}_${file.name}`;
    const storageRef = ref(this.storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  }

  async deleteMenuItemImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(this.storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.warn('Failed to delete image from storage:', error);
    }
  }

  async uploadCategoryImage(file: File, categoryId: string): Promise<string> {
    const fileName = `menu-categories/${categoryId}_${file.name}`;
    const storageRef = ref(this.storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  }

  // Bulk operations
  async bulkUpdateItemsAvailability(itemIds: string[], isAvailable: boolean): Promise<void> {
    const batch = writeBatch(this.db);
    
    itemIds.forEach(itemId => {
      const itemRef = doc(this.db, 'menuItems', itemId);
      batch.update(itemRef, { isAvailable, updatedAt: new Date() });
    });
    
    await batch.commit();
  }

  async duplicateMenuItem(itemId: string, newName?: string): Promise<string> {
    const originalItem = await this.getMenuItemById(itemId);
    
    if (!originalItem) {
      throw new Error('Menu item not found');
    }
    
    const { id, createdAt, updatedAt, ...itemData } = originalItem;
    const duplicatedItem = {
      ...itemData,
      name: newName || `${originalItem.name} (Copy)`,
      sortOrder: (originalItem.sortOrder || 0) + 1
    };
    
    return await this.createMenuItem(duplicatedItem);
  }

  // Statistics and analytics
  async getMenuStats(restaurantId: string): Promise<MenuStats> {
    const items = await this.getMenuItemsByRestaurant(restaurantId);
    const categories = await this.getCategoriesByRestaurant(restaurantId);
    
    const activeItems = items.filter(item => item.isAvailable);
    const popularItems = items.filter(item => item.isPopular);
    const featuredItems = items.filter(item => item.isFeatured);
    const vegetarianItems = items.filter(item => item.isVegetarian);
    const veganItems = items.filter(item => item.isVegan);
    
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const averagePrice = items.length > 0 ? totalPrice / items.length : 0;
    
    return {
      totalItems: items.length,
      activeItems: activeItems.length,
      inactiveItems: items.length - activeItems.length,
      categoriesCount: categories.length,
      popularItems: popularItems.length,
      featuredItems: featuredItems.length,
      averagePrice: averagePrice,
      vegetarianItems: vegetarianItems.length,
      veganItems: veganItems.length
    };
  }

  // Real-time subscriptions
  subscribeToCategories(restaurantId: string, callback: (categories: MenuCategory[]) => void): Unsubscribe {
    const q = query(
      collection(this.db, 'menuCategories'),
      where('restaurantId', '==', restaurantId),
      orderBy('sortOrder', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuCategory));
      callback(categories);
    });
  }

  subscribeToMenuItems(restaurantId: string, callback: (items: MenuItem[]) => void): Unsubscribe {
    const q = query(
      collection(this.db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      orderBy('sortOrder', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));
      callback(items);
    });
  }

  subscribeToMenuItemsByCategory(categoryId: string, callback: (items: MenuItem[]) => void): Unsubscribe {
    const q = query(
      collection(this.db, 'menuItems'),
      where('categoryId', '==', categoryId),
      orderBy('sortOrder', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));
      callback(items);
    });
  }

  // Menu item variations and addons management
  async addItemVariation(itemId: string, variation: Omit<MenuItemVariation, 'id'>): Promise<void> {
    const variationWithId = {
      ...variation,
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const itemRef = doc(this.db, 'menuItems', itemId);
    await updateDoc(itemRef, {
      variations: arrayUnion(variationWithId),
      updatedAt: new Date()
    });
  }

  async removeItemVariation(itemId: string, variationId: string): Promise<void> {
    const item = await this.getMenuItemById(itemId);
    if (item && item.variations) {
      const updatedVariations = item.variations.filter(v => v.id !== variationId);
      await this.updateMenuItem(itemId, { variations: updatedVariations });
    }
  }

  async addItemAddon(itemId: string, addon: Omit<MenuItemAddon, 'id'>): Promise<void> {
    const addonWithId = {
      ...addon,
      id: `addon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const itemRef = doc(this.db, 'menuItems', itemId);
    await updateDoc(itemRef, {
      addons: arrayUnion(addonWithId),
      updatedAt: new Date()
    });
  }

  async removeItemAddon(itemId: string, addonId: string): Promise<void> {
    const item = await this.getMenuItemById(itemId);
    if (item && item.addons) {
      const updatedAddons = item.addons.filter(a => a.id !== addonId);
      await this.updateMenuItem(itemId, { addons: updatedAddons });
    }
  }
}

export const menuService = new MenuService();