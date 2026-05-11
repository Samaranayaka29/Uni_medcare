import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import './adminSettings.css'
import AdminNavigation from './adminNavigation'

type SystemSetting = {
  id: string
  label: string
  value: string
  type: 'text' | 'toggle' | 'select'
  options?: string[]
}

const AdminSettings = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const checkAdminAndLoadSettings = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          navigate('/login')
          return
        }

        const idTokenResult = await user.getIdTokenResult()
        const isAdminUser =
          idTokenResult.claims.admin === true || user.email === 'admin@unimedcare.com'

        if (!isAdminUser) {
          navigate('/dashboard')
          return
        }

        // Mock settings data
        const mockSettings: SystemSetting[] = [
          {
            id: 's1',
            label: 'Hospital Name',
            value: 'Uni Medical Care Center',
            type: 'text',
          },
          {
            id: 's2',
            label: 'Emergency Maintenance',
            value: 'false',
            type: 'toggle',
          },
          {
            id: 's3',
            label: 'Maximum Daily Appointments',
            value: '100',
            type: 'text',
          },
          {
            id: 's4',
            label: 'System Theme',
            value: 'light',
            type: 'select',
            options: ['light', 'dark', 'auto'],
          },
          {
            id: 's5',
            label: 'Enable Email Notifications',
            value: 'true',
            type: 'toggle',
          },
          {
            id: 's6',
            label: 'Support Email',
            value: 'support@unimedcare.com',
            type: 'text',
          },
        ]

        setSettings(mockSettings)
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndLoadSettings()
  }, [navigate])

  const handleSettingChange = (id: string, newValue: string) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, value: newValue } : s)))
    setHasChanges(true)
  }

  const handleSaveSettings = () => {
    setSaveMessage('Saving settings...')
    setTimeout(() => {
      setSaveMessage('✓ Settings saved successfully!')
      setHasChanges(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="admin-settings-container">
        <AdminNavigation />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-settings-container">
      <AdminNavigation />

      <div className="admin-content">
        <div className="page-header">
          <h1>System Settings</h1>
          <p>Manage system configuration and preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="settings-sections">
          {/* General Settings */}
          <div className="settings-section">
            <h2>General Settings</h2>
            <div className="settings-group">
              {settings
                .slice(0, 3)
                .map((setting) => (
                  <div key={setting.id} className="setting-item">
                    <label className="setting-label">{setting.label}</label>
                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="setting-input"
                      />
                    )}
                    {setting.type === 'toggle' && (
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={setting.value === 'true'}
                          onChange={(e) =>
                            handleSettingChange(setting.id, e.target.checked ? 'true' : 'false')
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h2>Notification Settings</h2>
            <div className="settings-group">
              {settings
                .slice(3, 5)
                .map((setting) => (
                  <div key={setting.id} className="setting-item">
                    <label className="setting-label">{setting.label}</label>
                    {setting.type === 'select' && (
                      <select
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="setting-select"
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                    {setting.type === 'toggle' && (
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={setting.value === 'true'}
                          onChange={(e) =>
                            handleSettingChange(setting.id, e.target.checked ? 'true' : 'false')
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Contact Settings */}
          <div className="settings-section">
            <h2>Contact Settings</h2>
            <div className="settings-group">
              {settings
                .slice(5)
                .map((setting) => (
                  <div key={setting.id} className="setting-item">
                    <label className="setting-label">{setting.label}</label>
                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="setting-input"
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section danger-zone">
            <h2>⚠️ Danger Zone</h2>
            <div className="danger-actions">
              <button className="btn-danger">Clear Cache</button>
              <button className="btn-danger">Reset to Defaults</button>
              <button className="btn-danger critical">Delete All Logs</button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {saveMessage && <p className="save-message">{saveMessage}</p>}
          <button
            className="btn-cancel"
            onClick={() => {
              setHasChanges(false)
              setSaveMessage('')
            }}
          >
            Discard Changes
          </button>
          <button
            className="btn-save"
            onClick={handleSaveSettings}
            disabled={!hasChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
