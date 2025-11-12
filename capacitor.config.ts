import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arhamstationary.app',
  appName: 'Arham Stationary POS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app needs camera access for barcode scanning'
      }
    }
  }
};

export default config;

