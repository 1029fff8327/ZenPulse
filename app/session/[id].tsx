import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MEDITATIONS } from "../../src/data/meditations";
import { useSubscription } from "../../src/state/subscription";

type SessionStatus = "idle" | "running" | "paused" | "done";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const mmStr = String(mm).padStart(2, "0");
  const ssStr = String(ss).padStart(2, "0");
  return `${mmStr}:${ssStr}`;
}

export default function SessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmall = width <= 360;
  const isLarge = width >= 430;

  const padH = isSmall ? 14 : 16;
  const padBottom = 20 + insets.bottom;

  const timerFontSize = isSmall ? 38 : isLarge ? 52 : 44;

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { isSubscribed, hydrated } = useSubscription();

  const item = useMemo(() => {
    if (!id) return undefined;
    return MEDITATIONS.find((m) => m.id === id);
  }, [id]);

  const totalSeconds = useMemo(() => {
    const minutes = item?.minutes ?? 0;
    return Math.max(0, minutes * 60);
  }, [item?.minutes]);

  const [status, setStatus] = useState<SessionStatus>("idle");
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!item) return;
    setStatus("idle");
    setRemaining(item.minutes * 60);
  }, [item?.id]);

  useEffect(() => {
    if (!hydrated) return;
    if (!item) return;
    if (item.isPremium && !isSubscribed) {
      router.replace("/paywall");
    }
  }, [hydrated, item?.id, item?.isPremium, isSubscribed, router]);

  useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status === "running" && remaining <= 0) {
      setStatus("done");
    }
  }, [remaining, status]);

  const locked = !!item?.isPremium && hydrated && !isSubscribed;

  const progress = useMemo(() => {
    if (!totalSeconds) return 0;
    return clamp(1 - remaining / totalSeconds, 0, 1);
  }, [remaining, totalSeconds]);

  const title = item?.title ?? "Session";
  const description = item
    ? `A gentle ${item.minutes}-minute practice to settle your mind and soften your breath. Stay present — one calm moment at a time.`
    : "";

  const blobSize = isSmall ? 460 : 520;
  const blobStyle = { width: blobSize, height: blobSize, borderRadius: blobSize / 2 };

  function onStart() {
    if (!item) return;
    if (locked) return;
    setStatus("running");
  }

  function onPause() {
    setStatus("paused");
  }

  function onResume() {
    setStatus("running");
  }

  function onFinish() {
    setRemaining(0);
    setStatus("done");
  }

  function onRestart() {
    if (!item) return;
    setRemaining(item.minutes * 60);
    setStatus("idle");
  }

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

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Session not found</Text>
          <Text style={styles.notFoundSub} numberOfLines={2}>
            No meditation with id: {String(id ?? "")}
          </Text>

          <Pressable
            onPress={() => router.replace("/meditations")}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
          >
            <View style={styles.btnInner}>
              <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.92)" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (locked) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Redirecting…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        resizeMode="cover"
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={["rgba(5,6,10,0.10)", "rgba(5,6,10,0.85)", "rgba(5,6,10,0.98)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(156,120,255,0.22)", "rgba(0,0,0,0)"]}
            start={{ x: 0.15, y: 0.05 }}
            end={{ x: 0.85, y: 0.60 }}
            style={[styles.blob, blobStyle, styles.blobTop]}
          />
          <LinearGradient
            colors={["rgba(70,210,255,0.16)", "rgba(0,0,0,0)"]}
            start={{ x: 0.05, y: 0.25 }}
            end={{ x: 0.95, y: 0.95 }}
            style={[styles.blob, blobStyle, styles.blobBottom]}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: padH, paddingBottom: padBottom },
            isSmall && styles.contentSmall,
            {
              maxWidth: 560,
              alignSelf: "center",
              width: "100%",
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
            >
              <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.92)" />
            </Pressable>

            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Ionicons name="leaf-outline" size={18} color="#EDEBFF" />
              </View>
              <Text style={styles.brandText} numberOfLines={1}>
                ZenPulse
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Title block */}
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  isSmall && styles.titleSmall,
                ]}
                numberOfLines={2}
              >
                {title}
              </Text>

              {item.isPremium && (
                <View style={styles.premiumPill}>
                  <Ionicons name="sparkles" size={12} color="#0B0C10" />
                  <Text style={styles.premiumPillText} numberOfLines={1}>
                    Premium
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.75)" />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.minutes} min
              </Text>
            </View>

            <Text style={[styles.desc, isSmall && styles.descSmall]}>{description}</Text>
          </View>

          {/* Timer card */}
          <View style={[styles.glassCard, isSmall && styles.glassCardSmall]}>
            <View style={styles.timerTop}>
              <View style={styles.timerLabelRow}>
                <Ionicons name="pulse-outline" size={18} color="#EDEBFF" />
                <Text style={styles.timerLabel} numberOfLines={1}>
                  {status === "idle"
                    ? "Ready"
                    : status === "running"
                      ? "In progress"
                      : status === "paused"
                        ? "Paused"
                        : "Done"}
                </Text>
              </View>

              <Text style={[styles.timerText, { fontSize: timerFontSize }]}>
                {formatTime(remaining)}
              </Text>

              <View style={[styles.progressTrack, isSmall && styles.progressTrackSmall]}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
            </View>

            {/* Controls */}
            <View style={[styles.controls, isLarge && styles.controlsRow]}>
              {status === "idle" && (
                <Pressable
                  onPress={onStart}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    isLarge && styles.btnGrow,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <LinearGradient
                    colors={["rgba(126,231,255,0.95)", "rgba(156,120,255,0.95)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryGradient}
                  >
                    <View style={styles.btnInner}>
                      <Ionicons name="play" size={18} color="#0B0C10" />
                      <Text style={styles.primaryBtnText}>Start</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              )}

              {status === "running" && (
                <>
                  <Pressable
                    onPress={onPause}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      isLarge && styles.btnGrow,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <View style={styles.btnInner}>
                      <Ionicons name="pause" size={18} color="rgba(255,255,255,0.92)" />
                      <Text style={styles.secondaryBtnText}>Pause</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={onFinish}
                    style={({ pressed }) => [
                      styles.ghostBtn,
                      isLarge && styles.btnGrow,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <View style={styles.btnInner}>
                      <Ionicons name="checkmark" size={18} color="rgba(255,255,255,0.88)" />
                      <Text style={styles.ghostBtnText}>Finish</Text>
                    </View>
                  </Pressable>
                </>
              )}

              {status === "paused" && (
                <>
                  <Pressable
                    onPress={onResume}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      isLarge && styles.btnGrow,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={["rgba(126,231,255,0.95)", "rgba(156,120,255,0.95)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryGradient}
                    >
                      <View style={styles.btnInner}>
                        <Ionicons name="play" size={18} color="#0B0C10" />
                        <Text style={styles.primaryBtnText}>Resume</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={onFinish}
                    style={({ pressed }) => [
                      styles.ghostBtn,
                      isLarge && styles.btnGrow,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <View style={styles.btnInner}>
                      <Ionicons name="checkmark" size={18} color="rgba(255,255,255,0.88)" />
                      <Text style={styles.ghostBtnText}>Finish</Text>
                    </View>
                  </Pressable>
                </>
              )}

              {status === "done" && (
                <Pressable
                  onPress={onRestart}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    isLarge && styles.btnGrow,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <View style={styles.btnInner}>
                    <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.92)" />
                    <Text style={styles.secondaryBtnText}>Restart</Text>
                  </View>
                </Pressable>
              )}
            </View>

            <Text style={styles.note}>
              Prototype timer — counts down {item.minutes} minutes.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#05060A" },

  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { color: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: "600" },

  notFound: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  notFoundSub: { color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center" },

  bg: { flex: 1 },
  bgImage: { resizeMode: "cover" },

  blob: { position: "absolute" },
  blobTop: { top: -280, left: -200 },
  blobBottom: { bottom: -300, right: -210 },

  scroll: { flex: 1 },
  content: {
    paddingTop: 10,
    gap: 16,
  },
  contentSmall: {
    gap: 14,
  },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, maxWidth: "70%" },
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
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontWeight: "700",
  },

  titleBlock: { gap: 10, paddingTop: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  title: { flex: 1, minWidth: 0, color: "#FFFFFF", fontSize: 26, fontWeight: "800", letterSpacing: -0.3 },
  titleSmall: { fontSize: 22 },

  premiumPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  premiumPillText: { color: "#0B0C10", fontSize: 11, fontWeight: "900", letterSpacing: 0.3 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },

  desc: { color: "rgba(255,255,255,0.70)", fontSize: 14, lineHeight: 20 },
  descSmall: { fontSize: 13, lineHeight: 19 },

  glassCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    gap: 12,
  },
  glassCardSmall: { padding: 12, gap: 10 },

  timerTop: { gap: 10 },
  timerLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timerLabel: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },

  timerText: { color: "#FFFFFF", fontWeight: "900", letterSpacing: -0.8 },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressTrackSmall: { height: 8 },

  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "rgba(126,231,255,0.55)" },

  controls: { gap: 10 },
  controlsRow: { flexDirection: "row" },

  btnGrow: { flex: 1 },

  btnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },

  primaryBtn: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  primaryGradient: { paddingVertical: 12, paddingHorizontal: 12 },
  primaryBtnText: { color: "#0B0C10", fontSize: 14, fontWeight: "900", letterSpacing: 0.4, textTransform: "uppercase" },

  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  secondaryBtnText: { color: "rgba(255,255,255,0.92)", fontSize: 14, fontWeight: "900", letterSpacing: 0.4, textTransform: "uppercase" },

  ghostBtn: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  ghostBtnText: { color: "rgba(255,255,255,0.88)", fontSize: 14, fontWeight: "900", letterSpacing: 0.4, textTransform: "uppercase" },

  btnPressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },

  note: { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 16 },
});