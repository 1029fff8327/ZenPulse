import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MEDITATIONS, Meditation } from "../src/data/meditations";
import { Mood, buildPrompt, mockLLM } from "../src/utils/ai";
import React, { useCallback, useMemo, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSubscription } from "../src/state/subscription";

export default function MeditationsScreen() {
  const router = useRouter();
  const { isSubscribed, hydrated, reset } = useSubscription();

  // ===== AI vibe feature state =====
  const [mood, setMood] = useState<Mood>("good");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);

  const moodOptions = useMemo(
    () =>
      [
        { key: "good" as const, emoji: "🙂", label: "Good" },
        { key: "neutral" as const, emoji: "😐", label: "Neutral" },
        { key: "sad" as const, emoji: "😔", label: "Sad" },
      ] as const,
    []
  );

  const onGenerate = useCallback(async () => {
    if (aiLoading) return;

    const prompt = buildPrompt(mood);
    setLastPrompt(prompt);
    setAiLoading(true);

    try {
      const text = await mockLLM(prompt);
      setAiText(text);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, mood]);

  // ===== Meditations list logic =====
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
            <View style={styles.imageTint} />

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
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={styles.metaText}>{item.minutes} min</Text>
              </View>
            </View>

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

  const ListHeader = useMemo(() => {
    return (
      <View style={styles.headerWrap}>
        {/* Top header */}
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
                isSubscribed
                  ? styles.headerBtnTextReset
                  : styles.headerBtnTextPremium,
              ]}
            >
              {isSubscribed ? "Reset" : "Go Premium"}
            </Text>
          </Pressable>
        </View>

        {/* AI Mood block */}
        <View style={styles.aiCard}>
          <View style={styles.aiTopRow}>
            <View style={styles.aiTitleRow}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles-outline" size={18} color="#EDEBFF" />
              </View>
              <View>
                <Text style={styles.aiTitle}>AI Настрой дня</Text>
                <Text style={styles.aiSubtitle}>
                  Choose your mood — get a premium affirmation.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setPromptVisible(true)}
              disabled={!lastPrompt}
              style={({ pressed }) => [
                styles.showPromptBtn,
                !lastPrompt && styles.showPromptBtnDisabled,
                pressed && styles.showPromptBtnPressed,
              ]}
            >
              <Ionicons
                name="code-slash-outline"
                size={16}
                color={lastPrompt ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.45)"}
              />
              <Text
                style={[
                  styles.showPromptText,
                  !lastPrompt && { color: "rgba(255,255,255,0.45)" },
                ]}
              >
                Show prompt
              </Text>
            </Pressable>
          </View>

          <View style={styles.moodRow}>
            {moodOptions.map((m) => {
              const active = mood === m.key;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => setMood(m.key)}
                  style={({ pressed }) => [
                    styles.moodBtn,
                    active && styles.moodBtnActive,
                    pressed && styles.moodBtnPressed,
                  ]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      active && styles.moodLabelActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onGenerate}
            disabled={aiLoading}
            style={({ pressed }) => [
              styles.generateBtn,
              pressed && styles.generateBtnPressed,
              aiLoading && styles.generateBtnDisabled,
            ]}
          >
            <LinearGradient
              colors={["rgba(126, 231, 255, 0.95)", "rgba(156, 120, 255, 0.95)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.generateGradient}
            >
              <View style={styles.generateInner}>
                {aiLoading ? (
                  <ActivityIndicator color="#0B0C10" />
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={18} color="#0B0C10" />
                    <Text style={styles.generateText}>Generate</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </Pressable>

          {aiText && (
            <View style={styles.aiResult}>
              <Text style={styles.aiResultLabel}>Today’s affirmation</Text>
              <Text style={styles.aiResultText}>{aiText}</Text>
            </View>
          )}
        </View>

        <Text style={styles.listTitle}>Meditations</Text>
      </View>
    );
  }, [
    aiLoading,
    aiText,
    isSubscribed,
    lastPrompt,
    mood,
    moodOptions,
    onGenerate,
    onPressHeaderAction,
  ]);

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
      <FlatList
        data={MEDITATIONS}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Prompt Modal */}
      <Modal
        visible={promptVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPromptVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPromptVisible(false)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="code-slash" size={18} color="#EDEBFF" />
                <Text style={styles.modalTitle}>Prompt to LLM</Text>
              </View>

              <Pressable
                onPress={() => setPromptVisible(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.85)" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalHint}>
                (Mock mode) This is the exact prompt we would send to the model.
              </Text>

              <View style={styles.promptBox}>
                <Text style={styles.promptText}>
                  {lastPrompt ?? "Generate first to see the prompt."}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#05060A",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },

  headerWrap: {
    paddingBottom: 12,
    gap: 14,
  },

  header: {
    paddingTop: 6,
    paddingBottom: 2,
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

  // ===== AI card =====
  aiCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    gap: 12,
  },

  aiTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  aiIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  aiTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  aiSubtitle: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 12,
    marginTop: 3,
  },

  showPromptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  showPromptBtnDisabled: {
    opacity: 0.8,
  },
  showPromptBtnPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  showPromptText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  moodRow: {
    flexDirection: "row",
    gap: 10,
  },

  moodBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  moodBtnActive: {
    backgroundColor: "rgba(126, 231, 255, 0.10)",
    borderColor: "rgba(126, 231, 255, 0.55)",
  },
  moodBtnPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },

  moodEmoji: {
    fontSize: 20,
  },
  moodLabel: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 12,
    fontWeight: "700",
  },
  moodLabelActive: {
    color: "rgba(255,255,255,0.92)",
  },

  generateBtn: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  generateBtnPressed: {
    transform: [{ scale: 0.99 }],
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateGradient: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  generateInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  generateText: {
    color: "#0B0C10",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  aiResult: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 6,
  },
  aiResultLabel: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  aiResultText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  listTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: 2,
  },

  // ===== Cards =====
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
    minHeight: 124,
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

  // ===== Loading =====
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

  // ===== Modal =====
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  modalCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(18, 18, 22, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    maxHeight: "80%",
  },

  modalHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },

  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  modalTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  modalBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },

  modalHint: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },

  promptBox: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  promptText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    fontFamily: "monospace",
  },
});