import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../api.js';
import { navigate, ASSESSMENT_ID_KEY } from '../App.jsx';
import LoadingMessages from '../components/LoadingMessages.jsx';

export default function Assessment() {
  const assessmentId = localStorage.getItem(ASSESSMENT_ID_KEY);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selections, setSelections] = useState({});
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

  // Tapping an option is the only way forward (no separate "Next" button) — it
  // saves and auto-advances. Disabled while a save is in flight so a quick
  // double-tap can't fire two overlapping saves for the same question.
  async function choose(optionId) {
    if (!current || saving) return;
    setSelections((s) => ({ ...s, [current.id]: optionId }));
    setSaving(true);
    setNotice('');
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

  // Always-available "Submit" (replaces a separate "Next" button). If anything's
  // still unanswered, it jumps straight to the first gap instead of just sitting
  // there disabled — only actually submits once everything's filled in.
  async function handleSubmitClick() {
    if (!allAnswered) {
      const firstUnanswered = questions.findIndex((q) => !selections[q.id]);
      if (firstUnanswered !== -1) {
        setIndex(firstUnanswered);
        setNotice(`Question ${questions[firstUnanswered].number} still needs an answer.`);
      }
      return;
    }

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

  if (submitting) {
    return <LoadingMessages label="Submitting your answers…" />;
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
            disabled={saving}
          >
            <span className="sc-option-letter">{opt.letter}</span>
            {opt.text}
          </button>
        ))}
      </div>

      {notice && <p className="sc-notice">{notice}</p>}
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

        <button type="button" className="sc-btn" onClick={handleSubmitClick}>
          {allAnswered ? 'Submit & see results' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
