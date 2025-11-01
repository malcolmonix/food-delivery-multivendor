import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { getMenuverseAuth, getMenuverseFirestore } from '../firebase/menuverse';

// Admin user types and permissions
export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  permissions: AdminPermission[];
  restaurantIds?: string[]; // For restaurant-specific admins
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  profileImage?: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'restaurant_manager' | 'staff';

export type AdminPermission = 
  | 'manage_restaurants'
  | 'manage_menus'
  | 'manage_orders'
  | 'manage_users'
  | 'manage_admins'
  | 'view_analytics'
  | 'manage_promotions'
  | 'manage_deliveries'
  | 'manage_payments'
  | 'manage_settings';

// Role-based permission mapping
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'manage_restaurants',
    'manage_menus',
    'manage_orders',
    'manage_users',
    'manage_admins',
    'view_analytics',
    'manage_promotions',
    'manage_deliveries',
    'manage_payments',
    'manage_settings'
  ],
  admin: [
    'manage_restaurants',
    'manage_menus',
    'manage_orders',
    'manage_users',
    'view_analytics',
    'manage_promotions',
    'manage_deliveries'
  ],
  restaurant_manager: [
    'manage_menus',
    'manage_orders',
    'view_analytics'
  ],
  staff: [
    'manage_orders',
    'view_analytics'
  ]
};

class AdminAuthService {
  private auth = getMenuverseAuth();
  private db = getMenuverseFirestore();
  private currentUser: AdminUser | null = null;

  // Authentication methods
  async signIn(email: string, password: string): Promise<AdminUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const adminUser = await this.getAdminUser(userCredential.user.uid);
      
      if (!adminUser) {
        await signOut(this.auth);
        throw new Error('Access denied. Admin account not found.');
      }

      if (!adminUser.isActive) {
        await signOut(this.auth);
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Update last login time
      await this.updateLastLogin(adminUser.uid);
      
      this.currentUser = adminUser;
      return adminUser;
    } catch (error: any) {
      console.error('Admin sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  async createAdmin(
    email: string, 
    password: string, 
    displayName: string, 
    role: AdminRole,
    restaurantIds?: string[]
  ): Promise<AdminUser> {
    try {
      // Only super_admin can create other admins
      if (!this.hasPermission('manage_admins')) {
        throw new Error('Permission denied. Only super admins can create admin accounts.');
      }

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      const adminUser: AdminUser = {
        uid: userCredential.user.uid,
        email,
        displayName,
        role,
        permissions: ROLE_PERMISSIONS[role],
        restaurantIds: role === 'restaurant_manager' || role === 'staff' ? restaurantIds : undefined,
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(doc(this.db, 'adminUsers', userCredential.user.uid), adminUser);
      
      return adminUser;
    } catch (error: any) {
      console.error('Create admin error:', error);
      throw new Error(error.message || 'Failed to create admin account');
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser = null;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user before password change
      await signInWithEmailAndPassword(this.auth, user.email, currentPassword);
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  }

  // User management
  async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      const adminDoc = await getDoc(doc(this.db, 'adminUsers', uid));
      
      if (!adminDoc.exists()) {
        return null;
      }

      return {
        uid: adminDoc.id,
        ...adminDoc.data()
      } as AdminUser;
    } catch (error) {
      console.error('Get admin user error:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
        unsubscribe();
        
        if (user) {
          const adminUser = await this.getAdminUser(user.uid);
          this.currentUser = adminUser;
          resolve(adminUser);
        } else {
          resolve(null);
        }
      });
    });
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      if (!this.hasPermission('manage_admins')) {
        throw new Error('Permission denied');
      }

      const adminsSnapshot = await getDocs(collection(this.db, 'adminUsers'));
      return adminsSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as AdminUser));
    } catch (error: any) {
      console.error('Get all admins error:', error);
      throw new Error(error.message || 'Failed to fetch admin users');
    }
  }

  async updateAdminRole(uid: string, role: AdminRole, restaurantIds?: string[]): Promise<void> {
    try {
      if (!this.hasPermission('manage_admins')) {
        throw new Error('Permission denied');
      }

      const updates: Partial<AdminUser> = {
        role,
        permissions: ROLE_PERMISSIONS[role],
        restaurantIds: role === 'restaurant_manager' || role === 'staff' ? restaurantIds : undefined
      };

      await updateDoc(doc(this.db, 'adminUsers', uid), updates);
    } catch (error: any) {
      console.error('Update admin role error:', error);
      throw new Error(error.message || 'Failed to update admin role');
    }
  }

  async toggleAdminStatus(uid: string, isActive: boolean): Promise<void> {
    try {
      if (!this.hasPermission('manage_admins')) {
        throw new Error('Permission denied');
      }

      await updateDoc(doc(this.db, 'adminUsers', uid), { isActive });
    } catch (error: any) {
      console.error('Toggle admin status error:', error);
      throw new Error(error.message || 'Failed to update admin status');
    }
  }

  async deleteAdmin(uid: string): Promise<void> {
    try {
      if (!this.hasPermission('manage_admins')) {
        throw new Error('Permission denied');
      }

      // Don't allow deletion of the current user
      if (this.currentUser && this.currentUser.uid === uid) {
        throw new Error('Cannot delete your own account');
      }

      await deleteDoc(doc(this.db, 'adminUsers', uid));
    } catch (error: any) {
      console.error('Delete admin error:', error);
      throw new Error(error.message || 'Failed to delete admin account');
    }
  }

  // Permission and access control
  hasPermission(permission: AdminPermission): boolean {
    if (!this.currentUser) {
      return false;
    }

    return this.currentUser.permissions.includes(permission);
  }

  hasRole(role: AdminRole): boolean {
    if (!this.currentUser) {
      return false;
    }

    return this.currentUser.role === role;
  }

  canAccessRestaurant(restaurantId: string): boolean {
    if (!this.currentUser) {
      return false;
    }

    // Super admins and general admins can access all restaurants
    if (this.currentUser.role === 'super_admin' || this.currentUser.role === 'admin') {
      return true;
    }

    // Restaurant-specific roles can only access their assigned restaurants
    return this.currentUser.restaurantIds?.includes(restaurantId) || false;
  }

  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }

  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('super_admin');
  }

  // Utility methods
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'adminUsers', uid), {
        lastLoginAt: new Date()
      });
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  // Authentication state observer
  onAuthStateChanged(callback: (user: AdminUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const adminUser = await this.getAdminUser(user.uid);
        this.currentUser = adminUser;
        callback(adminUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  // Session management
  async refreshSession(): Promise<AdminUser | null> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        const adminUser = await this.getAdminUser(user.uid);
        this.currentUser = adminUser;
        return adminUser;
      }
      return null;
    } catch (error) {
      console.error('Refresh session error:', error);
      return null;
    }
  }

  // Profile management
  async updateProfile(updates: { displayName?: string; profileImage?: string }): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (!user || !this.currentUser) {
        throw new Error('No authenticated user found');
      }

      // Update Firebase Auth profile
      if (updates.displayName) {
        await updateProfile(user, { displayName: updates.displayName });
      }

      // Update admin user document
      await updateDoc(doc(this.db, 'adminUsers', this.currentUser.uid), updates);
      
      // Update local current user
      this.currentUser = { ...this.currentUser, ...updates };
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }
}

export const adminAuthService = new AdminAuthService();