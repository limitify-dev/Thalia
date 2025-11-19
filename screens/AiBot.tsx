import BouncyDots from "@/components/BouncyDots";
import { Ionicons } from "@expo/vector-icons";
import { encode as base64FromArrayBuffer } from "base64-arraybuffer";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ExpoSpeech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { openai } from "../modals/OpenAI";

// ---- CONFIG ----
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

type VoiceState =
  | "idle"
  | "recording"
  | "processing"
  | "transcribing"
  | "thinking"
  | "responding";

type ChatMessage = {
  id: number;
  type: "user" | "ai";
  content: string;
  status: "complete" | "processing" | "error";
  timestamp: Date;
};

type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ActiveTab = "write" | "speak" | "photo";

// Models to try for chat
const MODEL_CANDIDATES = [
  "gpt-4o",
  "o4-mini",
  "gpt-4o-mini",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4",
  "gpt-4.1",
  "gpt-3.5-turbo",
];

// TTS models (fast first for latency)
const TTS_MODELS = ["tts-1-hd", "tts-1"];

// Screen
const { width: W, height: H } = Dimensions.get("window");
const scaleFont = (size: number) => (W / 375) * size;
const BUBBLE_MAX = Math.round(W * 0.68);

// Language map (BCP-47 for TTS)
const LANGUAGE_CODES = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-BR",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  ar: "ar-SA",
  hi: "hi-IN",
};

// Friendly label + voice code
const LANGUAGE_CONFIGS = {
  auto: { name: "Auto-detect", code: "auto", voice: "en-US" },
  en: { name: "English", code: "en-US", voice: "en-US", bcp47: "en-US" },
  es: { name: "Español", code: "es-ES", voice: "es-ES", bcp47: "es-ES" },
  fr: { name: "Français", code: "fr-FR", voice: "fr-FR", bcp47: "fr-FR" },
  de: { name: "Deutsch", code: "de-DE", voice: "de-DE", bcp47: "de-DE" },
  it: { name: "Italiano", code: "it-IT", voice: "it-IT", bcp47: "it-IT" },
  pt: { name: "Português", code: "pt-BR", voice: "pt-BR", bcp47: "pt-BR" },
  ru: { name: "Русский", code: "ru-RU", voice: "ru-RU", bcp47: "ru-RU" },
  zh: { name: "中文", code: "zh-CN", voice: "zh-CN", bcp47: "zh-CN" },
  ja: { name: "日本語", code: "ja-JP", voice: "ja-JP", bcp47: "ja-JP" },
  ko: { name: "한국어", code: "ko-KR", voice: "ko-KR", bcp47: "ko-KR" },
};

