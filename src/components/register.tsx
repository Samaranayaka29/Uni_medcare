import { useState } from 'react'
import type { FormEvent } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import './register.css'
import doctorImage from '../assets/doctor-img1.jpeg'
import { auth } from '../firebase'

type RegisterForm = {
	firstName: string
	lastName: string
	studentId: string
	faculty: string
	age: string
	email: string
	phone: string
	password: string
	confirmPassword: string
	agree: boolean
}

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>

const initialForm: RegisterForm = {
	firstName: '',
	lastName: '',
	studentId: '',
	faculty: '',
	age: '',
	email: '',
	phone: '',
	password: '',
	confirmPassword: '',
	agree: false,
}

const studentEmailPattern = /^[a-zA-Z0-9._%+-]+@(?:students\.[a-zA-Z0-9-]+\.edu|(?:[a-zA-Z0-9-]+\.)*ac\.lk)$/i
const studentIdPattern = /^UG\d{6}$/

const getPasswordStrength = (password: string) => {
	if (!password) return { label: 'Not set', level: 0 }
	if (password.length < 8) return { label: 'Weak', level: 1 }

	const checks = [/[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)]
	const score = checks.filter(Boolean).length

	if (password.length >= 12 && score >= 3) {
		return { label: 'Strong', level: 3 }
	}

	if (score >= 2) {
		return { label: 'Good', level: 2 }
	}

	return { label: 'Weak', level: 1 }
}

