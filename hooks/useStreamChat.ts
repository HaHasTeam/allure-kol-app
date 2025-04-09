"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
} from "react-native-agora-chat";
import { log } from "@/utils/logger";

/**
 * Hook for handling chat in livestream with Agora Chat SDK
 */
export const useStreamChat = ({
  appKey,
  username,
  chatToken,
  autoLogin = true,
}: {
  appKey: string;
  username: string;
  chatToken: string | null;
  autoLogin?: boolean;
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      user: string;
      message: string;
      avatar: string;
      timestamp: number;
    }>
  >([]);
  const [tokenError, setTokenError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [logText, setLogText] = useState<string[]>([]);

  // Get chat client instance
  const chatClient = useRef<ChatClient>(ChatClient.getInstance());
  const chatManager = useRef(chatClient.current.chatManager);

  // Add log entry
  const addLog = useCallback((text: string) => {
    log.info(text);
    setLogText((prev) => [text, ...prev.slice(0, 19)]);
  }, []);

  /**
   * Initialize the Chat SDK
   */
  const initializeChat = useCallback(async () => {
    if (!appKey) {
      addLog("appKey is invalid");
      return false;
    }

    try {
      // Remove any existing listeners
      chatClient.current.removeAllConnectionListener();

      // Initialize with options - Fix for the ChatOptions initialization
      const options = new ChatOptions({
        autoLogin: false,
        appKey: appKey,
      });

      await chatClient.current.init(options);
      addLog("Chat SDK initialized successfully");

      // Add connection listeners - Fixed the listener interface
      const connectionListener = {
        onConnected: () => {
          addLog("Connected to Agora Chat server");
          setMessageListener();
        },
        onDisconnected: () => {
          addLog("Disconnected from server");
          setIsLoggedIn(false);
        },
        onTokenWillExpire: () => {
          addLog("Token will expire soon");
          setTokenError(true);
        },
        onTokenDidExpire: () => {
          addLog("Token has expired");
          setTokenError(true);
          setIsLoggedIn(false);
        },
      };

      chatClient.current.addConnectionListener(connectionListener);
      setIsInitialized(true);
      return true;
    } catch (error) {
      addLog(`Failed to initialize Chat SDK: ${JSON.stringify(error)}`);
      return false;
    }
  }, [appKey, addLog]);

  /**
   * Set up message listeners
   */
  const setMessageListener = useCallback(() => {
    // Remove any existing listeners
    chatManager.current.removeAllMessageListener();

    // Add new message listener
    const msgListener = {
      onMessagesReceived(messages: ChatMessage[]) {
        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          addLog(`Received message: ${msg.msgId}`);

          // Extract username from the sender's ID (you might need to adjust this)
          const senderName = msg.from;
          // Create avatar from first letters of the username
          const avatar = senderName.substring(0, 2).toUpperCase();

          // Fixed: Access message text content properly
          let messageText = "";
          if (msg.body.type === "txt") {
            // For text messages, access the text property
            messageText = (msg.body as any).text || "";
          } else {
            // For other message types
            messageText = `[${msg.body.type} message]`;
          }

          // Add message to state
          setMessages((prev) => [
            ...prev,
            {
              id: msg.msgId,
              user: senderName,
              message: messageText,
              avatar: avatar,
              timestamp: msg.serverTime,
            },
          ]);
        }
      },
      onCmdMessagesReceived: (messages: ChatMessage[]) => {},
      onMessagesRead: (messages: ChatMessage[]) => {},
      onGroupMessageRead: (groupMessageAcks: any) => {},
      onMessagesDelivered: (messages: ChatMessage[]) => {},
      onMessagesRecalled: (messages: ChatMessage[]) => {},
      onConversationsUpdate: () => {},
      onConversationRead: (from: string, to: string) => {},
    };

    chatManager.current.addMessageListener(msgListener);
    addLog("Message listener set up");
  }, [addLog]);

  /**
   * Login to Agora Chat
   */
  const login = useCallback(async () => {
    if (!isInitialized) {
      addLog("Chat SDK not initialized");
      return false;
    }

    if (!username) {
      addLog("Username is invalid");
      return false;
    }

    if (!chatToken) {
      addLog("Chat token is invalid");
      setTokenError(true);
      return false;
    }

    try {
      addLog(`Logging in as ${username}...`);
      await chatClient.current.loginWithToken(username, chatToken);
      addLog("Login successful");
      setIsLoggedIn(true);
      setTokenError(false);
      return true;
    } catch (error) {
      addLog(`Login failed: ${JSON.stringify(error)}`);
      setTokenError(true);
      return false;
    }
  }, [isInitialized, username, chatToken, addLog]);

  /**
   * Logout from Agora Chat
   */
  const logout = useCallback(async () => {
    if (!isInitialized || !isLoggedIn) {
      return false;
    }

    try {
      addLog("Logging out...");
      await chatClient.current.logout();
      addLog("Logout successful");
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      addLog(`Logout failed: ${JSON.stringify(error)}`);
      return false;
    }
  }, [isInitialized, isLoggedIn, addLog]);

  /**
   * Send a text message to a channel or user
   */
  const sendMessage = useCallback(
    async (targetId: string, content: string, isGroupChat = false) => {
      if (!isInitialized || !isLoggedIn) {
        addLog("Cannot send message: not initialized or not logged in");
        return false;
      }

      try {
        setIsSending(true);

        // Create a text message
        const msg = ChatMessage.createTextMessage(
          targetId,
          content,
          isGroupChat
            ? ChatMessageChatType.GroupChat
            : ChatMessageChatType.PeerChat
        );

        // Create callback
        const callback = new (class {
          onProgress(localMsgId: string, progress: number) {
            addLog(`Sending message progress: ${localMsgId}, ${progress}%`);
          }
          onError(localMsgId: string, error: any) {
            addLog(
              `Failed to send message: ${localMsgId}, ${JSON.stringify(error)}`
            );
            setIsSending(false);
          }
          onSuccess(message: ChatMessage) {
            addLog(`Message sent successfully: ${message.localMsgId}`);

            // Extract first two letters of username for avatar
            const avatar = username.substring(0, 2).toUpperCase();

            // Add message to state
            setMessages((prev) => [
              ...prev,
              {
                id: message.msgId || message.localMsgId,
                user: username,
                message: content,
                avatar: avatar,
                timestamp: Date.now(),
              },
            ]);

            setIsSending(false);
          }
        })();

        // Send the message
        addLog(`Sending message to ${targetId}...`);
        await chatClient.current.chatManager.sendMessage(msg, callback);
        return true;
      } catch (error) {
        addLog(`Error sending message: ${JSON.stringify(error)}`);
        setIsSending(false);
        return false;
      }
    },
    [isInitialized, isLoggedIn, username, addLog]
  );

  /**
   * Join a chat room
   */
  const joinChatRoom = useCallback(
    async (roomId: string) => {
      if (!isInitialized || !isLoggedIn) {
        addLog("Cannot join chat room: not initialized or not logged in");
        return false;
      }

      try {
        addLog(`Joining chat room ${roomId}...`);
        // Fixed: Use the correct method to join a chat room
        await chatClient.current.roomManager.joinChatRoom(roomId);
        addLog(`Successfully joined chat room ${roomId}`);
        return true;
      } catch (error) {
        addLog(`Failed to join chat room: ${JSON.stringify(error)}`);
        return false;
      }
    },
    [isInitialized, isLoggedIn, addLog]
  );

  /**
   * Leave a chat room
   */
  const leaveChatRoom = useCallback(
    async (roomId: string) => {
      if (!isInitialized || !isLoggedIn) {
        return false;
      }

      try {
        addLog(`Leaving chat room ${roomId}...`);
        // Fixed: Use the correct method to leave a chat room
        await chatClient.current.roomManager.leaveChatRoom(roomId);
        addLog(`Successfully left chat room ${roomId}`);
        return true;
      } catch (error) {
        addLog(`Failed to leave chat room: ${JSON.stringify(error)}`);
        return false;
      }
    },
    [isInitialized, isLoggedIn, addLog]
  );

  // Initialize the chat when the component mounts
  useEffect(() => {
    initializeChat();

    // Cleanup when the component unmounts
    return () => {
      try {
        chatClient.current.logout();
        chatClient.current.removeAllConnectionListener();
        chatManager.current.removeAllMessageListener();
      } catch (error) {
        log.error("Error during chat cleanup:", error);
      }
    };
  }, [initializeChat]);

  // Auto login if enabled
  useEffect(() => {
    if (isInitialized && !isLoggedIn && chatToken && username && autoLogin) {
      login();
    }
  }, [isInitialized, isLoggedIn, chatToken, username, autoLogin, login]);

  return {
    chatClient: chatClient.current,
    chatManager: chatManager.current,
    isInitialized,
    isLoggedIn,
    messages,
    tokenError,
    isSending,
    logs: logText,
    login,
    logout,
    sendMessage,
    joinChatRoom,
    leaveChatRoom,
    clearMessages: () => setMessages([]),
  };
};
