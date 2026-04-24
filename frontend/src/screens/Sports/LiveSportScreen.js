import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';
import { getSportEmoji } from '../../utils/sportIcons';

const isUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Canonical sports available as quick filters. If the user enters with a
// specific sportName that isn't in the list, we still show it at the front.
const QUICK_SPORTS = [
  'All', 'Football', 'Soccer', 'Basketball', 'Cricket', 'Tennis',
  'Baseball', 'Hockey', 'Golf', 'Pickleball', 'Padel', 'Chess',
  'Badminton', 'Table Tennis', 'Volleyball', 'Rugby',
];

const normalize = (s) => (s || '').toString().trim().toLowerCase();

const LiveSportScreen = ({ navigation, route }) => {
  const initialSport = route?.params?.sportName || 'All';
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [tab, setTab] = useState('scores'); // 'scores' | 'news'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [newsRes, scoresRes] = await Promise.all([
        api.get(API_ENDPOINTS.GET_NEWS).catch(() => ({ data: { news: [] } })),
        api.get(API_ENDPOINTS.GET_NEWS_SCORES).catch(() => ({ data: { scores: [] } })),
      ]);
      setNews(newsRes.data?.news || []);
      setScores(scoresRes.data?.scores || []);
    } catch (e) {
      // silent
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Build the sport chip list, ensuring the active sport is included even if custom
  const sportChips = useMemo(() => {
    const base = [...QUICK_SPORTS];
    if (selectedSport && !base.some((s) => normalize(s) === normalize(selectedSport))) {
      base.splice(1, 0, selectedSport);
    }
    return base;
  }, [selectedSport]);

  const filteredScores = useMemo(() => {
    if (selectedSport === 'All') return scores;
    return scores.filter((s) => normalize(s.sport) === normalize(selectedSport));
  }, [scores, selectedSport]);

  const filteredNews = useMemo(() => {
    if (selectedSport === 'All') return news;
    return news.filter((n) => normalize(n.sport) === normalize(selectedSport));
  }, [news, selectedSport]);

  const renderScore = ({ item }) => {
    const home = item.homeTeam || {};
    const away = item.awayTeam || {};
    const isLive = item.status === 'LIVE';
    return (
      <View style={styles.scoreCard}>
        <View style={styles.scoreCardHeader}>
          <View style={styles.scoreCardHeaderLeft}>
            <Ionicons name="trophy" size={14} color="#EF4444" />
            <Text style={styles.scoreCardLeague}>{item.league || item.sport}</Text>
          </View>
          <View style={[styles.statusChip, isLive ? styles.liveChip : styles.finalChip]}>
            {isLive && <View style={styles.liveDot} />}
            <Text style={styles.statusChipText}>{item.status || 'SCHEDULED'}</Text>
          </View>
        </View>
        <View style={styles.scoreTeams}>
          <View style={styles.scoreTeam}>
            {isUrl(home.logo) ? (
              <Image source={{ uri: home.logo }} style={styles.teamLogoImg} resizeMode="contain" />
            ) : (
              <Text style={styles.teamEmoji}>{home.logo || getSportEmoji(item.sport)}</Text>
            )}
            <Text style={styles.teamName} numberOfLines={1}>{home.name}</Text>
            <Text style={styles.teamScore}>{home.score ?? '-'}</Text>
          </View>
          <Text style={styles.scoreVs}>VS</Text>
          <View style={styles.scoreTeam}>
            {isUrl(away.logo) ? (
              <Image source={{ uri: away.logo }} style={styles.teamLogoImg} resizeMode="contain" />
            ) : (
              <Text style={styles.teamEmoji}>{away.logo || getSportEmoji(item.sport)}</Text>
            )}
            <Text style={styles.teamName} numberOfLines={1}>{away.name}</Text>
            <Text style={styles.teamScore}>{away.score ?? '-'}</Text>
          </View>
        </View>
        {!!item.quarter && <Text style={styles.scoreClock}>{item.quarter}</Text>}
      </View>
    );
  };

  const renderNews = ({ item }) => (
    <TouchableOpacity
      style={styles.newsCard}
      activeOpacity={0.9}
      onPress={() => item.url && item.url !== '#' && Linking.openURL(item.url).catch(() => {})}
    >
      {item.imageUrl ? (
        <View style={styles.newsImgWrap}>
          <Image source={{ uri: item.imageUrl }} style={styles.newsImg} />
          <View style={styles.newsChip}>
            <Ionicons name="newspaper" size={11} color={COLORS.white} />
            <Text style={styles.newsChipText}>{item.sport || 'Sports'}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.newsImg, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="newspaper-outline" size={42} color={COLORS.textLight} />
        </View>
      )}
      <View style={styles.newsBody}>
        <Text style={styles.newsTitle} numberOfLines={3}>{item.title}</Text>
        {!!item.summary && <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>}
        <View style={styles.newsFooter}>
          {!!item.source && (
            <>
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsDot}>•</Text>
            </>
          )}
          <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
          <Text style={styles.newsTime}>{timeAgo(item.publishedAt || item.timestamp)}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.newsReadMore}>Read →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const data = tab === 'scores' ? filteredScores : filteredNews;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEmoji}>{getSportEmoji(selectedSport === 'All' ? 'Sports' : selectedSport)}</Text>
          <Text style={styles.headerTitle}>
            {selectedSport === 'All' ? 'Live Sport' : selectedSport}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {sportChips.map((s) => {
          const active = normalize(s) === normalize(selectedSport);
          return (
            <TouchableOpacity
              key={s}
              style={[styles.sportChip, active && styles.sportChipActive]}
              onPress={() => setSelectedSport(s)}
              activeOpacity={0.8}
            >
              <Text style={styles.sportChipEmoji}>
                {s === 'All' ? '🏆' : getSportEmoji(s)}
              </Text>
              <Text style={[styles.sportChipText, active && styles.sportChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'scores' && styles.tabActive]}
          onPress={() => setTab('scores')}
        >
          <Ionicons name="flash" size={16} color={tab === 'scores' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabText, tab === 'scores' && styles.tabTextActive]}>
            Scores {filteredScores.length > 0 ? `(${filteredScores.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'news' && styles.tabActive]}
          onPress={() => setTab('news')}
        >
          <Ionicons name="newspaper" size={16} color={tab === 'news' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabText, tab === 'news' && styles.tabTextActive]}>
            News {filteredNews.length > 0 ? `(${filteredNews.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => `${item.id || item._id || i}_${i}`}
          renderItem={tab === 'scores' ? renderScore : renderNews}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={tab === 'scores' ? 'flash-outline' : 'newspaper-outline'}
                size={56}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyText}>
                No {tab} for {selectedSport === 'All' ? 'any sport' : selectedSport} right now
              </Text>
              <Text style={styles.emptySub}>Pull to refresh or try another sport</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flex: 1, justifyContent: 'center' },
  headerEmoji: { fontSize: 22 },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },

  chipsRow: { maxHeight: 54, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chipsContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  sportChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  sportChipEmoji: { fontSize: 14 },
  sportChipText: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '600' },
  sportChipTextActive: { color: COLORS.primary },

  tabsRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },

  listContent: { paddingVertical: SPACING.sm, paddingBottom: 120 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Score card
  scoreCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    ...SHADOWS.small,
  },
  scoreCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  scoreCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreCardLeague: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '700' },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  liveChip: { backgroundColor: '#EF4444' },
  finalChip: { backgroundColor: COLORS.textSecondary },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },
  statusChipText: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '700' },
  scoreTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  scoreTeam: { flex: 1, alignItems: 'center' },
  teamLogoImg: { width: 44, height: 44, marginBottom: 4 },
  teamEmoji: { fontSize: 28, marginBottom: 4 },
  teamName: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  teamScore: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.primary },
  scoreVs: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  scoreClock: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.sm },

  // News card
  newsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  newsImgWrap: { position: 'relative' },
  newsImg: { width: '100%', height: 180, backgroundColor: COLORS.surface },
  newsChip: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  newsChipText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  newsBody: { padding: SPACING.md },
  newsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, lineHeight: 22, marginBottom: SPACING.xs },
  newsSummary: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 19, marginBottom: SPACING.sm },
  newsFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.xs },
  newsSource: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  newsDot: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginHorizontal: 4 },
  newsTime: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginLeft: 2 },
  newsReadMore: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: SPACING.xl },
  emptyText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md, textAlign: 'center' },
  emptySub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center' },
});

export default LiveSportScreen;
