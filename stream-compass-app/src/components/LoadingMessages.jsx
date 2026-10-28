import { useEffect, useState } from 'react';

// Shown during the two genuinely slow waits in the flow: submitting the
// assessment (server-side scoring) and the results page's initial fetch.
// Cycles through these so a 5-10s wait reads as "working", not "stuck".
const PHRASES = [
  'Calculating your scores…',
  'Choosing the right stream for you…',
  'Analysing your answers…',
  'Weighing your strengths…',
  'Mapping your interests…',
  'Comparing PCM, PCB, Commerce and Humanities…',
  'Crunching the numbers…',
  'Scoring across 8 dimensions…',
  'Finding your best-fit stream…',
  'Reading between the lines…',
  'Balancing the equations…',
  'Checking your strengths…',
  'Lining up career clusters…',
  'Double-checking the maths…',
  'Preparing your report…',
  'Matching you to a stream…',
  'Reviewing your responses…',
  'Putting it all together…',
  'Almost there…',
  'Just a few more seconds…'
];

export default function LoadingMessages({ label }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sc-center">
      <div className="sc-spinner" />
      <p className="sc-lede" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>{label}</p>
      <p className="sc-loading-phrase">{PHRASES[index]}</p>
    </div>
  );
}
