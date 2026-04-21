import { Link } from 'react-router-dom'
import aboutMainImage from '../../assets/img2home.webp'
import galleryEvents from '../../assets/Vaccination Programs.jpg'
import galleryRoom from '../../assets/heart img2.png'
import './details.css'

type TimelineItem = {
  year: string
  title: string
  description: string
}

type Milestone = {
  label: string
  value: string
  detail: string
}

const timeline: TimelineItem[] = [
  {
    year: '1984',
    title: 'Medical center established',
    description: 'Founded to provide accessible healthcare for university students, staff, and faculty.',
  },
  {
    year: '1988',
    title: 'First clinic opened',
    description: 'Primary consultation and preventive care services started for campus patients.',
  },
  {
    year: '1999',
    title: 'Doctor team expanded',
    description: 'Specialists were added to improve treatment quality and reduce waiting times.',
  },
  {
    year: '2016',
    title: 'Digital system introduced',
    description: 'Online appointments and electronic medical records were launched.',
  },
  {
    year: '2023',
    title: 'Labs and services upgraded',
    description: 'New diagnostics, emergency workflows, and expanded patient support were added.',
  },
]

const milestones: Milestone[] = [
  {
    label: 'Patients treated',
    value: '125,000+',
    detail: 'Total visits and treatment sessions across all core services.',
  },
  {
    label: 'Awards and recognition',
    value: '12',
    detail: 'Recognitions for service quality, patient safety, and response efficiency.',
  },
  {
    label: 'Major improvements',
    value: '40+',
    detail: 'Infrastructure, laboratory, pharmacy, and digital workflow improvements.',
  },
]

const growthStory = [
  'The center began with general outpatient consultation and basic preventive care.',
  'Over time, services expanded to laboratory testing, pharmacy support, and emergency care.',
  'Dental and counseling units were introduced to provide broader student-centered healthcare.',
  'Today the center combines compassionate in-person care with modern digital operations.',
]

const History = () => {
  return (
    <div className="detail-page">
      <header className="detail-header">
        <div>
          <p className="detail-kicker">Our History</p>
          <h1>Journey of University Medical Center</h1>
          <p>
            University Medical Center was built to support academic life with reliable, affordable, and
            patient-focused healthcare. Its growth reflects a long-term commitment to quality care on campus.
          </p>
        </div>
        <Link to="/" className="detail-back-link">
          Back to Home
        </Link>
      </header>

      <section className="detail-panel" aria-label="History timeline">
        <h2>Timeline</h2>
        <ol className="timeline-list">
          {timeline.map((item) => (
            <li key={item.year + item.title}>
              <span>{item.year}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="detail-grid-three" aria-label="Milestones and achievements">
        {milestones.map((item) => (
          <article key={item.label} className="detail-stat-card">
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <span>{item.detail}</span>
          </article>
        ))}
      </section>

      <section className="detail-panel" aria-label="Growth story">
        <h2>Growth Story</h2>
        <ul className="detail-bullet-list">
          {growthStory.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="detail-grid-two" aria-label="Then and now gallery">
        <figure className="detail-gallery-card">
          <img src={galleryEvents} alt="Earlier community health outreach at the center" loading="lazy" />
          <figcaption>
            <p>Then</p>
            <h3>Early Community Health Programs</h3>
          </figcaption>
        </figure>
        <figure className="detail-gallery-card">
          <img src={aboutMainImage} alt="Modern patient care at university medical center" loading="lazy" />
          <figcaption>
            <p>Now</p>
            <h3>Modern Patient-Centered Operations</h3>
          </figcaption>
        </figure>
        <figure className="detail-gallery-card">
          <img src={galleryRoom} alt="Current patient-friendly center environment" loading="lazy" />
          <figcaption>
            <p>Current Space</p>
            <h3>Improved Care and Comfort</h3>
          </figcaption>
        </figure>
      </section>
    </div>
  )
}

export default History
