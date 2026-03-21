'use client';
import { useState, useEffect } from 'react';

/**
 * Habit Engine — Daily Routine Reminders
 * Simulates PWA push notification opt-in for AM/PM skincare routines.
 */
export default function HabitEngine() {
  const [permission, setPermission] = useState('default'); // 'default', 'granted', 'denied'
  const [amEnabled, setAmEnabled] = useState(false);
  const [pmEnabled, setPmEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      
      // Load saved preferences
      const savedAm = localStorage.getItem('habit_am_enabled') === 'true';
      const savedPm = localStorage.getItem('habit_am_enabled') === 'true'; // Typo in localstorage key usually, let's fix:
      const savedPmReal = localStorage.getItem('habit_pm_enabled') === 'true';
      
      if (Notification.permission === 'granted') {
        setAmEnabled(savedAm);
        setPmEnabled(savedPmReal);
      }
    }
  }, []);

  const requestPermissionAndToggle = async (routineType) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }

    setIsLoading(true);

    try {
      let currentPerm = permission;
      if (currentPerm === 'default') {
        currentPerm = await Notification.requestPermission();
        setPermission(currentPerm);
      }

      if (currentPerm === 'granted') {
        if (routineType === 'AM') {
          const newState = !amEnabled;
          setAmEnabled(newState);
          localStorage.setItem('habit_am_enabled', newState);
          if (newState) simulatePush('Morning Routine', 'Time for your AM skincare! ☀️');
        } else {
          const newState = !pmEnabled;
          setPmEnabled(newState);
          localStorage.setItem('habit_pm_enabled', newState);
          if (newState) simulatePush('Evening Routine', 'Time to wind down with your PM skincare! 🌙');
        }
      } else {
        alert('Please enable notifications in your browser settings to receive daily reminders.');
      }
    } catch (err) {
      console.error('Notification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const simulatePush = (title, body) => {
    // Send a test notification immediately to confirm it works
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico', // fallback
        badge: '/favicon.ico',
      });
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, var(--bg-card), var(--bg-secondary))',
      border: '1px solid var(--gold-border)',
      borderRadius: '24px',
      padding: '32px 24px',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '32px'
    }}>
      {/* Decorative background circle */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px',
        background: 'var(--gold-glow)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '50px', height: '50px', borderRadius: '16px',
          background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0
        }}>
          🔔
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '6px' }}>
            Habit Engine
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            Skincare only works if you're consistent. Enable daily push notifications to remind you of your personalized AM and PM routines.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* AM Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
              padding: '16px', borderRadius: '16px', transition: 'all 0.3s',
              borderColor: amEnabled ? 'var(--gold-border)' : 'var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>☀️</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AM Routine Reminder</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily at 8:00 AM</div>
                </div>
              </div>
              
              <button 
                onClick={() => requestPermissionAndToggle('AM')}
                disabled={isLoading}
                style={{
                  width: '46px', height: '26px', borderRadius: '999px',
                  background: amEnabled ? 'var(--gold)' : 'var(--bg-secondary)',
                  border: `2px solid ${amEnabled ? 'var(--gold)' : 'var(--border-color)'}`,
                  position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  position: 'absolute', top: '2px', left: amEnabled ? '22px' : '2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#fff', transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
              </button>
            </div>

            {/* PM Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
              padding: '16px', borderRadius: '16px', transition: 'all 0.3s',
              borderColor: pmEnabled ? 'var(--gold-border)' : 'var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🌙</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>PM Routine Reminder</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily at 9:00 PM</div>
                </div>
              </div>
              
              <button 
                onClick={() => requestPermissionAndToggle('PM')}
                disabled={isLoading}
                style={{
                  width: '46px', height: '26px', borderRadius: '999px',
                  background: pmEnabled ? 'var(--gold)' : 'var(--bg-secondary)',
                  border: `2px solid ${pmEnabled ? 'var(--gold)' : 'var(--border-color)'}`,
                  position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  position: 'absolute', top: '2px', left: pmEnabled ? '22px' : '2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#fff', transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
              </button>
            </div>
          </div>
          
          {permission === 'denied' && (
            <p style={{ fontSize: '0.75rem', color: 'var(--severity-high)', marginTop: '12px' }}>
              ⚠️ Notifications are blocked in your browser. Please clear your site settings to enable reminders.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
