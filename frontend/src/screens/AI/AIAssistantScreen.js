import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../config/theme';

const AIAssistantScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Initial greeting based on user's profile
    const greeting = generateGreeting();
    setMessages([
      {
        id: '1',
        text: greeting,
        isAI: true,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const generateGreeting = () => {
    const sports = user?.passions?.map((p) => p.name).join(', ') || 'sports';
    return `Hi ${user?.name || 'there'}! 👋 I'm your personal sports AI assistant. I've noticed you're interested in ${sports}. I can help you with:\n\n• Training tips and advice\n• Match analysis and strategy\n• Nutrition and recovery\n• Finding matches and teammates\n• Tracking your progress\n\nWhat would you like to know?`;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isAI: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post(API_ENDPOINTS.AI_CHAT, {
        message: inputText.trim(),
        context: {
          userName: user?.name,
          passions: user?.passions,
          recentMatches: user?.matchIds?.slice(-5),
          skillLevels: user?.passions?.map((p) => ({
            sport: p.name,
            level: p.skillLevel,
          })),
        },
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || getDefaultResponse(inputText),
        isAI: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        text: getDefaultResponse(inputText),
        isAI: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('training') || lowerQuery.includes('practice')) {
      return `Based on your skill level, here are some training tips:\n\n1. **Warm-up properly** - 10-15 minutes of dynamic stretching\n2. **Focus on fundamentals** - Master the basics before advanced techniques\n3. **Consistency is key** - Train at least 3-4 times per week\n4. **Rest and recover** - Your body needs time to adapt\n\nWould you like specific drills for any of your sports?`;
    }

    if (lowerQuery.includes('match') || lowerQuery.includes('game')) {
      return `I can help you prepare for your matches! Here's what I recommend:\n\n• **Pre-match**: Get good sleep, eat light 2-3 hours before\n• **Warm-up**: Arrive early for proper preparation\n• **Mental prep**: Visualize your game plan\n• **During match**: Stay focused, communicate with teammates\n\nWant me to help you find upcoming matches in your area?`;
    }

    if (lowerQuery.includes('nutrition') || lowerQuery.includes('diet') || lowerQuery.includes('eat')) {
      return `Nutrition is crucial for athletic performance! Here are my recommendations:\n\n🥗 **Pre-workout**: Complex carbs + lean protein (2-3 hours before)\n🍌 **During**: Stay hydrated, electrolytes for long sessions\n🥛 **Post-workout**: Protein within 30 mins for recovery\n\nWould you like a personalized meal plan based on your training schedule?`;
    }

    if (lowerQuery.includes('injury') || lowerQuery.includes('pain') || lowerQuery.includes('hurt')) {
      return `⚠️ I'm sorry to hear you might be injured. Here's my advice:\n\n1. **Stop immediately** if you feel sharp pain\n2. **RICE method**: Rest, Ice, Compression, Elevation\n3. **Consult a professional** for persistent pain\n\n**Important**: I'm an AI assistant, not a medical professional. Please see a doctor for proper diagnosis and treatment.`;
    }

    return `That's a great question! Based on your profile and interests in ${user?.passions?.map((p) => p.name).join(', ') || 'sports'}, I'd be happy to help.\n\nCould you tell me more about what specific aspect you'd like advice on? I can help with:\n• Training and technique\n• Match preparation\n• Nutrition and recovery\n• Finding teammates or matches`;
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isAI && styles.aiMessageContainer]}>
      {item.isAI && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={20} color={COLORS.white} />
        </View>
      )}
      <View style={[styles.messageBubble, item.isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.messageText, !item.isAI && styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Quick questions:</Text>
      <View style={styles.suggestionsRow}>
        {[
          'Training tips',
          'Match prep',
          'Nutrition advice',
          'Find matches',
        ].map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            style={styles.suggestionChip}
            onPress={() => {
              setInputText(suggestion);
            }}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiHeaderIcon}>
            <Ionicons name="sparkles" size={16} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={20} color={COLORS.white} />
              </View>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {messages.length <= 1 && renderSuggestions()}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything about sports..."
              placeholderTextColor={COLORS.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  messagesList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  aiMessageContainer: {
    flexDirection: 'row',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    marginLeft: 'auto',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  typingText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  suggestionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  suggestionsTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    maxHeight: 100,
  },
  input: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default AIAssistantScreen;
