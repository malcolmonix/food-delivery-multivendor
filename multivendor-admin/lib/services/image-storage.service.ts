// Alternative image storage utilities
export class ImageStorageService {
  private static instance: ImageStorageService;
  
  static getInstance(): ImageStorageService {
    if (!ImageStorageService.instance) {
      ImageStorageService.instance = new ImageStorageService();
    }
    return ImageStorageService.instance;
  }

  // Option 1: Imgur API Upload
  async uploadToImgur(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7', // Anonymous uploads
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

  // Option 2: Base64 Conversion (for small images stored in Firestore)
  async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Option 3: Cloudinary Upload (free tier available)
  async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'restaurant_images'); // You'd need to set this up
    formData.append('cloud_name', 'your_cloud_name'); // Replace with your cloud name

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  }

  // Option 4: Upload to own server (if you have one)
  async uploadToServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Server upload failed');
    }

    const data = await response.json();
    return data.url;
  }

  // Main upload method with fallbacks
  async uploadImage(file: File, options?: { preferredMethod?: 'imgur' | 'cloudinary' | 'base64' | 'server' }): Promise<string> {
    const method = options?.preferredMethod || 'imgur';
    
    try {
      switch (method) {
        case 'imgur':
          return await this.uploadToImgur(file);
        case 'cloudinary':
          return await this.uploadToCloudinary(file);
        case 'server':
          return await this.uploadToServer(file);
        case 'base64':
          const base64 = await this.convertToBase64(file);
          // Check size limit for Firestore
          if (base64.length > 500000) {
            throw new Error('Image too large for base64 storage');
          }
          return base64;
        default:
          return await this.uploadToImgur(file);
      }
    } catch (error) {
      console.warn(`${method} upload failed:`, error);
      
      // Fallback to base64 if file is small enough
      try {
        const base64 = await this.convertToBase64(file);
        if (base64.length <= 500000) {
          return base64;
        }
      } catch (base64Error) {
        console.warn('Base64 conversion failed:', base64Error);
      }
      
      // Final fallback to placeholder
      return 'https://via.placeholder.com/400x300/f97316/ffffff?text=Restaurant+Image';
    }
  }
}

export const imageStorageService = ImageStorageService.getInstance();