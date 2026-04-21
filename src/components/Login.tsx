import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import './Login.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import doctorImage from '../assets/doctor-img1.jpeg'
import { auth } from '../firebase'

type IconName = 'brandPlus' | 'help' | 'shield' | 'mail' | 'lock' | 'arrow' | 'dotShield'

type LoginIconProps = {
	name: IconName
	className?: string
}

type LoginPrefillState = {
	prefillEmail?: string
	prefillPassword?: string
	autoSignIn?: boolean
}

const LoginIcon = ({ name, className }: LoginIconProps) => {
	switch (name) {
		case 'brandPlus':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
				</svg>
			)
		case 'help':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
					<path d="M9.5 9.2a2.7 2.7 0 0 1 5 1.3c0 1.6-1.9 2.1-2.5 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
					<circle cx="12" cy="16.7" r="1" fill="currentColor" />
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
		case 'dotShield':
			return (
				<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
					<path d="M12 4.3 17.8 6v5.2c0 3.4-2.2 6.1-5.8 7-3.6-.9-5.8-3.6-5.8-7V6L12 4.3Z" fill="currentColor" />
				</svg>
			)
		default:
			return null
	}
}

const Login = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const hasAutoSignInRun = useRef(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loginMessage, setLoginMessage] = useState('')

	useEffect(() => {
		const state = location.state as LoginPrefillState | null

		if (!state) {
			return
		}

		const nextEmail = state.prefillEmail?.trim() ?? ''
		const nextPassword = state.prefillPassword ?? ''

		if (nextEmail) {
			setEmail(nextEmail)
		}

		if (nextPassword) {
			setPassword(nextPassword)
		}

		if (!state.autoSignIn || !nextEmail || !nextPassword || hasAutoSignInRun.current) {
			return
		}

		hasAutoSignInRun.current = true
		setLoginMessage('Signing in with your new account...')

		void signInWithEmailAndPassword(auth, nextEmail, nextPassword)
			.then(() => {
				setLoginMessage('Login successful.')
				navigate('/dashboard', { replace: true })
			})
			.catch((error: unknown) => {
				if (error instanceof Error) {
					setLoginMessage(error.message)
					console.log(error.message)
					return
				}

				setLoginMessage('Login failed.')
				console.log('Login failed.')
			})
	}, [location.state, navigate])

	const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		try {
			await signInWithEmailAndPassword(auth, email, password)
			setLoginMessage('Login successful.')
			navigate('/dashboard')
		} catch (error) {
			if (error instanceof Error) {
				setLoginMessage(error.message)
				console.log(error.message)
				return
			}
			setLoginMessage('Login failed.')
			console.log('Login failed.')
		}
	}

	return (
		<div className="login-page">
			<div className="login-glow login-glow-left" aria-hidden="true" />
			<div className="login-glow login-glow-right" aria-hidden="true" />

			<header className="topbar">
				<Link className="brand" to="/login" aria-label="UniMed Center Home">
					<LoginIcon name="brandPlus" className="brand-plus" />
					<span>UniMed Center</span>
				</Link>
				<button className="help-button" type="button" aria-label="Help">
					<LoginIcon name="help" className="help-icon" />
				</button>
			</header>

			<main className="portal-shell">
				<div className="login-layout">
					<div className="login-image-panel" aria-hidden="true">
						<img src={doctorImage} alt="" />
						<div className="login-image-overlay" />
						<div className="login-image-copy">
							<p className="image-chip">SECURE STUDENT HEALTH ACCESS</p>
							<h2>Welcome back to your care portal</h2>
							<p>Sign in to manage appointments, records, and personal medical updates in one protected dashboard.</p>
							<ul>
								<li>Real-time appointment tracking</li>
								<li>Encrypted health document access</li>
								<li>Instant profile and emergency updates</li>
							</ul>
						</div>
					</div>

					<div className="login-content">
						<section className="login-card" aria-labelledby="portal-title">
							<div className="shield-badge" aria-hidden="true">
								<LoginIcon name="shield" className="shield-icon" />
							</div>

							<h1 id="portal-title">Student Login</h1>
							<p className="portal-subtitle">Access your UniMed dashboard and continue your healthcare journey.</p>

							<form className="login-form" onSubmit={handleLogin}>
								<label className="field-label" htmlFor="email">
									EMAIL ADDRESS
								</label>
								<div className="input-wrap">
									<LoginIcon name="mail" className="input-icon" />
									<input
										id="email"
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="name@students.university.edu"
										autoComplete="email"
									/>
								</div>

								<div className="password-row">
									<label className="field-label" htmlFor="password">
										PASSWORD
									</label>
									<a href="#" className="forgot-link">
										Forgot Password?
									</a>
								</div>
								<div className="input-wrap">
									<LoginIcon name="lock" className="input-icon" />
									<input
										id="password"
										type="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										autoComplete="current-password"
									/>
								</div>

								<label className="remember-row" htmlFor="remember">
									<input id="remember" type="checkbox" />
									<span>Keep me logged in for this session</span>
								</label>

								<button className="login-button" type="submit">
									Sign in securely
									<LoginIcon name="arrow" className="arrow-icon" />
								</button>

								<p className="auth-switch-text">
									New university student?{' '}
									<Link className="auth-switch-link" to="/register">
										Create account
									</Link>
								</p>

								{loginMessage && <p className="auth-switch-text">{loginMessage}</p>}
							</form>

							<div className="system-status">
								<span className="status-dot" aria-hidden="true"></span>
								<span>SYSTEM STATUS: ALL SERVICES ACTIVE</span>
							</div>
						</section>

						<div className="compliance-row" aria-label="Compliance badges">
							<span>
								<LoginIcon name="dotShield" className="compliance-icon" />
								HIPAA COMPLIANT
							</span>
							<span>
								<LoginIcon name="dotShield" className="compliance-icon" />
								AES-256 BIT ENCRYPTION
							</span>
						</div>
					</div>
				</div>
			</main>

			<footer className="page-footer">
				<small>Copyright 2026 UniMed Center. All rights reserved.</small>
				<nav aria-label="Footer links">
					<a href="#">Privacy Policy</a>
					<a href="#">Terms of Service</a>
					<a href="#">Security Standards</a>
					<a href="#">Support</a>
				</nav>
			</footer>
		</div>
	)
}

export default Login