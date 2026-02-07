import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWebRTC } from '../composables/useWebRTC'
import { useSocketStore } from './socket'
import { useAuthStore } from './auth'

export const useCallStore = defineStore('call', () => {
  const callState = ref('idle') // idle|requesting|outgoing|incoming|connecting|connected|ended
  const callId = ref(null)
  const callType = ref('audio') // audio|video
  const remoteUser = ref(null)
  const isCaller = ref(false)
  const isAudioEnabled = ref(true)
  const isVideoEnabled = ref(true)
  const callDuration = ref(0)
  const endReason = ref(null)

  let webrtc = null
  let ringTimeout = null
  let durationInterval = null
  let disconnectTimeout = null
  let endedResetTimeout = null
  let pendingOffer = null
  let pendingCandidates = []
  let listenersAttached = false

  const isInCall = computed(() =>
    ['requesting', 'outgoing', 'incoming', 'connecting', 'connected'].includes(callState.value)
  )

  function generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  async function startCall(userId, userInfo, type) {
    if (isInCall.value) return

    const socketStore = useSocketStore()
    const authStore = useAuthStore()

    callState.value = 'requesting'
    callId.value = generateCallId()
    callType.value = type
    remoteUser.value = userInfo
    isCaller.value = true
    isAudioEnabled.value = true
    isVideoEnabled.value = type === 'video'
    endReason.value = null

    webrtc = useWebRTC()

    try {
      const constraints = { audio: true, video: type === 'video' }
      await webrtc.initializeMedia(constraints)
    } catch (err) {
      // If video was requested but device not found, fall back to audio-only
      if (type === 'video' && (err.name === 'NotFoundError' || err.name === 'OverconstrainedError')) {
        console.warn('Camera not available, falling back to audio-only call')
        try {
          await webrtc.initializeMedia({ audio: true, video: false })
          callType.value = 'audio'
          isVideoEnabled.value = false
        } catch (audioErr) {
          console.error('Failed to get audio media:', audioErr)
          endReason.value = 'permissions'
          callState.value = 'ended'
          resetAfterDelay()
          return
        }
      } else {
        console.error('Failed to get media:', err)
        endReason.value = 'permissions'
        callState.value = 'ended'
        resetAfterDelay()
        return
      }
    }

    webrtc.createPeerConnection()

    webrtc.setOnIceCandidate((candidate) => {
      socketStore.emit('call-ice-candidate', {
        to: userId,
        callId: callId.value,
        candidate
      })
    })

    webrtc.setOnConnectionStateChange((state) => {
      handleConnectionStateChange(state)
    })

    try {
      const offer = await webrtc.createOffer()

      socketStore.emit('call-offer', {
        to: userId,
        callId: callId.value,
        callType: callType.value,
        offer,
        callerInfo: {
          _id: authStore.user?._id,
          name: authStore.user?.name,
          initials: authStore.userInitials
        }
      })

      callState.value = 'outgoing'

      // 30s ring timeout
      ringTimeout = setTimeout(() => {
        if (callState.value === 'outgoing') {
          socketStore.emit('call-end', {
            to: userId,
            callId: callId.value,
            reason: 'timeout'
          })
          endReason.value = 'timeout'
          doCleanup()
          callState.value = 'ended'
          resetAfterDelay()
        }
      }, 30000)
    } catch (err) {
      console.error('Failed to create offer:', err)
      endReason.value = 'error'
      doCleanup()
      callState.value = 'ended'
      resetAfterDelay()
    }
  }

  async function acceptCall() {
    if (callState.value !== 'incoming') return

    const socketStore = useSocketStore()

    webrtc = useWebRTC()

    try {
      const constraints = { audio: true, video: callType.value === 'video' }
      await webrtc.initializeMedia(constraints)
    } catch (err) {
      // If video was requested but device not found, fall back to audio-only
      if (callType.value === 'video' && (err.name === 'NotFoundError' || err.name === 'OverconstrainedError')) {
        console.warn('Camera not available, falling back to audio-only call')
        try {
          await webrtc.initializeMedia({ audio: true, video: false })
          callType.value = 'audio'
          isVideoEnabled.value = false
        } catch (audioErr) {
          console.error('Failed to get audio media:', audioErr)
          rejectCall('error')
          endReason.value = 'permissions'
          callState.value = 'ended'
          resetAfterDelay()
          return
        }
      } else {
        console.error('Failed to get media:', err)
        rejectCall('error')
        endReason.value = 'permissions'
        callState.value = 'ended'
        resetAfterDelay()
        return
      }
    }

    webrtc.createPeerConnection()

    webrtc.setOnIceCandidate((candidate) => {
      socketStore.emit('call-ice-candidate', {
        to: remoteUser.value._id,
        callId: callId.value,
        candidate
      })
    })

    webrtc.setOnConnectionStateChange((state) => {
      handleConnectionStateChange(state)
    })

    try {
      const answer = await webrtc.createAnswer(pendingOffer)

      // Flush buffered ICE candidates
      for (const candidate of pendingCandidates) {
        await webrtc.addIceCandidate(candidate)
      }
      pendingCandidates = []

      socketStore.emit('call-answer', {
        to: remoteUser.value._id,
        callId: callId.value,
        answer
      })

      callState.value = 'connecting'
    } catch (err) {
      console.error('Failed to create answer:', err)
      endReason.value = 'error'
      doCleanup()
      callState.value = 'ended'
      resetAfterDelay()
    }
  }

  function rejectCall(reason) {
    if (callState.value !== 'incoming') return

    const socketStore = useSocketStore()
    socketStore.emit('call-reject', {
      to: remoteUser.value._id,
      callId: callId.value,
      reason: reason || 'declined'
    })

    endReason.value = reason || 'declined'
    pendingOffer = null
    pendingCandidates = []
    doCleanup()
    callState.value = 'ended'
    resetAfterDelay()
  }

  function endCall() {
    if (!isInCall.value) return

    const socketStore = useSocketStore()
    socketStore.emit('call-end', {
      to: remoteUser.value?._id,
      callId: callId.value,
      reason: 'hangup'
    })

    endReason.value = 'hangup'
    doCleanup()
    callState.value = 'ended'
    resetAfterDelay()
  }

  function toggleAudio() {
    isAudioEnabled.value = !isAudioEnabled.value
    if (webrtc) {
      webrtc.toggleAudio(isAudioEnabled.value)
    }
    const socketStore = useSocketStore()
    socketStore.emit('call-media-toggle', {
      to: remoteUser.value?._id,
      callId: callId.value,
      audio: isAudioEnabled.value,
      video: isVideoEnabled.value
    })
  }

  function toggleVideo() {
    isVideoEnabled.value = !isVideoEnabled.value
    if (webrtc) {
      webrtc.toggleVideo(isVideoEnabled.value)
    }
    const socketStore = useSocketStore()
    socketStore.emit('call-media-toggle', {
      to: remoteUser.value?._id,
      callId: callId.value,
      audio: isAudioEnabled.value,
      video: isVideoEnabled.value
    })
  }

  function handleConnectionStateChange(state) {
    if (state === 'connected') {
      callState.value = 'connected'
      clearTimeout(ringTimeout)
      clearTimeout(disconnectTimeout)
      startDurationTimer()
    } else if (state === 'disconnected') {
      // Wait 5s before ending
      disconnectTimeout = setTimeout(() => {
        if (webrtc && webrtc.connectionState.value === 'disconnected') {
          endReason.value = 'error'
          endCall()
        }
      }, 5000)
    } else if (state === 'failed') {
      endReason.value = 'error'
      doCleanup()
      callState.value = 'ended'
      resetAfterDelay()

      const socketStore = useSocketStore()
      socketStore.emit('call-end', {
        to: remoteUser.value?._id,
        callId: callId.value,
        reason: 'error'
      })
    }
  }

  function startDurationTimer() {
    callDuration.value = 0
    durationInterval = setInterval(() => {
      callDuration.value++
    }, 1000)
  }

  function doCleanup() {
    clearTimeout(ringTimeout)
    clearTimeout(disconnectTimeout)
    clearInterval(durationInterval)
    ringTimeout = null
    disconnectTimeout = null
    durationInterval = null

    if (webrtc) {
      webrtc.cleanup()
      webrtc = null
    }

    pendingOffer = null
    pendingCandidates = []
  }

  function resetAfterDelay() {
    clearTimeout(endedResetTimeout)
    endedResetTimeout = setTimeout(() => {
      if (callState.value === 'ended') {
        callState.value = 'idle'
        callId.value = null
        callType.value = 'audio'
        remoteUser.value = null
        isCaller.value = false
        isAudioEnabled.value = true
        isVideoEnabled.value = true
        callDuration.value = 0
        endReason.value = null
      }
    }, 3000)
  }

  // Socket event handlers
  function onCallOffer(data) {
    const authStore = useAuthStore()
    if (data.from === authStore.user?._id) return

    // Already in a call — auto-reject as busy
    if (isInCall.value) {
      const socketStore = useSocketStore()
      socketStore.emit('call-reject', {
        to: data.from,
        callId: data.callId,
        reason: 'busy'
      })
      return
    }

    callState.value = 'incoming'
    callId.value = data.callId
    callType.value = data.callType
    remoteUser.value = data.callerInfo
    isCaller.value = false
    isAudioEnabled.value = true
    isVideoEnabled.value = data.callType === 'video'
    endReason.value = null
    pendingOffer = data.offer
    pendingCandidates = []
  }

  function onCallAnswer(data) {
    if (data.callId !== callId.value) return
    if (!webrtc) return

    clearTimeout(ringTimeout)
    webrtc.handleAnswer(data.answer)
    callState.value = 'connecting'
  }

  function onCallIceCandidate(data) {
    if (data.callId !== callId.value) return

    if (webrtc) {
      webrtc.addIceCandidate(data.candidate).catch((err) => {
        console.error('Failed to add ICE candidate:', err)
      })
    } else {
      // Buffer until peer connection is ready
      pendingCandidates.push(data.candidate)
    }
  }

  function onCallReject(data) {
    if (data.callId !== callId.value) return

    endReason.value = data.reason === 'busy' ? 'busy' : 'declined'
    doCleanup()
    callState.value = 'ended'
    resetAfterDelay()
  }

  function onCallEnd(data) {
    if (data.callId !== callId.value) return

    endReason.value = data.reason || 'hangup'
    doCleanup()
    callState.value = 'ended'
    resetAfterDelay()
  }

  function onCallMediaToggle(data) {
    if (data.callId !== callId.value) return
    // Could be used to show remote mute indicators in the future
  }

  function setupCallListeners() {
    if (listenersAttached) return
    listenersAttached = true

    const socketStore = useSocketStore()
    socketStore.on('call-offer', onCallOffer)
    socketStore.on('call-answer', onCallAnswer)
    socketStore.on('call-ice-candidate', onCallIceCandidate)
    socketStore.on('call-reject', onCallReject)
    socketStore.on('call-end', onCallEnd)
    socketStore.on('call-media-toggle', onCallMediaToggle)
  }

  function removeCallListeners() {
    listenersAttached = false

    const socketStore = useSocketStore()
    socketStore.off('call-offer', onCallOffer)
    socketStore.off('call-answer', onCallAnswer)
    socketStore.off('call-ice-candidate', onCallIceCandidate)
    socketStore.off('call-reject', onCallReject)
    socketStore.off('call-end', onCallEnd)
    socketStore.off('call-media-toggle', onCallMediaToggle)

    doCleanup()
  }

  function getLocalStream() {
    return webrtc?.localStream.value || null
  }

  function getRemoteStream() {
    return webrtc?.remoteStream.value || null
  }

  return {
    callState,
    callId,
    callType,
    remoteUser,
    isCaller,
    isAudioEnabled,
    isVideoEnabled,
    callDuration,
    endReason,
    isInCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    setupCallListeners,
    removeCallListeners,
    getLocalStream,
    getRemoteStream
  }
})
