import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import doctorHero from '../../assets/blood-pressure-and-your-heart-header.jpg'
import galleryRoom from '../../assets/hospital rooms.avif'
import galleryDoctors from '../../assets/2d echo test (1).webp'
import galleryEquipment from '../../assets/lab.jpg'
import galleryEvents from '../../assets/Vaccination Programs.jpg'
import serviceConsultation from '../../assets/img2home.webp'
import serviceEmergency from '../../assets/blood-pressure-and-your-heart-header.jpg'
import serviceLab from '../../assets/lab.jpg'
import servicePharmacy from '../../assets/Pharmacy.png'
import serviceMentalHealth from '../../assets/mentalhealth.png'
import aboutMainImage from '../../assets/img2home.webp'
import healthTipHydration from '../../assets/Stay Hydrated.jpg'
import healthTipSleep from '../../assets/Prioritize Sleep.avif'
import healthTipCheckup from '../../assets/Book Regular Checkups.jpg'
import healthTipstretch from '../../assets/Take Stretch Breaks.jpg'
import healthTipEat from '../../assets/Eat Smart Snacks.webp'
import campusMap from '../../assets/map.webp'
import { doctorProfiles } from '../doctorData'
import './home.css'

type Service = {
	icon: string
	title: string
	description: string
	image: string
	imageAlt: string
}

type Testimonial = {
	quote: string
	author: string
	role: string
	tag: string
	rating: number
	avatar: string
	avatarAlt: string
	supportImage: string
	supportImageAlt: string
}

type HealthTip = {
	title: string
	description: string
	category: string
	frequency: string
	image: string
	imageAlt: string
}

type GalleryItem = {
	title: string
	description: string
	category: string
	image: string
	imageAlt: string
}

const services: Service[] = [
	{
		icon: 'GC',
		title: 'General Consultation',
		description: 'Primary care checkups, diagnosis, and personalized treatment plans.',
		image: serviceConsultation,
		imageAlt: 'Doctor discussing treatment options with a patient',
	},
	{
		icon: 'EC',
		title: 'Emergency Care',
		description: 'Rapid response medical support available every hour of the day.',
		image: serviceEmergency,
		imageAlt: 'Emergency care team monitoring a patient closely',
	},
	{
		icon: 'LS',
		title: 'Laboratory Services',
		description: 'Accurate tests with modern diagnostic tools for fast results.',
		image: serviceLab,
		imageAlt: 'Laboratory workspace with medical sample equipment',
	},
	{
		icon: 'PH',
		title: 'Pharmacy',
		description: 'Safe and reliable medicine dispensing with usage guidance.',
		image: servicePharmacy,
		imageAlt: 'Pharmacy section with medication shelves and support desk',
	},
	{
		icon: 'MH',
		title: 'Mental Health Support',
		description: 'Confidential counseling and wellness care for student wellbeing.',
		image: serviceMentalHealth,
		imageAlt: 'Counseling session focused on mental wellness support',
	},
]

const testimonials: Testimonial[] = [
	{
		quote: 'Very fast service and friendly doctors. Booking was simple and quick.',
		author: 'Engineering Faculty Student',
		role: 'Faculty of Engineering',
		tag: 'Fast Appointment Flow',
		rating: 5,
		avatar: doctorProfiles[0].image,
		avatarAlt: 'Portrait of engineering faculty student',
		supportImage: galleryEquipment,
		supportImageAlt: 'Medical laboratory equipment used for diagnostics',
	},
	{
		quote: 'The staff explained everything clearly and helped me feel comfortable.',
		author: 'Science Faculty Student',
		role: 'Faculty of Science',
		tag: 'Supportive Doctors',
		rating: 5,
		avatar: doctorProfiles[1].image,
		avatarAlt: 'Portrait of science faculty student',
		supportImage: galleryEvents,
		supportImageAlt: 'Campus health awareness event at the medical center',
	},
	{
		quote: 'The appointment system is well organized and the doctors explained reports very clearly.',
		author: 'Management Faculty Student',
		role: 'Faculty of Management',
		tag: 'Clear Guidance',
		rating: 5,
		avatar: doctorProfiles[2].image,
		avatarAlt: 'Portrait of management faculty student',
		supportImage: galleryRoom,
		supportImageAlt: 'Comfortable medical consultation room',
	},
	{
		quote: 'Service was quick and professional. I got my lab results and follow-up advice on time.',
		author: 'Surveying Faculty Student',
		role: 'Faculty of Surveying',
		tag: 'Fast Lab Process',
		rating: 5,
		avatar: doctorProfiles[3].image,
		avatarAlt: 'Portrait of surveying faculty student',
		supportImage: galleryEquipment,
		supportImageAlt: 'Laboratory diagnostics and testing equipment',
	},
	{
		quote: 'As a technology student, I appreciated the smooth digital booking and excellent doctor support.',
		author: 'Technology Faculty Student',
		role: 'Faculty of Technology',
		tag: 'Smart Digital Flow',
		rating: 5,
		avatar: doctorProfiles[4].image,
		avatarAlt: 'Portrait of technology faculty student',
		supportImage: galleryDoctors,
		supportImageAlt: 'Doctors collaborating with modern systems',
	},
	{
		quote: 'The team listened carefully, reduced my stress, and gave practical health advice for study life.',
		author: 'Social Science Student',
		role: 'Faculty of Social Science',
		tag: 'Friendly Care',
		rating: 5,
		avatar: doctorProfiles[1].image,
		avatarAlt: 'Portrait of social science faculty student',
		supportImage: serviceMentalHealth,
		supportImageAlt: 'Student counseling and mental wellness support area',
	},
]

