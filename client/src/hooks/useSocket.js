import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });

    setSocket(s);

    s.on("connect", () => {
      s.emit("room:join", roomId);
    });

    const onMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    s.on("chat:message", onMessage);

    return () => {
      s.off("chat:message", onMessage);
      s.disconnect();
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;

      socket?.emit("chat:message", {
        roomId,
        text,
      });
    },
    [socket, roomId]
  );

  return { messages, sendMessage };
}