import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useLocalization } from '../context/LocalizationContext';
import { User, HistoryItem, WeightLog } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';
import { StarBorder } from '../components/StarBorder';

const SCREEN_W = Dimensions.get('window').width;

const WeightChart: React.FC<{ data: WeightLog[] }> = ({ data }) => {
  if (data.length < 2) return null;
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-8);
  const weights = sorted.map(d => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const CARD_PAD = 20;
  const W = SCREEN_W - 64 - CARD_PAD * 2;
  const H = 130;
  const TOP_PAD = 8;
  const BOT_PAD = 4;
  const LEFT_PAD = 6;
  const RIGHT_PAD = 6;

  const getX = (i: number) => LEFT_PAD + (i / (sorted.length - 1)) * (W - LEFT_PAD - RIGHT_PAD);
  const getY = (w: number) => TOP_PAD + (1 - (w - minW) / range) * (H - TOP_PAD - BOT_PAD);

  const points = sorted.map((d, i) => ({ x: getX(i), y: getY(d.weight), w: d.weight, date: d.date }));

  // Smooth bezier curve
  const bezierPath = (() => {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2;
      const cp1y = points[i - 1].y;
      const cp2x = (points[i - 1].x + points[i].x) / 2;
      const cp2y = points[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }
    return d;
  })();

  const fillPath = `${bezierPath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const diff = +(last - prev).toFixed(1);
  const trendIcon = diff < 0 ? 'trending-down' : diff > 0 ? 'trending-up' : 'remove';
  const trendColor = diff < 0 ? '#4ADE80' : diff > 0 ? COLORS.orange : COLORS.textGray;

  const GRID_LINES = 3;

  return (
    <AnimatedBentoCard style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>Kilo Değişimi</Text>
          <Text style={styles.chartSubtitle}>Son {sorted.length} kayıt</Text>
        </View>
        <View style={styles.chartBadge}>
          <Ionicons name={trendIcon as any} size={16} color={trendColor} />
          <Text style={[styles.chartBadgeText, { color: trendColor }]}>
            {diff > 0 ? '+' : ''}{diff} kg
          </Text>
        </View>
      </View>

      <Svg width={W} height={H}>
        <Defs>
          <SvgGradient id="wgFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.cyan} stopOpacity="0.4" />
            <Stop offset="0.6" stopColor={COLORS.cyan} stopOpacity="0.08" />
            <Stop offset="1" stopColor={COLORS.cyan} stopOpacity="0" />
          </SvgGradient>
          <SvgGradient id="wgLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#2DD4BF" stopOpacity="0.6" />
            <Stop offset="1" stopColor={COLORS.cyan} stopOpacity="1" />
          </SvgGradient>
        </Defs>

        {/* Subtle grid lines */}
        {Array.from({ length: GRID_LINES }).map((_, i) => {
          const gy = TOP_PAD + (i / (GRID_LINES - 1)) * (H - TOP_PAD - BOT_PAD);
          return (
            <Path key={i} d={`M ${LEFT_PAD} ${gy} L ${W - RIGHT_PAD} ${gy}`}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4,6" />
          );
        })}

        <Path d={fillPath} fill="url(#wgFill)" />
        <Path d={bezierPath} stroke="url(#wgLine)" strokeWidth={2.5} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <React.Fragment key={i}>
              {isLast && <Circle cx={p.x} cy={p.y} r={10} fill={COLORS.cyan} opacity={0.15} />}
              <Circle cx={p.x} cy={p.y} r={isLast ? 5 : 3.5}
                fill={isLast ? COLORS.cyan : '#1E2A38'}
                stroke={COLORS.cyan} strokeWidth={isLast ? 0 : 1.5} />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Date labels — one per data point */}
      <View style={[styles.chartXAxis, { width: W }]}>
        {points.map((p, i) => (
          <View key={i} style={[styles.chartXLabel, { left: p.x - 20, width: 40 }]}>
            <Text style={styles.chartXLabelText}>
              {new Date(p.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        ))}
      </View>
    </AnimatedBentoCard>
  );
};


interface Props {
  user: User | null;
  history: HistoryItem[];
  streak: number;
  weightHistory: WeightLog[];
  onAddWeight: (weight: number) => void;
  onDeleteWeight: (id: string) => void;
  onUpdateUser: (user: User) => void;
}

export const ProfileScreen: React.FC<Props> = ({
  user, history, streak, weightHistory, onAddWeight, onDeleteWeight, onUpdateUser
}) => {
  const { t } = useLocalization();
  const [weightInput, setWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleWeightInputChange = (text: string) => {
    // Virgülleri ve eğik çizgileri noktaya çevir
    let normalized = text.replace(/,/g, '.').replace(/\//g, '.');
    
    // Sadece sayıları ve tek bir noktayı koru
    const parts = normalized.split('.');
    if (parts.length > 2) {
      normalized = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Sayılar ve nokta dışındaki tüm karakterleri temizle
    normalized = normalized.replace(/[^0-9.]/g, '');
    setWeightInput(normalized);
  };

  // Yeni bir photoUrl geldiğinde hata durumunu sıfırla
  React.useEffect(() => {
    setImageError(false);
    console.log("[Profile] Current photoUrl in state:", user?.photoUrl);
  }, [user?.photoUrl]);

  if (!user) return null;

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // Kırpılmış resimlerde 0.3 kalitesi dosya boyutunu 30-50 KB aralığında tutar (Firestore için mükemmeldir)
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingPhoto(true);
        const asset = result.assets[0];
        
        if (asset.base64) {
          const base64Url = `data:image/jpeg;base64,${asset.base64}`;
          console.log("[Profile] Storing lightweight Base64 avatar inside Firestore...");
          onUpdateUser({ ...user, photoUrl: base64Url });
        } else {
          Alert.alert('Hata', 'Görsel verisi alınamadı.');
        }
      }
    } catch (error: any) {
      console.error('Profil fotoğrafı yükleme hatası:', error);
      Alert.alert('Hata Detayı', error?.message || String(error));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const xpForLevel = (level: number) => {
    let xp = 0;
    for (let i = 1; i < level; i++) xp += i * 100;
    return xp;
  };
  const xpForNextLevel = (level: number) => xpForLevel(level + 1);
  const currentXP = user.xp || 0;
  const levelStartXP = xpForLevel(user.level);
  const levelEndXP = xpForNextLevel(user.level);
  const xpProgress = levelEndXP > levelStartXP
    ? (currentXP - levelStartXP) / (levelEndXP - levelStartXP)
    : 0;

  const handleAddWeight = () => {
    const w = parseFloat(weightInput);
    if (!w || w < 10 || w > 500) return;
    onAddWeight(w);
    setWeightInput('');
    setShowWeightModal(false);
  };

  return (
    <>
      <Modal visible={showWeightModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profileAddWeight')}</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>
            <View style={styles.weightInputRow}>
              <TextInput
                style={styles.weightInput}
                value={weightInput}
                onChangeText={handleWeightInputChange}
                keyboardType="decimal-pad"
                placeholder="70"
                placeholderTextColor={COLORS.textGray}
                autoFocus
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
            <StarBorder color={COLORS.cyan} speed={2000} radius={RADIUS.full}>
              <TouchableOpacity onPress={handleAddWeight} activeOpacity={0.8}>
                <LinearGradient colors={[COLORS.cyan, COLORS.blue]} style={styles.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.saveBtnText}>{t('saveButton')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </StarBorder>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <AnimatedBentoCard style={styles.userCard}>
          <TouchableOpacity onPress={handlePickImage} disabled={isUploadingPhoto}>
            {user.photoUrl && !imageError ? (
              <Image 
                source={{ uri: user.photoUrl }} 
                style={styles.avatar} 
                onError={() => setImageError(true)}
              />
            ) : (
              <LinearGradient colors={[COLORS.cyan, COLORS.blue]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            )}
            {isUploadingPhoto && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 40, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={COLORS.cyan} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* Level & XP */}
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>{t('profileLevel')} {user.level}</Text>
            <Text style={styles.xpText}>{currentXP} XP</Text>
          </View>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${Math.min(xpProgress * 100, 100)}%` }]} />
          </View>
        </AnimatedBentoCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          <AnimatedBentoCard style={styles.statCard}>
            <Ionicons name="flame" size={24} color={COLORS.orange} />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>{t('profileStreak')}</Text>
          </AnimatedBentoCard>
          <AnimatedBentoCard style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={COLORS.yellow} />
            <Text style={styles.statNumber}>{history.length}</Text>
            <Text style={styles.statLabel}>{t('profileCompleted')}</Text>
          </AnimatedBentoCard>
          <AnimatedBentoCard style={styles.statCard}>
            <Ionicons name="star" size={24} color={COLORS.cyan} />
            <Text style={styles.statNumber}>{user.level}</Text>
            <Text style={styles.statLabel}>{t('profileLevel')}</Text>
          </AnimatedBentoCard>
        </View>

        {/* Weight Tracker */}
        <AnimatedBentoCard style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('profileWeightTracker')}</Text>
            <TouchableOpacity onPress={() => setShowWeightModal(true)} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={COLORS.cyan} />
              <Text style={styles.addBtnText}>{t('profileAddWeight')}</Text>
            </TouchableOpacity>
          </View>

          {weightHistory.length === 0 ? (
            <Text style={styles.emptyText}>{t('profileNoWeightData')}</Text>
          ) : (
            weightHistory.slice(-10).reverse().map(log => (
              <View key={log.id} style={styles.weightRow}>
                <View>
                  <Text style={styles.weightValue}>{log.weight} kg</Text>
                  <Text style={styles.weightDate}>{new Date(log.date).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => onDeleteWeight(log.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.textGrayDark} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </AnimatedBentoCard>

        {/* Weight Chart */}
        {weightHistory.length >= 2 && (
          <WeightChart data={weightHistory} />
        )}

        {/* Recent Workouts */}
        {history.length > 0 && (
          <AnimatedBentoCard style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profileRecentWorkouts')}</Text>
            {history.slice(-5).reverse().map((item, i) => (
              <View key={i} style={styles.workoutRow}>
                <View style={styles.workoutIcon}>
                  <Ionicons
                    name={item.feedback?.rating === 'easy' ? 'happy' : item.feedback?.rating === 'hard' ? 'sad' : 'star'}
                    size={20}
                    color={item.feedback?.rating === 'easy' ? COLORS.cyan : item.feedback?.rating === 'hard' ? COLORS.orange : COLORS.yellow}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutTitle} numberOfLines={1}>{item.plan.title}</Text>
                  <Text style={styles.workoutDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                {item.heartRateData && (item.heartRateData.daily || item.heartRateData.preWorkout || item.heartRateData.postWorkout) && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="heart" size={14} color={COLORS.red} />
                    <Text style={{ color: COLORS.red, fontSize: FONTS.sizes.xs }}>
                      {item.heartRateData.daily ? (
                        `${item.heartRateData.daily} BPM`
                      ) : (
                        `${item.heartRateData.preWorkout || '--'} → ${item.heartRateData.postWorkout || '--'}`
                      )}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </AnimatedBentoCard>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: 80 },
  userCard: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', marginBottom: SPACING.xl,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  avatarText: { fontSize: FONTS.sizes.xxxl, fontWeight: 'bold', color: 'white' },
  userName: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: 4 },
  userEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, marginBottom: SPACING.lg },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: SPACING.sm },
  levelText: { color: COLORS.cyan, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  xpText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm },
  xpBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  xpFill: { height: 6, backgroundColor: COLORS.cyan, borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', gap: 4,
  },
  statNumber: { fontSize: FONTS.sizes.xxl, fontWeight: 'bold', color: COLORS.textWhite },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { color: COLORS.cyan, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  emptyText: { color: COLORS.textGray, fontSize: FONTS.sizes.sm, textAlign: 'center', paddingVertical: SPACING.md },
  weightRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  weightValue: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.md },
  weightDate: { color: COLORS.textGray, fontSize: FONTS.sizes.xs },
  workoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  workoutIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
  },
  workoutTitle: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  workoutDate: { color: COLORS.textGray, fontSize: FONTS.sizes.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#2D3748', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xxl,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.textWhite },
  weightInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  weightInput: {
    fontSize: 48, fontWeight: 'bold', color: COLORS.textWhite,
    borderBottomWidth: 2, borderBottomColor: COLORS.cyan, minWidth: 100, textAlign: 'center',
  },
  weightUnit: { fontSize: FONTS.sizes.xxl, color: COLORS.textGray },
  saveBtn: { borderRadius: RADIUS.full, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
  chartCard: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  chartTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite },
  chartSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, marginTop: 2 },
  chartBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chartBadgeText: { fontSize: FONTS.sizes.sm, fontWeight: 'bold' },
  chartXAxis: { position: 'relative', height: 20, marginTop: SPACING.sm },
  chartXLabel: { position: 'absolute', alignItems: 'center' },
  chartXLabelText: { fontSize: 10, color: COLORS.textGray, textAlign: 'center' },
});
