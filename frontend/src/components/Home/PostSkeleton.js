import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const Shimmer = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[style, { opacity, backgroundColor: COLORS.border }]} />;
};

const PostSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Shimmer style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Shimmer style={[styles.line, { width: '40%' }]} />
        <Shimmer style={[styles.line, { width: '25%', marginTop: 6, height: 10 }]} />
      </View>
    </View>
    <Shimmer style={styles.media} />
    <View style={styles.actions}>
      <Shimmer style={styles.actionDot} />
      <Shimmer style={styles.actionDot} />
      <Shimmer style={styles.actionDot} />
    </View>
    <Shimmer style={[styles.line, { width: '80%', marginHorizontal: SPACING.md, marginBottom: 6 }]} />
    <Shimmer style={[styles.line, { width: '50%', marginHorizontal: SPACING.md, marginBottom: SPACING.md }]} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    paddingTop: SPACING.md,
    ...SHADOWS.small,
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  line: { height: 12, borderRadius: 6 },
  media: { height: 220, marginHorizontal: 0, borderRadius: 0 },
  actions: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.md },
  actionDot: { width: 26, height: 26, borderRadius: 13 },
});

export default PostSkeleton;
