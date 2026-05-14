import React, { useState, useCallback, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import CharacterCreate from './components/CharacterCreate'
import CinematicIntro from './components/CinematicIntro'
import LondonMap from './components/LondonMap'
import TubeRide from './components/TubeRide'
import ConversationScene from './components/ConversationScene'
import Debrief from './components/Debrief'
import BillyPhone from './components/BillyPhone'
import SlangBank from './components/SlangBank'
import { SCENES, SCENE_ORDER } from './data/scenes'
import { useGameStore, getProfile, saveProfile } from './store/gameStore'

const VIEW = {
  SPLASH: 'splash',
  CHARACTER_CREATE: 'character_create',
  CINEMATIC: 'cinematic',
  MAP: 'map',
  TUBE_RIDE: 'tube_ride',
  SCENE: 'scene',
  DEBRIEF: 'debrief',
}

function isFirstVisit() {
  return !localStorage.getItem('am_visited')
}

function hasSeenCinematic() {
  return !!localStorage.getItem('am_cinematic_done')
}

function formatBillyTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [view, setView] = useState(() => {
    const profile = getProfile()
    if (!profile) return VIEW.SPLASH
    return VIEW.MAP
  })
  const [playerProfile, setPlayerProfile] = useState(() => getProfile())
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [billyPhoneOpen, setBillyPhoneOpen] = useState(false)
  const [billyMessages, setBillyMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('am_billy_messages') || '[]') } catch { return [] }
  })
  const [showSlangBank, setShowSlangBank] = useState(false)

  const { xp, streak, streakShields, unlockedScenes, slangBank, addXP, updateStreak, unlockScene, addToSlangBank } = useGameStore()

  // Save Billy messages to localStorage
  const addBillyMessage = useCallback((text, sceneId) => {
    setBillyMessages(prev => {
      const id = `billy_${sceneId}_${Date.now()}`
      // Don't add duplicates for the same scene trigger
      if (prev.some(m => m.sceneId === sceneId)) return prev
      const next = [...prev, { id, text, sceneId, timestamp: formatBillyTime() }]
      localStorage.setItem('am_billy_messages', JSON.stringify(next))
      return next
    })
  }, [])

  // Handle first visit flow
  const handleSplashEnter = () => {
    setView(VIEW.CHARACTER_CREATE)
  }

  const handleProfileComplete = (profile) => {
    setPlayerProfile(profile)
    saveProfile(profile)
    localStorage.setItem('am_visited', '1')
    if (!hasSeenCinematic()) {
      setView(VIEW.CINEMATIC)
    } else {
      setView(VIEW.MAP)
    }
  }

  const handleCinematicComplete = () => {
    localStorage.setItem('am_cinematic_done', '1')
    setView(VIEW.MAP)
  }

  const handleSelectScene = (sceneId) => {
    setActiveSceneId(sceneId)
    setConversationHistory([])
    setView(VIEW.TUBE_RIDE)
  }

  const handleTubeArrived = () => {
    setView(VIEW.SCENE)
  }

  const handleSceneEnd = (history) => {
    setConversationHistory(history)
    setView(VIEW.DEBRIEF)
  }

  const handleSceneExit = () => {
    setActiveSceneId(null)
    setView(VIEW.MAP)
  }

  const handleAddXP = useCallback((amount) => {
    addXP(amount)
    updateStreak()
    // Check if any new scenes unlock
    const newTotal = xp + amount
    if (newTotal >= 60 && !unlockedScenes.includes('caff_morning')) unlockScene('caff_morning')
    if (newTotal >= 120 && !unlockedScenes.includes('south_bank')) unlockScene('south_bank')
    if (newTotal >= 180 && !unlockedScenes.includes('crown_pub')) unlockScene('crown_pub')
    if (newTotal >= 200 && !unlockedScenes.includes('kings_cross')) unlockScene('kings_cross')
    if (newTotal >= 280 && !unlockedScenes.includes('notting_hill')) unlockScene('notting_hill')
    if (newTotal >= 360 && !unlockedScenes.includes('camden_market')) unlockScene('camden_market')
  }, [addXP, updateStreak, xp, unlockedScenes, unlockScene])

  const handleDebriefContinue = useCallback(() => {
    const scene = SCENES[activeSceneId]
    if (scene?.billyMessageAfter) {
      addBillyMessage(scene.billyMessageAfter, activeSceneId)
    }
    // Add new slang from this session (the debrief already calls addToSlangBank indirectly via scoring)
    setActiveSceneId(null)
    setConversationHistory([])
    setView(VIEW.MAP)
  }, [activeSceneId, addBillyMessage])

  const handleNextScene = useCallback(() => {
    const scene = SCENES[activeSceneId]
    if (scene?.billyMessageAfter) addBillyMessage(scene.billyMessageAfter, activeSceneId)
    const currentIndex = SCENE_ORDER.indexOf(activeSceneId)
    const nextId = SCENE_ORDER[currentIndex + 1]
    setConversationHistory([])
    if (nextId) {
      setActiveSceneId(nextId)
      setView(VIEW.TUBE_RIDE)
    } else {
      setActiveSceneId(null)
      setView(VIEW.MAP)
    }
  }, [activeSceneId, addBillyMessage])

  // Show Billy phone notification after 2s when a new message arrives
  useEffect(() => {
    const readIds = new Set(JSON.parse(localStorage.getItem('am_billy_read') || '[]'))
    const hasUnread = billyMessages.some(m => !readIds.has(m.id))
    if (hasUnread && view === VIEW.MAP) {
      const t = setTimeout(() => {
        // Gentle buzz — don't auto-open, just let the badge show
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [billyMessages, view])

  const activeScene = activeSceneId ? SCENES[activeSceneId] : null

  return (
    <>
      {view === VIEW.SPLASH && (
        <SplashScreen onEnter={handleSplashEnter} />
      )}

      {view === VIEW.CHARACTER_CREATE && (
        <CharacterCreate onComplete={handleProfileComplete} />
      )}

      {view === VIEW.CINEMATIC && (
        <CinematicIntro
          playerName={playerProfile?.name}
          onComplete={handleCinematicComplete}
        />
      )}

      {view === VIEW.MAP && (
        <>
          <LondonMap
            xp={xp}
            streak={streak}
            streakShields={streakShields}
            unlockedScenes={unlockedScenes}
            onSelectScene={handleSelectScene}
            onOpenSlangBank={() => setShowSlangBank(true)}
          />
          <BillyPhone
            messages={billyMessages}
            isOpen={billyPhoneOpen}
            onOpen={() => setBillyPhoneOpen(true)}
            onClose={() => setBillyPhoneOpen(false)}
          />
          {showSlangBank && (
            <SlangBank
              slangBank={slangBank}
              onClose={() => setShowSlangBank(false)}
            />
          )}
        </>
      )}

      {view === VIEW.TUBE_RIDE && activeSceneId && (
        <TubeRide
          destinationId={activeSceneId}
          onArrived={handleTubeArrived}
        />
      )}

      {view === VIEW.SCENE && activeScene && (
        <ConversationScene
          scene={activeScene}
          playerProfile={playerProfile}
          xp={xp}
          streak={streak}
          streakShields={streakShields}
          onEnd={handleSceneEnd}
          onExit={handleSceneExit}
        />
      )}

      {view === VIEW.DEBRIEF && activeScene && (() => {
        const currentIndex = SCENE_ORDER.indexOf(activeSceneId)
        const nextId = SCENE_ORDER[currentIndex + 1]
        return (
          <Debrief
            scene={activeScene}
            history={conversationHistory}
            playerProfile={playerProfile}
            onContinue={handleDebriefContinue}
            onNextScene={handleNextScene}
            nextSceneId={nextId || null}
            onAddXP={handleAddXP}
          />
        )
      })()}
    </>
  )
}
