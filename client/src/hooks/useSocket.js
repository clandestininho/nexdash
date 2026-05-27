import { useEffect, useState, useCallback, useRef } from 'react';
import { socket } from '../lib/socket';

/**
 * Generic hook to subscribe to a socket.io event.
 * Automatically subscribes on mount and cleans up on unmount.
 */
export function useSocket(eventName, callback) {
  const callbackRef = useRef(callback);

  // Keep callback ref current without re-subscribing
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args) => {
      callbackRef.current?.(...args);
    };

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName]);

  return socket;
}

/**
 * Hook for real-time WhatsApp connection status.
 * Listens to 'whatsapp:status', 'whatsapp:qr', and 'whatsapp:connected' events.
 * Returns { status, qrCode, phoneNumber, profilePic }
 */
export function useWhatsAppStatus() {
  const [state, setState] = useState({
    status: 'disconnected', // 'disconnected' | 'connecting' | 'scanning' | 'connected'
    qrCode: null,
    phoneNumber: null,
    profilePic: null,
  });

  const handleStatus = useCallback((data) => {
    setState((prev) => ({
      ...prev,
      status: data.status || prev.status,
      phoneNumber: data.phoneNumber || prev.phoneNumber,
      profilePic: data.profilePic || prev.profilePic,
    }));
  }, []);

  const handleQR = useCallback((data) => {
    setState((prev) => ({
      ...prev,
      status: 'scanning',
      qrCode: data.qr || data.qrCode || data,
    }));
  }, []);

  const handleConnected = useCallback((data) => {
    setState({
      status: 'connected',
      qrCode: null,
      phoneNumber: data.phoneNumber || data.phone || null,
      profilePic: data.profilePic || data.profilePicUrl || null,
    });
  }, []);

  useEffect(() => {
    let active = true;
    const fetchInitialStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch('/api/whatsapp/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok && active) {
          const data = await res.json();
          setState({
            status: data.status || 'disconnected',
            qrCode: data.qrCode || null,
            phoneNumber: data.phoneNumber || null,
            profilePic: data.profilePic || null,
          });
        }
      } catch (err) {
        console.error('[useWhatsAppStatus] Error fetching initial status:', err);
      }
    };
    
    fetchInitialStatus();
    return () => {
      active = false;
    };
  }, []);

  useSocket('whatsapp:status', handleStatus);
  useSocket('whatsapp:qr', handleQR);
  useSocket('whatsapp:connected', handleConnected);

  return state;
}

export default useSocket;
