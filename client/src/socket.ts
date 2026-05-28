import { io } from 'socket.io-client'

const configuredServerUrl = import.meta.env.VITE_SERVER_URL?.trim()
const serverUrl = configuredServerUrl || (import.meta.env.DEV ? 'http://localhost:4000' : undefined)

export const socket = io(serverUrl)
