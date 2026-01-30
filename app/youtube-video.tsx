import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Clipboard } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { generateText } from '@rork-ai/toolkit-sdk';
import { useExplanations } from '@/contexts/explanations';
import LanguagePicker from '@/components/LanguagePicker';
import { GenerateLanguage } from '@/constants/languageOptions';

const YOUTUBE_URL_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

export default function YouTubeVideoScreen() {
  const router = useRouter();
  const { addExplanation } = useExplanations();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<GenerateLanguage>("auto");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const extractVideoId = (inputUrl: string): string | null => {
    const match = inputUrl.match(YOUTUBE_URL_REGEX);
    return match ? match[1] : null;
  };

  const handleUrlChange = (text: string) => {
    setUrl(text);
    setError('');

    const extractedId = extractVideoId(text);
    if (extractedId) {
      setVideoId(extractedId);
      setVideoInfo({
        title: 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`,
      });
    } else {
      setVideoId('');
      setVideoInfo(null);
    }
  };

  const fetchVideoInfo = async (id: string): Promise<{ title: string; description: string; channel: string; tags: string }> => {
    console.log('Fetching video info for:', id);

    // Try noembed API first (most reliable)
    try {
      const noembedResponse = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
      if (noembedResponse.ok) {
        const data = await noembedResponse.json();
        console.log('Noembed data:', JSON.stringify(data, null, 2));
        if (data.title && !data.error) {
          return {
            title: data.title,
            description: '',
            channel: data.author_name || '',
            tags: '',
          };
        }
      }
    } catch (err) {
      console.log('Noembed API error:', err);
    }

    // Try oembed API as fallback
    try {
      const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (oembedResponse.ok) {
        const data = await oembedResponse.json();
        console.log('Oembed data:', JSON.stringify(data, null, 2));
        if (data.title) {
          return {
            title: data.title,
            description: '',
            channel: data.author_name || '',
            tags: '',
          };
        }
      }
    } catch (err) {
      console.log('Oembed API error:', err);
    }

    // Try lemnoslife API as another fallback
    try {
      const response = await fetch(`https://yt.lemnoslife.com/noKey/videos?part=snippet&id=${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Lemnoslife data:', JSON.stringify(data, null, 2));
        if (data.items && data.items.length > 0) {
          const snippet = data.items[0].snippet;
          return {
            title: snippet?.title || '',
            description: snippet?.description || '',
            channel: snippet?.channelTitle || '',
            tags: snippet?.tags?.join(', ') || '',
          };
        }
      }
    } catch (err) {
      console.log('Lemnoslife API error:', err);
    }

    return { title: '', description: '', channel: '', tags: '' };
  };

  const getLanguagePrompt = () => {
    if (selectedLanguage === "auto") {
      return "Generate the notes in the same language as the video title, or English if unclear.";
    }
    const selectedLang = languageOptions.find((l) => l.code === selectedLanguage);
    return `Generate all notes and content in ${selectedLang?.name || "English"}.`;
  };

  const handleGenerate = async () => {
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting YouTube video processing...');

      const fetchedInfo = await fetchVideoInfo(videoId);
      console.log('Fetched video info:', JSON.stringify(fetchedInfo, null, 2));

      // Update video info with fetched title
      if (fetchedInfo.title) {
        setVideoInfo({
          title: fetchedInfo.title,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        });
      }

      const actualTitle = fetchedInfo.title || videoInfo?.title || 'Unknown Video';
      const videoContent = [
        `Video Title: ${actualTitle}`,
        fetchedInfo.channel ? `Channel: ${fetchedInfo.channel}` : '',
        fetchedInfo.description ? `Description: ${fetchedInfo.description}` : '',
        fetchedInfo.tags ? `Tags: ${fetchedInfo.tags}` : '',
      ].filter(Boolean).join('\n\n');

      console.log('Video content for AI:', videoContent);

      const languageInstruction = getLanguagePrompt();

      const prompt = `You are an AI learning assistant. Create study notes SPECIFICALLY about the following YouTube video.

IMPORTANT: Your notes MUST be about the exact topic mentioned in the video title. Do NOT generate generic or unrelated content.
${languageInstruction}

Video Information:
${videoContent}

Based on this video's title "${actualTitle}", create comprehensive study notes about this SPECIFIC topic.

Please provide:
1. Main Topic: The exact topic from the video title
2. Summary: What this video likely covers based on its title
3. Key Concepts: 4-6 key concepts related to this specific topic
4. Detailed Explanation: Educational content about this exact subject
5. Review Questions: 2-3 questions to test understanding of this topic

Format your response as follows:
MAIN TOPIC:
[The topic from the video title]

SUMMARY:
[Summary about this specific topic]

KEY CONCEPTS:
- [Concept 1 related to this topic]
- [Concept 2 related to this topic]
- [Concept 3 related to this topic]
- [Concept 4 related to this topic]
- [Concept 5 related to this topic]

DETAILED EXPLANATION:
[Educational explanation about this specific subject]

REVIEW QUESTIONS:
1. [Question about this topic]
2. [Question about this topic]
3. [Question about this topic]

Remember: Focus ONLY on the topic "${actualTitle}". Do not deviate to other subjects.`;

      console.log('Generating notes with AI...');
      const generatedContent = await generateText({
        messages: [{ role: 'user', content: prompt }],
      });

      const fetchedTitle = fetchedInfo.title || videoInfo?.title;
      let topicName = fetchedTitle || 'YouTube Video Notes';

      // Try to extract main topic from AI response
      const topicMatch = generatedContent.match(/MAIN TOPIC:\s*([^\n]+)/);
      if (topicMatch && topicMatch[1].trim() && topicMatch[1].trim() !== '**') {
        const extractedTopic = topicMatch[1].trim().replace(/^\*+|\*+$/g, '').trim();
        if (extractedTopic && extractedTopic.length > 0) {
          topicName = extractedTopic;
        }
      }

      // Always prefer the actual video title if we have one and topic extraction failed
      if (fetchedTitle && fetchedTitle !== 'YouTube Video' && (topicName === 'YouTube Video Notes' || topicName === '**' || topicName.length < 3)) {
        topicName = fetchedTitle;
      }

      // Clean up any markdown formatting from title
      topicName = topicName.replace(/^\*+|\*+$/g, '').replace(/^#+\s*/, '').trim();

      // Final fallback
      if (!topicName || topicName.length < 2 || topicName === '**') {
        topicName = 'Video Notes';
      }

      console.log('Adding explanation with topic:', topicName);
      await addExplanation(topicName, generatedContent);

      router.replace('/(tabs)/library');
    } catch (err) {
      console.error('Error generating notes:', err);
      setError('Failed to generate notes. Please try again.');

      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to generate notes. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (Platform.OS === 'web') {
        const text = await navigator.clipboard.readText();
        handleUrlChange(text);
      } else {
        const Clipboard = await import('expo-clipboard');
        const text = await Clipboard.getStringAsync();
        handleUrlChange(text);
      }
    } catch (err) {
      console.log('Failed to paste:', err);
    }
  };

  const handleOpenYouTube = () => {
    Linking.openURL('https://www.youtube.com');
  };

  const isValidUrl = !!videoId;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate from YouTube</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Enter YouTube URL section */}
            <View style={styles.sectionHeader}>
              <View style={styles.youtubeIcon}>
                <View style={styles.youtubePlayButton} />
              </View>
              <Text style={styles.sectionTitle}>Enter YouTube URL</Text>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://youtube.com/..."
                  placeholderTextColor="#9CA3AF"
                  value={url}
                  onChangeText={handleUrlChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={styles.pasteButton}
                onPress={handlePaste}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Clipboard size={16} color="#374151" />
                <Text style={styles.pasteButtonText}>Paste link</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Topic generate language section */}
            <LanguagePicker
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              showModal={showLanguageDropdown}
              onOpenModal={() => setShowLanguageDropdown(true)}
              onCloseModal={() => setShowLanguageDropdown(false)}
            />
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.openYoutubeButton}
              onPress={handleOpenYouTube}
              activeOpacity={0.7}
            >
              <View style={styles.youtubeIconSmall}>
                <View style={styles.youtubePlayButtonSmall} />
              </View>
              <Text style={styles.openYoutubeText}>Open YouTube App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.generateButton,
                (!isValidUrl || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!isValidUrl || isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generate Topic</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  youtubeIcon: {
    width: 24,
    height: 18,
    backgroundColor: '#FF0000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubePlayButton: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: '#1F2937',
  },
  robotEmoji: {
    fontSize: 18,
  },
  inputWrapper: {
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: '#1F2937',
    padding: 16,
    minHeight: 56,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  pasteButtonText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: '#374151',
  },
  errorText: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: '#EF4444',
    marginTop: -24,
    marginBottom: 24,
  },
  languageSection: {
    marginBottom: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomWidth: 3,
    borderBottomColor: '#374151',
  },
  languageSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageEmoji: {
    fontSize: 20,
  },
  languageName: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    color: '#1F2937',
  },
  chevronContainer: {
    alignItems: 'center',
  },
  chevronDown: {
    marginTop: -4,
  },
  languageDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageOptionSelected: {
    backgroundColor: '#F9FAFB',
  },
  languageOptionEmoji: {
    fontSize: 20,
  },
  languageOptionText: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: '#374151',
  },
  languageOptionTextSelected: {
    fontFamily: Fonts.Medium,
    color: '#1F2937',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  openYoutubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  youtubeIconSmall: {
    width: 20,
    height: 14,
    backgroundColor: '#FF0000',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubePlayButtonSmall: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 1,
  },
  openYoutubeText: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    color: '#1F2937',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 56,
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    fontSize: 17,
    fontFamily: Fonts.SemiBold,
    color: '#FFFFFF',
  },
});
