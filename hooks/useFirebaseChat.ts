import { useState, useEffect, useCallback, useRef } from "react";
import { log } from "@/utils/logger";
import useUserAuth from "@/hooks/useUserAuth";
import firestore from "@react-native-firebase/firestore";

// Message type definition
export interface ChatMessage {
  id: string;
  user: string;
  userId: string;
  message: string;
  avatar: string;
  timestamp: number;
}

// Default message limit per batch
const DEFAULT_MESSAGE_LIMIT = 50;

// Throttle time for sending messages (ms)
const SEND_THROTTLE_TIME = 500;

/**
 * Hook for handling high-volume chat in livestream with Firebase
 */
export const useFirebaseChat = (
  livestreamId: string,
  messageLimit = DEFAULT_MESSAGE_LIMIT
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Get authenticated user from useUserAuth hook
  const { user, error: authError } = useUserAuth();

  // Refs for managing state without triggering re-renders
  const lastMessageRef = useRef<any>(null);
  const lastSendTimeRef = useRef<number>(0);
  const unsubscribeRef = useRef<() => void | null>(() => null);

  // Check if user is logged in
  const isLoggedIn = !!user;

  // Set auth error if any
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Initialize chat listener
  useEffect(() => {
    if (!livestreamId) {
      setError("No livestream ID provided");
      return;
    }

    try {
      // Create a reference to the chat collection for this livestream
      const chatRef = firestore()
        .collection("livestreams")
        .doc(livestreamId)
        .collection("messages");

      // Create a query ordered by timestamp and limited to prevent loading too many messages
      const unsubscribe = chatRef
        .orderBy("timestamp", "desc")
        .limit(messageLimit)
        .onSnapshot(
          (snapshot) => {
            const newMessages: ChatMessage[] = [];

            // Store the last document for pagination
            if (!snapshot.empty) {
              lastMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
            }

            // Process messages in reverse to get chronological order
            snapshot.docs.reverse().forEach((doc) => {
              const data = doc.data();

              // Convert Firestore Timestamp to milliseconds
              const timestamp = data.timestamp
                ? data.timestamp.toMillis()
                : Date.now();

              newMessages.push({
                id: doc.id,
                user: data.user || "Anonymous",
                userId: data.userId || "",
                message: data.message || "",
                avatar:
                  data.avatar ||
                  data.user?.substring(0, 2)?.toUpperCase() ||
                  "AN",
                timestamp,
              });
            });

            setMessages(newMessages);
            setIsInitialized(true);
          },
          (err) => {
            log.error("Error getting chat messages:", err);
            setError("Failed to load chat messages");
          }
        );

      // Store unsubscribe function in ref
      unsubscribeRef.current = unsubscribe;

      // Clean up listener on unmount
      return () => {
        unsubscribe();
      };
    } catch (err) {
      log.error("Error setting up chat listener:", err);
      setError("Failed to initialize chat");
    }
  }, [livestreamId, messageLimit]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!lastMessageRef.current || isLoadingMore || !hasMoreMessages) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const chatRef = firestore()
        .collection("livestreams")
        .doc(livestreamId)
        .collection("messages");

      const snapshot = await chatRef
        .orderBy("timestamp", "desc")
        .startAfter(lastMessageRef.current)
        .limit(messageLimit)
        .get();

      if (snapshot.empty) {
        setHasMoreMessages(false);
        setIsLoadingMore(false);
        return;
      }

      // Update last document for next pagination
      lastMessageRef.current = snapshot.docs[snapshot.docs.length - 1];

      const olderMessages: ChatMessage[] = [];

      // Process messages in reverse to get chronological order
      snapshot.docs.reverse().forEach((doc) => {
        const data = doc.data();

        const timestamp = data.timestamp
          ? data.timestamp.toMillis()
          : Date.now();

        olderMessages.push({
          id: doc.id,
          user: data.user || "Anonymous",
          userId: data.userId || "",
          message: data.message || "",
          avatar:
            data.avatar || data.user?.substring(0, 2)?.toUpperCase() || "AN",
          timestamp,
        });
      });

      // Append older messages to the beginning
      setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
    } catch (err) {
      log.error("Error loading more messages:", err);
      setError("Failed to load more messages");
    } finally {
      setIsLoadingMore(false);
    }
  }, [livestreamId, messageLimit, isLoadingMore, hasMoreMessages]);

  // Send a message with throttling
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !isLoggedIn || !livestreamId || !user) {
        return false;
      }

      // Throttle sending to prevent spam
      const now = Date.now();
      if (now - lastSendTimeRef.current < SEND_THROTTLE_TIME) {
        return false;
      }

      lastSendTimeRef.current = now;
      setIsSending(true);

      try {
        // Get user info
        const userName = user.displayName || "Anonymous";
        const userId = user.uid || "";

        // Create avatar from first letters of the username
        const avatar = userName.substring(0, 2).toUpperCase();

        // Add message to Firestore
        await firestore()
          .collection("livestreams")
          .doc(livestreamId)
          .collection("messages")
          .add({
            user: userName,
            userId,
            message: message.trim(),
            avatar,
            timestamp: firestore.Timestamp.now(),
          });

        setIsSending(false);
        return true;
      } catch (err) {
        log.error("Error sending message:", err);
        setError("Failed to send message");
        setIsSending(false);
        return false;
      }
    },
    [user, isLoggedIn, livestreamId]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reconnect chat if connection is lost
  const reconnect = useCallback(() => {
    try {
      // Clean up existing listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Create a reference to the chat collection for this livestream
      const chatRef = firestore()
        .collection("livestreams")
        .doc(livestreamId)
        .collection("messages");

      // Create a query ordered by timestamp and limited
      const unsubscribe = chatRef
        .orderBy("timestamp", "desc")
        .limit(messageLimit)
        .onSnapshot(
          (snapshot) => {
            const newMessages: ChatMessage[] = [];

            // Store the last document for pagination
            if (!snapshot.empty) {
              lastMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
            }

            // Process messages in reverse to get chronological order
            snapshot.docs.reverse().forEach((doc) => {
              const data = doc.data();

              // Convert Firestore Timestamp to milliseconds
              const timestamp = data.timestamp
                ? data.timestamp.toMillis()
                : Date.now();

              newMessages.push({
                id: doc.id,
                user: data.user || "Anonymous",
                userId: data.userId || "",
                message: data.message || "",
                avatar:
                  data.avatar ||
                  data.user?.substring(0, 2)?.toUpperCase() ||
                  "AN",
                timestamp,
              });
            });

            setMessages(newMessages);
            setIsInitialized(true);
            clearError();
          },
          (err) => {
            log.error("Error getting chat messages:", err);
            setError("Failed to load chat messages");
          }
        );

      // Store unsubscribe function in ref
      unsubscribeRef.current = unsubscribe;

      return true;
    } catch (err) {
      log.error("Error reconnecting to chat:", err);
      setError("Failed to reconnect to chat");
      return false;
    }
  }, [livestreamId, messageLimit, clearError]);

  return {
    messages,
    isInitialized,
    isLoggedIn,
    isSending,
    error,
    isLoadingMore,
    hasMoreMessages,
    sendMessage,
    loadMoreMessages,
    clearError,
    reconnect,
  };
};
