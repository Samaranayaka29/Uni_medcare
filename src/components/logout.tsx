import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './logout.css'

const Logout = () => {
	const navigate = useNavigate()
	const [countdown, setCountdown] = useState(5)
	const [darkMode, setDarkMode] = useState(false)

	const userName = 'Ayodya'
	const lastLogin = new Date().toLocaleString()

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					window.clearInterval(intervalId)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		const timeoutId = window.setTimeout(() => {
			navigate('/login', { replace: true })
		}, 5000)

		return () => {
			window.clearInterval(intervalId)
			window.clearTimeout(timeoutId)
		}
	}, [navigate])

	return (
		<div className={`logout-page ${darkMode ? 'dark' : ''}`}>
			<main className="logout-card" role="status" aria-live="polite">
				<div className="logout-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="9" />
						<path d="m8.2 12.4 2.5 2.5 5.2-5.2" />
					</svg>
				</div>

				<h1>Logged Out Successfully</h1>
				<p className="primary-message">You have been logged out successfully.</p>
				<p className="goodbye-message">Goodbye, {userName}.</p>

				<div className="meta-row">
					<span>Last login: {lastLogin}</span>
				</div>

				<p className="redirect-message">Redirecting in {countdown} seconds...</p>

				<div className="action-row">
					<button type="button" className="btn-primary" onClick={() => navigate('/login')}>
						Login Again
					</button>
					<button type="button" className="btn-secondary" onClick={() => navigate('/')}>
						Go to Home
					</button>
				</div>

				<div className="action-row secondary">
					<button type="button" className="btn-tertiary" onClick={() => setDarkMode((prev) => !prev)}>
						{darkMode ? 'Light Mode' : 'Dark Mode'}
					</button>
					<Link to="/login" className="link-button">
						Report Issue
					</Link>
				</div>

				<p className="security-note">
					For your security, please close the browser if using a shared device.
				</p>
			</main>
		</div>
	)
}

export default Logout