const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 375;
export const scale = (size: any) => (width / guidelineBaseWidth) * size;
export const moderateScale = (size: any, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export default function AiBot() {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [userText, setUserText] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [aiReply, setAiReply] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string>("");
  const [usedModel, setUsedModel] = useState<string>("");
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("speak");
  const extraTop = 25;
  const gradientBackgroundBoxColors = {
    light: [
      "rgba(255, 255, 255, 0.95)",
      "rgba(241, 245, 249, 0.90)",
      "rgba(226, 232, 240, 0.85)",
    ],
    dark: ["#1e3a8a", "#581c87", "#0f172a"],
  };

  // Voice interaction
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Language & context
  const [detectedLanguage, setDetectedLanguage] = useState<string>("en");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);

  // Animations
  const vizAnim = useRef(new Animated.Value(1)).current;
  const [vizContentH, setVizContentH] = useState<number | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingScale = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const imageOpacityAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView | null>(null);
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const bottomOffset = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();

  // Keyboard handling
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      if (activeTab === "write") {
        const height = Platform.OS === "ios" ? e.endCoordinates.height : 0;
        setKeyboardHeight(height);
        Animated.timing(bottomOffset, {
          toValue: height,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
      Animated.timing(bottomOffset, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    };

    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      keyboardWillShow
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      keyboardWillHide
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [activeTab]);

  const showVisualizer = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(vizAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const hideVisualizer = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(vizAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  // Audio playback
  const soundRef = useRef<Audio.Sound | null>(null);

  // Abort controller for AI requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const makeLoop = (val: Animated.Value, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    let a1: Animated.CompositeAnimation | undefined;
    let a2: Animated.CompositeAnimation | undefined;
    let a3: Animated.CompositeAnimation | undefined;

    if (speaking) {
      a1 = makeLoop(ring1, 0);
      a2 = makeLoop(ring2, 300);
      a3 = makeLoop(ring3, 600);
      a1.start();
      a2.start();
      a3.start();
    } else {
      a1?.stop?.();
      a2?.stop?.();
      a3?.stop?.();
      ring1.setValue(0);
      ring2.setValue(0);
      ring3.setValue(0);
    }
  }, [speaking, ring1, ring2, ring3]);

  const ringStyle = (
    val: Animated.Value,
    maxScale: number,
    maxOpacity: number
  ) => ({
    transform: [
      {
        scale: val.interpolate({
          inputRange: [0, 1],
          outputRange: [1, maxScale],
        }),
      },
    ],
    opacity: val.interpolate({
      inputRange: [0, 1],
      outputRange: [maxOpacity, 0],
    }),
  });

  const detectLanguage = (text: string): string => {
    if (!text || text.trim().length < 2) return "en";

    const raw = text;
    const lower = text.toLowerCase();

    // Non-Latin scripts (high confidence)
    if (/[\u4E00-\u9FFF]/.test(raw)) return "zh";
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(raw)) return "ja";
    if (/[\uAC00-\uD7AF]/.test(raw)) return "ko";
    if (/[\u0400-\u04FF]/.test(raw)) return "ru";
    if (/[\u0600-\u06FF]/.test(raw)) return "ar";
    if (/[\u0900-\u097F]/.test(raw)) return "hi";

    // Diacritic patterns (more specific)
    const hasFRSpecific = /[àâæçèêëîïôœùûüÿ]/i.test(raw);
    const hasESSpecific = /[ñ¿¡]/i.test(raw);
    const hasPTSpecific = /[ãõ]/i.test(raw);
    const hasDESpecific = /[äöüß]/i.test(raw);
    const hasITSpecific = /[ìòù]/i.test(raw);

    const tokens = lower
      .replace(/[^\p{L}\p{N}']+/gu, " ")
      .split(" ")
      .filter((token) => token.length > 1); // Ignore single chars

    // Expanded French words (most common)
    const frenchWords = [
      "le",
      "de",
      "et",
      "à",
      "un",
      "il",
      "être",
      "en",
      "avoir",
      "que",
      "pour",
      "dans",
      "ce",
      "son",
      "une",
      "sur",
      "avec",
      "ne",
      "se",
      "pas",
      "tout",
      "plus",
      "par",
      "bonjour",
      "merci",
      "comment",
      "allez",
      "vous",
      "je",
      "suis",
      "nous",
      "les",
      "des",
      "du",
      "au",
      "aux",
      "qui",
      "quoi",
      "où",
      "quand",
      "mais",
      "ou",
      "donc",
      "car",
      "ni",
      "comme",
      "si",
      "bien",
      "très",
      "aussi",
      "peut",
      "faire",
      "ça",
      "alors",
      "votre",
      "cette",
      "cette",
      "leur",
      "leurs",
      "mon",
      "ton",
      "son",
      "mes",
      "tes",
      "ses",
      "notre",
      "votre",
      "bonsoir",
      "salut",
      "oui",
      "non",
      "merci",
    ];

    // Spanish words
    const spanishWords = [
      "el",
      "la",
      "de",
      "que",
      "y",
      "en",
      "un",
      "es",
      "se",
      "no",
      "te",
      "lo",
      "le",
      "da",
      "su",
      "por",
      "son",
      "con",
      "para",
      "una",
      "hola",
      "gracias",
      "cómo",
      "está",
      "muy",
      "bien",
      "del",
      "los",
      "las",
      "al",
      "pero",
      "como",
      "más",
      "yo",
      "si",
      "tú",
      "hay",
      "bueno",
      "buena",
      "qué",
      "cuando",
      "donde",
      "porque",
    ];

    // English words
    const englishWords = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "hello",
      "thanks",
      "how",
      "are",
      "very",
      "good",
      "what",
      "when",
      "where",
      "why",
      "who",
      "which",
      "can",
      "will",
      "would",
      "there",
      "their",
      "said",
      "from",
      "they",
      "she",
      "or",
      "an",
      "had",
      "by",
      "word",
      "but",
      "not",
      "all",
      "were",
      "we",
      "when",
      "your",
    ];

    // Count word matches
    let frScore = tokens.filter((t) => frenchWords.includes(t)).length;
    let esScore = tokens.filter((t) => spanishWords.includes(t)).length;
    let enScore = tokens.filter((t) => englishWords.includes(t)).length;

    // Add bonus for unique diacritics (stronger signals)
    if (hasFRSpecific) frScore += 3;
    if (hasESSpecific) esScore += 3;
    if (hasPTSpecific) return "pt"; // Portuguese is distinctive
    if (hasDESpecific) return "de"; // German is distinctive
    if (hasITSpecific) esScore += 1; // Italian shares with Spanish/French

    // Debugging: log scores
    addDebug(
      `Language scores - FR: ${frScore}, ES: ${esScore}, EN: ${enScore}`
    );

    // Return highest score with clear winner logic
    if (frScore > esScore && frScore > enScore) return "fr";
    if (esScore > frScore && esScore > enScore) return "es";
    if (enScore > frScore && enScore > esScore) return "en";

    // Tie-breaker: prefer French if FR-specific diacritics present
    if (frScore === esScore && hasFRSpecific) return "fr";
    if (esScore >= enScore) return "es";

    return "en";
  };

  const addDebug = (m: string) => {
    const t = new Date().toLocaleTimeString();
    setDebugLog((prev) => [...prev.slice(-30), `${t}: ${m}`]);
    console.log(`[DEBUG] ${m}`);
  };

  async function prepareAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        interruptionModeIOS: (Audio as any).INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: (Audio as any)
          .INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
    } catch {}
  }

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          addDebug("Audio permissions not granted");
          Alert.alert(
            t("aiBot.chat.permissionRequired"),
            t("aiBot.chat.errors.recordingPermission")
          );
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
        addDebug("Audio configuration successful");
      } catch (e: any) {
        addDebug(`Audio setup failed: ${e?.message || e}`);
      }
    })();
  }, []);

  async function ensureDirAsync(dir: string) {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  }

  const FS = FileSystem as any;

  async function startRecording(): Promise<void> {
    try {
      if (speaking) {
        Alert.alert(
          t("aiBot.chat.errors.pleaseWait"),
          t("aiBot.chat.errors.stillSpeaking")
        );
        return;
      }
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("aiBot.chat.permissionRequired"),
          t("aiBot.chat.errors.microphoneAccess")
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setVoiceState("recording");
      hideVisualizer();
      setLastError("");
      addDebug("Recording started");
    } catch (e: any) {
      addDebug(`Recording start error: ${e?.message || e}`);
      Alert.alert(
        t("common.error"),
        t("aiBot.chat.errors.couldNotStartRecording")
      );
      setIsRecording(false);
      setVoiceState("idle");
      recordingRef.current = null;
    }
  }

  async function stopRecordingAndTranscribe(): Promise<void> {
    try {
      const recording = recordingRef.current;
      if (!recording) {
        addDebug("No active recording to stop");
        return;
      }
      setVoiceState("processing");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      addDebug(`Recording saved at: ${uri}`);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      if (!uri) {
        addDebug("No audio URI after recording.");
        Alert.alert(t("common.error"), t("aiBot.chat.errors.recordingFailed"));
        setVoiceState("idle");
        return;
      }
      const msgId = addChatMessage(
        "user",
        t("aiBot.chat.status.transcribing"),
        "processing"
      );
      setVoiceState("transcribing");
      addDebug("Starting transcription...");
      const transcribedText = await transcribeWithOpenAI(uri);
      if (transcribedText) {
        setUserText(transcribedText);
        const lang = detectLanguage(transcribedText);
        setDetectedLanguage(lang);
        updateChatMessage(msgId, {
          content: transcribedText,
          status: "complete",
        });
        addDebug(`Transcribed (${lang}): ${transcribedText}`);
        await getAIResponse(transcribedText, true);
      } else {
        addDebug("Transcription returned empty result");
        updateChatMessage(msgId, {
          content: t("aiBot.chat.errors.transcriptionError"),
          status: "error",
        });
        Alert.alert(
          t("common.error"),
          t("aiBot.chat.errors.transcriptionError")
        );
        setVoiceState("idle");
      }
    } catch (e: any) {
      addDebug(`Stop/transcribe error: ${e?.message || e}`);
      setIsRecording(false);
      setVoiceState("idle");
      recordingRef.current = null;
      Alert.alert(
        t("common.error"),
        t("aiBot.chat.errors.couldNotFinishRecording")
      );
    }
  }

  async function transcribeWithOpenAI(fileUri: string): Promise<string> {
    try {
      if (!OPENAI_API_KEY) {
        addDebug("Missing OPENAI_API_KEY (EXPO_PUBLIC_OPENAI_API_KEY)");
        return "";
      }
      const form = new FormData();
      form.append("file", {
        uri: fileUri,
        name: "speech.m4a",
        type: "audio/m4a",
      } as any);
      form.append("model", "whisper-1");
      const res = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: form,
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        addDebug(`Whisper error: ${res.status} ${errText}`);
        return "";
      }
      const json = await res.json();
      return json?.text?.trim?.() || "";
    } catch (e: any) {
      addDebug(`Whisper fetch error: ${e?.message || e}`);
      return "";
    }
  }

  function normalizeArrayBuffer(buf: ArrayBuffer | Uint8Array): any {
    if (buf instanceof ArrayBuffer) return buf;
    const { buffer, byteOffset, byteLength } = buf;
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }

  const speakWithNovaOrFallback = async (
    text: string,
    language: string = "en",
    messageId?: number
  ): Promise<void> => {
    if (!text) return;

    await cleanupAudio();
    setSpeaking(true);
    setPlayingMessageId(messageId ?? null);

    if (Platform.OS === "web") {
      addDebug("Web platform detected, using fallback TTS");
      try {
        const voiceLanguage =
          (LANGUAGE_CONFIGS as any)[language]?.voice || "en-US";
        ExpoSpeech.stop();
        ExpoSpeech.speak(String(text), {
          language: voiceLanguage,
          pitch: 1.0,
          rate: 0.85,
          onDone: () => {
            setSpeaking(false);
            setPlayingMessageId(null);
          },
          onStopped: () => {
            setSpeaking(false);
            setPlayingMessageId(null);
          },
          onError: () => {
            setSpeaking(false);
            setPlayingMessageId(null);
          },
        });
        addDebug(`Fallback TTS using ${voiceLanguage}`);
      } catch (fallbackErr: any) {
        addDebug(`Fallback TTS failed (web): ${String(fallbackErr)}`);
        setSpeaking(false);
        setPlayingMessageId(null);
      }
      return;
    }

    try {
      await prepareAudioMode();
      const rawBuffer = await synthesizeNova(text);
      if (!rawBuffer) throw new Error("TTS produced no audio");
      const arrayBuffer = normalizeArrayBuffer(rawBuffer);
      const base64Audio = base64FromArrayBuffer(arrayBuffer);
      const cacheDir: string | null =
        (FileSystem as any).cacheDirectory ?? null;
      const docDir: string | null =
        (FileSystem as any).documentDirectory ?? null;
      addDebug(
        `TTS dirs → cache: ${cacheDir ?? "null"}, doc: ${docDir ?? "null"}`
      );

      let fileUri: string | null = null;

      try {
        const baseDir = cacheDir || docDir;
        if (baseDir) {
          const ttsDir = `${baseDir}tts/`;
          await ensureDirAsync(ttsDir);
          fileUri = `${ttsDir}nova_${Date.now()}.mp3`;
          await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
            encoding: (FileSystem as any).EncodingType.Base64,
          });
          addDebug(`Wrote TTS file: ${fileUri}`);
        } else {
          addDebug("No writable dir available → will use Base64 data URI");
        }
      } catch (ioErr: any) {
        addDebug(
          `File write failed: ${String(
            ioErr?.message || ioErr
          )} → using data URI`
        );
        fileUri = null;
      }

      const source = fileUri
        ? { uri: fileUri }
        : { uri: `data:audio/mpeg;base64,${base64Audio}` };

      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
      });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate(async (status: any) => {
        if (status.didJustFinish) {
          try {
            await sound.unloadAsync();
          } catch {}
          soundRef.current = null;

          if (fileUri) {
            try {
              await FileSystem.deleteAsync(fileUri, { idempotent: true });
              addDebug(`Deleted audio file: ${fileUri}`);
            } catch (delErr: any) {
              addDebug(
                `Failed to delete audio file: ${String(
                  delErr?.message || delErr
                )}`
              );
            }
          }

          setSpeaking(false);
          setPlayingMessageId(null);
          addDebug("Nova TTS playback finished");
        }
      });
    } catch (e: any) {
      addDebug(`Nova TTS failed: ${String(e?.message || e)} → fallback`);
      setLastError(`TTS: ${String(e?.message || e)}`);
      setSpeaking(false);
      setPlayingMessageId(null);

      try {
        const voiceLanguage =
          (LANGUAGE_CONFIGS as any)[language]?.voice || "en-US";
        ExpoSpeech.stop();
        ExpoSpeech.speak(String(text), {
          language: voiceLanguage,
          pitch: 1.0,
          rate: 0.85,
          onDone: () => {
            setSpeaking(false);
            setPlayingMessageId(null);
          },
          onStopped: () => {
            setSpeaking(false);
            setPlayingMessageId(null);
          },
          onError: () => {
            setSpeaking(false);
            setPlayingMessageId(null);
          },
        });
        addDebug(`Fallback TTS using ${voiceLanguage}`);
      } catch (fallbackErr: any) {
        addDebug(`Fallback TTS also failed: ${String(fallbackErr)}`);
        setSpeaking(false);
        setPlayingMessageId(null);
      }
    }
  };

  const synthesizeNova = async (text: string): Promise<ArrayBuffer> => {
    let lastErr: any = null;
    for (const model of TTS_MODELS) {
      try {
        let voice = "nova";
        if (detectedLanguage === "es") voice = "nova";
        else if (detectedLanguage === "fr") voice = "coral";
        else if (detectedLanguage === "de") voice = "echo";
        else if (["zh", "ja", "ko"].includes(detectedLanguage)) voice = "alloy";

        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            voice,
            input: text,
            response_format: "mp3",
            speed: 1.05,
          }),
        });
        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          addDebug(
            `TTS ok: ${model} (${voice}), ${arrayBuffer.byteLength} bytes`
          );
          return arrayBuffer;
        }
      } catch (err: any) {
        lastErr = err;
        addDebug(`TTS ${model} error: ${String(err?.message || err)}`);
      }
    }
    throw lastErr || new Error("All TTS attempts failed");
  };

  const cleanupAudio = async (): Promise<void> => {
    try {
      // Stop any ongoing AI requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Stop audio playback
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      try {
        ExpoSpeech.stop();
      } catch {}

      // Stop recording if active
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {}
        recordingRef.current = null;
      }

      // Reset all states
      setSpeaking(false);
      setPlayingMessageId(null);
      setIsRecording(false);
      setLoading(false);
      setVoiceState("idle");
    } catch (e: any) {
      addDebug(`Audio cleanup error: ${String(e)}`);
    }
  };

  const addChatMessage = (
    type: ChatMessage["type"],
    content: string,
    status: ChatMessage["status"] = "complete"
  ): number => {
    const message: ChatMessage = {
      id: Date.now() + Math.random(),
      type,
      content,
      status,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, message]);
    return message.id;
  };

  const updateChatMessage = (
    id: number,
    updates: Partial<ChatMessage>
  ): void => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const clearConversation = () => {
    Alert.alert(
      t("aiBot.chat.clearConversation"),
      t("aiBot.chat.confirmClear"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            setChatMessages([]);
            setConversationHistory([]);
            setUserText("");
            setAiReply("");
            setLastError("");
            setInputText("");
            addDebug("Conversation cleared");
            showVisualizer();
          },
        },
      ]
    );
  };

  const getStatusText = (): string => {
    switch (voiceState) {
      case "recording":
        return t("aiBot.chat.status.listening");
      case "processing":
        return t("aiBot.chat.status.processing");
      case "transcribing":
        return t("aiBot.chat.status.transcribing");
      case "thinking":
        return t("aiBot.chat.status.thinking");
      case "responding":
        return t("aiBot.chat.status.responding");
      default:
        if (activeTab === "speak") {
          return t("aiBot.chat.startWithThaia");
        } else if (activeTab === "write") {
          return t("aiBot.chat.placeholder");
        } else {
          return t("aiBot.chat.placeholder");
        }
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    const mkPulse = (toValue: number, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ])
      );

    if (voiceState === "recording") {
      mkPulse(1.1, 800).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (voiceState === "processing" || voiceState === "thinking") {
      mkPulse(1.05, 1200).start();
      waveformAnim.setValue(0);
    } else {
      pulseAnim.setValue(1);
      waveformAnim.setValue(0);
    }

    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingScale, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordingScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      recordingScale.setValue(1);
    }

    if (speaking) {
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      waveAnim.setValue(0);
    }
  }, [voiceState, isRecording, speaking]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(imageOpacityAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 80);
    }
  }, [chatMessages]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Cleanup when navigating away from the screen
  useFocusEffect(
    useCallback(() => {
      // This runs when the screen comes into focus
      return () => {
        // This runs when the screen loses focus (user navigates away)
        cleanupAudio();
      };
    }, [])
  );

  const renderChatMessage = (message: ChatMessage) => {
    const isUser = message.type === "user";

    const playMessage = async () => {
      if (playingMessageId === message.id) {
        await cleanupAudio();
        return;
      }

      await cleanupAudio();
      await speakWithNovaOrFallback(
        message.content,
        detectedLanguage,
        message.id
      );
    };

    return (
      <View
        key={message.id}
        style={{
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-end",
          marginVertical: 6,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            maxWidth: BUBBLE_MAX,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 18,
            backgroundColor: isUser
              ? "rgba(255, 255, 255, 0.9)"
              : !isUser
              ? "rgba(139, 92, 246, 0.8)"
              : "rgba(255, 255, 255, 0.15)",
            ...(isUser
              ? { borderBottomRightRadius: 8, alignSelf: "flex-end" }
              : { borderBottomLeftRadius: 8, alignSelf: "flex-start" }),
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text
            style={{
              color:
                colorScheme === "dark"
                  ? isUser
                    ? "#000"
                    : "#fff"
                  : isUser
                  ? "#000"
                  : "#fff",
              fontSize: 15,
              lineHeight: 20,
            }}
          >
            {message.content}
          </Text>
        </View>

        {!isUser && (
          <TouchableOpacity
            onPress={playMessage}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            <Ionicons
              name={playingMessageId === message.id ? "stop" : "play"}
              size={14}
              color={colorScheme === "dark" ? "white" : "#000"}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText("");
    const msgId = addChatMessage("user", message, "complete");
    const lang = detectLanguage(message);
    setDetectedLanguage(lang);
    addDebug(`Text input detected language: ${lang}`);
    await getAIResponse(message, false);
  };

  const handleStartRecording = async () => {
    setActiveTab("speak");
    await startRecording();
  };

  const getAIResponse = async (
    text: string,
    useTTS: boolean = true
  ): Promise<void> => {
    if (!text || text.trim().length === 0) {
      addDebug("Empty text provided to AI");
      setVoiceState("idle");
      return;
    }

    const targetKey = detectLanguage(text) || detectedLanguage || "en";
    if (targetKey !== detectedLanguage) setDetectedLanguage(targetKey);

    const hasLangConfig = (key: string): key is keyof typeof LANGUAGE_CONFIGS =>
      Object.prototype.hasOwnProperty.call(LANGUAGE_CONFIGS, key);
    const hasLangCode = (key: string): key is keyof typeof LANGUAGE_CODES =>
      Object.prototype.hasOwnProperty.call(LANGUAGE_CODES, key);

    const targetName = hasLangConfig(targetKey)
      ? LANGUAGE_CONFIGS[targetKey].name
      : hasLangCode(targetKey)
      ? LANGUAGE_CODES[targetKey]
      : targetKey;
    const targetCode =
      hasLangConfig(targetKey) && "bcp47" in LANGUAGE_CONFIGS[targetKey]
        ? (LANGUAGE_CONFIGS[targetKey] as { bcp47: string }).bcp47
        : hasLangConfig(targetKey)
        ? LANGUAGE_CONFIGS[targetKey].code
        : hasLangCode(targetKey)
        ? LANGUAGE_CODES[targetKey]
        : targetKey === "en"
        ? "en-US"
        : targetKey;

    addDebug(
      `AI request (${text.length} chars) → target=${targetName} (${targetCode})`
    );

    setVoiceState("thinking");
    const aiMessageId = addChatMessage(
      "ai",
      t("aiBot.chat.status.thinking"),
      "processing"
    );
    setLoading(true);
    setAiReply("");
    setUsedModel("");
    setLastError("");

    try {
      const languageInstruction = `
        You MUST respond strictly in ${targetName} (${targetCode}).
        - If the detected/target language changes in any turn, switch immediately to the new language without explanation.
        - Never mix languages in one response.
        - Do not translate back to English unless the user explicitly requests it.
      `;

      const sysMsg = `
        You are Thaïa, a helpful AI assistant specialized in art and culture.
        ${languageInstruction}
        Keep responses concise, conversational, and natural. Always match the user's tone and level of formality.
        Focus on providing helpful information about art, museums, exhibitions, and cultural topics.
      `;

      const messages: ConversationMessage[] = [
        { role: "system", content: sysMsg },
        ...conversationHistory.slice(-6),
        { role: "user", content: text },
      ];

      let reply = "";
      let lastErr: any = null;

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      for (let i = 0; i < MODEL_CANDIDATES.length; i++) {
        let model = MODEL_CANDIDATES[MODEL_CANDIDATES.length - 1];
        if (useTTS) {
          model = MODEL_CANDIDATES[i];
        }
        try {
          setUsedModel(`Trying ${model}...`);
          addDebug(`Attempting ${model}`);

          const completion: any = await Promise.race([
            openai.chat.completions.create(
              {
                model,
                messages: messages as any,
                temperature: 0.6,
                max_tokens: 300,
                top_p: 0.9,
              },
              {
                signal: abortControllerRef.current.signal,
              }
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 15000)
            ),
          ]);

          reply = completion?.choices?.[0]?.message?.content?.trim?.() ?? "";
          if (reply) {
            setUsedModel(`${model} (${targetName})`);
            addDebug(`${model} succeeded (${reply.length} chars)`);
            break;
          } else {
            addDebug(`${model} returned empty`);
          }
        } catch (err: any) {
          lastErr = err;
          const msg = String(err?.message || err);

          // Check if request was aborted
          if (err.name === "AbortError" || msg.includes("abort")) {
            addDebug("AI request aborted by user");
            updateChatMessage(aiMessageId, {
              content: "Request stopped.",
              status: "error",
            });
            setVoiceState("idle");
            setLoading(false);
            abortControllerRef.current = null;
            return;
          }

          addDebug(`${model} failed: ${msg}`);
          if (/timeout|network/i.test(msg)) break;
          if (i < MODEL_CANDIDATES.length - 1) {
            await new Promise((r) => setTimeout(r, 800));
          }
        }
      }

      // Clear the abort controller after request completes
      abortControllerRef.current = null;

      if (!reply) {
        const errorMsg = `AI Error: ${lastErr?.message || "All models failed"}`;
        setLastError(errorMsg);
        updateChatMessage(aiMessageId, {
          content: "I'm having trouble responding right now. Please try again.",
          status: "error",
        });
        addDebug(errorMsg);
        setVoiceState("idle");
        return;
      }

      updateChatMessage(aiMessageId, { content: reply, status: "complete" });
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: reply },
      ]);
      setAiReply(reply);

      if (useTTS) {
        setVoiceState("responding");
        addDebug("TTS starting...");
        await speakWithNovaOrFallback(reply, targetKey);
      }

      addDebug("AI response completed");
      setVoiceState("idle");
    } catch (error: any) {
      const errorMsg = `Unexpected error: ${error?.message || error}`;
      setLastError(errorMsg);
      updateChatMessage(aiMessageId, {
        content: "Something went wrong. Please try again.",
        status: "error",
      });
      addDebug(errorMsg);
      setVoiceState("idle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const shouldHide =
      isRecording ||
      speaking ||
      chatMessages.length > 0 ||
      !!userText ||
      !!aiReply;
    shouldHide ? hideVisualizer() : showVisualizer();
  }, [isRecording, speaking, chatMessages.length, userText, aiReply]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1e3a8a", "#581c87", "#0f172a"]
            : [
                "rgba(243, 232, 255, 0.95)", // Light purple
                "rgba(219, 234, 254, 0.90)", // Light blue
                "rgba(255, 255, 255, 0.85)", // White
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      >
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          translucent={false}
          backgroundColor="transparent"
        />

        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: "transparent" }}
        >
          <View
            style={{
              paddingTop: extraTop,
              paddingHorizontal: 20,
              paddingBottom: 25,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.push("/")
              }
              style={{
                position: "absolute",
                left: 16 + insets.left,
                padding: 8,
                borderRadius: 20,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 1)",
              }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colorScheme === "dark" ? "white" : "#000"}
              />
            </TouchableOpacity>

            <Text
              style={{
                color: colorScheme === "dark" ? "white" : "#000",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Thaïa
            </Text>

            <TouchableOpacity
              onPress={clearConversation}
              style={{
                position: "absolute",
                right: 16 + insets.right,
                padding: 8,
                borderRadius: 20,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 1)",
              }}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={colorScheme === "dark" ? "white" : "#000"}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={{ flex: 1, flexDirection: "column" }}>
          <Animated.View
            style={{
              overflow: "hidden",
              opacity: vizAnim,
              height:
                vizContentH == null
                  ? undefined
                  : vizAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, vizContentH],
                    }),
              marginTop: vizAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 5],
              }),
              transform: [
                {
                  translateY: vizAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
                {
                  scale: vizAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            }}
            pointerEvents="none"
          >
            <View
              onLayout={(e) => setVizContentH(e.nativeEvent.layout.height)}
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 20,
              }}
            >
              <BouncyDots />
              <Animated.Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colorScheme === "dark" ? "white" : "#000",
                  textAlign: "center",
                  marginBottom: 20,
                  opacity: vizAnim,
                  transform: [
                    {
                      translateY: vizAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                }}
              >
                {t("aiBot.chat.startWithThaia")}
              </Animated.Text>
              <Animated.Text
                style={{
                  fontSize: 16,
                  color: colorScheme === "dark" ? "white" : "#000",
                  textAlign: "center",
                  lineHeight: 24,
                  paddingHorizontal: 40,
                  opacity: vizAnim.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                  transform: [
                    {
                      translateY: vizAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                {getStatusText()}
              </Animated.Text>
            </View>
          </Animated.View>

          <ScrollView
            ref={scrollViewRef}
            style={{
              flex: 1,
              paddingHorizontal: 16,
            }}
            contentContainerStyle={{
              paddingBottom: keyboardHeight || insets.bottom,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.length > 0 &&
              chatMessages.map((m) => renderChatMessage(m))}
          </ScrollView>

          <Animated.View
            style={{
              left: insets.left,
              right: insets.right,
              bottom: Platform.OS === "ios" ? bottomOffset : insets.bottom,
              padding: scale(8),
              zIndex: 30,
              overflow: "visible",
              minHeight: scale(200),
            }}
          >
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["#8B5CF6", "#7C3AED", "#6D28D9"]
                  : [
                      "rgba(219, 234, 254, 0.4)",
                      "rgba(243, 232, 255, 0.3)",
                      "rgba(251, 207, 232, 0.4)",
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            >
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "#F5F5F5",
                  borderRadius: scale(50),
                  padding: scale(4),
                  margin: scale(10),
                }}
              >
                {/* Write Tab */}
                {activeTab === "write" ? (
                  <LinearGradient
                    colors={
                      colorScheme === "dark"
                        ? [
                            "rgba(255, 255, 255, 0.1)",
                            "rgba(255, 255, 255, 0.4)",
                          ]
                        : ["#8B5CF6", "#3B82F6"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flex: 1,
                      borderRadius: scale(25),
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setActiveTab("write")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(16),
                      }}
                    >
                      <Ionicons
                        name="create-outline"
                        size={scale(18)}
                        color="white"
                        style={{ marginRight: scale(6) }}
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: scale(14),
                          fontWeight: "600",
                        }}
                      >
                        {t("aiBot.chat.tabs.write")}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity
                    onPress={() => setActiveTab("write")}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: scale(12),
                      paddingHorizontal: scale(16),
                      borderRadius: scale(25),
                      backgroundColor: "transparent",
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={scale(18)}
                      color={colorScheme === "dark" ? "white" : "#666"}
                      style={{ marginRight: scale(6) }}
                    />
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "white" : "#666",
                        fontSize: scale(14),
                        fontWeight: "500",
                      }}
                    >
                      {t("aiBot.chat.tabs.write")}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Speak Tab */}
                {activeTab === "speak" ? (
                  <LinearGradient
                    colors={
                      colorScheme === "dark"
                        ? [
                            "rgba(255, 255, 255, 0.1)",
                            "rgba(255, 255, 255, 0.4)",
                          ]
                        : ["#8B5CF6", "#3B82F6"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flex: 1,
                      borderRadius: scale(25),
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setActiveTab("speak")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(16),
                      }}
                    >
                      <Ionicons
                        name="mic-outline"
                        size={scale(18)}
                        color="white"
                        style={{ marginRight: scale(6) }}
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: scale(14),
                          fontWeight: "600",
                        }}
                      >
                        {t("aiBot.chat.tabs.speak")}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity
                    onPress={() => setActiveTab("speak")}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: scale(12),
                      paddingHorizontal: scale(16),
                      borderRadius: scale(25),
                      backgroundColor: "transparent",
                    }}
                  >
                    <Ionicons
                      name="mic-outline"
                      size={scale(18)}
                      color={colorScheme === "dark" ? "white" : "#666"}
                      style={{ marginRight: scale(6) }}
                    />
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "white" : "#666",
                        fontSize: scale(14),
                        fontWeight: "500",
                      }}
                    >
                      {t("aiBot.chat.tabs.speak")}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Photo Tab */}
                {activeTab === "photo" ? (
                  <LinearGradient
                    colors={
                      colorScheme === "dark"
                        ? [
                            "rgba(255, 255, 255, 0.1)",
                            "rgba(255, 255, 255, 0.4)",
                          ]
                        : ["#8B5CF6", "#3B82F6"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flex: 1,
                      borderRadius: scale(25),
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setActiveTab("photo")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(16),
                      }}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={scale(18)}
                        color="white"
                        style={{ marginRight: scale(6) }}
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: scale(14),
                          fontWeight: "600",
                        }}
                      >
                        {t("aiBot.chat.tabs.photo")}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity
                    onPress={() => setActiveTab("photo")}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: scale(12),
                      paddingHorizontal: scale(16),
                      borderRadius: scale(25),
                      backgroundColor: "transparent",
                    }}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={scale(18)}
                      color={colorScheme === "dark" ? "white" : "#666"}
                      style={{ marginRight: scale(6) }}
                    />
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "white" : "#666",
                        fontSize: scale(14),
                        fontWeight: "500",
                      }}
                    >
                      {t("aiBot.chat.tabs.photo")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {activeTab === "write" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.15)"
                        : "rgba(255, 255, 255, 0.8)",
                    borderRadius: scale(20),
                    padding: scale(6),
                    marginHorizontal: scale(8),
                    marginVertical: scale(8),
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: scale(4),
                    shadowOffset: { width: 0, height: scale(2) },
                    elevation: 4,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      color: colorScheme === "dark" ? "white" : "#000",
                      fontSize: scale(14),
                      maxHeight: scale(30),
                      padding: scale(1),
                      marginVertical: scale(20),
                    }}
                    placeholder={t("aiBot.chat.placeholder")}
                    placeholderTextColor={
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.6)"
                        : "rgba(0, 0, 0, 0.2)"
                    }
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      if (inputText.trim() && !loading) {
                        handleSendMessage();
                      }
                    }}
                    editable={!loading}
                    blurOnSubmit={true}
                  />

                  {inputText.trim() ? (
                    <LinearGradient
                      colors={["#8B5CF6", "#3B82F6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: scale(40),
                        height: scale(40),
                        borderRadius: scale(15),
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#8B5CF6",
                        shadowOpacity: 0.3,
                        shadowRadius: scale(4),
                        shadowOffset: { width: 0, height: scale(2) },
                        elevation: 4,
                      }}
                    >
                      <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={loading}
                        style={{
                          width: "100%",
                          height: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="send" size={scale(18)} color="white" />
                      </TouchableOpacity>
                    </LinearGradient>
                  ) : (
                    <LinearGradient
                      colors={["#8B5CF6", "#3B82F6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: scale(40),
                        height: scale(40),
                        borderRadius: scale(15),
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#8B5CF6",
                        shadowOpacity: 0.3,
                        shadowRadius: scale(4),
                        shadowOffset: { width: 0, height: scale(2) },
                        elevation: 4,
                        opacity: 0.6,
                      }}
                    >
                      <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={loading}
                        style={{
                          width: "100%",
                          height: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="send" size={scale(18)} color="white" />
                      </TouchableOpacity>
                    </LinearGradient>
                  )}
                </View>
              )}

              {activeTab === "speak" && (
                <View style={{ alignItems: "center", marginVertical: 8 }}>
                  <TouchableOpacity
                    onPress={
                      isRecording ? stopRecordingAndTranscribe : startRecording
                    }
                    disabled={speaking}
                    style={{
                      width: scale(70),
                      height: scale(70),
                      borderRadius: scale(40),
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: scale(12),
                      shadowColor: "#000",
                      shadowOpacity: 0.2,
                      shadowRadius: scale(8),
                      shadowOffset: { width: 0, height: scale(4) },
                      elevation: 4,
                    }}
                  >
                    <Ionicons
                      name={isRecording ? "square" : "mic-outline"}
                      size={scale(28)}
                      color={colorScheme === "dark" ? "#8B5CF6" : "#000"}
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      color:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.8)"
                          : "rgba(0, 0, 0, 0.5)",
                      fontSize: scale(14),
                      textAlign: "center",
                    }}
                  >
                    {isRecording
                      ? t("aiBot.chat.speakInstructions.recording")
                      : t("aiBot.chat.speakInstructions.idle")}
                  </Text>
                </View>
              )}

              {activeTab === "photo" && (
                <View style={{ alignItems: "center", padding: scale(20) }}>
                  <Text
                    style={{
                      color:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.8)"
                          : "rgba(0, 0, 0, 0.5)",
                      fontSize: scale(16),
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    {t("aiBot.chat.photoPlaceholder")}
                  </Text>
                </View>
              )}

              {speaking && (
                <TouchableOpacity
                  onPress={cleanupAudio}
                  style={{
                    position: "absolute",
                    top: scale(-60),
                    right: scale(20),
                    width: scale(44),
                    height: scale(44),
                    borderRadius: scale(22),
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="stop" size={scale(20)} color="white" />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}
