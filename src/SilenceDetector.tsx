import { useState, useEffect, FC } from "react";
import { useWebSocket } from "./hooks/useWebSocket";

export const SilenceDetector: FC = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioResponse, setAudioResponse] = useState<Blob | null>(null);
  const { send, data } = useWebSocket("wss://echo.websocket.org/");

  console.log(data);

  useEffect(() => {
    if (audioStream) {
      const audioContext = new window.AudioContext();
      const mediaRecorder = new MediaRecorder(audioStream);
      const audioChunks: Blob[] = [];
      const source = audioContext.createMediaStreamSource(audioStream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      let silenceStart: number | null = null;

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const isSilent = input.every((sample) => Math.abs(sample) < 0.01);

        if (isSilent) {
          if (!silenceStart) {
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart > 3000) {
            mediaRecorder.stop();
            processor.disconnect();
          }
        } else {
          silenceStart = null;
        }
      };

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
      }

      return () => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
        processor.disconnect();
      };
    }
  }, [audioStream, isRecording, send]);

  useEffect(() => {
    if (data && typeof data === "object") {
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

  const playAudio = () => {
    if (audioResponse) {
      const audioUrl = URL.createObjectURL(audioResponse);
      const audio = new window.Audio(audioUrl);
      audio.play();
      setIsRecording(false);
      setAudioResponse(null);
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={playAudio} disabled={!audioResponse}>
        Play Audio
      </button>
    </div>
  );
};
