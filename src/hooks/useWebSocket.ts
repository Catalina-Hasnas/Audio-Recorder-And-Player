import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);
  const [readyState, setReadyState] = useState<WebSocket["readyState"]>();
  const ws = useRef<WebSocket>();

  const send = useCallback((data: any) => {
    if (ws.current) {
      ws.current.send(data);
    }
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log(`Connected: ${url}`);
      setReadyState(ws.current?.readyState);
    };

    ws.current.onmessage = (event) => {
      setData(event.data);
    };

    ws.current.onerror = (event) => {
      setError(event);
    };

    ws.current.onclose = () => {
      setReadyState(ws.current?.readyState);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return { send, data, error, readyState };
};
