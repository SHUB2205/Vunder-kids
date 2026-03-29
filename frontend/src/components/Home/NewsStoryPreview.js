import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const NewsStoryPreview = ({ onOpenFullNews }) => {
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    }
  };

  const handleItemPress = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  // Combine news and scores for story-like display
  const storyItems = [
    // Live scores first
    ...scores.filter(s => s.status === 'LIVE').map(s => ({ ...s, itemType: 'score', isLive: true })),
    // Then news
    ...news.slice(0, 5).map(n => ({ ...n, itemType: 'news' })),
    // Then other scores
    ...scores.filter(s => s.status !== 'LIVE').slice(0, 3).map(s => ({ ...s, itemType: 'score' })),
  ];

  if (storyItems.length === 0) return null;

  return (
    <>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* News/Scores Header */}
        <TouchableOpacity 
          style={styles.headerItem}
          onPress={onOpenFullNews}
        >
          <View style={styles.headerIconContainer}>
            <Ionicons name="newspaper" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.headerText}>Sports</Text>
          <Text style={styles.headerSubtext}>News</Text>
        </TouchableOpacity>

        {storyItems.map((item, index) => (
          <TouchableOpacity
            key={item.id || index}
            style={styles.storyItem}
            onPress={() => handleItemPress(item, item.itemType)}
          >
            {item.itemType === 'score' ? (
              // Live Score Preview
              <View style={[styles.scorePreview, item.isLive && styles.liveScorePreview]}>
                {item.isLive && (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveIndicator} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
                <Text style={styles.scoreTeam} numberOfLines={1}>{item.homeTeam?.name}</Text>
                <Text style={styles.scoreVs}>
                  {item.homeTeam?.score} - {item.awayTeam?.score}
                </Text>
                <Text style={styles.scoreTeam} numberOfLines={1}>{item.awayTeam?.name}</Text>
                <Text style={styles.scoreLeague} numberOfLines={1}>{item.league}</Text>
              </View>
            ) : (
              // News Preview
              <View style={styles.newsPreview}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
                ) : (
                  <View style={styles.newsImagePlaceholder}>
                    <Ionicons name="newspaper-outline" size={24} color={COLORS.textSecondary} />
                  </View>
                )}
                <View style={styles.newsOverlay}>
                  <Text style={styles.newsSport}>{item.sport}</Text>
                </View>
              </View>
            )}
            <Text style={styles.itemLabel} numberOfLines={1}>
              {item.itemType === 'score' ? item.league : item.sport}
            </Text>
          </TouchableOpacity>
        ))}

        {/* View All */}
        <TouchableOpacity style={styles.viewAllItem} onPress={onOpenFullNews}>
          <View style={styles.viewAllCircle}>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>

            {selectedItem?.type === 'news' ? (
              <View style={styles.newsDetail}>
                {selectedItem.imageUrl && (
                  <Image source={{ uri: selectedItem.imageUrl }} style={styles.newsDetailImage} />
                )}
                <View style={styles.newsDetailContent}>
                  <Text style={styles.newsDetailSport}>{selectedItem.sport}</Text>
                  <Text style={styles.newsDetailTitle}>{selectedItem.title}</Text>
                  <Text style={styles.newsDetailSummary}>{selectedItem.summary}</Text>
                  <Text style={styles.newsDetailSource}>{selectedItem.source}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.scoreDetail}>
                <Text style={styles.scoreDetailLeague}>{selectedItem?.league}</Text>
                {selectedItem?.isLive && (
                  <View style={styles.scoreDetailLive}>
                    <View style={styles.liveIndicator} />
                    <Text style={styles.liveTextLarge}>LIVE</Text>
                  </View>
                )}
                <View style={styles.scoreDetailTeams}>
                  <View style={styles.scoreDetailTeam}>
                    <Text style={styles.scoreDetailLogo}>{selectedItem?.homeTeam?.logo}</Text>
                    <Text style={styles.scoreDetailTeamName}>{selectedItem?.homeTeam?.name}</Text>
                    <Text style={styles.scoreDetailScore}>{selectedItem?.homeTeam?.score}</Text>
                  </View>
                  <Text style={styles.scoreDetailVs}>VS</Text>
                  <View style={styles.scoreDetailTeam}>
                    <Text style={styles.scoreDetailLogo}>{selectedItem?.awayTeam?.logo}</Text>
                    <Text style={styles.scoreDetailTeamName}>{selectedItem?.awayTeam?.name}</Text>
                    <Text style={styles.scoreDetailScore}>{selectedItem?.awayTeam?.score}</Text>
                  </View>
                </View>
                <Text style={styles.scoreDetailQuarter}>{selectedItem?.quarter}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.viewMoreBtn}
              onPress={() => {
                setShowModal(false);
                onOpenFullNews?.();
              }}
            >
              <Text style={styles.viewMoreText}>View All News & Scores</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 72,
  },
  scorePreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 4,
  },
  liveScorePreview: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  liveBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  liveIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.white,
    marginRight: 2,
  },
  liveText: {
    fontSize: 6,
    fontWeight: '700',
    color: COLORS.white,
  },
  scoreTeam: {
    fontSize: 7,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  scoreVs: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginVertical: 1,
  },
  scoreLeague: {
    fontSize: 6,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  newsPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
  },
  newsSport: {
    fontSize: 7,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    maxWidth: 64,
  },
  viewAllItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  viewAllCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  viewAllText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsDetail: {
    width: '100%',
  },
  newsDetailImage: {
    width: '100%',
    height: 180,
  },
  newsDetailContent: {
    padding: SPACING.lg,
  },
  newsDetailSport: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  newsDetailTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  newsDetailSummary: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  newsDetailSource: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  scoreDetail: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  scoreDetailLeague: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  scoreDetailLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  liveTextLarge: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  scoreDetailTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  scoreDetailTeam: {
    flex: 1,
    alignItems: 'center',
  },
  scoreDetailLogo: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  scoreDetailTeamName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  scoreDetailScore: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  scoreDetailVs: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  scoreDetailQuarter: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  viewMoreBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  viewMoreText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default NewsStoryPreview;
