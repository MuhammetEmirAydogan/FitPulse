import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  EmailAuthProvider, reauthenticateWithCredential,
  updatePassword, updateEmail, updateProfile,
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { useLocalization } from '../context/LocalizationContext';
import { User, Language } from '../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';
import { StarBorder } from '../components/StarBorder';
import { AnimatedBentoCard } from '../components/AnimatedBentoCard';

interface Props {
  user: User;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'zh', label: 'Chinese', native: '中文' },
];

export const SettingsScreen: React.FC<Props> = ({ user, onUserUpdate, onLogout }) => {
  const { t, language, setLanguage } = useLocalization();

  // ─── Profil düzenleme ────────────────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ─── Şifre değiştirme ────────────────────────────────────────────────────────
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ─── Profil aç ───────────────────────────────────────────────────────────────
  const openEdit = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditError(null);
    setIsEditOpen(true);
  };

  // ─── Profil kaydet ───────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editName.trim()) {
      setEditError('İsim boş bırakılamaz.');
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Kullanıcı bulunamadı.');

      // Firebase Auth displayName güncelle
      await updateProfile(firebaseUser, { displayName: editName.trim() });

      // Email değiştiyse Firebase Auth'da güncelle
      if (editEmail.trim() !== user.email) {
        await updateEmail(firebaseUser, editEmail.trim());
      }

      // Firestore'da güncelle
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        name: editName.trim(),
        email: editEmail.trim(),
        updatedAt: serverTimestamp(),
      });

      onUserUpdate({ ...user, name: editName.trim(), email: editEmail.trim() });
      setIsEditOpen(false);
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        setEditError('Email değişikliği için önce çıkış yapıp tekrar giriş yapmanız gerekiyor.');
      } else if (e.code === 'auth/email-already-in-use') {
        setEditError('Bu email adresi zaten kullanılıyor.');
      } else if (e.code === 'auth/invalid-email') {
        setEditError('Geçersiz email adresi.');
      } else {
        setEditError('Güncelleme başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Şifre kaydet ────────────────────────────────────────────────────────────
  const savePassword = async () => {
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalı.');
      return;
    }

    setPasswordLoading(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error('Kullanıcı bulunamadı.');

      // Önce mevcut şifre ile yeniden kimlik doğrula
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Şifreyi güncelle
      await updatePassword(firebaseUser, newPassword);

      Alert.alert('Başarılı', 'Şifreniz güncellendi.');
      setIsPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setPasswordError('Mevcut şifre hatalı.');
      } else if (e.code === 'auth/weak-password') {
        setPasswordError('Yeni şifre çok zayıf.');
      } else if (e.code === 'auth/too-many-requests') {
        setPasswordError('Çok fazla deneme. Lütfen bekleyin.');
      } else {
        setPasswordError('Şifre güncellenemedi. Tekrar deneyin.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── Çıkış onayı ─────────────────────────────────────────────────────────────
  const confirmLogout = () => {
    Alert.alert(
      t('logoutTitle'),
      t('logoutConfirm'),
      [
        { text: t('cancelButton'), style: 'cancel' },
        { text: t('logoutButton'), style: 'destructive', onPress: onLogout },
      ]
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Profil Düzenleme Modal ── */}
      <Modal visible={isEditOpen} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('editProfileTitle')}</Text>
              <TouchableOpacity onPress={() => setIsEditOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder={t('namePlaceholder')}
              placeholderTextColor={COLORS.textGray}
            />
            <TextInput
              style={styles.modalInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder={t('emailPlaceholder')}
              placeholderTextColor={COLORS.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {editError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color="#FC8181" />
                <Text style={styles.errorText}>{editError}</Text>
              </View>
            )}

            <StarBorder color={COLORS.cyan} speed={2000} radius={RADIUS.full}>
              <TouchableOpacity onPress={saveEdit} activeOpacity={0.8} disabled={editLoading}>
                <LinearGradient
                  colors={[COLORS.cyan, COLORS.blue]}
                  style={styles.saveBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {editLoading
                    ? <ActivityIndicator color="white" />
                    : <Text style={styles.saveBtnText}>{t('saveButton')}</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </StarBorder>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Ana Ekran ── */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settingsTitle')}</Text>

        {/* Profil */}
        <AnimatedBentoCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={COLORS.textWhite} />
            <Text style={styles.sectionTitle}>{t('profileTitle')}</Text>
            <TouchableOpacity onPress={openEdit} style={{ marginLeft: 'auto' }}>
              <Text style={styles.editLink}>{t('editButton')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>{t('profileNameLabel')}</Text>
            <Text style={styles.profileValue}>{user.name}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>{t('profileEmailLabel')}</Text>
            <Text style={styles.profileValue} numberOfLines={1}>{user.email}</Text>
          </View>
        </AnimatedBentoCard>

        {/* Dil */}
        <AnimatedBentoCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={20} color={COLORS.textWhite} />
            <Text style={styles.sectionTitle}>{t('languageTitle')}</Text>
          </View>
          <View style={styles.langGrid}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langOption, language === lang.code && styles.langOptionSelected]}
                onPress={() => setLanguage(lang.code)}
                activeOpacity={0.8}
              >
                <Text style={[styles.langText, language === lang.code && styles.langTextSelected]}>
                  {lang.native}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedBentoCard>

        {/* Güvenlik */}
        <AnimatedBentoCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textWhite} />
            <Text style={styles.sectionTitle}>{t('securityTitle')}</Text>
          </View>
          <TouchableOpacity
            style={styles.passwordBtn}
            activeOpacity={0.8}
            onPress={() => { setPasswordError(null); setIsPasswordOpen(true); }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.passwordBtnInner}
            >
              <View style={styles.passwordBtnLeft}>
                <Ionicons name="key-outline" size={20} color={COLORS.cyan} />
                <Text style={styles.passwordBtnText}>{t('changePasswordButton')}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textGray} />
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedBentoCard>

        {/* Çıkış */}
        <StarBorder color="#FC4B6C" speed={3000} radius={RADIUS.xl} style={{ marginTop: SPACING.lg }}>
          <TouchableOpacity onPress={confirmLogout} style={styles.logoutBtn} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
            <Text style={styles.logoutText}>{t('logoutButton')}</Text>
          </TouchableOpacity>
        </StarBorder>
      </ScrollView>

      {/* ── Şifre Değiştirme Modal ── */}
      <Modal visible={isPasswordOpen} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('changePasswordTitle')}</Text>
              <TouchableOpacity onPress={() => setIsPasswordOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('currentPasswordPlaceholder')}
              placeholderTextColor={COLORS.textGray}
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('newPasswordPlaceholder')}
              placeholderTextColor={COLORS.textGray}
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('confirmNewPasswordPlaceholder')}
              placeholderTextColor={COLORS.textGray}
              secureTextEntry
            />

            {passwordError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color="#FC8181" />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            )}

            <StarBorder color={COLORS.cyan} speed={2000} radius={RADIUS.full} style={{ marginTop: SPACING.md }}>
              <TouchableOpacity onPress={savePassword} activeOpacity={0.8} disabled={passwordLoading}>
                <LinearGradient
                  colors={[COLORS.cyan, COLORS.blue]}
                  style={styles.saveBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {passwordLoading
                    ? <ActivityIndicator color="white" />
                    : <Text style={styles.saveBtnText}>{t('saveChangesButton')}</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </StarBorder>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: 80 },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: 'bold', color: COLORS.textWhite, marginBottom: SPACING.xl, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textWhite },
  editLink: { color: COLORS.cyan, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  profileRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  profileLabel: { color: COLORS.textGray, fontSize: FONTS.sizes.md },
  profileValue: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.md, maxWidth: '60%' },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  langOption: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  langOptionSelected: { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan },
  langText: { color: COLORS.textGray, fontWeight: 'bold', fontSize: FONTS.sizes.sm },
  langTextSelected: { color: 'white' },
  passwordBtn: { marginTop: SPACING.md },
  passwordBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  passwordBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  passwordBtnText: { color: COLORS.textWhite, fontWeight: 'bold', fontSize: FONTS.sizes.md },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(252,75,108,0.1)', borderRadius: RADIUS.xl, padding: SPACING.lg,
  },
  logoutText: { color: COLORS.red, fontWeight: 'bold', fontSize: FONTS.sizes.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#2D3748', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xxl,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: 'bold', color: COLORS.textWhite },
  modalInput: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.lg, color: COLORS.textWhite,
    fontSize: FONTS.sizes.md, marginBottom: SPACING.md,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(252,129,129,0.1)', borderWidth: 1,
    borderColor: 'rgba(252,129,129,0.3)', borderRadius: 10,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { color: '#FC8181', fontSize: FONTS.sizes.sm, flex: 1 },
  saveBtn: { borderRadius: RADIUS.full, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONTS.sizes.md },
});
