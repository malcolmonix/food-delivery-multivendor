import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { getMenuverseFirestore, getMenuverseStorage } from '../firebase/menuverse';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  coverImage?: string;
  cuisineType: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  deliveryRadius: number; // in kilometers
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  location: {
    latitude: number;
    longitude: number;
  };
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: 'mild' | 'medium' | 'hot' | 'very-hot';
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  variations?: {
    name: string;
    options: { name: string; price: number }[];
  }[];
  addons?: {
    name: string;
    price: number;
    isAvailable: boolean;
  }[];
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class RestaurantService {
  private db = getMenuverseFirestore();
  
  // Use 'eateries' collection to match multivendor-web expectations
  private readonly COLLECTION_NAME = 'eateries';

  // Restaurant CRUD operations
  async getAllRestaurants(): Promise<Restaurant[]> {
    try {
      const restaurantsRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(restaurantsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Restaurant));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Restaurant;
      }
      return null;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  }

  async createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const restaurantsRef = collection(this.db, this.COLLECTION_NAME);
      
      // Map admin panel fields to multivendor-web expected fields
      const mappedData = {
        ...restaurantData,
        // Map image field to both logoUrl and bannerUrl for compatibility
        logoUrl: restaurantData.image || '',
        bannerUrl: restaurantData.image || '',
        // Keep original image field for admin panel compatibility
        image: restaurantData.image || '',
        // Map other fields for web app compatibility
        contactEmail: restaurantData.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(restaurantsRef, mappedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }

  async updateRestaurant(id: string, updates: Partial<Omit<Restaurant, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      
      // Map admin panel fields to multivendor-web expected fields
      const mappedUpdates: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      // If image is being updated, map it to web app fields
      if (updates.image !== undefined) {
        mappedUpdates.logoUrl = updates.image;
        mappedUpdates.bannerUrl = updates.image;
      }
      
      // If email is being updated, map it to contactEmail
      if (updates.email !== undefined) {
        mappedUpdates.contactEmail = updates.email;
      }
      
      await updateDoc(docRef, mappedUpdates);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  }

  async deleteRestaurant(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  }

  // Menu Category CRUD operations
  async getMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
    try {
      const categoriesRef = collection(this.db, 'menuCategories');
      const q = query(
        categoriesRef, 
        where('restaurantId', '==', restaurantId),
        orderBy('order')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuCategory));
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      throw error;
    }
  }

  async createMenuCategory(categoryData: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const categoriesRef = collection(this.db, 'menuCategories');
      const docRef = await addDoc(categoriesRef, {
        ...categoryData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating menu category:', error);
      throw error;
    }
  }

  async updateMenuCategory(id: string, updates: Partial<Omit<MenuCategory, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.db, 'menuCategories', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating menu category:', error);
      throw error;
    }
  }

  async deleteMenuCategory(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'menuCategories', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting menu category:', error);
      throw error;
    }
  }

  // Menu Item CRUD operations
  async getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]> {
    try {
      const itemsRef = collection(this.db, 'menuItems');
      let q = query(
        itemsRef,
        where('restaurantId', '==', restaurantId),
        orderBy('order')
      );

      if (categoryId) {
        q = query(
          itemsRef,
          where('restaurantId', '==', restaurantId),
          where('categoryId', '==', categoryId),
          orderBy('order')
        );
      }

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  async createMenuItem(itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const itemsRef = collection(this.db, 'menuItems');
      const docRef = await addDoc(itemsRef, {
        ...itemData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.db, 'menuItems', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'menuItems', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToRestaurants(callback: (restaurants: Restaurant[]) => void): () => void {
    const restaurantsRef = collection(this.db, this.COLLECTION_NAME);
    const q = query(restaurantsRef, orderBy('name'));
    
    return onSnapshot(q, (snapshot) => {
      const restaurants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Restaurant));
      callback(restaurants);
    });
  }

  subscribeToMenuItems(restaurantId: string, callback: (items: MenuItem[]) => void): () => void {
    const itemsRef = collection(this.db, 'menuItems');
    const q = query(
      itemsRef,
      where('restaurantId', '==', restaurantId),
      orderBy('order')
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));
      callback(items);
    });
  }

  // Analytics and statistics
  async getRestaurantStats(restaurantId: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    totalMenuItems: number;
  }> {
    try {
      // Get menu items count
      const itemsRef = collection(this.db, 'menuItems');
      const itemsQuery = query(itemsRef, where('restaurantId', '==', restaurantId));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      // Get orders (this would be implemented based on your orders collection structure)
      const ordersRef = collection(this.db, 'orders');
      const ordersQuery = query(ordersRef, where('restaurantId', '==', restaurantId));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      let totalRevenue = 0;
      let totalRating = 0;
      let ratingCount = 0;
      
      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data();
        totalRevenue += order.total || 0;
        if (order.rating) {
          totalRating += order.rating;
          ratingCount++;
        }
      });
      
      return {
        totalOrders: ordersSnapshot.size,
        totalRevenue,
        averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
        totalMenuItems: itemsSnapshot.size
      };
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
      throw error;
    }
  }

  async uploadRestaurantImage(file: File, restaurantId: string): Promise<string> {
    // Try multiple upload strategies in order of preference
    const strategies = [
      () => this.uploadToLocalServer(file),
      () => this.uploadToImgur(file),
      () => this.convertToBase64(file),
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        console.log('Image upload successful');
        return result;
      } catch (error) {
        console.warn('Upload strategy failed, trying next:', error);
        continue;
      }
    }

    // All strategies failed, use placeholder
    console.warn('All upload strategies failed, using placeholder');
    return 'https://via.placeholder.com/400x300/f97316/ffffff?text=Restaurant+Image';
  }

  private async uploadToLocalServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Local server upload failed');
    }

    const data = await response.json();
    if (data.success) {
      return data.url;
    } else {
      throw new Error('Local upload API error');
    }
  }

  private async uploadToImgur(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Imgur upload failed');
    }

    const data = await response.json();
    if (data.success) {
      return data.data.link;
    } else {
      throw new Error('Imgur API error');
    }
  }

  private async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Check if image is too large (Firestore has 1MB document limit)
        if (base64String.length > 500000) {
          reject(new Error('Image too large for base64 storage'));
        } else {
          resolve(base64String);
        }
      };
      reader.onerror = () => reject(new Error('Failed to convert to base64'));
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export const restaurantService = new RestaurantService();