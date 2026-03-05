import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useMemo, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSubscription } from "../src/state/subscription";

type PlanKey = "monthly" | "yearly";

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmall = width <= 360; // условный iPhone SE / маленькие андроиды
  const isLarge = width >= 430; // условный Pro Max / крупные андроиды

  const { subscribe, hydrated } = useSubscription();

  const [selected, setSelected] = useState<PlanKey>("yearly");
  const [loading, setLoading] = useState(false);

  const benefits = useMemo(
    () => [
      { icon: "sparkles-outline" as const, text: "AI affirmations tailored to your mood" },
      { icon: "lock-closed-outline" as const, text: "Unlock all premium meditation sessions" },
      { icon: "moon-outline" as const, text: "Better sleep routines & soundscapes" },
      { icon: "heart-outline" as const, text: "Daily calm streaks & gentle reminders" },
    ],
    []
  );

  const contentMaxWidth = 560;

  const padH = isSmall ? 14 : 16;
  const padTop = isSmall ? 10 : 14;
  const padBottom = 18 + insets.bottom;

  const blobSize = isSmall ? 460 : 520;
  const blobStyle = { width: blobSize, height: blobSize, borderRadius: blobSize / 2 };

  async function onTryFree() {
    if (loading) return;
    setLoading(true);
    try {
      await subscribe();
      router.replace("/meditations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#05060A", "#070A12", "#060713"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(156, 120, 255, 0.22)", "rgba(0, 0, 0, 0)"]}
          start={{ x: 0.2, y: 0.05 }}
          end={{ x: 0.8, y: 0.65 }}
          style={[styles.blob, blobStyle, isSmall ? styles.blobTopSmall : styles.blobTop]}
        />
        <LinearGradient
          colors={["rgba(70, 210, 255, 0.18)", "rgba(0, 0, 0, 0)"]}
          start={{ x: 0.05, y: 0.2 }}
          end={{ x: 0.9, y: 0.9 }}
          style={[styles.blob, blobStyle, isSmall ? styles.blobBottomSmall : styles.blobBottom]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: padH,
            paddingTop: padTop,
            paddingBottom: padBottom,
            flexGrow: 1, // важно: позволяет CTA “прилипать” к низу на больших экранах
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
          isSmall && styles.contentSmall,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="leaf-outline" size={18} color="#EDEBFF" />
            </View>
            <Text style={styles.brandText} numberOfLines={1}>
              ZenPulse
            </Text>
          </View>

          <Text
            style={[styles.title, isSmall && styles.titleSmall]}
            numberOfLines={2}
          >
            Unlock Premium Calm
          </Text>

          <Text
            style={[styles.subtitle, isSmall && styles.subtitleSmall]}
            numberOfLines={isSmall ? 3 : 2}
          >
            Guided sessions, mood-based affirmations, and a gentle rhythm for your day.
          </Text>
        </View>

        {/* Premium card */}
        <View style={[styles.glassCard, isSmall && styles.glassCardSmall]}>
          <View style={styles.cardTopRow}>
            <View style={styles.pill}>
              <Ionicons name="sparkles" size={14} color="#0B0C10" />
              <Text style={styles.pillText}>Premium</Text>
            </View>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFD37D" />
              <Ionicons name="star" size={14} color="#FFD37D" />
              <Ionicons name="star" size={14} color="#FFD37D" />
              <Ionicons name="star" size={14} color="#FFD37D" />
              <Ionicons name="star" size={14} color="#FFD37D" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>

          <View style={styles.benefits}>
            {benefits.map((b, idx) => (
              <View key={idx} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <Ionicons name={b.icon} size={18} color="#E8E6FF" />
                </View>
                <Text style={[styles.benefitText, isSmall && styles.benefitTextSmall]}>
                  {b.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            Choose your plan
          </Text>
          <Text style={styles.sectionHint} numberOfLines={2}>
            Cancel anytime • 7-day free trial (prototype)
          </Text>
        </View>

        <View style={styles.planGrid}>
          {/* Monthly */}
          <Pressable
            onPress={() => setSelected("monthly")}
            style={({ pressed }) => [
              styles.planCard,
              selected === "monthly" && styles.planCardSelected,
              pressed && styles.planCardPressed,
              isSmall && styles.planCardSmall,
            ]}
          >
            <View style={styles.planHeaderRow}>
              <Text style={[styles.planTitle, isSmall && styles.planTitleSmall]} numberOfLines={1}>
                Monthly
              </Text>
              {selected === "monthly" && (
                <Ionicons name="checkmark-circle" size={18} color="#7EE7FF" />
              )}
            </View>
            <Text style={[styles.planPrice, isSmall && styles.planPriceSmallText]} numberOfLines={1}>
              $9.99 <Text style={styles.planPriceSmall}>/ month</Text>
            </Text>
            <Text style={styles.planMeta} numberOfLines={1}>
              Great to try it out
            </Text>
          </Pressable>

          {/* Yearly */}
          <Pressable
            onPress={() => setSelected("yearly")}
            style={({ pressed }) => [
              styles.planCard,
              styles.planCardBestValue,
              selected === "yearly" && styles.planCardSelected,
              pressed && styles.planCardPressed,
              isSmall && styles.planCardSmall,
            ]}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText} numberOfLines={1}>
                BEST VALUE
              </Text>
            </View>

            <View style={styles.planHeaderRow}>
              <Text style={[styles.planTitle, isSmall && styles.planTitleSmall]} numberOfLines={1}>
                Yearly
              </Text>
              {selected === "yearly" && (
                <Ionicons name="checkmark-circle" size={18} color="#7EE7FF" />
              )}
            </View>

            <Text style={[styles.planPrice, isSmall && styles.planPriceSmallText]} numberOfLines={1}>
              $59.99 <Text style={styles.planPriceSmall}>/ year</Text>
            </Text>
            <Text style={styles.planMeta} numberOfLines={1}>
              Save 50% vs monthly
            </Text>
          </Pressable>
        </View>

        {/* CTA (push to bottom on tall screens) */}
        <View style={[styles.ctaWrap, { marginTop: "auto" }]}>
          <Pressable
            disabled={!hydrated || loading}
            onPress={onTryFree}
            style={({ pressed }) => [
              styles.ctaButton,
              (!hydrated || loading) && styles.ctaButtonDisabled,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <LinearGradient
              colors={["rgba(126, 231, 255, 0.95)", "rgba(156, 120, 255, 0.95)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ctaGradient, isSmall && styles.ctaGradientSmall]}
            >
              <View style={styles.ctaInner}>
                {loading ? (
                  <ActivityIndicator color="#0B0C10" />
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={18} color="#0B0C10" />
                    <Text style={[styles.ctaText, isSmall && styles.ctaTextSmall]}>
                      Try free
                    </Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </Pressable>

          <Text style={styles.footnote} numberOfLines={2}>
            This is a prototype. Purchase is simulated.
          </Text>
        </View>

        {/* extra breathing room on very large screens */}
        {isLarge ? <View style={{ height: 6 }} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#05060A" },
  scroll: { flex: 1 },

  content: {
    gap: 16,
  },
  contentSmall: {
    gap: 14,
  },

  blob: {
    position: "absolute",
    opacity: 1,
  },
  blobTop: { top: -260, left: -180 },
  blobBottom: { bottom: -280, right: -190 },
  blobTopSmall: { top: -240, left: -200 },
  blobBottomSmall: { bottom: -260, right: -210 },

  header: { gap: 10, paddingTop: 4 },

  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontWeight: "700",
  },

  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "700", letterSpacing: -0.4 },
  titleSmall: { fontSize: 26 },

  subtitle: { color: "rgba(255,255,255,0.70)", fontSize: 15, lineHeight: 21 },
  subtitleSmall: { fontSize: 14, lineHeight: 20 },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 16,
    overflow: "hidden",
  },
  glassCardSmall: { padding: 14 },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { color: "#0B0C10", fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },

  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { marginLeft: 6, color: "rgba(255,255,255,0.70)", fontSize: 12, fontWeight: "600" },

  benefits: { gap: 10 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: { flex: 1, color: "rgba(255,255,255,0.86)", fontSize: 14, lineHeight: 20 },
  benefitTextSmall: { fontSize: 13, lineHeight: 19 },

  sectionHeader: { gap: 4, marginTop: 2 },
  sectionTitle: { color: "rgba(255,255,255,0.92)", fontSize: 16, fontWeight: "700" },
  sectionHint: { color: "rgba(255,255,255,0.60)", fontSize: 12 },

  planGrid: { gap: 12 },

  planCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  planCardSmall: { padding: 14 },
  planCardPressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },
  planCardSelected: {
    borderColor: "rgba(126, 231, 255, 0.60)",
    backgroundColor: "rgba(126, 231, 255, 0.10)",
  },
  planCardBestValue: {
    borderColor: "rgba(156, 120, 255, 0.40)",
    backgroundColor: "rgba(156, 120, 255, 0.12)",
  },

  bestValueBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.90)",
    marginBottom: 10,
  },
  bestValueText: { color: "#0B0C10", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },

  planHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  planTitle: { color: "rgba(255,255,255,0.92)", fontSize: 16, fontWeight: "800" },
  planTitleSmall: { fontSize: 15 },

  planPrice: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", letterSpacing: -0.2 },
  planPriceSmallText: { fontSize: 20 },
  planPriceSmall: { color: "rgba(255,255,255,0.70)", fontSize: 14, fontWeight: "600" },
  planMeta: { marginTop: 6, color: "rgba(255,255,255,0.62)", fontSize: 12 },

  ctaWrap: { gap: 10, marginTop: 6 },
  ctaButton: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  ctaButtonDisabled: { opacity: 0.6 },
  ctaButtonPressed: { transform: [{ scale: 0.99 }] },

  ctaGradient: { paddingVertical: 14, paddingHorizontal: 14 },
  ctaGradientSmall: { paddingVertical: 12, paddingHorizontal: 12 },

  ctaInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  ctaText: { color: "#0B0C10", fontSize: 16, fontWeight: "900", letterSpacing: 0.2, textTransform: "uppercase" },
  ctaTextSmall: { fontSize: 14 },

  footnote: { textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 16 },
});