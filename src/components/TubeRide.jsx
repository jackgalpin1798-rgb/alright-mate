import React, { useEffect, useState, useRef } from 'react'
import { useAmbientAudio } from '../hooks/useAmbientAudio'
import { SCENES } from '../data/scenes'

const LINE_STATIONS = {
  piccadilly: ['Heathrow T5', 'Hatton Cross', 'Hounslow West', 'Osterley', 'Boston Manor', 'South Ealing', 'Acton Town', 'Hammersmith', 'Barons Court', 'Earls Court', 'South Kensington', 'Knightsbridge', 'Hyde Park Corner', 'Green Park', 'Piccadilly Circus', 'Leicester Square', 'Covent Garden', 'Holborn', 'Russell Square', 'King\'s Cross'],
  central:    ['Liverpool Street', 'Bethnal Green', 'Mile End', 'Bow Road', 'Stratford'],
  overground: ['Liverpool Street', 'Shoreditch High St'],
}

const LINE_COLORS = {
  piccadilly: '#0019A8',
  central:    '#E32017',
  overground: '#EF7B10',
}

export default function TubeRide({ destinationId, onArrived }) {
  const scene = SCENES[destinationId]
  const lineName = scene?.tubeLine || 'central'
  const destination = scene?.tubeStation || 'Unknown'
  const lineColor = LINE_COLORS[lineName] || '#E32017'
  const stations = LINE_STATIONS[lineName] || [destination]

  const audio = useAmbientAudio('tube')
  const [currentStation, setCurrentStation] = useState(null)
  const [arrived, setArrived] = useState(false)
  const [tunnelFlash, setTunnelFlash] = useState(false)
  const [sway, setSway] = useState(0)

  // Sway animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSway(Math.sin(Date.now() / 400) * 3)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    audio.start()

    // Station sequence — show 2-3 intermediate stops then destination
    const stopsBeforeDest = stations.filter(s => s !== destination).slice(0, 3)
    const sequence = [...stopsBeforeDest, destination]
    let t = 1200

    sequence.forEach((station, i) => {
      setTimeout(() => {
        setCurrentStation(station)
        setTunnelFlash(true)
        setTimeout(() => setTunnelFlash(false), 180)

        if (station === destination) {
          setTimeout(() => {
            setArrived(true)
            audio.stop()
            setTimeout(onArrived, 1400)
          }, 1200)
        }
      }, t)
      t += i < sequence.length - 2 ? 900 : 1600
    })

    return () => audio.stop()
  }, [destinationId])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0804',
      overflow: 'hidden', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Carriage background image */}
      <img
        src="/assets/scenes/tube_carriage.png"
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          transform: `rotate(${sway * 0.15}deg) translateX(${sway}px)`,
          transition: 'transform 0.08s ease',
        }}
      />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        pointerEvents: 'none',
      }} />

      {/* Tunnel flash when passing stations */}
      <div style={{
        position: 'absolute', inset: 0,
        background: tunnelFlash ? 'rgba(255,255,220,0.08)' : 'transparent',
        transition: 'background 0.08s',
        pointerEvents: 'none',
      }} />

      {/* LED destination board — at top, like real tube */}
      <div style={{
        position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
        background: '#0a0a0a', border: '1px solid #222',
        borderRadius: 6, padding: '8px 20px',
        boxShadow: '0 0 20px rgba(0,0,0,0.8), inset 0 0 8px rgba(0,0,0,0.5)',
        minWidth: 260, textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: lineColor, boxShadow: `0 0 8px ${lineColor}` }} />
          <span style={{ color: '#e0ddd0', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.6 }}>
            {lineName} line
          </span>
        </div>
        <div style={{
          color: arrived ? '#00ff88' : '#FFD700',
          fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: 2,
          textShadow: `0 0 8px ${arrived ? '#00ff88' : '#FFD700'}`,
          transition: 'color 0.3s',
        }}>
          {arrived ? '● ARRIVED' : currentStation || destination}
        </div>
        {!arrived && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 1, marginTop: 2 }}>
            next station
          </div>
        )}
      </div>

      {/* Line progress bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'rgba(255,255,255,0.06)',
      }}>
        <div style={{
          height: '100%', background: lineColor,
          boxShadow: `0 0 8px ${lineColor}`,
          width: arrived ? '100%' : currentStation ? `${(stations.indexOf(currentStation) + 1) / stations.length * 100}%` : '0%',
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
        padding: '40px 24px 32px',
        textAlign: 'center',
      }}>
        <div style={{
          color: '#F5F0E8', fontFamily: "'Playfair Display', serif",
          fontSize: 22, fontWeight: 600, marginBottom: 4,
          opacity: arrived ? 1 : 0.5,
          transition: 'opacity 0.5s',
        }}>
          {arrived ? `Welcome to ${destination}` : `Travelling to ${destination}`}
        </div>
        <div style={{ color: 'rgba(200,164,90,0.5)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
          {arrived ? 'Doors opening' : 'Mind the gap'}
        </div>
      </div>
    </div>
  )
}