const healthTips: HealthTip[] = [
	{
		title: 'Stay Hydrated',
		description: 'Carry a water bottle during lectures and keep drinking water throughout the day.',
		category: 'Daily Habit',
		frequency: 'Every 2-3 Hours',
		image: healthTipHydration,
		imageAlt: 'Hydration and wellness guidance at the medical center',
	},
	{
		title: 'Prioritize Sleep',
		description: 'Sleep at least 7 hours before exams to improve focus, memory, and energy levels.',
		category: 'Recovery',
		frequency: '7+ Hours/Night',
		image: healthTipSleep,
		imageAlt: 'Mental wellness and healthy sleep support visual',
	},
	{
		title: 'Book Regular Checkups',
		description: 'Visit the medical center for preventive checkups even when you feel healthy.',
		category: 'Prevention',
		frequency: 'Every 6 Months',
		image: healthTipCheckup,
		imageAlt: 'Preventive medical checkup and lab screening environment',
	},
	{
		title: 'Take Stretch Breaks',
		description: 'Stand up and stretch for 2-3 minutes during long study sessions to reduce fatigue.',
		category: 'Movement',
		frequency: 'Every 60 Minutes',
		image: healthTipstretch,
		imageAlt: 'Stretch and movement guidance for students',
	},
	{
		title: 'Eat Smart Snacks',
		description: 'Choose nuts, fruit, or yogurt over sugary snacks for steady energy and concentration.',
		category: 'Nutrition',
		frequency: '2 Healthy Snacks/Day',
		image: healthTipEat,
		imageAlt: 'Healthy nutrition and medicine support at campus center',
	},
	{
		title: 'Manage Stress Early',
		description: 'Speak to counseling services when stress starts affecting sleep, mood, or studies.',
		category: 'Mental Wellbeing',
		frequency: 'Weekly Check-In',
		image: serviceMentalHealth,
		imageAlt: 'Mental wellbeing and counseling support at university medical center',
	},
]

const galleryItems: GalleryItem[] = [
	{
		title: 'Hospital Rooms',
		description: 'Clean, calm, and technology-enabled rooms designed for comfort and faster recovery.',
		category: 'Facilities',
		image: galleryRoom,
		imageAlt: 'Hospital room',
	},
	{
		title: 'Doctors Working',
		description: 'Experienced specialists using modern diagnostics to deliver accurate clinical decisions.',
		category: 'Teamwork',
		image: galleryDoctors,
		imageAlt: 'Doctors at work',
	},
	{
		title: 'Equipment',
		description: 'Advanced laboratory and medical devices that support precise testing and treatment.',
		category: 'Diagnostics',
		image: galleryEquipment,
		imageAlt: 'Medical equipment and laboratory',
	},
	{
		title: 'Events',
		description: 'Community health programs, screenings, and awareness activities across campus.',
		category: 'Community',
		image: galleryEvents,
		imageAlt: 'Campus health event',
	},
]

