import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

interface Props {
  exerciseName: string;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<Props> = ({ exerciseName, onClose }) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Build YouTube search URL with the exercise name
  const query = encodeURIComponent(exerciseName + ' exercise tutorial form');
  const youtubeSearchUrl = `https://m.youtube.com/results?search_query=${query}`;

  const openExternalSearch = async () => {
    const url = `https://www.youtube.com/results?search_query=${query}`;
    try {
      await Linking.openURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={30} color={COLORS.textGray} />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
            <TouchableOpacity onPress={openExternalSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="open-outline" size={22} color={COLORS.textGray} />
            </TouchableOpacity>
          </View>

          {/* WebView */}
          <View style={styles.webViewContainer}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.cyan} />
                <Text style={styles.loadingText}>{t('videoLoading') || 'Yükleniyor...'}</Text>
              </View>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textGray} style={{ marginBottom: 12 }} />
                <Text style={styles.errorText}>{t('videoLoadError') || 'Video yüklenemedi'}</Text>
                <TouchableOpacity onPress={openExternalSearch} activeOpacity={0.8} style={styles.fallbackBtn}>
                  <Ionicons name="search-outline" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.fallbackBtnText}>{t('videoSearchExternal') || 'Tarayıcıda Ara'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <WebView
                ref={webViewRef}
                source={{ uri: youtubeSearchUrl }}
                style={styles.webView}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => { setError(true); setLoading(false); }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                allowsFullscreenVideo={true}
                scalesPageToFit={true}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1A202C',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    height: '92%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    flex: 1,
    textAlign: 'center',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A202C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    color: COLORS.textGray,
    fontSize: FONTS.sizes.sm,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    color: COLORS.textGray,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  fallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cyan,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxl,
  },
  fallbackBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
});
