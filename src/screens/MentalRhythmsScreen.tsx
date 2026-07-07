import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalization } from '../context/LocalizationContext';
import { useApp } from '../context/AppContext';
import { generateMeditationScript } from '../services/geminiService';
import {
  generateSpeech, generatePreview,
  ELEVENLABS_VOICES, VoiceOption, getVoiceById,
} from '../services/elevenLabsService';
import {
  saveMeditationLog, addFavorite, removeFavorite, isFavorite,
  getMeditationStats, MeditationStats,
} from '../utils/meditationStorage';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';

type ScreenState = 'selection' | 'generating' | 'player';
type PlayerStatus = 'paused' | 'playing' | 'ended';

const VOICE_STORAGE_KEY = 'fitpulse_meditation_voice';
const SPEED_STORAGE_KEY = 'fitpulse_meditation_speed';

const themes = [
  { id: 'Stress', labelKey: 'meditationThemeStress', icon: 'cloud-outline', color: COLORS.blue, gradient: ['#667eea', '#764ba2'] as [string, string] },
  { id: 'Focus', labelKey: 'meditationThemeFocus', icon: 'sunny-outline', color: COLORS.yellow, gradient: ['#f093fb', '#f5576c'] as [string, string] },
  { id: 'Sleep', labelKey: 'meditationThemeSleep', icon: 'moon-outline', color: COLORS.indigo, gradient: ['#4facfe', '#00f2fe'] as [string, string] },
  { id: 'Anxiety', labelKey: 'meditationThemeAnxiety', icon: 'leaf-outline', color: COLORS.green, gradient: ['#43e97b', '#38f9d7'] as [string, string] },
  { id: 'Energy', labelKey: 'meditationThemeEnergy', icon: 'flash-outline', color: COLORS.orange, gradient: ['#fa709a', '#fee140'] as [string, string] },
  { id: 'Confidence', labelKey: 'meditationThemeConfidence', icon: 'star-outline', color: COLORS.pink, gradient: ['#a18cd1', '#fbc2eb'] as [string, string] },
  { id: 'Gratitude', labelKey: 'meditationThemeGratitude', icon: 'heart-outline', color: '#FF6B6B', gradient: ['#ff9a9e', '#fecfef'] as [string, string] },
  { id: 'InnerPeace', labelKey: 'meditationThemeInnerPeace', icon: 'water-outline', color: '#00CEC9', gradient: ['#89f7fe', '#66a6ff'] as [string, string] },
];