const Home = () => {
	const navigate = useNavigate()
	const navItems = [
		{ label: 'Home', id: 'home' },
		{ label: 'Services', id: 'services' },
		{ label: 'About Us', id: 'about' },
		{ label: 'Doctors', id: 'doctors' },
		{ label: 'Appointments', id: 'appointments' },
		{ label: 'Gallery', id: 'gallery' },
		{ label: 'Reviews', id: 'reviews' },
		{ label: 'Health Tips', id: 'health-tips' },
		{ label: 'Contact', id: 'contact' },
	]
	const [isEmergencyDetailsOpen, setIsEmergencyDetailsOpen] = useState(false)
	const [isChatOpen, setIsChatOpen] = useState(false)
	const [chatDraft, setChatDraft] = useState('')
	const [chatMessages, setChatMessages] = useState<string[]>([
		'Support Team: Hello, how can we help you today?',
	])

	const scrollToSection = (sectionId: string) => {
		const section = document.getElementById(sectionId)

		if (!section) {
			return
		}

		section.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	const sendChatMessage = () => {
		const text = chatDraft.trim()
		if (!text) {
			return
		}

		setChatMessages((prev) => [
			...prev,
			`You: ${text}`,
			'Support Team: Thanks for your message. A medical assistant will reply shortly.',
		])
		setChatDraft('')
	}

	return (
		<div className="umc-page" id="home">
			<button
				type="button"
				className="umc-emergency"
				onClick={() => setIsEmergencyDetailsOpen(true)}
				aria-label="Open emergency support details"
			>
				Emergency Alert
			</button>

			<header className="umc-header">
				<nav className="umc-nav" aria-label="Primary navigation">
					<a className="umc-brand" href="#home">
						<span className="umc-brand-mark" aria-hidden="true">
							+
						</span>
						<span>
							Uni Med
							<strong>Care</strong>
						</span>
					</a>

					<div className="umc-links">
						{navItems.map((item) => (
							<button key={item.id} type="button" onClick={() => scrollToSection(item.id)}>
								{item.label}
							</button>
						))}
					</div>

					<div className="umc-auth">
						<Link to="/login">Login</Link>
						<Link to="/register" className="primary">
							Register
						</Link>
					</div>
				</nav>
			</header>

			<main>
				<section className="umc-hero">
					<article>
						<p className="eyebrow">Trusted Campus Healthcare</p>
						<h1>
							Welcome to University Medical Center{' '}
							<span className="umc-hero-priority">Your Health, Our Priority</span>
						</h1>
						<p>
							We provide accessible and modern healthcare services for university students and staff with
							caring doctors and smart systems.
						</p>
						<div className="umc-hero-actions">
							<a href="#appointments" className="cta-main">
								Book Appointment
							</a>
							<a href="#about" className="cta-soft">
								Learn More
							</a>
						</div>
					</article>
					<img src={doctorHero} alt="Doctor consulting a patient at the university medical center" />
				</section>

				<section className="umc-services" id="services">
					<header>
						<h2>Quick Services</h2>
						<p>Essential services designed for student and staff healthcare needs.</p>
					</header>
					<div className="service-grid">
						{services.map((service) => (
							<article key={service.title} className="service-card">
								<div className="service-media">
									<img src={service.image} alt={service.imageAlt} loading="lazy" />
									<span className="service-icon" aria-hidden="true">
										{service.icon}
									</span>
								</div>
								<h3>{service.title}</h3>
								<p>{service.description}</p>
							</article>
						))}
					</div>
				</section>

				<section className="umc-about" id="about">
					<div className="about-hero">
						<article className="about-intro">
							<h2>
								Leading <em>Caring</em>
								<br />
								Medical Services.
							</h2>
							<p>
								For more than 40 years, the University Medical Center has provided trusted and quality
								healthcare. We use modern medical knowledge while giving personal care and attention to
								every patient.
							</p>
							<div className="about-actions">
								<Link to="/our-history" className="about-btn-soft">
									Our History
								</Link>
								<Link to="/our-facilities" className="about-btn-link">
									View Facilities
								</Link>
							</div>
						</article>
						<figure className="about-hero-image">
							<img src={aboutMainImage} alt="Doctor checking patient blood pressure" loading="lazy" />
						</figure>
						<article className="about-outcome-card" aria-label="Patient satisfaction data">
							<strong>98%</strong>
							<h3>Patient Satisfaction</h3>
							<p>Measured across the last 24 months of teaching hospital outcomes.</p>
						</article>
					</div>

					<div className="about-values">
						<article className="about-value-card">
							<span className="about-value-tag">Purpose</span>
							<h3>Our Mission</h3>
							<p>
								Our goal is to provide high-quality medical education and excellent healthcare services.
								We focus on teamwork, new ideas, and caring for patients with kindness and respect.
							</p>
						</article>
						<article className="about-value-card">
							<span className="about-value-tag">Future Focus</span>
							<h3>Our Vision</h3>
							<p>
								Our aim is to improve healthcare by using modern technology together with caring human
								relationships. We want to give better treatment while making patients feel supported and
								valued.
							</p>
						</article>
					</div>
				</section>

				<section className="umc-doctors" id="doctors">
					<header>
						<h2>Meet Our Doctors</h2>
						<p>Experienced specialists focused on student-centered medical care.</p>
					</header>
					<div className="doctor-grid">
						{doctorProfiles.map((doctor) => (
							<article key={doctor.slug} className="doctor-card">
								<div className="doctor-media">
									<img className="doctor-main-image" src={doctor.image} alt={doctor.fullName} loading="lazy" />
									<span className="doctor-availability">{doctor.availability}</span>
									<img
										className="doctor-focus-image"
										src={doctor.focusImage}
										alt={doctor.focusImageAlt}
										loading="lazy"
									/>
								</div>
								<h3>{doctor.fullName}</h3>
								<p>{doctor.specialization}</p>
								<button type="button" onClick={() => navigate(`/doctor/${doctor.slug}`)}>
									View Profile
								</button>
							</article>
						))}
					</div>
				</section>

				<section className="umc-appointment" id="appointments">
					<article>
						<h2>Book an Appointment</h2>
						<p>Schedule your visit in less than a minute.</p>
						<form>
							<label htmlFor="patient-name">Name</label>
							<input id="patient-name" type="text" placeholder="Enter your name" />

							<label htmlFor="appointment-date">Date</label>
							<input id="appointment-date" type="date" />

							<label htmlFor="appointment-doctor">Doctor</label>
							<select id="appointment-doctor" defaultValue="">
								<option value="" disabled>
									Select a doctor
								</option>
								{doctorProfiles.map((doctor) => (
									<option key={doctor.slug} value={doctor.fullName}>
										{doctor.fullName}
									</option>
								))}
							</select>

							<button type="submit">Book Now</button>
						</form>
					</article>
					<aside className="appointment-highlight">
						<h3>Need urgent support?</h3>
						<p>Use the Emergency Alert button for immediate medical response on campus.</p>
						<a href="tel:+94112345678">Call Emergency Team</a>
					</aside>
				</section>

				<section className="umc-stats" aria-label="Medical center statistics">
					<article>
						<strong>5000+</strong>
						<span>Students Treated</span>
					</article>
					<article>
						<strong>20+</strong>
						<span>Doctors</span>
					</article>
					<article>
						<strong>24/7</strong>
						<span>Service</span>
					</article>
					<article>
						<strong>10+</strong>
						<span>Years Experience</span>
					</article>
				</section>

				<section className="umc-gallery" id="gallery">
					<header>
						<span className="gallery-kicker">Inside Our Center</span>
						<h2>Gallery</h2>
						<p>A quick look at our facilities, team, and events.</p>
					</header>
					<div className="gallery-grid">
						{galleryItems.map((item) => (
							<figure className="gallery-card" key={item.title}>
								<img src={item.image} alt={item.imageAlt} loading="lazy" />
								<figcaption>
									<span className="gallery-chip">{item.category}</span>
									<h3>{item.title}</h3>
									<p>{item.description}</p>
								</figcaption>
							</figure>
						))}
					</div>
				</section>

				<section className="umc-testimonials" id="reviews" aria-label="Patient feedback">
					<header>
						<span className="testimonial-kicker">Patient Voices</span>
						<h2>What People Say</h2>
						<p>Real feedback from students and faculty who used our medical services.</p>
						<p className="testimonial-note">
							Review Note: These comments are simple feedback collected from Management, Surveying,
							Technology, and Social Science faculty students.
						</p>
					</header>
					<div className="testimonial-grid">
						{testimonials.map((item) => (
							<blockquote key={item.author} className="testimonial-card">
								<div className="testimonial-head">
									<div className="testimonial-identity">
										<div>
											<cite>{item.author}</cite>
											<span className="testimonial-role">{item.role}</span>
										</div>
									</div>
								</div>
								<p className="testimonial-quote">"{item.quote}"</p>
								<div className="testimonial-footer">
									<span className="testimonial-tag">{item.tag}</span>
								</div>
							</blockquote>
						))}
					</div>
				</section>


				<section className="umc-health-tips" id="health-tips" aria-label="Health tips">
					<header>
						<span className="health-kicker">Student Wellness Guide</span>
						<h2>Health Tips</h2>
						<p>Simple habits you can follow every week to stay healthy, focused, and exam-ready.</p>
					</header>
					<div className="health-tips-grid">
						{healthTips.map((tip) => (
							<article key={tip.title} className="health-tip-card">
								<img src={tip.image} alt={tip.imageAlt} loading="lazy" />
								<div className="health-tip-content">
									<div className="health-tip-meta">
										<span className="health-tip-chip">{tip.category}</span>
										<span className="health-tip-frequency">{tip.frequency}</span>
									</div>
									<h3>{tip.title}</h3>
									<p>{tip.description}</p>
								</div>
							</article>
						))}
					</div>
				</section>

				<section className="umc-contact" id="contact">
					<article className="contact-panel contact-info-panel">
						<span className="contact-kicker">Reach Out</span>
						<h2>Get in Touch</h2>
						<p className="contact-intro">We are here to help you with appointments, records, and urgent guidance.</p>
						<div className="contact-info-list">
							<div className="contact-info-item">
								<h3>Address</h3>
								<p>102 Precision Way, Serenity Park, NY 10012</p>
							</div>
							<div className="contact-info-item">
								<h3>Phone</h3>
								<p>+1 (555) 0123-4567</p>
							</div>
							<div className="contact-info-item">
								<h3>Email</h3>
								<p>care@clinicsanctuary.com</p>
							</div>
						</div>
						<div className="contact-quick-actions">
							<a className="contact-quick-link" href="tel:+155501234567">
								Call Support
							</a>
							<a className="contact-quick-link secondary" href="mailto:care@clinicsanctuary.com">
								Email Desk
							</a>
						</div>
						<p className="contact-map-head">Campus Medical Center Location</p>
						<div className="contact-map-grid" role="img" aria-label="Map showing campus medical center location">
							<img
								src={campusMap}
								alt="Campus medical center map with marked location"
								loading="lazy"
							/>
						</div>
					</article>
					<article className="contact-panel contact-form-panel" aria-label="Contact form section">
						<span className="contact-kicker contact-kicker-form">Quick Response</span>
						<h3>Send a Message</h3>
						<p className="contact-intro">Share your concern and our team will respond as quickly as possible.</p>
						<form className="contact-form">
							<div className="contact-form-row">
								<label htmlFor="contact-name">
									Full Name
									<input id="contact-name" type="text" placeholder="John Doe" />
								</label>
								<label htmlFor="contact-email">
									Email Address
									<input id="contact-email" type="email" placeholder="john@example.com" />
								</label>
							</div>
							<label htmlFor="contact-subject">
								Subject
								<select id="contact-subject" defaultValue="General Inquiry">
									<option>General Inquiry</option>
									<option>Appointment Support</option>
									<option>Medical Records</option>
									<option>Emergency Assistance</option>
								</select>
							</label>
							<label htmlFor="contact-message">
								Message
								<textarea id="contact-message" rows={4} placeholder="How can we help you today?" />
							</label>
							<p className="contact-form-note">Your details are kept private and used only for support follow-up.</p>
							<button type="submit">Send Message</button>
						</form>
					</article>
				</section>
			</main>

			{isEmergencyDetailsOpen && (
				<div className="umc-emergency-overlay" role="dialog" aria-modal="true" aria-label="Emergency support details">
					<div className="umc-emergency-panel">
						<h3>Emergency Support Details</h3>
						<p>
							For urgent situations, contact the medical emergency team immediately. Keep the patient stable,
							share your exact campus location, and avoid moving injured persons unless necessary.
						</p>
						<ul>
							<li>Emergency Hotline: +94 11 234 5678</li>
							<li>Ambulance Desk: Main Gate Medical Response Unit</li>
							<li>Average Response Time: 5-8 minutes on campus</li>
						</ul>
						<div className="umc-emergency-actions">
							<a href="tel:+94112345678">Call Emergency Team</a>
							<a href="#contact" onClick={() => setIsEmergencyDetailsOpen(false)}>
								Share Location
							</a>
							<button type="button" onClick={() => setIsEmergencyDetailsOpen(false)}>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			<button
				type="button"
				className="umc-chat"
				aria-label="Open live chat support"
				onClick={() => setIsChatOpen(true)}
			>
				Live Chat
			</button>

			{isChatOpen && (
				<div className="umc-chat-overlay" role="dialog" aria-modal="true" aria-label="Live chat details">
					<div className="umc-chat-panel">
						<div className="umc-chat-head">
							<div>
								<h3>Live Chat Support</h3>
								<p>Get quick help for appointments, records, and medical guidance.</p>
							</div>
							<button type="button" onClick={() => setIsChatOpen(false)}>
								Close
							</button>
						</div>

						<div className="umc-chat-stream" aria-label="Chat messages">
							{chatMessages.map((message, index) => (
								<p key={`${message}-${index}`}>{message}</p>
							))}
						</div>

						<div className="umc-chat-quick-actions">
							<button
								type="button"
								onClick={() => setChatDraft('I need help booking an appointment for this week.')}
							>
								Appointment Help
							</button>
							<button
								type="button"
								onClick={() => setChatDraft('Please guide me to access my medical records.')}
							>
								Medical Records
							</button>
							<button
								type="button"
								onClick={() => setChatDraft('I want to speak with emergency support now.')}
							>
								Emergency Help
							</button>
						</div>

						<div className="umc-chat-compose">
							<input
								type="text"
								value={chatDraft}
								onChange={(event) => setChatDraft(event.target.value)}
								placeholder="Type your message"
							/>
							<button type="button" onClick={sendChatMessage}>
								Send
							</button>
						</div>
					</div>
				</div>
			)}

			<footer className="umc-footer">
				<div className="umc-footer-shell">
					<section className="umc-footer-brand-col" aria-label="University Medical Center information">
						<a className="umc-footer-brand" href="#home">
							<span className="umc-brand-mark" aria-hidden="true">
								+
							</span>
							<span>
								Uni Med
								<strong>Care</strong>
							</span>
						</a>
						<h3>University Medical Center</h3>
						<p>Trusted campus healthcare for students and staff with modern, compassionate support.</p>
						<div className="umc-footer-social" aria-label="Social media links">
							<a href="#" onClick={(event) => event.preventDefault()} aria-label="Facebook">
								f
							</a>
							<a href="#" onClick={(event) => event.preventDefault()} aria-label="YouTube">
								yt
							</a>
							<a href="#" onClick={(event) => event.preventDefault()} aria-label="TikTok">
								tt
							</a>
						</div>
					</section>

					<nav className="umc-footer-col" aria-label="Footer quick links">
						<h4>Quick Links</h4>
						<a href="#home">Home</a>
						<a href="#services">Services</a>
						<a href="#about">About Us</a>
						<a href="#doctors">Doctors</a>
						<a href="#appointments">Appointments</a>
						<a href="#contact">Contact</a>
					</nav>

					<section className="umc-footer-col" aria-label="Footer contact information">
						<h4>Contact Info</h4>
						<a href="tel:+155501234567">+1 (555) 0123-4567</a>
						<a href="mailto:care@clinicsanctuary.com">care@clinicsanctuary.com</a>
						<p>102 Precision Way, Serenity Park, NY 10012</p>
					</section>

					<section className="umc-footer-col" aria-label="About university medical center">
						<h4>About</h4>
						<div className="umc-footer-about-card">
							<p>
								We provide accessible healthcare, preventive checkups, emergency care, and mental
								wellness support for the university community.
							</p>
							<span>Powered by Uni MedCare Digital Desk</span>
						</div>
					</section>
				</div>

				<div className="umc-footer-bottom">
					<p>Copyright 2026 University Medical Center. All Rights Reserved.</p>
					<p>
						Made with <span aria-hidden="true">♥</span> by Uni MedCare
					</p>
				</div>
			</footer>
		</div>
	)
}

export default Home
