import { useState, useEffect, FC } from "react";
import { useWebSocket } from "./hooks/useWebSocket";

export const ButtonClicker: FC = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioResponse, setAudioResponse] = useState<Blob | null>(null);

  const { send, data } = useWebSocket("wss://echo.websocket.org/");

  useEffect(() => {
    if (audioStream) {
      const mediaRecorder = new MediaRecorder(audioStream);
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: "audio/ogg; codecs=opus",
        });
        send(audioBlob);
      };
      if (isRecording) {
        mediaRecorder.start();
      } else if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
      return () => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      };
    }
  }, [audioStream, isRecording]);

  useEffect(() => {
    if (data) {
      const blob = new Blob([data], { type: "audio/ogg; codecs=opus" });
      setAudioResponse(blob);
    }
  }, [data]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    audioStream?.getTracks().forEach((track) => track.stop());
  };

  const playAudio = () => {
    if (audioResponse) {
      const audioUrl = URL.createObjectURL(audioResponse);
      const audio = new window.Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <button onClick={playAudio} disabled={!audioResponse}>
        Play Audio
      </button>
    </div>
  );
};
