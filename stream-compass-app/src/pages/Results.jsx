import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { api, ApiError } from '../api.js';
import { navigate, ASSESSMENT_ID_KEY } from '../App.jsx';
import LoadingMessages from '../components/LoadingMessages.jsx';

const STREAM_LABELS = { PCM: 'PCM', PCB: 'PCB', Commerce: 'Commerce', Humanities: 'Humanities' };

function StreamCard({ code, content, primary }) {
  return (
    <div className={`sc-stream-card${primary ? ' is-primary' : ''}`}>
      <h3 style={{ margin: '0 0 6px', color: 'var(--brand-dark)' }}>
        {primary ? 'Primary match — ' : 'Also worth exploring — '}
        {content.displayName}
      </h3>
      <p className="sc-lede" style={{ margin: '0 0 10px' }}>{content.description}</p>

      <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>Strengths</p>
      <div className="sc-chip-row">
        {content.strengths.map((s) => (
          <span className="sc-chip" key={s}>{s}</span>
        ))}
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, margin: '14px 0 4px' }}>Career clusters</p>
      <div className="sc-chip-row">
        {content.careerClusters.map((c) => (
          <span className="sc-chip" key={c}>{c}</span>
        ))}
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, margin: '14px 0 4px' }}>Before deciding</p>
      <p className="sc-lede" style={{ margin: 0, fontSize: 13.5 }}>{content.beforeDeciding}</p>
    </div>
  );
}

export default function Results() {
  const assessmentId = localStorage.getItem(ASSESSMENT_ID_KEY);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assessmentId) {
      navigate('#/details');
      return;
    }
    api
      .getResults(assessmentId)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 409) {
          navigate('#/assessment');
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Could not load your results.');
        setLoading(false);
      });
  }, [assessmentId]);

  if (loading) {
    return <LoadingMessages label="Scoring your results…" />;
  }

  if (error) {
    return (
      <div className="sc-card">
        <p className="sc-error">{error}</p>
      </div>
    );
  }

  const { student, result } = data;
  const chartData = Object.entries(result.scores).map(([stream, score]) => ({
    stream: STREAM_LABELS[stream] || stream,
    score
  }));

  // Browser print-to-PDF rather than a server-rendered PDF — zero new backend
  // dependency, and the print stylesheet (see styles.css @media print) already
  // hides everything but the result cards, so "Print" and "Save as PDF" are the
  // same action from the browser's own dialog. The title becomes the suggested
  // save filename in most browsers.
  function downloadAsPdf() {
    const original = document.title;
    const slug = (student.name || 'student').trim().replace(/\s+/g, '-');
    document.title = `Stream-Selection-Result-${slug}`;
    window.print();
    setTimeout(() => {
      document.title = original;
    }, 500);
  }

  return (
    <div>
      <div className="sc-card" style={{ marginBottom: 16 }}>
        <span className="sc-badge">Results{student.name ? ` for ${student.name}` : ''}</span>
        <h1 className="sc-title">{result.headline}</h1>
        <p className="sc-lede">{result.action}</p>
        <button type="button" className="sc-btn sc-btn-secondary sc-no-print" onClick={downloadAsPdf}>
          Download result as PDF
        </button>
      </div>

      <div className="sc-card" style={{ marginBottom: 16 }}>
        <h2 className="sc-title">Your stream fit scores</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ddf3" />
            <XAxis dataKey="stream" tick={{ fontSize: 13 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="score" fill="#6d28d9" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={chartData} outerRadius="75%">
            <PolarGrid stroke="#e6ddf3" />
            <PolarAngleAxis dataKey="stream" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar dataKey="score" stroke="#5b2d90" fill="#5b2d90" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="sc-card">
        <StreamCard code={result.primary.code} content={result.primary.content} primary />
        {result.secondary && <StreamCard code={result.secondary.code} content={result.secondary.content} />}
      </div>
    </div>
  );
}
