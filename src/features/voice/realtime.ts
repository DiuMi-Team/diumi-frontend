import type { RealtimeServerEvent } from "@/features/voice/conversation";

/**
 * OpenAI Realtime WebRTC 연결 (정식 GA 방식).
 * 백엔드가 준 임시 키(ek_…)로 SDP를 교환하고, 마이크 음성을 보내고 AI 음성을 재생한다.
 * 이벤트는 "oai-events" 데이터 채널로 주고받는다.
 *
 * 마이크는 처음에 꺼 둔다(무음을 보냄). 사용자가 마이크 버튼을 누르는 동안만 켠다.
 * 말이 끝난 것은 서버의 음성 감지(VAD)가 알려 준다.
 */

const CALLS_URL = "https://api.openai.com/v1/realtime/calls";

export type RealtimeLink = {
  setMicEnabled: (enabled: boolean) => void;
  send: (event: Record<string, unknown>) => void;
  /** 사용자 동작 안에서 불러 아이폰 사파리의 자동 재생 제한을 푼다 */
  unlockAudio: () => void;
  close: () => void;
};

export class MicPermissionError extends Error {
  constructor() {
    super("마이크 권한이 없어요.");
    this.name = "MicPermissionError";
  }
}

export async function connectRealtime(options: {
  clientSecret: string;
  onEvent: (event: RealtimeServerEvent) => void;
  /** 연결이 끊겼다 (네트워크, 키 만료 등) */
  onDisconnect: () => void;
}): Promise<RealtimeLink> {
  let mic: MediaStream;
  try {
    mic = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      throw new MicPermissionError();
    }
    throw error;
  }
  const micTrack = mic.getAudioTracks()[0];
  micTrack.enabled = false;

  const pc = new RTCPeerConnection();
  const audio = new Audio();
  audio.autoplay = true;
  pc.ontrack = (event) => {
    audio.srcObject = event.streams[0];
  };
  pc.addTrack(micTrack, mic);

  const channel = pc.createDataChannel("oai-events");
  channel.onmessage = (message) => {
    try {
      options.onEvent(JSON.parse(message.data));
    } catch {
      /* 읽을 수 없는 메시지는 버린다 */
    }
  };

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    channel.close();
    pc.close();
    mic.getTracks().forEach((track) => track.stop());
    audio.srcObject = null;
  };
  pc.onconnectionstatechange = () => {
    if (!closed && (pc.connectionState === "failed" || pc.connectionState === "disconnected")) {
      close();
      options.onDisconnect();
    }
  };

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const response = await fetch(CALLS_URL, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${options.clientSecret}`,
        "Content-Type": "application/sdp",
      },
    });
    if (!response.ok) throw new Error(`Realtime 연결 실패 (${response.status})`);
    await pc.setRemoteDescription({ type: "answer", sdp: await response.text() });
  } catch (error) {
    close();
    throw error;
  }

  return {
    setMicEnabled: (enabled) => {
      micTrack.enabled = enabled;
    },
    send: (event) => {
      if (channel.readyState === "open") channel.send(JSON.stringify(event));
    },
    unlockAudio: () => {
      audio.play().catch(() => {});
    },
    close,
  };
}

/**
 * 백엔드가 사용자 음성 받아쓰기를 켜지 않았을 때 브라우저에서 켠다.
 * 질문 transcript가 있어야 대화 기록(API 9)을 저장할 수 있다.
 */
export const ENABLE_INPUT_TRANSCRIPTION = {
  type: "session.update",
  session: {
    type: "realtime",
    audio: { input: { transcription: { model: "gpt-4o-mini-transcribe", language: "ko" } } },
  },
} as const;
