import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../Login.css'
import doctorImage from '../../assets/doctor-img1.jpeg'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const AdminLoginIcon = ({ name, className }) => {
	switch (name) {
		case 'brandPlus':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
				</svg>
			)
		case 'shield':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<path d="M12 3.8 18.5 6v5.8c0 4.1-2.6 7.4-6.5 8.5-3.9-1.1-6.5-4.4-6.5-8.5V6L12 3.8Z" fill="currentColor" />
					<path d="M12 8v8.1M8.8 11.6h6.4" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
				</svg>
			)
		case 'mail':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<path d="M4 7.2h16v9.6H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
					<path d="m4.8 8 7.2 5.6L19.2 8" fill="none" stroke="currentColor" strokeWidth="1.8" />
				</svg>
			)
		case 'lock':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<rect x="5.5" y="10.2" width="13" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
					<path d="M8.3 10.2V8.5a3.7 3.7 0 0 1 7.4 0v1.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
				</svg>
			)
		case 'arrow':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<path d="M6 12h11.5M13.8 7.8 18 12l-4.2 4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			)
		default:
			return null
	}
}

const AdminLogin = () => {
	const navigate = useNavigate()
	const hasCheckedSession = useRef(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (hasCheckedSession.current) {
			return
		}

		hasCheckedSession.current = true

		const checkCurrentSession = async () => {
			const token = localStorage.getItem('adminToken')

			if (!token) {
				return
			}

			try {
				const response = await fetch(`${API_URL}/api/admin/me`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				})

				if (response.ok) {
					navigate('/admin/dashboard', { replace: true })
				} else {
					localStorage.removeItem('adminToken')
				}
			} catch (error) {
				console.error('Error checking admin session:', error)
				localStorage.removeItem('adminToken')
			}
		}

		void checkCurrentSession()
	}, [navigate])

	const handleSubmit = async (event) => {
		event.preventDefault()
		setIsLoading(true)
		setMessage('')

		try {
			const response = await fetch(`${API_URL}/api/admin/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (response.ok) {
				localStorage.setItem('adminToken', data.token)
				setMessage('Admin login successful.')
				navigate('/admin/dashboard', { replace: true })
			} else {
				setMessage(data.error || 'Login failed.')
			}
		} catch (error) {
			if (error instanceof Error) {
				setMessage(error.message)
			} else {
				setMessage('Login failed.')
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="login-page">
			<div className="login-glow login-glow-left" aria-hidden="true" />
			<div className="login-glow login-glow-right" aria-hidden="true" />

			<header className="topbar">
				<Link className="brand" to="/admin/login" aria-label="UniMed Admin Home">
					<AdminLoginIcon name="brandPlus" className="brand-plus" />
					<span>UniMed Admin</span>
				</Link>
			</header>

			<main className="portal-shell">
				<div className="login-layout">
					<div className="login-image-panel" aria-hidden="true">
						<img src={doctorImage} alt="" />
						<div className="login-image-overlay" />
						<div className="login-image-copy">
							<p className="image-chip">ADMIN ACCESS ONLY</p>
							<h2>Secure access for system administrators</h2>
							<p>Sign in to manage users, doctors, appointments, records, and reports from one control center.</p>
							<ul>
								<li>Role-verified admin sign-in</li>
								<li>Centralized system controls</li>
								<li>Protected operational dashboard</li>
							</ul>
						</div>
					</div>

					<div className="login-content">
						<section className="login-card" aria-labelledby="admin-portal-title">
							<div className="shield-badge" aria-hidden="true">
								<AdminLoginIcon name="shield" className="shield-icon" />
							</div>

							<h1 id="admin-portal-title">Admin Login</h1>
							<p className="portal-subtitle">Use an admin-approved account to continue to the management dashboard.</p>

							<form className="login-form" onSubmit={handleSubmit}>
								<label className="field-label" htmlFor="admin-email">
									EMAIL ADDRESS
								</label>
								<div className="input-wrap">
									<AdminLoginIcon name="mail" className="input-icon" />
									<input
										id="admin-email"
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="admin@unimedcare.com"
										autoComplete="email"
										disabled={isLoading}
									/>
								</div>

								<div className="password-row">
									<label className="field-label" htmlFor="admin-password">
										PASSWORD
									</label>
									<Link className="forgot-link" to="/login">
										Student login
									</Link>
								</div>
								<div className="input-wrap">
									<AdminLoginIcon name="lock" className="input-icon" />
									<input
										id="admin-password"
										type="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										autoComplete="current-password"
										disabled={isLoading}
									/>
								</div>

								<button className="login-button" type="submit" disabled={isLoading}>
									{isLoading ? 'Signing in...' : 'Sign in to admin'}
									<AdminLoginIcon name="arrow" className="arrow-icon" />
								</button>

								{message && <p className="auth-switch-text">{message}</p>}
							</form>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}

export default AdminLogin