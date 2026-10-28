import { useEffect, useState } from 'react';
import { api, ApiError, DISPLAY_PRICE } from '../api.js';
import { navigate, ASSESSMENT_ID_KEY } from '../App.jsx';

export default function Payment() {
  const assessmentId = localStorage.getItem(ASSESSMENT_ID_KEY);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assessmentId) {
      navigate('#/details');
      return;
    }
    api
      .getAssessment(assessmentId)
      .then((data) => {
        if (data.paymentStatus === 'paid') {
          navigate('#/assessment');
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        // Stale/invalid id in localStorage — start over.
        localStorage.removeItem(ASSESSMENT_ID_KEY);
        navigate('#/details');
      });
  }, [assessmentId]);

  async function handlePay() {
    setError('');
    setPaying(true);
    try {
      const order = await api.createOrder(assessmentId);

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'CareerKalam360',
        description: 'Stream Selection Tool',
        theme: { color: '#5b2d90' },
        handler: async (response) => {
          try {
            const result = await api.verifyPayment(assessmentId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (result.status === 'paid') {
              navigate('#/assessment');
            } else {
              setError("Payment is still processing — if you were charged, this will unlock within a minute. You can also refresh this page.");
              setPaying(false);
            }
          } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not verify payment.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false)
        }
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start payment. Please try again.');
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="sc-center">
        <div className="sc-spinner" />
        <p className="sc-lede">Loading…</p>
      </div>
    );
  }

  return (
    <div className="sc-card">
      <p className="sc-eyebrow">One last step</p>
      <h2 className="sc-title">Unlock the assessment</h2>
      <p className="sc-lede">
        A one-time payment unlocks all 64 questions and your full results — scores, stream
        breakdown, and what to explore next.
      </p>

      <div className="sc-price" style={{ marginBottom: 20 }}>
        {DISPLAY_PRICE} <small>one-time</small>
      </div>

      {error && <p className="sc-error">{error}</p>}

      <button className="sc-btn sc-btn-block" onClick={handlePay} disabled={paying}>
        {paying ? 'Opening payment…' : `Pay ${DISPLAY_PRICE} & unlock`}
      </button>
    </div>
  );
}
