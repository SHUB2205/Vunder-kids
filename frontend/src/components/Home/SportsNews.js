import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const SportsNews = ({ onClose }) => {
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('news');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [newsRes, scoresRes] = await Promise.all([
        api.get(API_ENDPOINTS.GET_NEWS),
        api.get(API_ENDPOINTS.GET_NEWS_SCORES),
      ]);
      setNews(newsRes.data.news || []);
      setScores(scoresRes.data.scores || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderNewsItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.newsCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Text style={styles.sportTag}>{item.sport}</Text>
          <Text style={styles.newsTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
        <Text style={styles.newsSource}>{item.source}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderScoreItem = (item) => (
    <View key={item.id} style={styles.scoreCard}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLeague}>{item.league}</Text>
        <View style={[styles.statusBadge, item.status === 'LIVE' && styles.liveBadge]}>
          <Text style={[styles.statusText, item.status === 'LIVE' && styles.liveText]}>
            {item.status === 'LIVE' ? '● LIVE' : item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.teamsContainer}>
        <View style={styles.teamRow}>
          <Text style={styles.teamLogo}>{item.homeTeam.logo}</Text>
          <Text style={styles.teamName}>{item.homeTeam.name}</Text>
          <Text style={styles.teamScore}>{item.homeTeam.score}</Text>
        </View>
        <View style={styles.teamRow}>
          <Text style={styles.teamLogo}>{item.awayTeam.logo}</Text>
          <Text style={styles.teamName}>{item.awayTeam.name}</Text>
          <Text style={styles.teamScore}>{item.awayTeam.score}</Text>
        </View>
      </View>
      
      <Text style={styles.scoreQuarter}>{item.quarter}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading sports updates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sports Updates</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Ionicons 
            name="newspaper-outline" 
            size={18} 
            color={activeTab === 'news' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
            News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scores' && styles.activeTab]}
          onPress={() => setActiveTab('scores')}
        >
          <Ionicons 
            name="stats-chart-outline" 
            size={18} 
            color={activeTab === 'scores' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'scores' && styles.activeTabText]}>
            Live Scores
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'news' ? (
          news.length > 0 ? (
            news.map(renderNewsItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No news available</Text>
            </View>
          )
        ) : (
          scores.length > 0 ? (
            scores.map(renderScoreItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="stats-chart-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No live scores</Text>
            </View>
          )
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  activeTab: {
    backgroundColor: COLORS.primaryLight || '#E8F5E9',
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  newsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  newsImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.surface,
  },
  newsContent: {
    padding: SPACING.md,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sportTag: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  newsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  newsSource: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scoreLeague: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  liveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  liveText: {
    color: '#E53935',
  },
  teamsContainer: {
    marginBottom: SPACING.sm,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  teamLogo: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  teamName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  teamScore: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreQuarter: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default SportsNews;
