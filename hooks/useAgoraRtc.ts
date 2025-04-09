"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import createAgoraRtcEngine, {
  type IRtcEngine,
  type RtcConnection,
  type RemoteVideoState,
  type RemoteAudioState,
  ChannelProfileType,
  ClientRoleType,
  ThreadPriorityType,
} from "react-native-agora";

//change this to your own Agora App ID
const AGORA_APP_ID = "00f5d43335cb4a19969ef78bb8955d2c";

export const useAgoraRtcEngine = (props: {
  userID: string;
  channel: string;
  token: string;
  roleType?: ClientRoleType;
}) => {
  const [rtcEngine] = useState<IRtcEngine>(createAgoraRtcEngine());
  const [rtcEngineReady, setRtcEngineReady] = useState(false);
  const [didJoinChannel, setDidJoinChannel] = useState(false);
  const [remoteUserID, setRemoteUserID] = useState<string | null>(null);
  const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(false);
  const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false);

  const onJoinChannelSuccess = useCallback(() => {
    console.log("onJoinChannelSuccess");
    setDidJoinChannel(true);
  }, []);

  const onLeaveChannel = useCallback(() => {
    console.log("onLeaveChannel");
    setDidJoinChannel(false);
    setRemoteUserID("0");
  }, []);

  const onUserJoined = useCallback(
    (_connection: RtcConnection, remoteUid: number) => {
      console.log("onUserJoined");
      if (remoteUid) {
        setRemoteUserID(remoteUid.toString());
      }
    },
    []
  );

  const onUserOffline = useCallback(
    (_connection: RtcConnection, remoteUid: number) => {
      console.log("onUserOffline");
      if (Number(remoteUid) > 0) {
        setRemoteUserID(null);
      }
    },
    []
  );

  const onRemoteVideoStateChanged = useCallback(
    (
      _connection: RtcConnection,
      _remoteUid: number,
      state: RemoteVideoState
    ) => {
      console.log("onRemoteVideoStateChanged");
      setIsRemoteVideoEnabled(Number(state) > 0);
    },
    []
  );

  const onRemoteAudioStateChanged = useCallback(
    (
      _connection: RtcConnection,
      _remoteUid: number,
      state: RemoteAudioState
    ) => {
      console.log("onRemoteAudioStateChanged");
      setIsRemoteAudioEnabled(Number(state) > 0);
    },
    []
  );

  const onAgoraError = useCallback((error: number) => {
    console.error(error, "rtcEngine.onError");
  }, []);

  const rtcInitializeDone = useRef(false);
  useEffect(() => {
    if (rtcInitializeDone.current) return;

    rtcInitializeDone.current = true;

    console.log("RTC Engine initialize");
    try {
      rtcEngine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        threadPriority: ThreadPriorityType.Normal,
      });

      rtcEngine.registerEventHandler({
        onJoinChannelSuccess,
        onLeaveChannel,
        onUserJoined,
        onUserOffline,
        onRemoteVideoStateChanged,
        onRemoteAudioStateChanged,
        onError: onAgoraError,
      });

      setRtcEngineReady(true);
    } catch (error) {
      console.error(error, "Failed to initialize Agora RTC Engine");
    }

    return () => {
      console.log("RTC Engine release");
      setRtcEngineReady(false);
      setDidJoinChannel(false);
      setIsRemoteAudioEnabled(true);
      setIsRemoteVideoEnabled(true);

      try {
        rtcEngine.unregisterEventHandler({});
        rtcEngine.removeAllListeners();
        rtcEngine.leaveChannel();
        rtcEngine.release();
      } catch (_) {
        //
      }
    };
  }, [
    rtcEngine,
    onAgoraError,
    onJoinChannelSuccess,
    onLeaveChannel,
    onRemoteAudioStateChanged,
    onRemoteVideoStateChanged,
    onUserJoined,
    onUserOffline,
  ]);

  useEffect(() => {
    // console.log(rtcEngineReady, didJoinChannel, props.channel, props.userID);
    if (!rtcEngineReady || didJoinChannel || !props.channel || !props.userID) {
      return;
    }

    try {
      const channel = props.channel;
      console.log("153: ", props.userID);

      console.log(`Joining channel '${channel}' with userUID ${props.userID}`);

      rtcEngine.enableAudio();
      rtcEngine.enableVideo();
      rtcEngine.muteLocalVideoStream(false);
      rtcEngine.muteLocalAudioStream(false);

      const joinResult = rtcEngine.joinChannelWithUserAccount(
        props.token,
        channel,
        props.userID,
        {
          // Set the client role type, default to broadcaster if not provided
          clientRoleType:
            props.roleType || ClientRoleType.ClientRoleBroadcaster,
        }
      );

      if (joinResult !== 0) {
        console.error(joinResult, "Failed to join Agora channel");
      }

      setRemoteUserID(props.userID);
      setIsRemoteAudioEnabled(true);
      setIsRemoteVideoEnabled(true);
      setDidJoinChannel(true);
    } catch (error) {
      console.error(error, "Failed to join Agora channel");
    }
  }, [rtcEngine, didJoinChannel, rtcEngineReady, props]);

  return {
    rtcEngine,
    rtcEngineReady,
    didJoinChannel,
    remoteUserID,
    isRemoteAudioEnabled,
    isRemoteVideoEnabled,
  };
};
