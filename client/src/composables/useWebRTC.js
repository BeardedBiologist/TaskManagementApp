import { ref, shallowRef } from 'vue'

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
    // { urls: 'turn:your-turn-server.com', username: '', credential: '' }
  ]
}

export function useWebRTC() {
  const localStream = shallowRef(null)
  const remoteStream = shallowRef(null)
  const connectionState = ref('new')

  let peerConnection = null
  let onIceCandidate = null
  let onRemoteStream = null
  let onConnectionStateChange = null

  function initializeMedia(constraints) {
    return navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        localStream.value = stream
        return stream
      })
  }

  function createPeerConnection(iceConfig) {
    const config = iceConfig || ICE_CONFIG
    peerConnection = new RTCPeerConnection(config)

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate)
      }
    }

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStream.value = event.streams[0]
        if (onRemoteStream) onRemoteStream(event.streams[0])
      }
    }

    peerConnection.onconnectionstatechange = () => {
      connectionState.value = peerConnection.connectionState
      if (onConnectionStateChange) {
        onConnectionStateChange(peerConnection.connectionState)
      }
    }

    // Add local tracks to connection
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream.value)
      })
    }

    return peerConnection
  }

  async function createOffer() {
    if (!peerConnection) return null
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
  }

  async function createAnswer(remoteOffer) {
    if (!peerConnection) return null
    await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    return answer
  }

  async function handleAnswer(sdp) {
    if (!peerConnection) return
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
  }

  async function addIceCandidate(candidate) {
    if (!peerConnection) return
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  }

  function toggleAudio(enabled) {
    if (!localStream.value) return
    localStream.value.getAudioTracks().forEach((track) => {
      track.enabled = enabled
    })
  }

  function toggleVideo(enabled) {
    if (!localStream.value) return
    localStream.value.getVideoTracks().forEach((track) => {
      track.enabled = enabled
    })
  }

  function cleanup() {
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop())
      localStream.value = null
    }
    remoteStream.value = null

    if (peerConnection) {
      peerConnection.close()
      peerConnection = null
    }

    connectionState.value = 'new'
    onIceCandidate = null
    onRemoteStream = null
    onConnectionStateChange = null
  }

  return {
    localStream,
    remoteStream,
    connectionState,
    initializeMedia,
    createPeerConnection,
    createOffer,
    createAnswer,
    handleAnswer,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    cleanup,
    setOnIceCandidate(cb) { onIceCandidate = cb },
    setOnRemoteStream(cb) { onRemoteStream = cb },
    setOnConnectionStateChange(cb) { onConnectionStateChange = cb }
  }
}
