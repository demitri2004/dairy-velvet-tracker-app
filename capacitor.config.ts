import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dairyvelvet.tracker',
  appName: 'DairyVelvet',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
};

export default config;
