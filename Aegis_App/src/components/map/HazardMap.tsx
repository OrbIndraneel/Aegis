import React from 'react';
import { Platform } from 'react-native';
import { HazardMap as WebMap } from './HazardMap.web';
import { HazardMap as NativeMap } from './HazardMap.native';

export const HazardMap: React.FC<any> = (props) => {
  if (Platform.OS === 'web') {
    return <WebMap {...props} />;
  }
  return <NativeMap {...props} />;
};
