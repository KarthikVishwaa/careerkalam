import { navigate } from '../App.jsx';

export default function Welcome() {
  return (
    <div className="sc-card">
      <p className="sc-eyebrow">Stream Selection Tool</p>
      <h1 className="sc-title">Find the stream that actually fits you</h1>
      <p className="sc-lede">
        A 64-question assessment that scores you across 8 dimensions and maps you to
        PCM, PCB, Commerce or Humanities — with a clear breakdown of why, not just a label.
      </p>

      <ul className="sc-list">
        <li>64 quick questions, answered one at a time — about 15–20 minutes</li>
        <li>Instant results: your stream fit, scored and visualised</li>
        <li>Strengths, career clusters and what to explore before deciding</li>
        <li>A summary written for parents, and discussion points for a counsellor</li>
      </ul>

      <div className="sc-price">
        ₹299 <small>one-time, unlocks the full tool</small>
      </div>

      <button className="sc-btn sc-btn-block" style={{ marginTop: 18 }} onClick={() => navigate('#/details')}>
        Get started
      </button>
    </div>
  );
}
