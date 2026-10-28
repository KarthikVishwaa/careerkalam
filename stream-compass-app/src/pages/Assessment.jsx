import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../api.js';
import { navigate, ASSESSMENT_ID_KEY } from '../App.jsx';

export default function Assessment() {
  const assessmentId = localStorage.getItem(ASSESSMENT_ID_KEY);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selections, setSelections] = useState({});
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assessmentId) {
      navigate('#/details');
      return;
    }

    (async () => {
      try {
        const status = await api.getAssessment(assessmentId);
        if (status.paymentStatus !== 'paid') {
          navigate('#/pay');
          return;
        }
        if (status.status === 'scored') {
          navigate('#/results');
          return;
        }

        const [{ questions: qs }, { selections: sel, answeredNumbers }] = await Promise.all([
          api.getQuestions(assessmentId),
          api.getResponses(assessmentId)
        ]);
        setQuestions(qs);
        setSelections(sel);

        // Resume at the first unanswered question, not always question 1.
        const firstUnanswered = qs.findIndex((q) => !answeredNumbers.includes(q.number));
        setIndex(firstUnanswered === -1 ? qs.length - 1 : firstUnanswered);
        setLoading(false);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load the assessment.');
        setLoading(false);
      }
    })();
  }, [assessmentId]);

  const current = questions[index];
  const answeredCount = useMemo(
    () => questions.filter((q) => selections[q.id]).length,
    [questions, selections]
  );
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  async function choose(optionId) {
    if (!current) return;
    setSelections((s) => ({ ...s, [current.id]: optionId }));
    setSaving(true);
    try {
      await api.saveResponse(assessmentId, current.id, optionId);
    } catch {
      // Autosave is best-effort per question; the completeness check on submit is
      // authoritative, so a transient failure here just means the student may need
      // to re-tap this one option before submitting.
    } finally {
      setSaving(false);
    }

    if (index < questions.length - 1) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length - 1)), 180);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await api.submit(assessmentId);
      navigate('#/results');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="sc-center">
        <div className="sc-spinner" />
        <p className="sc-lede">Loading your assessment…</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="sc-card">
        <p className="sc-error">{error}</p>
      </div>
    );
  }

  if (!current) return null;

  const percent = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="sc-card">
      <div className="sc-progress-label">
        <span>Question {index + 1} of {questions.length}</span>
        <span>{answeredCount} answered{saving ? ' · saving…' : ''}</span>
      </div>
      <div className="sc-progress-track">
        <div className="sc-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <p className="sc-question-number">Q{current.number}</p>
      <h2 className="sc-title">{current.text}</h2>

      <div style={{ marginTop: 18 }}>
        {current.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`sc-option${selections[current.id] === opt.id ? ' is-selected' : ''}`}
            onClick={() => choose(opt.id)}
          >
            <span className="sc-option-letter">{opt.letter}</span>
            {opt.text}
          </button>
        ))}
      </div>

      {error && <p className="sc-error">{error}</p>}

      <div className="sc-nav-row">
        <button
          type="button"
          className="sc-btn sc-btn-secondary"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Back
        </button>

        {index < questions.length - 1 ? (
          <button
            type="button"
            className="sc-btn"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={!selections[current.id]}
          >
            Next
          </button>
        ) : (
          <button type="button" className="sc-btn" onClick={handleSubmit} disabled={!allAnswered || submitting}>
            {submitting ? 'Submitting…' : 'Submit & see results'}
          </button>
        )}
      </div>

      {index === questions.length - 1 && !allAnswered && (
        <p className="sc-lede" style={{ marginTop: 12, fontSize: 13 }}>
          {questions.length - answeredCount} question(s) still need an answer before you can submit.
        </p>
      )}
    </div>
  );
}
