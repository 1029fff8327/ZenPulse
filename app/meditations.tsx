import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MEDITATIONS, Meditation } from "../src/data/meditations";
import React, { useCallback } from "react";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSubscription } from "../src/state/subscription";

export default function MeditationsScreen() {
  const router = useRouter();
  const { isSubscribed, hydrated, reset } = useSubscription();

  const onPressCard = useCallback(
    (item: Meditation) => {
      if (item.isPremium && !isSubscribed) {
        router.push("/paywall");
        return;
      }
      router.push(`/session/${item.id}`);
    },
    [isSubscribed, router]
  );

  const onPressHeaderAction = useCallback(async () => {
    if (!hydrated) return;

    if (!isSubscribed) {
      router.push("/paywall");
      return;
    }

    await reset();
  }, [hydrated, isSubscribed, reset, router]);

  const renderItem = useCallback(
    ({ item }: { item: Meditation }) => {
      const locked = item.isPremium && !isSubscribed;

      return (
        <Pressable
          onPress={() => onPressCard(item)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <ImageBackground
            source={{ uri: item.imageUrl }}
            resizeMode="cover"
            style={styles.cardImage}
            imageStyle={styles.cardImageInner}
          >
            {/* Soft gradient-ish overlay */}
            <View style={styles.imageTint} />

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.titleRow}>
                <Text numberOfLines={1} style={styles.cardTitle}>
                  {item.title}
                </Text>

                {item.isPremium && (
                  <View style={styles.premiumPill}>
                    <Ionicons name="sparkles" size={12} color="#0B0C10" />
                    <Text style={styles.premiumPillText}>Premium</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.75)" />
                <Text style={styles.metaText}>{item.minutes} min</Text>
              </View>
            </View>

            {/* Locked overlay */}
            {locked && (
              <View style={styles.lockOverlay} pointerEvents="none">
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={18} color="#EDEBFF" />
                  <Text style={styles.lockText}>Locked</Text>
                </View>
              </View>
            )}
          </ImageBackground>
        </Pressable>
      );
    },
    [isSubscribed, onPressCard]
  );

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.brandIcon}>
            <Ionicons name="leaf-outline" size={18} color="#EDEBFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>ZenPulse</Text>
            <Text style={styles.brandSubtitle}>
              {isSubscribed ? "Premium unlocked" : "Free access"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onPressHeaderAction}
          style={({ pressed }) => [
            styles.headerBtn,
            isSubscribed ? styles.headerBtnReset : styles.headerBtnPremium,
            pressed && styles.headerBtnPressed,
          ]}
        >
          <Ionicons
            name={isSubscribed ? "refresh" : "sparkles"}
            size={16}
            color={isSubscribed ? "rgba(255,255,255,0.92)" : "#0B0C10"}
          />
          <Text
            style={[
              styles.headerBtnText,
              isSubscribed ? styles.headerBtnTextReset : styles.headerBtnTextPremium,
            ]}
          >
            {isSubscribed ? "Reset" : "Go Premium"}
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={MEDITATIONS}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#05060A",
    paddingHorizontal: 16,
  },

  header: {
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  brandSubtitle: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 12,
    marginTop: 2,
  },

  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },

  headerBtnPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },

  headerBtnPremium: {
    backgroundColor: "rgba(255,255,255,0.90)",
    borderColor: "rgba(255,255,255,0.22)",
  },

  headerBtnReset: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
  },

  headerBtnText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  headerBtnTextPremium: {
    color: "#0B0C10",
  },

  headerBtnTextReset: {
    color: "rgba(255,255,255,0.92)",
  },

  listContent: {
    paddingTop: 8,
    paddingBottom: 18,
  },

  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  cardPressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.96,
  },

  cardImage: {
    minHeight: 124, // не фикс высота экрана, просто минимальный размер карточки
    justifyContent: "flex-end",
  },

  cardImageInner: {
    borderRadius: 18,
  },

  imageTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  cardContent: {
    padding: 14,
    gap: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cardTitle: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  premiumPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  premiumPillText: {
    color: "#0B0C10",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
  },

  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 12, 0.62)",
    justifyContent: "center",
    alignItems: "center",
  },

  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  lockText: {
    color: "#EDEBFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    fontWeight: "600",
  },
});