const AMBIENT_SOUNDS = [
  { id: 'none',   labelKey: 'meditationAmbientNone',   icon: '🔇', url: null },
  { id: 'rain',   labelKey: 'meditationAmbientRain',   icon: '🌧️', url: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3' },
  { id: 'birds',  labelKey: 'meditationAmbientBirds',  icon: '🐦', url: 'https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3' },
  { id: 'fire',   labelKey: 'meditationAmbientFire',   icon: '🔥', url: 'https://assets.mixkit.co/active_storage/sfx/1345/1345-preview.mp3' },
];

// Her tema için önerilen arka plan sesi
const THEME_AMBIENT_MAP: Record<string, string> = {
  Stress:      'rain',
  Focus:       'birds',
  Sleep:       'rain',
  Anxiety:     'rain',
  Energy:      'birds',
  Confidence:  'fire',
  Gratitude:   'birds',
  InnerPeace:  'fire',
};

const DURATION_OPTIONS = [
  { label: '3 dk', seconds: 180, key: '3min' as const },
  { label: '5 dk', seconds: 300, key: '5min' as const },
  { label: '10 dk', seconds: 600, key: '10min' as const },
];

const SPEED_OPTIONS = [
  { label: '0.75x', value: 0.75 },
  { label: '1x',    value: 1.0  },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x',  value: 1.5  },
  { label: '2x',    value: 2.0  },
];

const VALID_SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

export const MentalRhythmsScreen: React.FC = () => {
  const { t, language } = useLocalization();
  const { user } = useApp();
  const [screenState, setScreenState] = useState<ScreenState>('selection');
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('paused');
  const [script, setScript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<typeof themes[0] | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1]);
  const [selectedAmbient, setSelectedAmbient] = useState(AMBIENT_SOUNDS[0]);
  const soundRef = useRef<AudioPlayer | null>(null);
  const speechRef = useRef<AudioPlayer | null>(null);
  const previewRef = useRef<AudioPlayer | null>(null); // Ses önizlemesi için ayrı oynatıcı — ana meditasyon sesiyle çakışmaz
  const ttsPromiseRef = useRef<Promise<string> | null>(null);

  // Ses seçimi
  const [selectedVoice, setSelectedVoice] = useState<string>(ELEVENLABS_VOICES[0].id);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null); // hangi sesin preview'ı yükleniyor

  // Hız kontrolü
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);

  // Meditasyon istatistikleri
  const [meditationStats, setMeditationStats] = useState<MeditationStats | null>(null);

  // Süre takibi
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Favori durumu
  const [favLoading, setFavLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // TTS yükleme durumu
  const [ttsLoading, setTtsLoading] = useState(false);

  // Ses seansını hazırlama (Özellikle iOS cihazlarda sessiz moddayken çalışması için)
  useEffect(() => {
    const initAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'mixWithOthers',
          shouldPlayInBackground: true,
          allowsRecording: false,
        });
        await setIsAudioActiveAsync(true);
      } catch (err) {
        console.warn('Audio settings error:', err);
      }
    };
    initAudio();
  }, []);

  const releasePlayer = (player: AudioPlayer | null) => {
    if (!player) return;
    try {
      player.pause();
      if (typeof player.release === 'function') {
        player.release();
      } else if (typeof player.remove === 'function') {
        player.remove();
      }
    } catch (e) {
      console.warn('Error releasing player:', e);
    }
  };

  // Kayıtlı ses tercihini al
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const [savedVoice, savedSpeed] = await Promise.all([
          AsyncStorage.getItem(VOICE_STORAGE_KEY),
          AsyncStorage.getItem(SPEED_STORAGE_KEY),
        ]);
        const validIds = ELEVENLABS_VOICES.map(v => v.id);
        if (savedVoice && validIds.includes(savedVoice)) {
          setSelectedVoice(savedVoice);
        }
        if (savedSpeed) {
          const speed = parseFloat(savedSpeed);
          if (VALID_SPEEDS.includes(speed)) {
            setPlaybackSpeed(speed);
          }
        }
      } catch (e) {
        console.error('Voice/speed load error:', e);
      } finally {
        setVoicesLoading(false);
      }
    };
    loadPrefs();
  }, []);

  // Meditasyon istatistiklerini yükle
  useEffect(() => {
    getMeditationStats().then(setMeditationStats);
  }, []);

  // Favori durumunu kontrol et
  useEffect(() => {
    if (!script) return;
    isFavorite(script).then(setIsFav);
  }, [script]);

  // Temizlik
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releasePlayer(soundRef.current);
      releasePlayer(speechRef.current);
      releasePlayer(previewRef.current);
    };
  }, []);

  // ─── Ses seçimi kaydet ─────────────────────────────────────────────────────
  const handleVoiceSelect = async (voiceId: string) => {
    setSelectedVoice(voiceId);
    setShowVoicePicker(false);
    try {
      await AsyncStorage.setItem(VOICE_STORAGE_KEY, voiceId);
    } catch (e) {
      console.error('Ses tercihi kaydetme hatası:', e);
    }
  };

  // ─── Hız seçimi kaydet ────────────────────────────────────────────────────
  const handleSpeedSelect = async (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedPicker(false);
    // Oynatma sırasında hız değiştir
    if (speechRef.current) {
      speechRef.current.setPlaybackRate(speed, 'medium');
    }
    try {
      await AsyncStorage.setItem(SPEED_STORAGE_KEY, speed.toString());
    } catch (e) {
      console.error('Hız tercihi kaydetme hatası:', e);
    }
  };

  // ─── Ses önizleme (ElevenLabs servis modülü ile) ──────────────────────────
  const handleVoicePreview = async (voiceId: string) => {
    // Mevcut önizlemeyi durdur
    if (previewRef.current) {
      releasePlayer(previewRef.current);
      previewRef.current = null;
    }

    // Geçmiş prefetch varsa iptal et
    ttsPromiseRef.current = null;

    setPreviewLoading(voiceId);
    try {
      console.log('[MentalRhythms] Generating preview for voiceId:', voiceId);
      const fileUri = await generatePreview(voiceId, language);
      console.log('[MentalRhythms] Preview generated successfully at:', fileUri);
      
      const player = createAudioPlayer(fileUri, { keepAudioSessionActive: true });
      previewRef.current = player;

      let hasPlayed = false;
      player.addListener('playbackStatusUpdate', (status) => {
        console.log('[MentalRhythms Preview Status Update]:', JSON.stringify(status));
        if (status.isLoaded && !hasPlayed) {
          console.log('[MentalRhythms Preview] Player loaded, playing now...');
          player.play();
          hasPlayed = true;
        }
      });

      if (player.isLoaded) {
        console.log('[MentalRhythms Preview] Player is already loaded, playing now...');
        player.play();
        hasPlayed = true;
      }
    } catch (e: any) {
      console.error('[MentalRhythms] Preview error:', e);
      setError(e.message || 'Ses önizleme hatası');
      setTimeout(() => setError(null), 3000);
    } finally {
      setPreviewLoading(null);
    }
  };

  // ─── Tema seç ──────────────────────────────────────────────────────────────
  const handleThemeSelect = async (theme: typeof themes[0]) => {
    // Çalan/yüklenmiş ses önizlemesini durdur — ana meditasyon sesiyle çakışmasın
    if (previewRef.current) {
      releasePlayer(previewRef.current);
      previewRef.current = null;
    }
    setActiveTheme(theme);
    setScreenState('generating');
    setError(null);
    setElapsed(0);
    elapsedRef.current = 0;

    // 🚀 Hız Optimizasyonu: Arka plan sesini hemen yüklemeye başla
    if (selectedAmbient.url) {
      try {
        console.log('[MentalRhythms] Prefetching ambient player for URL:', selectedAmbient.url);
        const player = createAudioPlayer(selectedAmbient.url, { keepAudioSessionActive: true });
        player.loop = true;
        player.volume = 0.1;
        soundRef.current = player;
      } catch (ambientErr) {
        console.warn('Ambient prefetch error:', ambientErr);
      }
    }

    try {
      const generated = await generateMeditationScript(
        theme.id,
        t,
        selectedDuration.key,
        user?.name,
        meditationStats ? {
          totalSessions: meditationStats.totalSessions,
          streakDays: meditationStats.currentStreak,
        } : undefined
      );
      setScript(generated);
      setScreenState('player');
      setPlayerStatus('paused');

      // 🚀 Hız Optimizasyonu: Kullanıcı play tuşuna basana kadar vakit kazanmak için arka planda sesi indirmeye başla
      ttsPromiseRef.current = generateSpeech(
        generated,
        selectedVoice,
        `meditation_${Date.now()}.mp3`
      ).catch(e => {
        console.warn('Prefetch error:', e);
        return '';
      });
      
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorUnknown'));
      setScreenState('selection');
      // Prefetch edilen arka plan oynatıcısını temizle
      if (soundRef.current) {
        releasePlayer(soundRef.current);
        soundRef.current = null;
      }
    }
  };

  // ─── Süre sayacı başlat/durdur ─────────────────────────────────────────────
  const startTimer = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000) + elapsedRef.current;
      setElapsed(secs);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startTimeRef.current) {
      elapsedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
  };

  // ─── Meditasyon logu kaydet ────────────────────────────────────────────────
  const saveLog = async (finalSeconds: number) => {
    if (!activeTheme || finalSeconds < 10) return;
    try {
      await saveMeditationLog({
        theme: activeTheme.id,
        duration: selectedDuration.key,
        durationSeconds: finalSeconds,
      });
    } catch (e) {
      console.error('Meditasyon log hatası:', e);
    }
  };

  // ─── Play / Pause ──────────────────────────────────────────────────────────
  const handlePlay = async () => {
    if (playerStatus === 'playing') {
      // PAUSE
      if (speechRef.current) speechRef.current.pause();
      if (soundRef.current) soundRef.current.pause();
      stopTimer();
      setPlayerStatus('paused');
    } else {
      // PLAY
      startTimer();

      // Ambient ses başlat/devam ettir
      if (selectedAmbient.url && !soundRef.current) {
        try {
          console.log('[MentalRhythms] Playing ambient sound ID:', selectedAmbient.id);
          console.log('[MentalRhythms] Playing ambient sound URL:', selectedAmbient.url);
          const player = createAudioPlayer(selectedAmbient.url, { keepAudioSessionActive: true });
          player.loop = true;
          player.volume = 0.1;
          soundRef.current = player;
          
          let hasPlayed = false;
          player.addListener('playbackStatusUpdate', (status) => {
            console.log('[MentalRhythms Ambient Status Update]:', JSON.stringify(status));
            if (status.isLoaded && !hasPlayed) {
              console.log('[MentalRhythms Ambient] Loaded, playing now...');
              player.play();
              hasPlayed = true;
            }
          });

          if (player.isLoaded) {
            console.log('[MentalRhythms Ambient] Already loaded, playing now...');
            player.play();
            hasPlayed = true;
          }
        } catch (e) {
          console.error('Ambient audio error:', e);
        }
      } else if (soundRef.current) {
        const player = soundRef.current;
        if (player.isLoaded) {
          player.play();
        } else {
          let hasPlayed = false;
          player.addListener('playbackStatusUpdate', (status) => {
            if (status.isLoaded && !hasPlayed) {
              player.play();
              hasPlayed = true;
            }
          });
        }
      }

      // TTS ile ses oluştur veya mevcut olan devam ettir
      try {
        if (!speechRef.current) {
          setTtsLoading(true);
          
          let fileUri = '';
          // Eğer arkada önceden indirme başladıysa, onu bekle
          if (ttsPromiseRef.current) {
            console.log('[MentalRhythms] Awaiting prefetched TTS promise...');
            fileUri = await ttsPromiseRef.current;
            ttsPromiseRef.current = null;
          }
          
          // Eğer hata olduysa veya prefetch yetişmediyse normal yoldan çek
          if (!fileUri) {
            console.log('[MentalRhythms] Prefetch TTS not available or failed, generating now...');
            fileUri = await generateSpeech(
              script,
              selectedVoice,
              `meditation_${Date.now()}.mp3`
            );
          }

          console.log('[MentalRhythms] Creating TTS audio player for file:', fileUri);
          const player = createAudioPlayer(fileUri, { keepAudioSessionActive: true });
          speechRef.current = player;

          let isRateSet = false;
          let hasPlayed = false;

          // Oynatma bittiğinde veya yüklendiğinde
          player.addListener('playbackStatusUpdate', (status) => {
            console.log('[MentalRhythms TTS Status Update]:', JSON.stringify(status));
            if (status.isLoaded && !hasPlayed) {
              console.log('[MentalRhythms TTS] Player loaded, playing voice now...');
              if (!isRateSet && playbackSpeed !== 1.0) {
                player.setPlaybackRate(playbackSpeed, 'medium');
                isRateSet = true;
              }
              player.play();
              hasPlayed = true;
              setPlayerStatus('playing');
              setTtsLoading(false);
            }
            if (status.didJustFinish) {
              console.log('[MentalRhythms TTS] Playback finished.');
              stopTimer();
              setPlayerStatus('ended');
              if (soundRef.current) {
                releasePlayer(soundRef.current);
                soundRef.current = null;
              }
              saveLog(elapsedRef.current);
            }
          });

          if (player.isLoaded) {
            console.log('[MentalRhythms TTS] Player is already loaded, playing voice now...');
            if (playbackSpeed !== 1.0) {
              player.setPlaybackRate(playbackSpeed, 'medium');
              isRateSet = true;
            }
            player.play();
            hasPlayed = true;
            setPlayerStatus('playing');
            setTtsLoading(false);
          }
        } else {
          // Mevcut player'ı devam ettir
          console.log('[MentalRhythms TTS] Resuming existing player...');
          const player = speechRef.current;
          if (playbackSpeed !== 1.0) {
            player.setPlaybackRate(playbackSpeed, 'medium');
          }
          player.play();
          setPlayerStatus('playing');
        }
      } catch (e: any) {
        console.error('ElevenLabs playback error:', e);
        setTtsLoading(false);
        stopTimer();
        setPlayerStatus('paused');

        // Hata mesajını göster
        const errorMsg = e.message || 'Ses üretilirken bir hata oluştu.';
        setError(errorMsg);
        
        // Ciddi hata ise kullanıcıyı uyar
        Alert.alert(
          language === 'tr' ? 'Ses Hatası' : 'Audio Error',
          language === 'tr'
            ? `Ses üretilirken bir sorun oluştu: ${errorMsg}\n\nLütfen internet bağlantınızı kontrol edin.`
            : `An error occurred while generating audio: ${errorMsg}\n\nPlease check your internet connection.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  // ─── Stop ──────────────────────────────────────────────────────────────────
  const handleStop = async () => {
    if (speechRef.current) {
      releasePlayer(speechRef.current);
      speechRef.current = null;
    }
    if (soundRef.current) {
      releasePlayer(soundRef.current);
      soundRef.current = null;
    }
    stopTimer();
    setPlayerStatus('paused');
    await saveLog(elapsedRef.current);
  };

  // ─── Geri ──────────────────────────────────────────────────────────────────
  const handleBack = async () => {
    if (speechRef.current) {
      releasePlayer(speechRef.current);
      speechRef.current = null;
    }
    if (soundRef.current) {
      releasePlayer(soundRef.current);
      soundRef.current = null;
    }
    stopTimer();
    if (elapsedRef.current >= 10) {
      await saveLog(elapsedRef.current);
    }
    setScreenState('selection');
    setPlayerStatus('paused');
    setScript('');
    setActiveTheme(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setTtsLoading(false);
  };

  // ─── Favori ekle/çıkar ────────────────────────────────────────────────────
  const handleToggleFavorite = async () => {
    if (!activeTheme || favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) {
        setIsFav(false);
      } else {
        await addFavorite({
          theme: activeTheme.id,
          script: script,
          duration: selectedDuration.key,
        });
        setIsFav(true);
      }
    } catch (e) {
      console.error('Favori toggle hatası:', e);
    } finally {
      setFavLoading(false);
    }
  };

  // ─── Süre formatlama ──────────────────────────────────────────────────────
  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Seçili sesin bilgisini bul
  const selectedVoiceInfo = getVoiceById(selectedVoice);
  const selectedVoiceName = selectedVoiceInfo
    ? `${selectedVoiceInfo.icon} ${selectedVoiceInfo.name} — ${language === 'tr' ? selectedVoiceInfo.style : selectedVoiceInfo.styleEn}`
    : t('meditationVoiceDefault');

  // ─── Yükleniyor ───────────────────────────────────────────────────────────
  if (screenState === 'generating') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.cyan} />
        <Text style={styles.loadingText}>{t('meditationGenerating')}</Text>
      </View>
    );
  }

  // ─── Player ───────────────────────────────────────────────────────────────
  if (screenState === 'player') {
    return (
      <View style={styles.container}>
        {/* Geri butonu */}
        <View style={styles.playerHeader}>
          <TouchableOpacity style={styles.backRow} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textGray} />
            <Text style={styles.backText}>{t('meditationBackToThemes')}</Text>
          </TouchableOpacity>

          {/* Favori butonu */}
          <TouchableOpacity onPress={handleToggleFavorite} disabled={favLoading} style={styles.favBtn}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? '#FF6B6B' : COLORS.textGray}
            />
          </TouchableOpacity>
        </View>

        {/* Seçili ses ve hız göstergesi */}
        <View style={styles.playerInfoRow}>
          <View style={styles.voiceIndicator}>
            <Ionicons name="mic-outline" size={14} color={COLORS.cyan} />
            <Text style={styles.voiceIndicatorText} numberOfLines={1}>
              {selectedVoiceInfo?.icon} {selectedVoiceInfo?.name || 'Ses'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.speedIndicator}
            onPress={() => setShowSpeedPicker(!showSpeedPicker)}
          >
            <Ionicons name="speedometer-outline" size={14} color={COLORS.cyan} />
            <Text style={styles.voiceIndicatorText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
        </View>

        {/* Hız seçici (açılır) */}
        {showSpeedPicker && (
          <View style={styles.speedPickerRow}>
            {SPEED_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.speedBtn, playbackSpeed === opt.value && styles.speedBtnActive]}
                onPress={() => handleSpeedSelect(opt.value)}
              >
                <Text style={[styles.speedBtnText, playbackSpeed === opt.value && styles.speedBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TTS yükleniyor */}
        {ttsLoading && (
          <View style={styles.ttsLoadingRow}>
            <ActivityIndicator size="small" color={COLORS.cyan} />
            <Text style={styles.ttsLoadingText}>
              {language === 'tr' ? 'Ses oluşturuluyor...' : 'Generating audio...'}
            </Text>
          </View>
        )}

        {/* Script */}
        <ScrollView contentContainerStyle={styles.playerScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.scriptText}>{script}</Text>
        </ScrollView>

        {/* Süre göstergesi */}
        <View style={styles.elapsedRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.textGray} />
          <Text style={styles.elapsedText}>{formatElapsed(elapsed)}</Text>
          {playerStatus === 'ended' && (
            <Text style={styles.savedText}>✓ {language === 'tr' ? 'Kaydedildi' : 'Saved'}</Text>
          )}
        </View>

        {/* Kontroller */}
        <View style={styles.playerControls}>
          <TouchableOpacity onPress={handlePlay} activeOpacity={0.8} disabled={ttsLoading}>
            <LinearGradient
              colors={ttsLoading ? ['#888', '#666'] : [COLORS.cyan, COLORS.blue]}
              style={styles.playBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={playerStatus === 'playing' ? 'pause' : 'play'}
                size={32}
                color="white"
              />
            </LinearGradient>
          </TouchableOpacity>

          {playerStatus !== 'paused' && (
            <TouchableOpacity onPress={handleStop} style={styles.stopBtn} activeOpacity={0.8}>
              <Ionicons name="stop" size={32} color={COLORS.textGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ─── Tema seçim ekranı ────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.titleSection}>
        <Ionicons name="fitness-outline" size={48} color={COLORS.cyan} style={{ marginBottom: 12 }} />
        <Text style={styles.title}>{t('mentalRhythmsTitle')}</Text>
        <Text style={styles.subtitle}>{t('mentalRhythmsSubtitle')}</Text>
      </View>

      {/* Süre seçimi */}
      <View style={styles.durationRow}>
        {DURATION_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.durationBtn, selectedDuration.key === opt.key && styles.durationBtnActive]}
            onPress={() => setSelectedDuration(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.durationBtnText, selectedDuration.key === opt.key && styles.durationBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ses seçimi */}
      <TouchableOpacity
        style={[
          styles.voiceSelectBtn,
          showVoicePicker && {
            marginBottom: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomWidth: 0,
          }
        ]}
        onPress={() => setShowVoicePicker(!showVoicePicker)}
        activeOpacity={0.7}
      >
        <View style={styles.voiceSelectLeft}>
          <Ionicons name="mic-outline" size={20} color={COLORS.cyan} />
          <View>
            <Text style={styles.voiceSelectLabel}>{t('meditationVoiceSelect')}</Text>
            <Text style={styles.voiceSelectName} numberOfLines={1}>{selectedVoiceName}</Text>
          </View>
        </View>
        <Ionicons
          name={showVoicePicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textGray}
        />
      </TouchableOpacity>

      {/* Ses listesi (açılır) */}
      {showVoicePicker && (
        <ScrollView
          style={[styles.voiceList, { borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}
          nestedScrollEnabled
        >
          {voicesLoading ? (
            <ActivityIndicator size="small" color={COLORS.cyan} style={{ padding: SPACING.md }} />
          ) : ELEVENLABS_VOICES.length === 0 ? (
            <Text style={styles.noVoicesText}>{t('meditationNoVoices')}</Text>
          ) : (
            <>
              {/* Kadın Sesler */}
              <Text style={styles.voiceGroupLabel}>
                {language === 'tr' ? '🌸 Kadın Sesler' : '🌸 Female Voices'}
              </Text>
              {ELEVENLABS_VOICES.filter(v => v.gender === 'female').map(voice => (
                <VoiceItem
                  key={voice.id}
                  voice={voice}
                  selected={selectedVoice === voice.id}
                  previewLoading={previewLoading === voice.id}
                  language={language}
                  onSelect={() => handleVoiceSelect(voice.id)}
                  onPreview={() => handleVoicePreview(voice.id)}
                />
              ))}
              {/* Erkek Sesler */}
              <Text style={styles.voiceGroupLabel}>
                {language === 'tr' ? '🏔️ Erkek Sesler' : '🏔️ Male Voices'}
              </Text>
              {ELEVENLABS_VOICES.filter(v => v.gender === 'male').map(voice => (
                <VoiceItem
                  key={voice.id}
                  voice={voice}
                  selected={selectedVoice === voice.id}
                  previewLoading={previewLoading === voice.id}
                  language={language}
                  onSelect={() => handleVoiceSelect(voice.id)}
                  onPreview={() => handleVoicePreview(voice.id)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* Hız seçimi */}
      <View style={styles.speedSection}>
        <View style={styles.voiceSelectLeft}>
          <Ionicons name="speedometer-outline" size={20} color={COLORS.cyan} />
          <Text style={styles.ambientLabelText}>
            {language === 'tr' ? 'Ses Hızı' : 'Playback Speed'}
          </Text>
        </View>
        <View style={styles.speedOptionsRow}>
          {SPEED_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.speedOptionBtn, playbackSpeed === opt.value && styles.speedOptionBtnActive]}
              onPress={() => handleSpeedSelect(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.speedOptionText, playbackSpeed === opt.value && styles.speedOptionTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Arka Plan Sesi Seçimi */}
      <View style={styles.ambientSection}>
        <View style={styles.voiceSelectLeft}>
          <Ionicons name="musical-notes-outline" size={20} color={COLORS.cyan} />
          <Text style={styles.ambientLabelText}>{t('meditationAmbientLabel')}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ambientScroll}>
          {AMBIENT_SOUNDS.map(sound => (
            <TouchableOpacity
              key={sound.id}
              style={[styles.ambientBtn, selectedAmbient.id === sound.id && styles.ambientBtnActive]}
              onPress={() => setSelectedAmbient(sound)}
              activeOpacity={0.7}
            >
              <Text style={styles.ambientBtnIcon}>{sound.icon}</Text>
              <Text style={[styles.ambientBtnText, selectedAmbient.id === sound.id && styles.ambientBtnTextActive]}>
                {t(sound.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={18} color={COLORS.orange} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Tema kartları */}
      {themes.map((theme, i) => (
        <AnimatedBentoCard
          key={theme.id}
          style={[styles.themeCard, { marginTop: i === 0 ? 0 : SPACING.md }]}
          onPress={() => handleThemeSelect(theme)}
        >
          <LinearGradient
            colors={theme.gradient}
            style={styles.themeGradientOverlay}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.themeCardContent}>
            <Ionicons name={theme.icon as any} size={32} color="white" style={{ marginBottom: 8 }} />
            <Text style={styles.themeLabel}>{t(theme.labelKey)}</Text>
          </View>
        </AnimatedBentoCard>
      ))}
    </ScrollView>
  );
};

// ─── Voice Item Component ────────────────────────────────────────────────────
const VoiceItem: React.FC<{
  voice: VoiceOption;
  selected: boolean;
  previewLoading: boolean;
  language: string;
  onSelect: () => void;
  onPreview: () => void;
}> = ({ voice, selected, previewLoading, language, onSelect, onPreview }) => (
  <View style={[styles.voiceItem, selected && styles.voiceItemSelected]}>
    <TouchableOpacity
      style={styles.voiceItemMain}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.voiceRadio, selected && styles.voiceRadioActive]}>
        {selected && <View style={styles.voiceRadioDot} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.voiceItemName, selected && { color: COLORS.cyan }]}>
          {voice.icon} {voice.name}
        </Text>
        <Text style={styles.voiceItemLang}>
          {language === 'tr' ? voice.style : voice.styleEn}
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.voicePreviewBtn}
      onPress={onPreview}
      activeOpacity={0.7}
      disabled={previewLoading}
    >
      {previewLoading ? (
        <ActivityIndicator size="small" color={COLORS.cyan} />
      ) : (
        <Ionicons name="play-circle-outline" size={22} color={COLORS.cyan} />
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: 80 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: COLORS.textGray, fontSize: FONTS.sizes.md, textAlign: 'center' },
  titleSection: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textGray, textAlign: 'center', lineHeight: 22 },
  durationRow: {
    flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg,
    justifyContent: 'center',
  },
  durationBtn: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  durationBtnActive: { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan },
  durationBtnText: { color: COLORS.textGray, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  durationBtnTextActive: { color: 'white' },

  // Ses seçimi
  voiceSelectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md,
  },
  voiceSelectLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  voiceSelectLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textGray },
  voiceSelectName: { fontSize: FONTS.sizes.sm, color: COLORS.textWhite, fontWeight: 'bold', maxWidth: 250 },
  voiceList: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, marginBottom: SPACING.xl, overflow: 'hidden',
    maxHeight: 350,
  },
  voiceGroupLabel: {
    color: COLORS.textGray, fontSize: FONTS.sizes.xs, fontWeight: 'bold',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.xs,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  noVoicesText: {
    color: COLORS.textGray, fontSize: FONTS.sizes.sm,
    textAlign: 'center', padding: SPACING.lg,
  },
  voiceItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  voiceItemSelected: { backgroundColor: 'rgba(64,224,208,0.06)' },
  voiceItemMain: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.sm },
  voiceRadio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: COLORS.textGray, alignItems: 'center', justifyContent: 'center',
  },
  voiceRadioActive: { borderColor: COLORS.cyan },
  voiceRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.cyan },
  voiceItemName: { color: COLORS.textWhite, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  voiceItemLang: { color: COLORS.textGray, fontSize: FONTS.sizes.xs },
  voicePreviewBtn: { padding: SPACING.sm },

  // Player ses ve hız göstergesi
  playerInfoRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.md,
    paddingVertical: SPACING.xs, marginHorizontal: SPACING.xl,
  },
  voiceIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(64,224,208,0.08)',
    borderRadius: RADIUS.full,
  },
  speedIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(64,224,208,0.08)',
    borderRadius: RADIUS.full,
  },
  voiceIndicatorText: { color: COLORS.cyan, fontSize: FONTS.sizes.xs, fontWeight: 'bold' },

  // Hız seçici
  speedPickerRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, marginHorizontal: SPACING.xl,
  },
  speedBtn: {
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  speedBtnActive: { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan },
  speedBtnText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  speedBtnTextActive: { color: 'white' },

  // Hız bölümü (seçim ekranı)
  speedSection: {
    marginTop: SPACING.md, marginBottom: SPACING.sm,
  },
  speedOptionsRow: {
    flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm,
  },
  speedOptionBtn: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.border,
  },
  speedOptionBtnActive: { backgroundColor: 'rgba(64,224,208,0.1)', borderColor: COLORS.cyan },
  speedOptionText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  speedOptionTextActive: { color: COLORS.cyan },

  // TTS yükleniyor
  ttsLoadingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: SPACING.sm,
  },
  ttsLoadingText: { color: COLORS.cyan, fontSize: FONTS.sizes.sm },

  // Seçim
  ambientSection: { marginTop: SPACING.md, marginBottom: SPACING.lg },
  ambientLabelText: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, fontWeight: '600' },
  ambientScroll: { gap: SPACING.sm, marginTop: SPACING.sm, paddingRight: SPACING.xl },
  ambientBtn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 4 },
  ambientBtnActive: { backgroundColor: 'rgba(64,224,208,0.1)', borderColor: COLORS.cyan },
  ambientBtnIcon: { fontSize: 14 },
  ambientBtnText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  ambientBtnTextActive: { color: COLORS.cyan },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,127,80,0.1)', borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.xl,
  },
  errorText: { color: COLORS.orange, fontSize: FONTS.sizes.sm, flex: 1 },

  // Tema kartları
  themeCard: { padding: 0, alignItems: 'center', marginBottom: SPACING.md, overflow: 'hidden' },
  themeGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    borderRadius: RADIUS.lg,
  },
  themeCardContent: {
    padding: SPACING.xxl, alignItems: 'center',
  },
  themeLabel: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.lg },

  // Player
  playerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingRight: SPACING.xl,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.xl },
  backText: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  favBtn: { padding: SPACING.md },
  playerScroll: { padding: SPACING.xl, paddingTop: 0 },
  scriptText: { color: COLORS.textGray, fontSize: FONTS.sizes.md, lineHeight: 28 },
  elapsedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', paddingBottom: SPACING.sm,
  },
  elapsedText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  savedText: { color: COLORS.green, fontSize: FONTS.sizes.sm, fontWeight: 'bold', marginLeft: 8 },
  playerControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.xl, padding: SPACING.xxl,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  playBtn: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  stopBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
});
