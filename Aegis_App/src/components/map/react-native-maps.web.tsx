import React from 'react';
import { View } from 'react-native';

export const PROVIDER_DEFAULT = 'default';
export const PROVIDER_GOOGLE = 'google';

export const MapView: React.FC<any> = (props) => {
  return <View {...props}>{props.children}</View>;
};

export const Marker: React.FC<any> = (props) => {
  return <View {...props}>{props.children}</View>;
};

export const Polygon: React.FC<any> = () => null;
export const Polyline: React.FC<any> = () => null;
export const Circle: React.FC<any> = () => null;
export const Callout: React.FC<any> = (props) => <View {...props}>{props.children}</View>;

export default MapView;
