from fastapi import WebSocket


class WebSocketManager:
    """
    Manage active WebSocket connections grouped by conversation.

    Each conversation can have multiple connected clients.
    """

    def __init__(self):
        self.active_connections: dict[
            str,
            set[WebSocket],
        ] = {}

    async def connect(
        self,
        conversation_id: str,
        websocket: WebSocket,
    ) -> None:
        """
        Accept a WebSocket connection and register it
        for the given conversation.
        """

        await websocket.accept()

        self.active_connections.setdefault(
            conversation_id,
            set(),
        ).add(websocket)

    async def disconnect(
        self,
        conversation_id: str,
        websocket: WebSocket,
    ) -> None:
        """
        Remove a WebSocket connection from a conversation.
        """

        connections = self.active_connections.get(
            conversation_id
        )

        if not connections:
            return

        connections.discard(websocket)

        if not connections:
            self.active_connections.pop(
                conversation_id,
                None,
            )

    async def broadcast(
        self,
        conversation_id: str,
        event: dict,
    ) -> None:
        """
        Send an event to every currently connected client
        in the conversation.
        """

        connections = self.active_connections.get(
            conversation_id
        )

        if not connections:
            return

        disconnected_connections: list[WebSocket] = []

        for websocket in list(connections):
            try:
                await websocket.send_json(event)
            except Exception:
                disconnected_connections.append(websocket)

        for websocket in disconnected_connections:
            await self.disconnect(
                conversation_id,
                websocket,
            )


websocket_manager = WebSocketManager()