import { Link, Navigate, useParams } from 'react-router-dom'
import { doctorProfiles } from './doctorData'
import './doctorProfile.css'

const DoctorProfile = () => {
  const { slug } = useParams<{ slug: string }>()
  const doctor = doctorProfiles.find((item) => item.slug === slug)

  if (!doctor) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="doctor-profile-page">
      <header className="doctor-profile-header">
        <Link to="/" className="doctor-back-link">
          Back to Home
        </Link>
        <span className="doctor-status">{doctor.availability}</span>
      </header>

      <main className="doctor-profile-main">
        <section className="doctor-profile-card" aria-label="Doctor profile details">
          <figure className="doctor-profile-image-wrap">
            <img src={doctor.image} alt={doctor.fullName} className="doctor-profile-image" />
            <img src={doctor.focusImage} alt={doctor.focusImageAlt} className="doctor-focus-image" />
          </figure>

          <article className="doctor-profile-details">
            <h1>{doctor.fullName}</h1>
            <p className="doctor-specialization">{doctor.specialization}</p>

            <div className="doctor-profile-grid">
              <div>
                <h2>Qualification</h2>
                <p>{doctor.qualification}</p>
              </div>
              <div>
                <h2>Experience</h2>
                <p>{doctor.experience}</p>
              </div>
              <div>
                <h2>Working Hours</h2>
                <p>{doctor.workingHours}</p>
              </div>
              <div>
                <h2>Contact</h2>
                <p>{doctor.contactNumber}</p>
              </div>
            </div>

            <section className="doctor-about">
              <h2>About Doctor</h2>
              <p>{doctor.about}</p>
            </section>

            <div className="doctor-action-row">
              <a href={`tel:${doctor.contactNumber.replace(/\s+/g, '')}`} className="doctor-contact-btn">
                Contact Doctor
              </a>
              <Link to="/appointments" className="doctor-appointment-btn">
                Book Appointment
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default DoctorProfile
