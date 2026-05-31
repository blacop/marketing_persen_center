import { useState } from 'react'
import { User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (username === 'Admin' && password === '123456') {
        localStorage.setItem('isLoggedIn', 'true')
        onLogin()
      } else {
        setError('用户名或密码错误')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Sparkles size={32} color="white" />
          </div>
          <h1>玛丽黛佳</h1>
          <p>美妆智能投流中心</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <User size={18} className="login-field-icon" />
            <input
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="login-field">
            <Lock size={18} className="login-field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              '登 录'
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>36 AI Agents · 国内美妆智能投流</span>
        </div>
      </div>
    </div>
  )
}