const Register = () => {
	const navigate = useNavigate()
	const [form, setForm] = useState<RegisterForm>(initialForm)
	const [errors, setErrors] = useState<RegisterErrors>({})
	const [successMessage, setSuccessMessage] = useState('')
	const passwordStrength = getPasswordStrength(form.password)

	const handleRegister = async () => {
		try {
			const studentProfile = {
				firstName: form.firstName.trim(),
				lastName: form.lastName.trim(),
				studentId: form.studentId.trim(),
				faculty: form.faculty.trim(),
				email: form.email.trim(),
			}
			const registeredEmail = form.email.trim()
			let backendSyncError = ''
			const user = await createUserWithEmailAndPassword(auth, registeredEmail, form.password)

			try {
				const response = await fetch('/api/users', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						uid: user.user.uid,
						name: `${form.firstName} ${form.lastName}`.trim(),
						age: Number(form.age),
						email: registeredEmail,
						studentId: form.studentId,
						faculty: form.faculty,
						phone: form.phone,
					}),
				})

				if (!response.ok) {
					const data = (await response.json().catch(() => null)) as { error?: string } | null
					backendSyncError =
						typeof data?.error === 'string' && data.error.trim().length > 0
							? data.error
							: 'Account created, but profile sync to backend is temporarily unavailable.'
					console.warn('Backend profile sync failed:', backendSyncError)
				}
			} catch (syncError) {
				backendSyncError = 'Account created, but profile sync to backend is temporarily unavailable.'
				console.warn('Backend profile sync failed:', syncError)
			}

			console.log('User created:', user)
			setSuccessMessage('Registration successful. Redirecting to your dashboard...')
			setForm(initialForm)
			navigate('/dashboard', {
				state: {
					newlyRegistered: true,
					studentProfile,
					backendSyncError,
				},
			})
		} catch (error) {
			if (error instanceof Error) {
				console.log(error.message)
				setSuccessMessage(error.message)
				return
			}

			console.log('Registration failed.')
			setSuccessMessage('Registration failed.')
		}
	}

	const validateForm = (): RegisterErrors => {
		const nextErrors: RegisterErrors = {}

		if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.'
		if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.'
		if (!studentIdPattern.test(form.studentId.trim())) nextErrors.studentId = 'Student ID must look like UG123456.'
		if (!form.faculty.trim()) nextErrors.faculty = 'Faculty is required.'

		if (!/^\d{1,3}$/.test(form.age.trim()) || Number(form.age) < 16 || Number(form.age) > 100) {
			nextErrors.age = 'Age must be a number between 16 and 100.'
		}

		if (!studentEmailPattern.test(form.email.trim())) {
			nextErrors.email = 'Use a valid student email (for example, name@students.university.edu or name@std.foc.sab.ac.lk).'
		}

		if (!/^\+?[0-9]{10,15}$/.test(form.phone.trim())) {
			nextErrors.phone = 'Phone number should contain 10 to 15 digits.'
		}

		if (form.password.length < 8) {
			nextErrors.password = 'Password must be at least 8 characters.'
		}

		if (form.confirmPassword !== form.password) {
			nextErrors.confirmPassword = 'Passwords do not match.'
		}

		if (!form.agree) {
			nextErrors.agree = 'You must accept the student portal terms.'
		}

		return nextErrors
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const nextErrors = validateForm()
		setErrors(nextErrors)

		if (Object.keys(nextErrors).length === 0) {
			await handleRegister()
			return
		}

		setSuccessMessage('')
	}

	return (
		<div className="register-page">
			<div className="register-glow register-glow-left" aria-hidden="true" />
			<div className="register-glow register-glow-right" aria-hidden="true" />

			<div className="register-layout">
				<div className="register-image-panel" aria-hidden="true">
					<img src={doctorImage} alt="" />
					<div className="register-image-overlay" />
					<div className="register-image-content">
						<p className="register-badge">UNIMED STUDENT PORTAL</p>
						<h2>Join your campus health space</h2>
						<p>Book consultations, track records, and keep your medical profile updated from one secure place.</p>
						<ul className="register-feature-list">
							<li>Priority student appointment scheduling</li>
							<li>Secure access to health history</li>
							<li>Profile and emergency contact management</li>
						</ul>
					</div>
				</div>

				<div className="register-card">
					<div className="register-header">
						<p className="register-kicker">Create your account</p>
						<h1>Student registration</h1>
						<p>Set up your profile in less than a minute and start using the UniMed services dashboard.</p>
					</div>

					<form className="register-form" onSubmit={handleSubmit} noValidate>
						<div className="register-grid">
							<label>
								<span>First name</span>
								<input
									type="text"
									value={form.firstName}
									onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
									placeholder="Thathsarani"
								/>
								{errors.firstName && <small className="error-text">{errors.firstName}</small>}
							</label>

							<label>
								<span>Last name</span>
								<input
									type="text"
									value={form.lastName}
									onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
									placeholder="Silva"
								/>
								{errors.lastName && <small className="error-text">{errors.lastName}</small>}
							</label>

							<label>
								<span>Student ID</span>
								<input
									type="text"
									value={form.studentId}
									onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))}
									placeholder="UG123456"
								/>
								{errors.studentId && <small className="error-text">{errors.studentId}</small>}
							</label>

							<label>
								<span>Faculty / Department</span>
								<input
									type="text"
									value={form.faculty}
									onChange={(event) => setForm((prev) => ({ ...prev, faculty: event.target.value }))}
									placeholder="Faculty of Medicine"
								/>
								{errors.faculty && <small className="error-text">{errors.faculty}</small>}
							</label>

							<label>
								<span>Age</span>
								<input
									type="number"
									value={form.age}
									onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
									placeholder="22"
									min={16}
									max={100}
								/>
								{errors.age && <small className="error-text">{errors.age}</small>}
							</label>

							<label>
								<span>Student email</span>
								<input
									type="email"
									value={form.email}
									onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
									placeholder="name@students.university.edu"
								/>
								{errors.email && <small className="error-text">{errors.email}</small>}
							</label>

							<label>
								<span>Phone number</span>
								<input
									type="tel"
									value={form.phone}
									onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
									placeholder="+94771234567"
								/>
								{errors.phone && <small className="error-text">{errors.phone}</small>}
							</label>

							<label>
								<span>Password</span>
								<input
									type="password"
									value={form.password}
									onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
									placeholder="Minimum 8 characters"
								/>
								<div className="password-meter" aria-hidden="true">
									<span className={passwordStrength.level >= 1 ? 'active' : ''} />
									<span className={passwordStrength.level >= 2 ? 'active' : ''} />
									<span className={passwordStrength.level >= 3 ? 'active' : ''} />
								</div>
								<small className="password-hint">Strength: {passwordStrength.label}</small>
								{errors.password && <small className="error-text">{errors.password}</small>}
							</label>

							<label>
								<span>Confirm password</span>
								<input
									type="password"
									value={form.confirmPassword}
									onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
									placeholder="Re-enter password"
								/>
								{errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
								{!errors.confirmPassword && form.confirmPassword && form.confirmPassword !== form.password && (
									<small className="error-text">Passwords do not match.</small>
								)}
							</label>
						</div>

						<label className="terms-row">
							<input
								type="checkbox"
								checked={form.agree}
								onChange={(event) => setForm((prev) => ({ ...prev, agree: event.target.checked }))}
							/>
							<span>I confirm these details are correct and agree with UniMed portal terms and privacy guidelines.</span>
						</label>
						{errors.agree && <small className="error-text">{errors.agree}</small>}

						<button
							type="submit"
							className="register-button"
							disabled={!form.agree || form.password.length < 8 || form.confirmPassword !== form.password}
						>
							Create student account
						</button>

						{successMessage && <p className="success-text">{successMessage}</p>}

						<p className="register-login-link">
							Already registered? <Link to="/login">Sign in here</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Register
