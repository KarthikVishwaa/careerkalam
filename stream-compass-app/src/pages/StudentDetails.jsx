import { useState } from 'react';
import { api, ApiError } from '../api.js';
import { navigate, ASSESSMENT_ID_KEY } from '../App.jsx';

const INITIAL = {
  studentName: '',
  email: '',
  phone: '',
  grade: '',
  city: '',
  schoolName: '',
  academicPerformance: '',
  preferredStream: '',
  dreamCareer: ''
};

export default function StudentDetails() {
  const [form, setForm] = useState(INITIAL);
  const [showMore, setShowMore] = useState(false);
  const [prefillNote, setPrefillNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Prefills from an existing webinar registration ("the old form") once the
  // student has typed a plausible email or 10-digit phone — never required,
  // just saves retyping what we already have on file.
  async function tryPrefill(nextForm) {
    const emailLooksValid = /\S+@\S+\.\S+/.test(nextForm.email);
    const phoneLooksValid = /^\d{10}$/.test(nextForm.phone.replace(/\D/g, ''));
    if (!emailLooksValid && !phoneLooksValid) return;

    try {
      const { match } = await api.prefill(emailLooksValid ? nextForm.email : '', phoneLooksValid ? nextForm.phone : '');
      if (match) {
        setForm((f) => ({
          ...f,
          studentName: f.studentName || match.name || '',
          grade: f.grade || match.grade || '',
          city: f.city || match.city || ''
        }));
        setPrefillNote('Filled in a few details from your earlier registration — check they still look right.');
      }
    } catch {
      // Prefill is a convenience; a failed lookup just means nothing gets filled in.
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.studentName.trim()) return setError('Please enter the student name.');
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Please enter a valid email.');
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) return setError('Please enter a valid 10-digit mobile number.');

    setSubmitting(true);
    try {
      const { assessmentId } = await api.start(form);
      localStorage.setItem(ASSESSMENT_ID_KEY, assessmentId);
      navigate('#/pay');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sc-card">
      <h2 className="sc-title">A few details first</h2>
      <p className="sc-lede">We'll use these for the report and to prefill from any earlier registration.</p>

      <form onSubmit={handleSubmit}>
        <div className="sc-field">
          <label htmlFor="studentName">Student name</label>
          <input
            id="studentName"
            value={form.studentName}
            onChange={(e) => update('studentName', e.target.value)}
            required
          />
        </div>

        <div className="sc-field-row">
          <div className="sc-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => tryPrefill(form)}
              required
            />
          </div>
          <div className="sc-field">
            <label htmlFor="phone">Mobile number</label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              onBlur={() => tryPrefill(form)}
              required
            />
          </div>
        </div>

        {prefillNote && <p className="sc-lede" style={{ marginTop: -8, fontSize: 13 }}>{prefillNote}</p>}

        <div className="sc-field-row">
          <div className="sc-field">
            <label htmlFor="grade">Grade / Class</label>
            <input id="grade" value={form.grade} onChange={(e) => update('grade', e.target.value)} placeholder="e.g. 10" />
          </div>
          <div className="sc-field">
            <label htmlFor="city">City</label>
            <input id="city" value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
        </div>

        <button
          type="button"
          className="sc-btn sc-btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? 'Hide optional details' : 'Add optional details'}
        </button>

        {showMore && (
          <>
            <div className="sc-field">
              <label htmlFor="schoolName">School name</label>
              <input id="schoolName" value={form.schoolName} onChange={(e) => update('schoolName', e.target.value)} />
            </div>
            <div className="sc-field">
              <label htmlFor="academicPerformance">Academic performance (optional)</label>
              <input
                id="academicPerformance"
                value={form.academicPerformance}
                onChange={(e) => update('academicPerformance', e.target.value)}
                placeholder="e.g. strong in Maths and Science"
              />
            </div>
            <div className="sc-field-row">
              <div className="sc-field">
                <label htmlFor="preferredStream">Preferred stream (if any)</label>
                <input
                  id="preferredStream"
                  value={form.preferredStream}
                  onChange={(e) => update('preferredStream', e.target.value)}
                />
              </div>
              <div className="sc-field">
                <label htmlFor="dreamCareer">Dream career (if any)</label>
                <input id="dreamCareer" value={form.dreamCareer} onChange={(e) => update('dreamCareer', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {error && <p className="sc-error">{error}</p>}

        <button type="submit" className="sc-btn sc-btn-block" disabled={submitting}>
          {submitting ? 'Please wait…' : 'Continue to payment'}
        </button>
      </form>
    </div>
  );
}
