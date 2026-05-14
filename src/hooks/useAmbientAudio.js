import { useRef, useCallback } from 'react'

export function useAmbientAudio(sceneType) {
  const ctxRef = useRef(null)
  const nodesRef = useRef([])
  const gainRef = useRef(null)

  const stop = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.() } catch {} })
    nodesRef.current = []
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
  }, [])

  const duck = useCallback(() => {
    if (gainRef.current) gainRef.current.gain.linearRampToValueAtTime(0.12, gainRef.current.context.currentTime + 0.3)
  }, [])

  const unduck = useCallback(() => {
    if (gainRef.current) gainRef.current.gain.linearRampToValueAtTime(1, gainRef.current.context.currentTime + 0.5)
  }, [])

  const start = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ctxRef.current = ctx

      const master = ctx.createGain()
      master.gain.value = 0
      master.connect(ctx.destination)
      gainRef.current = master
      master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2)

      const nodes = []

      function makeNoise(color = 'white') {
        const bufLen = ctx.sampleRate * 2
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
        const data = buf.getChannelData(0)
        if (color === 'white') {
          for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
        } else {
          let last = 0
          for (let i = 0; i < bufLen; i++) {
            last = (last + (0.02 * (Math.random() * 2 - 1))) / 1.02
            data[i] = last * 3.5
          }
        }
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.loop = true
        return src
      }

      function makeLFO(freq, min, max) {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        const gain = ctx.createGain()
        gain.gain.value = (max - min) / 2
        const offsetGain = ctx.createGain()
        offsetGain.gain.value = (max + min) / 2
        osc.connect(gain)
        gain.connect(offsetGain.gain)
        osc.start()
        nodes.push(osc)
        return offsetGain
      }

      if (sceneType === 'heathrow_arrivals') {
        // HVAC hum — constant low rumble
        const hum = ctx.createOscillator()
        hum.type = 'sawtooth'
        hum.frequency.value = 58
        const humGain = ctx.createGain()
        humGain.gain.value = 0.018
        const humFilter = ctx.createBiquadFilter()
        humFilter.type = 'lowpass'
        humFilter.frequency.value = 90
        hum.connect(humFilter)
        humFilter.connect(humGain)
        humGain.connect(master)
        hum.start()
        nodes.push(hum)

        // White noise — rolling luggage + HVAC blend
        const noise = makeNoise('white')
        const noiseFilter = ctx.createBiquadFilter()
        noiseFilter.type = 'bandpass'
        noiseFilter.frequency.value = 800
        noiseFilter.Q.value = 0.3
        const noiseGain = ctx.createGain()
        noiseGain.gain.value = 0.04
        noise.connect(noiseFilter)
        noiseFilter.connect(noiseGain)
        noiseGain.connect(master)
        noise.start()
        nodes.push(noise)

        // PA murmur — filtered speech-frequency noise
        const pa = makeNoise('pink')
        const paFilter = ctx.createBiquadFilter()
        paFilter.type = 'bandpass'
        paFilter.frequency.value = 1800
        paFilter.Q.value = 0.8
        const paGain = ctx.createGain()
        paGain.gain.value = 0.022
        pa.connect(paFilter)
        paFilter.connect(paGain)
        paGain.connect(master)
        pa.start()
        nodes.push(pa)

        // PA reverb-style echo using delay
        const delay = ctx.createDelay(0.5)
        delay.delayTime.value = 0.28
        const delayGain = ctx.createGain()
        delayGain.gain.value = 0.35
        paGain.connect(delay)
        delay.connect(delayGain)
        delayGain.connect(master)

        // Periodic distant plane (low rumble LFO)
        const plane = ctx.createOscillator()
        plane.type = 'sawtooth'
        plane.frequency.value = 38
        const planeLFO = makeLFO(0.04, 0, 0.03)
        const planeFilter = ctx.createBiquadFilter()
        planeFilter.type = 'lowpass'
        planeFilter.frequency.value = 60
        plane.connect(planeFilter)
        planeFilter.connect(planeLFO)
        planeLFO.connect(master)
        plane.start()
        nodes.push(plane)

      } else if (sceneType === 'caff_morning') {
        // Grill sizzle — high-pass white noise
        const sizzle = makeNoise('white')
        const sizzleFilter = ctx.createBiquadFilter()
        sizzleFilter.type = 'highpass'
        sizzleFilter.frequency.value = 4000
        const sizzleGain = ctx.createGain()
        sizzleGain.gain.value = 0.06
        sizzle.connect(sizzleFilter)
        sizzleFilter.connect(sizzleGain)
        sizzleGain.connect(master)
        sizzle.start()
        nodes.push(sizzle)

        // Sizzle intensity LFO
        const sLFO = makeLFO(0.15, 0.04, 0.09)
        sizzleGain.gain.value = 0
        sLFO.connect(sizzleGain.gain)

        // Radio 2 murmur — bandpass around 1200Hz
        const radio = makeNoise('pink')
        const radioFilter = ctx.createBiquadFilter()
        radioFilter.type = 'bandpass'
        radioFilter.frequency.value = 1200
        radioFilter.Q.value = 1.2
        const radioGain = ctx.createGain()
        radioGain.gain.value = 0.028
        radio.connect(radioFilter)
        radioFilter.connect(radioGain)
        radioGain.connect(master)
        radio.start()
        nodes.push(radio)

        // TV news murmur (background, lower)
        const tv = makeNoise('pink')
        const tvFilter = ctx.createBiquadFilter()
        tvFilter.type = 'bandpass'
        tvFilter.frequency.value = 900
        tvFilter.Q.value = 2
        const tvGain = ctx.createGain()
        tvGain.gain.value = 0.014
        tv.connect(tvFilter)
        tvFilter.connect(tvGain)
        tvGain.connect(master)
        tv.start()
        nodes.push(tv)

        // Warm hum from kitchen appliances
        const hum = ctx.createOscillator()
        hum.type = 'sine'
        hum.frequency.value = 50
        const humGain = ctx.createGain()
        humGain.gain.value = 0.01
        hum.connect(humGain)
        humGain.connect(master)
        hum.start()
        nodes.push(hum)

      } else if (sceneType === 'crown_pub') {
        // Pub chatter — layered bandpass noise
        for (let i = 0; i < 3; i++) {
          const chatter = makeNoise('pink')
          const freq = 700 + i * 350
          const chatFilter = ctx.createBiquadFilter()
          chatFilter.type = 'bandpass'
          chatFilter.frequency.value = freq
          chatFilter.Q.value = 0.6
          const chatGain = ctx.createGain()
          chatGain.gain.value = 0.026 - i * 0.005
          const chatLFO = makeLFO(0.08 + i * 0.03, 0.018, 0.034)
          chatter.connect(chatFilter)
          chatFilter.connect(chatGain)
          chatGain.connect(master)
          chatter.start()
          nodes.push(chatter)
        }

        // Fruit machine — subtle electronic high tones
        const fm = ctx.createOscillator()
        fm.type = 'square'
        fm.frequency.value = 880
        const fmGain = ctx.createGain()
        fmGain.gain.value = 0.003
        const fmFilter = ctx.createBiquadFilter()
        fmFilter.type = 'bandpass'
        fmFilter.frequency.value = 880
        fm.connect(fmFilter)
        fmFilter.connect(fmGain)
        fmGain.connect(master)
        fm.start()
        nodes.push(fm)

        // TV football — slow crowd swell LFO
        const crowd = makeNoise('pink')
        const crowdFilter = ctx.createBiquadFilter()
        crowdFilter.type = 'bandpass'
        crowdFilter.frequency.value = 500
        crowdFilter.Q.value = 0.4
        const crowdLFO = makeLFO(0.05, 0.015, 0.045)
        crowd.connect(crowdFilter)
        crowdFilter.connect(crowdLFO)
        crowdLFO.connect(master)
        crowd.start()
        nodes.push(crowd)

        // Low bass hum of building / pump
        const bass = ctx.createOscillator()
        bass.type = 'sawtooth'
        bass.frequency.value = 42
        const bassFilter = ctx.createBiquadFilter()
        bassFilter.type = 'lowpass'
        bassFilter.frequency.value = 80
        const bassGain = ctx.createGain()
        bassGain.gain.value = 0.012
        bass.connect(bassFilter)
        bassFilter.connect(bassGain)
        bassGain.connect(master)
        bass.start()
        nodes.push(bass)

      } else if (sceneType === 'tube') {
        // Underground rumble — heavy low-pass
        const rumble = makeNoise('pink')
        const rumbleFilter = ctx.createBiquadFilter()
        rumbleFilter.type = 'lowpass'
        rumbleFilter.frequency.value = 120
        const rumbleLFO = makeLFO(0.3, 0.08, 0.16)
        rumble.connect(rumbleFilter)
        rumbleFilter.connect(rumbleLFO)
        rumbleLFO.connect(master)
        rumble.start()
        nodes.push(rumble)

        // Rail rhythm — 0.3Hz modulation on mid noise
        const rail = makeNoise('white')
        const railFilter = ctx.createBiquadFilter()
        railFilter.type = 'bandpass'
        railFilter.frequency.value = 400
        railFilter.Q.value = 0.5
        const railLFO = makeLFO(0.3, 0.02, 0.06)
        rail.connect(railFilter)
        railFilter.connect(railLFO)
        railLFO.connect(master)
        rail.start()
        nodes.push(rail)

        // High frequency screech (rail joints)
        const screech = makeNoise('white')
        const screechFilter = ctx.createBiquadFilter()
        screechFilter.type = 'highpass'
        screechFilter.frequency.value = 3000
        const screechGain = ctx.createGain()
        screechGain.gain.value = 0.018
        screech.connect(screechFilter)
        screechFilter.connect(screechGain)
        screechGain.connect(master)
        screech.start()
        nodes.push(screech)
      }

      nodesRef.current = nodes
    } catch (e) {
      console.warn('Web Audio not available:', e)
    }
  }, [sceneType])

  return { start, stop, duck, unduck }
}
