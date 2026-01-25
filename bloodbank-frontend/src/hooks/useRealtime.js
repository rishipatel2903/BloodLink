import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from '../context/AuthContext';

/**
 * useRealtime Hook
 * Listens for WebSocket events and triggers refetching of dashboard data.
 * Does NOT mutate state directly to ensure data consistency.
 */
export const useRealtime = (onEvent) => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Establish connection to /ws endpoint
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);

        // Disable heavy logging in production
        stompClient.debug = null;

        stompClient.connect({}, () => {
            // Determine topic based on user role
            let topic = '';
            if (user.role === 'ROLE_USER') {
                topic = `/topic/user/${user.id}`;
            } else if (user.role === 'ROLE_HOSPITAL') {
                topic = `/topic/hospital/${user.id}`;
            } else if (user.role === 'ROLE_ORG') {
                topic = `/topic/org/${user.id}`;
            }

            // Subscribe to primary role topic
            if (topic) {
                stompClient.subscribe(topic, (message) => {
                    const event = JSON.parse(message.body);
                    console.log(`[Realtime] Event Received on ${topic}:`, event.type);
                    if (onEvent) onEvent(event);
                });
            }

            // Also subscribe to specific global/broadcast topics if applicable
            if (user.role === 'ROLE_ORG') {
                stompClient.subscribe('/topic/org/broadcast', (message) => {
                    const event = JSON.parse(message.body);
                    console.log(`[Realtime] Broadcast Event Received:`, event.type);
                    if (onEvent) onEvent(event);
                });
            }

            // Optional: OTP topic for monitoring
            stompClient.subscribe('/topic/otp', (message) => {
                const event = JSON.parse(message.body);
                if (onEvent) onEvent(event);
            });

            // GLOBAL: Inventory topic
            stompClient.subscribe('/topic/inventory', (message) => {
                const event = JSON.parse(message.body);
                if (onEvent) onEvent(event);
            });

        }, (error) => {
            console.error('[Websocket] Connection Error:', error);
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [user, onEvent]);
};
