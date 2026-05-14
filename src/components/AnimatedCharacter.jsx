import React, { useRef, useEffect } from 'react'

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, (n >> 16) + Math.round(amt * 255))
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(amt * 255))
  const b = Math.min(255, (n & 0xff) + Math.round(amt * 255))
  return `rgb(${r},${g},${b})`
}

function darken(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - Math.round(amt * 255))
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(amt * 255))
  const b = Math.max(0, (n & 0xff) - Math.round(amt * 255))
  return `rgb(${r},${g},${b})`
}

function drawCharacter(ctx, char, cx, cy, r, mouthOpen, blinkP, breathOffset) {
  const skin = char.skin || '#c0785a'
  const hair = char.hair || '#1a0a02'
  const eye  = char.eye  || '#2a1200'

  // Drop shadow
  const shadow = ctx.createRadialGradient(cx, cy + r * 1.05, 0, cx, cy + r * 1.05, r * 0.7)
  shadow.addColorStop(0, 'rgba(0,0,0,0.3)')
  shadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shadow
  ctx.fillRect(cx - r, cy, r * 2, r)

  // Neck
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.rect(cx - r * 0.18, cy + r * 0.72 + breathOffset, r * 0.36, r * 0.32)
  ctx.fill()

  // Body / clothing
  const bodyTop = cy + r * 0.86 + breathOffset
  if (char.hasLeatherJacket) {
    // Billy: dark leather jacket
    const jacket = ctx.createLinearGradient(cx, bodyTop, cx, bodyTop + r * 0.6)
    jacket.addColorStop(0, '#1a1008')
    jacket.addColorStop(1, '#0a0804')
    ctx.fillStyle = jacket
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, bodyTop)
    ctx.quadraticCurveTo(cx - r * 0.6, bodyTop + r * 0.08, cx - r * 1.2, bodyTop + r * 0.6)
    ctx.lineTo(cx + r * 1.2, bodyTop + r * 0.6)
    ctx.quadraticCurveTo(cx + r * 0.6, bodyTop + r * 0.08, cx + r * 0.2, bodyTop)
    ctx.closePath()
    ctx.fill()
    // Jacket lapels
    ctx.fillStyle = '#2a1808'
    ctx.beginPath()
    ctx.moveTo(cx, bodyTop + r * 0.04)
    ctx.lineTo(cx - r * 0.22, bodyTop + r * 0.3)
    ctx.lineTo(cx - r * 0.04, bodyTop + r * 0.04)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx, bodyTop + r * 0.04)
    ctx.lineTo(cx + r * 0.22, bodyTop + r * 0.3)
    ctx.lineTo(cx + r * 0.04, bodyTop + r * 0.04)
    ctx.closePath()
    ctx.fill()
    // White tee underneath
    ctx.fillStyle = '#e8e0d0'
    ctx.fillRect(cx - r * 0.1, bodyTop + r * 0.04, r * 0.2, r * 0.18)
  } else if (char.hasApron) {
    // Brenda: blouse + apron
    const blouse = ctx.createLinearGradient(cx, bodyTop, cx, bodyTop + r * 0.6)
    blouse.addColorStop(0, '#4a6080')
    blouse.addColorStop(1, '#3a5070')
    ctx.fillStyle = blouse
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, bodyTop)
    ctx.quadraticCurveTo(cx - r * 0.6, bodyTop + r * 0.08, cx - r * 1.2, bodyTop + r * 0.6)
    ctx.lineTo(cx + r * 1.2, bodyTop + r * 0.6)
    ctx.quadraticCurveTo(cx + r * 0.6, bodyTop + r * 0.08, cx + r * 0.2, bodyTop)
    ctx.closePath()
    ctx.fill()
    // Apron
    ctx.fillStyle = '#f0e8d8'
    ctx.fillRect(cx - r * 0.35, bodyTop + r * 0.08, r * 0.7, r * 0.5)
    // Apron strings
    ctx.strokeStyle = '#d8d0c0'
    ctx.lineWidth = r * 0.03
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.35, bodyTop + r * 0.08)
    ctx.lineTo(cx - r * 0.55, bodyTop + r * 0.02)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + r * 0.35, bodyTop + r * 0.08)
    ctx.lineTo(cx + r * 0.55, bodyTop + r * 0.02)
    ctx.stroke()
  } else if (char.hasPubApron) {
    // Terry: dark shirt + pub apron
    const shirt = ctx.createLinearGradient(cx, bodyTop, cx, bodyTop + r * 0.6)
    shirt.addColorStop(0, '#1c1410')
    shirt.addColorStop(1, '#0e0a08')
    ctx.fillStyle = shirt
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, bodyTop)
    ctx.quadraticCurveTo(cx - r * 0.6, bodyTop + r * 0.08, cx - r * 1.2, bodyTop + r * 0.6)
    ctx.lineTo(cx + r * 1.2, bodyTop + r * 0.6)
    ctx.quadraticCurveTo(cx + r * 0.6, bodyTop + r * 0.08, cx + r * 0.2, bodyTop)
    ctx.closePath()
    ctx.fill()
    // Dark pub apron
    ctx.fillStyle = '#2a1808'
    ctx.fillRect(cx - r * 0.32, bodyTop + r * 0.1, r * 0.64, r * 0.48)
  } else {
    // Generic
    const shirt = ctx.createLinearGradient(cx, bodyTop, cx, bodyTop + r * 0.6)
    shirt.addColorStop(0, '#444')
    shirt.addColorStop(1, '#222')
    ctx.fillStyle = shirt
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, bodyTop)
    ctx.quadraticCurveTo(cx - r * 0.6, bodyTop + r * 0.08, cx - r * 1.2, bodyTop + r * 0.6)
    ctx.lineTo(cx + r * 1.2, bodyTop + r * 0.6)
    ctx.quadraticCurveTo(cx + r * 0.6, bodyTop + r * 0.08, cx + r * 0.2, bodyTop)
    ctx.closePath()
    ctx.fill()
  }

  // Head
  const faceGrad = ctx.createRadialGradient(cx - r * 0.15, cy - r * 0.2 + breathOffset, r * 0.1, cx, cy + breathOffset, r * 0.95)
  faceGrad.addColorStop(0, lighten(skin, 0.14))
  faceGrad.addColorStop(0.6, skin)
  faceGrad.addColorStop(1, darken(skin, 0.18))
  ctx.fillStyle = faceGrad
  ctx.beginPath()
  // Slightly different head shapes per character
  const headW = char.isOlder ? 0.72 : 0.68
  const headH = char.isOlder ? 0.9 : 0.86
  ctx.ellipse(cx, cy + breathOffset, r * headW, r * headH, 0, 0, Math.PI * 2)
  ctx.fill()

  // Ears
  ctx.fillStyle = darken(skin, 0.06)
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.67, cy + r * 0.04 + breathOffset, r * 0.1, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.67, cy + r * 0.04 + breathOffset, r * 0.1, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = darken(skin, 0.15)
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.67, cy + r * 0.04 + breathOffset, r * 0.055, r * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()

  // Glasses on head (Brenda)
  if (char.hasGlasses) {
    const gy = cy - r * 0.96 + breathOffset
    ctx.strokeStyle = '#888'
    ctx.lineWidth = r * 0.03
    ctx.beginPath()
    ctx.arc(cx - r * 0.2, gy, r * 0.15, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + r * 0.2, gy, r * 0.15, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.05, gy)
    ctx.lineTo(cx + r * 0.05, gy)
    ctx.stroke()
    // Stems going back
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.35, gy)
    ctx.lineTo(cx - r * 0.7, gy + r * 0.05)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + r * 0.35, gy)
    ctx.lineTo(cx + r * 0.7, gy + r * 0.05)
    ctx.stroke()
  }

  // Hair
  ctx.fillStyle = hair
  if (char.hasApron || char.key === 'brenda') {
    // Brenda: grey hair pulled up
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.72 + breathOffset, r * 0.68, r * 0.48, 0, Math.PI, 0)
    ctx.fill()
    // Bun
    ctx.beginPath()
    ctx.ellipse(cx + r * 0.18, cy - r * 1.05 + breathOffset, r * 0.22, r * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    // Sides
    ctx.fillRect(cx - r * 0.69, cy - r * 0.62 + breathOffset, r * 0.14, r * 0.45)
    ctx.fillRect(cx + r * 0.55, cy - r * 0.62 + breathOffset, r * 0.14, r * 0.45)
  } else if (char.isOlder) {
    // Terry: receding salt-and-pepper
    ctx.fillStyle = '#505048'
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.26 + breathOffset, r * 0.7, r * 0.65, 0, Math.PI, 0)
    ctx.fill()
    // Bald patch
    const bald = ctx.createRadialGradient(cx, cy - r * 0.52 + breathOffset, 0, cx, cy - r * 0.52 + breathOffset, r * 0.42)
    bald.addColorStop(0, skin + 'ff')
    bald.addColorStop(0.7, skin + '66')
    bald.addColorStop(1, 'transparent')
    ctx.fillStyle = bald
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.52 + breathOffset, r * 0.42, r * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // Billy / default: dark hair
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.24 + breathOffset, r * 0.7, r * 0.72, 0, Math.PI, 0)
    ctx.fill()
    ctx.fillRect(cx - r * 0.7, cy - r * 0.44 + breathOffset, r * 0.14, r * 0.52)
    ctx.fillRect(cx + r * 0.56, cy - r * 0.44 + breathOffset, r * 0.14, r * 0.52)
  }

  // Eyebrows
  const browColor = char.isOlder ? '#666' : darken(hair, 0.0)
  ctx.strokeStyle = browColor
  ctx.lineWidth = r * 0.06
  ctx.lineCap = 'round'
  const eyeY = cy - r * 0.1 + breathOffset
  const eSpacing = r * 0.265

  ctx.beginPath()
  ctx.moveTo(cx - eSpacing - r * 0.14, eyeY - r * 0.24)
  ctx.quadraticCurveTo(cx - eSpacing, eyeY - r * 0.31, cx - eSpacing + r * 0.16, eyeY - r * 0.25)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + eSpacing - r * 0.16, eyeY - r * 0.25)
  ctx.quadraticCurveTo(cx + eSpacing, eyeY - r * 0.31, cx + eSpacing + r * 0.14, eyeY - r * 0.24)
  ctx.stroke()

  // Eyes
  const eyeOpenH = r * 0.115 * (1 - blinkP * 0.96)
  const drawEye = (ex) => {
    ctx.fillStyle = '#f8f4ee'
    ctx.beginPath()
    ctx.ellipse(ex, eyeY, r * 0.125, eyeOpenH, 0, 0, Math.PI * 2)
    ctx.fill()
    const irisR = Math.min(eyeOpenH * 0.82, r * 0.075)
    ctx.fillStyle = eye
    ctx.beginPath()
    ctx.ellipse(ex, eyeY, irisR, irisR, 0, 0, Math.PI * 2)
    ctx.fill()
    const pupilR = Math.min(irisR * 0.55, r * 0.042)
    ctx.fillStyle = '#0a0000'
    ctx.beginPath()
    ctx.ellipse(ex, eyeY, pupilR, pupilR, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.beginPath()
    ctx.arc(ex + r * 0.035, eyeY - r * 0.03, r * 0.026, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = darken(skin, 0.12)
    ctx.beginPath()
    ctx.ellipse(ex, eyeY - eyeOpenH * 0.3, r * 0.13, eyeOpenH * 0.4, 0, Math.PI, 0)
    ctx.fill()
  }
  drawEye(cx - eSpacing)
  drawEye(cx + eSpacing)

  // Nose
  const noseY = cy + r * 0.16 + breathOffset
  ctx.strokeStyle = darken(skin, 0.22)
  ctx.lineWidth = r * 0.03
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 0.04 + breathOffset)
  ctx.quadraticCurveTo(cx + r * 0.14, noseY, cx + r * 0.12, noseY + r * 0.12)
  ctx.stroke()
  ctx.fillStyle = darken(skin, 0.2)
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.11, noseY + r * 0.13, r * 0.045, r * 0.03, 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.04, noseY + r * 0.13, r * 0.04, r * 0.028, -0.4, 0, Math.PI * 2)
  ctx.fill()

  // Mouth
  const mouthY = cy + r * 0.43 + breathOffset
  const mouthW = r * 0.3
  const openH = mouthOpen * r * 0.22

  ctx.fillStyle = darken(skin, 0.14)
  ctx.beginPath()
  ctx.ellipse(cx, mouthY + openH * 0.3, mouthW + r * 0.04, r * 0.04 + openH * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#7a3828'
  ctx.beginPath()
  ctx.moveTo(cx - mouthW, mouthY)
  ctx.quadraticCurveTo(cx - mouthW * 0.5, mouthY - r * 0.04, cx, mouthY - r * 0.02)
  ctx.quadraticCurveTo(cx + mouthW * 0.5, mouthY - r * 0.04, cx + mouthW, mouthY)
  ctx.quadraticCurveTo(cx + mouthW * 0.5, mouthY + r * 0.03 + openH, cx, mouthY + r * 0.04 + openH)
  ctx.quadraticCurveTo(cx - mouthW * 0.5, mouthY + r * 0.03 + openH, cx - mouthW, mouthY)
  ctx.fill()

  ctx.fillStyle = lighten('#7a3828', 0.15)
  ctx.beginPath()
  ctx.ellipse(cx, mouthY + r * 0.025 + openH * 0.6, mouthW * 0.55, r * 0.025, 0, 0, Math.PI * 2)
  ctx.fill()

  if (mouthOpen > 0.06) {
    ctx.fillStyle = '#2a0808'
    ctx.beginPath()
    ctx.ellipse(cx, mouthY + openH * 0.28, mouthW * 0.72, openH * 0.62, 0, 0, Math.PI * 2)
    ctx.fill()
    if (mouthOpen > 0.18) {
      ctx.fillStyle = '#f0ebe0'
      ctx.beginPath()
      ctx.rect(cx - mouthW * 0.6, mouthY, mouthW * 1.2, openH * 0.38)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'
      ctx.lineWidth = r * 0.018
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath()
        ctx.moveTo(cx + i * mouthW * 0.22, mouthY)
        ctx.lineTo(cx + i * mouthW * 0.22, mouthY + openH * 0.38)
        ctx.stroke()
      }
    }
  }

  // Cheek warmth
  ctx.fillStyle = 'rgba(220,100,80,0.10)'
  ctx.beginPath()
  ctx.ellipse(cx - eSpacing - r * 0.08, eyeY + r * 0.28, r * 0.2, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + eSpacing + r * 0.08, eyeY + r * 0.28, r * 0.2, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()

  // Billy: stubble
  if (char.hasStubble) {
    ctx.fillStyle = 'rgba(20,8,0,0.12)'
    for (let i = 0; i < 32; i++) {
      const sx = cx - r * 0.42 + (i % 8) * r * 0.12
      const sy = mouthY - r * 0.02 + Math.floor(i / 8) * r * 0.1
      if (sy > mouthY - r * 0.04 && sy < cy + r * 0.75 + breathOffset) {
        ctx.beginPath()
        ctx.arc(sx + Math.sin(i * 3.7) * r * 0.04, sy, r * 0.016, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // Brenda: reading glasses on head already drawn above
}

function drawAtmosphere(ctx, scene, t) {
  const W = ctx.canvas.width
  const H = ctx.canvas.height

  if (scene === 'heathrow') {
    // Fluorescent light bokeh
    const bokehPositions = [
      { x: 0.15, y: 0.12, phase: 0 },
      { x: 0.42, y: 0.08, phase: 1.2 },
      { x: 0.7, y: 0.14, phase: 2.4 },
      { x: 0.88, y: 0.1, phase: 0.7 },
      { x: 0.3, y: 0.2, phase: 3.1 },
    ]
    bokehPositions.forEach(b => {
      const a = 0.06 + Math.sin(t * 0.5 + b.phase) * 0.02
      const g = ctx.createRadialGradient(W * b.x, H * b.y, 0, W * b.x, H * b.y, 55)
      g.addColorStop(0, `rgba(240,240,210,${a})`)
      g.addColorStop(1, 'rgba(230,230,200,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    })
    // HVAC vignette glow from above
    const hvac = ctx.createLinearGradient(0, 0, 0, H * 0.3)
    hvac.addColorStop(0, 'rgba(200,210,240,0.04)')
    hvac.addColorStop(1, 'rgba(200,210,240,0)')
    ctx.fillStyle = hvac
    ctx.fillRect(0, 0, W, H)

  } else if (scene === 'caff') {
    // Steam rising from grill
    for (let i = 0; i < 8; i++) {
      const sx = W * (0.55 + i * 0.06) + Math.sin(t * 0.4 + i) * 8
      const progress = ((t * 0.3 + i * 0.4) % 1)
      const sy = H * (0.95 - progress * 0.7)
      const sa = (1 - progress) * 0.12
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 18 + progress * 12)
      sg.addColorStop(0, `rgba(220,220,210,${sa})`)
      sg.addColorStop(1, 'rgba(220,220,210,0)')
      ctx.fillStyle = sg
      ctx.fillRect(0, 0, W, H)
    }
    // Warm orange grill glow from bottom-right
    const grillGlow = ctx.createRadialGradient(W * 0.8, H * 0.95, 0, W * 0.8, H * 0.95, W * 0.5)
    const gp = 0.08 + Math.sin(t * 2.1) * 0.02
    grillGlow.addColorStop(0, `rgba(255,140,40,${gp})`)
    grillGlow.addColorStop(1, 'rgba(255,100,0,0)')
    ctx.fillStyle = grillGlow
    ctx.fillRect(0, 0, W, H)

  } else if (scene === 'pub') {
    // Warm amber bokeh from candle/lamp sources
    const lampPositions = [
      { x: 0.08, y: 0.35, phase: 0 },
      { x: 0.92, y: 0.28, phase: 2.1 },
      { x: 0.5, y: 0.15, phase: 1.4 },
    ]
    lampPositions.forEach(b => {
      const a = 0.09 + Math.sin(t * 1.2 + b.phase) * 0.03
      const g = ctx.createRadialGradient(W * b.x, H * b.y, 0, W * b.x, H * b.y, 80)
      g.addColorStop(0, `rgba(255,185,60,${a})`)
      g.addColorStop(1, 'rgba(200,120,20,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    })
    // TV flicker from corner
    const tvFlicker = 0.03 + Math.sin(t * 15 + Math.sin(t * 7.3) * 3) * 0.015
    const tvg = ctx.createRadialGradient(W * 0.9, H * 0.6, 0, W * 0.9, H * 0.6, W * 0.35)
    tvg.addColorStop(0, `rgba(140,160,220,${tvFlicker})`)
    tvg.addColorStop(1, 'rgba(120,140,200,0)')
    ctx.fillStyle = tvg
    ctx.fillRect(0, 0, W, H)
    // General haze
    const haze = ctx.createLinearGradient(0, H * 0.3, 0, H)
    haze.addColorStop(0, 'rgba(120,80,30,0)')
    haze.addColorStop(1, `rgba(80,50,10,${0.06 + Math.sin(t * 0.15) * 0.01})`)
    ctx.fillStyle = haze
    ctx.fillRect(0, 0, W, H)
  }

  // Universal vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.8)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, W, H)
}

export default function AnimatedCharacter({ character, speaking, size = 190, atmosphere }) {
  const canvasRef = useRef(null)
  const speakingRef = useRef(speaking)

  useEffect(() => { speakingRef.current = speaking }, [speaking])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const state = {
      blinkTimer: 2.5 + Math.random() * 3,
      blinkP: 0,
      blinkDir: 0,
      mouthOpen: 0,
      mouthTarget: 0,
      mouthTimer: 0,
      breathPhase: Math.random() * Math.PI * 2,
    }

    let t = 0
    let raf
    const draw = () => {
      t += 0.016

      // Blink
      state.blinkTimer -= 0.016
      if (state.blinkTimer <= 0 && state.blinkDir === 0) state.blinkDir = 1
      if (state.blinkDir === 1) {
        state.blinkP = Math.min(1, state.blinkP + 0.16)
        if (state.blinkP >= 1) state.blinkDir = -1
      } else if (state.blinkDir === -1) {
        state.blinkP = Math.max(0, state.blinkP - 0.16)
        if (state.blinkP <= 0) { state.blinkDir = 0; state.blinkTimer = 2.5 + Math.random() * 4 }
      }

      // Mouth
      if (speakingRef.current) {
        state.mouthTimer -= 0.016
        if (state.mouthTimer <= 0) {
          state.mouthTimer = 0.05 + Math.random() * 0.11
          state.mouthTarget = 0.12 + Math.random() * 0.78
        }
      } else {
        state.mouthTarget = 0
      }
      state.mouthOpen += (state.mouthTarget - state.mouthOpen) * 0.22

      // Breathing
      const breathOffset = Math.sin(state.breathPhase + t * 0.8) * 1.5

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw atmosphere overlay on canvas bg
      if (atmosphere) drawAtmosphere(ctx, atmosphere, t)

      const r = canvas.height * 0.34
      if (character) {
        drawCharacter(ctx, character, canvas.width / 2, canvas.height * 0.44, r, state.mouthOpen, state.blinkP, breathOffset)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [character?.key, atmosphere])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={Math.round(size * 1.25)}
      style={{ display: 'block' }}
    />
  )
}
