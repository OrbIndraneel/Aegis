/* eslint-disable */
declare module 'react-native/Libraries/Image/AssetSourceResolver';
declare module 'react-native/Libraries/Image/resolveAssetSource';
declare module '@react-native/assets-registry/registry';
declare module 'expo-app-metrics';
declare module 'expo-observe';
declare module 'invariant';

declare global {
  interface Window {
    $$EXPO_INITIAL_PROPS?: any;
  }
}

declare module 'expo-asset' {
  export class Asset {
    name: string;
    type: string;
    hash?: string | null;
    uri: string;
    localUri?: string | null;
    width?: number | null;
    height?: number | null;
    static loadAsync(moduleId: number | number[] | string | string[]): Promise<Asset[]>;
    static fromModule(moduleId: number | string): Asset;
    static fromURI(uri: string): Asset;
    downloadAsync(): Promise<this>;
  }
  export function useAssets(modules: any[]): [Asset[] | undefined, Error | undefined];
}

declare module 'expo-image' {
  import React from 'react';
  import { ImageProps as RNImageProps, StyleProp } from 'react-native';

  export interface ImageProps extends RNImageProps {
    source?: any;
    placeholder?: any;
    contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    transition?: number | { duration?: number };
    tintColor?: string;
    [key: string]: any;
  }

  export const Image: React.ComponentType<ImageProps>;
  export const ImageBackground: React.ComponentType<ImageProps>;
  export function useImage(source: any, options?: any): any;
}
