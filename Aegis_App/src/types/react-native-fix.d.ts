/* eslint-disable */
import type * as React from 'react';
import type {
  ViewProps,
  TextProps,
  ScrollViewProps,
  TextInputProps,
  TouchableOpacityProps,
  TouchableHighlightProps,
  TouchableWithoutFeedbackProps,
  ModalProps,
  ImageProps,
  ImageBackgroundProps,
  SwitchProps,
  ActivityIndicatorProps,
  FlatListProps,
  SectionListProps,
} from 'react-native';

declare module 'react' {
  interface Attributes {
    children?: React.ReactNode;
  }
}

declare module 'react-native' {
  interface View extends React.Component<ViewProps> {}
  interface Text extends React.Component<TextProps> {}
  interface ScrollView extends React.Component<ScrollViewProps> {}
  interface TextInput extends React.Component<TextInputProps> {}
  interface TouchableOpacity extends React.Component<TouchableOpacityProps> {}
  interface TouchableHighlight extends React.Component<TouchableHighlightProps> {}
  interface TouchableWithoutFeedback extends React.Component<TouchableWithoutFeedbackProps> {}
  interface Modal extends React.Component<ModalProps> {}
  interface Image extends React.Component<ImageProps> {}
  interface ImageBackground extends React.Component<ImageBackgroundProps> {}
  interface Switch extends React.Component<SwitchProps> {}
  interface ActivityIndicator extends React.Component<ActivityIndicatorProps> {}

  interface FlatListProps<ItemT> extends ScrollViewProps {}
  interface SectionListProps<ItemT, SectionT = any> extends ScrollViewProps {}

  namespace Animated {
    interface AnimatedComponent<T extends React.ComponentType<any>> {
      (props: any): React.ReactNode;
    }
  }
}
