import { Animated, Easing } from 'react-native';

export const fadeIn = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

export const fadeOut = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

export const slideIn = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

export const slideOut = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 100,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

export const scaleIn = (value, duration = 300) => {
  return Animated.spring(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
    tension: 50,
    friction: 7,
  });
};

export const scaleOut = (value, duration = 300) => {
  return Animated.spring(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
    tension: 50,
    friction: 7,
  });
};

export const createStaggeredAnimation = (items, animation, delay = 100) => {
  return Animated.stagger(
    delay,
    items.map(item => animation(item))
  );
};

export const createParallelAnimation = (items, animation) => {
  return Animated.parallel(items.map(item => animation(item)));
};

export const createSequenceAnimation = (animations) => {
  return Animated.sequence(animations);
};

export const interpolateColor = (animation, inputRange, outputRange) => {
  return animation.interpolate({
    inputRange,
    outputRange,
  });
};

export const createPressAnimation = (value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
  ]);
};

export const createShakeAnimation = (value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }),
  ]);
}; 