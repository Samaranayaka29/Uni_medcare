import { Link } from 'react-router-dom'
import galleryRoom from '../../assets/heart img2.png'
import serviceConsultation from '../../assets/img2home.webp'
import serviceLab from '../../assets/lab.jpg'
import servicePharmacy from '../../assets/Pharmacy.png'
import serviceEmergency from '../../assets/blood-pressure-and-your-heart-header.jpg'
import serviceMentalHealth from '../../assets/mentalhealth.png'
import galleryDoctors from '../../assets/2d echo test (1).webp'
import './details.css'

type Facility = {
  title: string
  description: string
  image: string
  imageAlt: string
}

type WorkingHour = {
  days: string
  time: string
}

const facilities: Facility[] = [
  {
    title: 'General Consultation Rooms',
    description: 'Dedicated spaces for checkups, diagnosis, and regular doctor visits.',
    image: serviceConsultation,
    imageAlt: 'General consultation room',
  },
  {
    title: 'Laboratory Services',
    description: 'Blood tests, urine tests, and rapid diagnostics with accurate reports.',
    image: serviceLab,
    imageAlt: 'Laboratory testing area',
  },
  {
    title: 'Pharmacy',
    description: 'Medicine issuing center with clear prescription and dosage guidance.',
    image: servicePharmacy,
    imageAlt: 'Pharmacy dispensing area',
  },
  {
    title: 'Emergency Unit',
    description: 'Immediate care for urgent medical situations and rapid stabilization.',
    image: serviceEmergency,
    imageAlt: 'Emergency treatment support',
  },
  {
    title: 'Dental Clinic',
    description: 'Routine oral health checkups and treatment services for patients.',
    image: galleryDoctors,
    imageAlt: 'Dental clinic environment',
  },
  {
    title: 'Counseling Services',
    description: 'Confidential mental health and wellbeing support sessions.',
    image: serviceMentalHealth,
    imageAlt: 'Counseling support room',
  },
  {
    title: 'Waiting Area',
    description: 'Comfortable seating and patient guidance while waiting for service.',
    image: galleryRoom,
    imageAlt: 'Patient waiting area',
  },
]

const workingHours: WorkingHour[] = [
  { days: 'Monday to Friday', time: '8:00 AM - 4:00 PM' },
  { days: 'Saturday', time: '8:00 AM - 12:00 PM' },
  { days: 'Emergency unit', time: '24/7' },
]

const specialFeatures = ['Online appointment system', 'Digital records', 'Student-friendly services']

const Facilities = () => {
  return (
    <div className="detail-page">
      <header className="detail-header">
        <div>
          <p className="detail-kicker">Our Facilities</p>
          <h1>Spaces and Services for Complete Care</h1>
          <p>
            The center provides modern facilities that support consultations, diagnostics, treatment,
            and wellbeing services in one connected system.
          </p>
        </div>
        <Link to="/" className="detail-back-link">
          Back to Home
        </Link>
      </header>

      <section className="detail-grid-cards" aria-label="Facilities list">
        {facilities.map((facility) => (
          <article key={facility.title} className="detail-facility-card">
            <img src={facility.image} alt={facility.imageAlt} loading="lazy" />
            <div>
              <h2>{facility.title}</h2>
              <p>{facility.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="detail-grid-two" aria-label="Working hours and special features">
        <article className="detail-panel">
          <h2>Working Hours</h2>
          <ul className="detail-hours-list">
            {workingHours.map((item) => (
              <li key={item.days}>
                <span>{item.days}</span>
                <strong>{item.time}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-panel">
          <h2>Special Features</h2>
          <ul className="detail-bullet-list">
            {specialFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

export default Facilities
