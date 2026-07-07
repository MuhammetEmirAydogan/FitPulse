import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { StarBorder } from './StarBorder';

interface NavItem {
  view: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'home', icon: 'home-outline', activeIcon: 'home', labelKey: 'navHome', color: '#40E0D0' },
  { view: 'wizard', icon: 'sparkles-outline', activeIcon: 'sparkles', labelKey: 'navCreate', color: '#FF7F50' },
  { view: 'smart_kitchen', icon: 'restaurant-outline', activeIcon: 'restaurant', labelKey: 'navKitchen', color: '#48BB78' },
  { view: 'calorie_calculator', icon: 'calculator-outline', activeIcon: 'calculator', labelKey: 'navCalorie', color: '#F6C90E' },
  { view: 'body_fat_wizard', icon: 'body-outline', activeIcon: 'body', labelKey: 'navBodyFat', color: '#FF6B6B' },
  { view: 'mental_rhythms', icon: 'leaf-outline', activeIcon: 'leaf', labelKey: 'navMental', color: '#38B2AC' },
  { view: 'analytics', icon: 'pulse-outline', activeIcon: 'pulse', labelKey: 'navAnalytics', color: '#FC4B6C' },
  { view: 'current_plan', icon: 'clipboard-outline', activeIcon: 'clipboard', labelKey: 'navPlan', color: '#67E8F9' },
  { view: 'mood', icon: 'happy-outline', activeIcon: 'happy', labelKey: 'navMood', color: '#F6C90E' },
  { view: 'heart_rate_monitor', icon: 'heart-outline', activeIcon: 'heart', labelKey: 'navHeart', color: '#FC4B6C' },
  { view: 'history', icon: 'star-outline', activeIcon: 'star', labelKey: 'navHistory', color: '#F6C90E' },
  { view: 'profile', icon: 'person-outline', activeIcon: 'person', labelKey: 'navProfile', color: '#9B59B6' },
  { view: 'settings', icon: 'settings-outline', activeIcon: 'settings', labelKey: 'navSettings', color: '#A0AEC0' },
];

interface Props {
  activeView: string;
  onNavigate: (view: string) => void;
  hasActivePlan: boolean;
  bottomInset?: number;
}

export const BottomNavigation: React.FC<Props> = ({
  activeView, onNavigate, hasActivePlan, bottomInset = 0
}) => {
  const { t } = useLocalization();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const activeIndex = NAV_ITEMS.findIndex(item => item.view === activeView);
    if (activeIndex !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: activeIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 50);
    }
  }, [activeView]);

  const renderItem = ({ item }: { item: NavItem }) => {
    const isActive = activeView === item.view;
    const showBadge = item.view === 'current_plan' && hasActivePlan;

    const content = (
      <TouchableOpacity
        onPress={() => onNavigate(item.view)}
        activeOpacity={0.75}
        style={[
          styles.item,
          isActive && { backgroundColor: item.color + '12' }
        ]}
      >
        <View style={{ position: 'relative' }}>
          <Ionicons
            name={isActive ? item.activeIcon : item.icon}
            size={17}
            color={isActive ? item.color : '#4A5568'}
          />
          {showBadge && <View style={styles.badge} />}
        </View>
        <Text style={[styles.label, isActive && { color: item.color, fontWeight: '700' }]}>
          {t(item.labelKey)}
        </Text>
      </TouchableOpacity>
    );

    if (isActive) {
      return (
        <StarBorder color={item.color} speed={2500} radius={50}>
          {content}
        </StarBorder>
      );
    }
    return content;
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]}>
      <FlatList
        ref={flatListRef}
        data={NAV_ITEMS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        keyExtractor={item => item.view}
        initialNumToRender={NAV_ITEMS.length}
        renderItem={renderItem}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
          }, 300);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(10,12,18,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    // Cam gölge efekti
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 30,
  },
  scroll: {
    paddingHorizontal: 8,
    paddingBottom: 6,
    gap: 4,
    alignItems: 'center',
  },
  // Webdeki gibi: aktif item pill/yuvarlak, ikon + yazı yan yana
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF7F50',
    borderWidth: 1.5,
    borderColor: '#0d1117',
  },
});
