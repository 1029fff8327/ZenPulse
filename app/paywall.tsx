import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useMemo, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSubscription } from "../src/state/subscription";

type PlanKey = "monthly" | "yearly";

export default function PaywallScreen() {
  const router = useRouter();
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
          style={[styles.blob, styles.blobTop]}
        />
        <LinearGradient
          colors={["rgba(70, 210, 255, 0.18)", "rgba(0, 0, 0, 0)"]}
          start={{ x: 0.05, y: 0.2 }}
          end={{ x: 0.9, y: 0.9 }}
          style={[styles.blob, styles.blobBottom]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="leaf-outline" size={18} color="#EDEBFF" />
            </View>
            <Text style={styles.brandText}>ZenPulse</Text>
          </View>

          <Text style={styles.title}>Unlock Premium Calm</Text>
          <Text style={styles.subtitle}>
            Guided sessions, mood-based affirmations, and a gentle rhythm for your day.
          </Text>
        </View>

        {/* Premium card */}
        <View style={styles.glassCard}>
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
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose your plan</Text>
          <Text style={styles.sectionHint}>Cancel anytime • 7-day free trial (prototype)</Text>
        </View>

        <View style={styles.planGrid}>
          {/* Monthly */}
          <Pressable
            onPress={() => setSelected("monthly")}
            style={({ pressed }) => [
              styles.planCard,
              selected === "monthly" && styles.planCardSelected,
              pressed && styles.planCardPressed,
            ]}
          >
            <View style={styles.planHeaderRow}>
              <Text style={styles.planTitle}>Monthly</Text>
              {selected === "monthly" && (
                <Ionicons name="checkmark-circle" size={18} color="#7EE7FF" />
              )}
            </View>
            <Text style={styles.planPrice}>
              $9.99 <Text style={styles.planPriceSmall}>/ month</Text>
            </Text>
            <Text style={styles.planMeta}>Great to try it out</Text>
          </Pressable>

          {/* Yearly */}
          <Pressable
            onPress={() => setSelected("yearly")}
            style={({ pressed }) => [
              styles.planCard,
              styles.planCardBestValue,
              selected === "yearly" && styles.planCardSelected,
              pressed && styles.planCardPressed,
            ]}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>

            <View style={styles.planHeaderRow}>
              <Text style={styles.planTitle}>Yearly</Text>
              {selected === "yearly" && (
                <Ionicons name="checkmark-circle" size={18} color="#7EE7FF" />
              )}
            </View>

            <Text style={styles.planPrice}>
              $59.99 <Text style={styles.planPriceSmall}>/ year</Text>
            </Text>
            <Text style={styles.planMeta}>Save 50% vs monthly</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
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
              style={styles.ctaGradient}
            >
              <View style={styles.ctaInner}>
                {loading ? (
                  <ActivityIndicator color="#0B0C10" />
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={18} color="#0B0C10" />
                    <Text style={styles.ctaText}>Try free</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </Pressable>

          <Text style={styles.footnote}>
            {Platform.OS === "android"
              ? "This is a prototype. Purchase is simulated."
              : "This is a prototype. Purchase is simulated."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#05060A",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 16,
  },

  blob: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 520 / 2,
    opacity: 1,
  },
  blobTop: {
    top: -260,
    left: -180,
  },
  blobBottom: {
    bottom: -280,
    right: -190,
  },

  header: {
    gap: 10,
    paddingTop: 4,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
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
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 15,
    lineHeight: 21,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 16,
    overflow: "hidden",
  },

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
  pillText: {
    color: "#0B0C10",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    marginLeft: 6,
    color: "rgba(255,255,255,0.70)",
    fontSize: 12,
    fontWeight: "600",
  },

  benefits: {
    gap: 10,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
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
  benefitText: {
    flex: 1,
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 20,
  },

  sectionHeader: {
    gap: 4,
    marginTop: 2,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHint: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 12,
  },

  planGrid: {
    gap: 12,
  },

  planCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  planCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
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
  bestValueText: {
    color: "#0B0C10",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  planHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  planTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "800",
  },
  planPrice: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  planPriceSmall: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    fontWeight: "600",
  },
  planMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
  },

  ctaWrap: {
    gap: 10,
    marginTop: 6,
  },

  ctaButton: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.99 }],
  },

  ctaGradient: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: {
    color: "#0B0C10",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },

  footnote: {
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 16,
  },
});