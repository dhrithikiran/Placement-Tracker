import React, { useState, useEffect } from 'react';
import apiService from '../api';


const OfferManagement = ({ setActiveTab }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [didBackfill, setDidBackfill] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getOffers();
      setOffers(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Failed to fetch offers.');
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const backfillOffers = async () => {
    try {
      const res = await apiService.backfillOffersForPassed();
      setMessage(`✅ ${res.data?.message || 'Backfill complete'} (${res.data?.offersCreated || 0} created)`);
      fetchOffers();
    } catch (e) {
      setMessage('❌ Failed to backfill offers');
      console.error('Backfill error:', e);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Auto-backfill if no offers are found on first load
  useEffect(() => {
    const auto = async () => {
      if (!didBackfill && !loading && Array.isArray(offers) && offers.length === 0) {
        try {
          const res = await apiService.backfillOffersForPassed();
          setDidBackfill(true);
          setMessage(`✅ ${res.data?.message || 'Backfill complete'} (${res.data?.offersCreated || 0} created)`);
          await fetchOffers();
        } catch (e) {
          console.error('Auto backfill error:', e);
        }
      }
    };
    auto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers, loading]);

  // --- Offer Action Handlers ---
  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to accept this offer? This will automatically withdraw all other pending applications for this student.")) {
      return;
    }
    
    try {
      const response = await apiService.acceptOffer(offerId);
      setMessage(`✅ ${response.data.message || 'Offer accepted successfully!'}`);
      // Refresh offers to show updated status
      setTimeout(() => {
        fetchOffers();
      }, 500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to accept offer';
      setMessage(`❌ ${errorMsg}`);
      console.error('Accept offer error:', error);
      // Still refresh to see current state
      setTimeout(() => {
        fetchOffers();
      }, 1000);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to reject this offer?")) return;
    
    try {
      const response = await apiService.rejectOffer(offerId);
      setMessage(`☑️ ${response.data.message}`);
      fetchOffers();
    } catch (error) {
      setMessage('❌ Failed to reject offer.');
      console.error('Reject offer error:', error);
    }
  };
  
  // Status-to-style mapping
  const getOfferStyle = (status) => {
    switch (status) {
      case 'Pending': return 'offer-card pending';
      case 'Accepted': return 'offer-card accepted';
      case 'Rejected': return 'offer-card rejected';
      default: return 'offer-card';
    }
  };

  if (loading) return <p>Loading offers...</p>;

  return (
    <div className="content-container container">
      <h2 className="mb-3">🎁 Offer Management & Status</h2>
      {message && <div className={`alert ${message.startsWith('❌') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}

      {/* Removed long explanatory note per request */}

      <div className="row g-3">
        {offers.length === 0 ? (
          <div>
            <p>No offers found.</p>
            <button className="btn btn-primary" onClick={backfillOffers}>Generate offers for Passed interviews</button>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.Offer_ID} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{offer.Company_Name}</h5>
                    <span className={`badge ${offer.Offer_Status === 'Pending' ? 'bg-warning text-dark' : offer.Offer_Status === 'Accepted' ? 'bg-success' : 'bg-secondary'}`}>{offer.Offer_Status}</span>
                  </div>
                  <h6 className="card-subtitle mb-2 text-muted">{offer.Role}</h6>
                  <p className="mb-1"><strong>Student:</strong> {offer.Student_Name} ({offer.Branch})</p>
                  <p className="mb-1"><strong>Package:</strong> ₹{offer.Package} LPA</p>
                  <p className="mb-3"><strong>Offer Date:</strong> {new Date(offer.Offer_Date).toLocaleDateString()}</p>

                  {offer.Offer_Status === 'Pending' && (
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handleAcceptOffer(offer.Offer_ID)}
                      >
                        Accept Offer
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm" 
                        onClick={() => handleRejectOffer(offer.Offer_ID)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {offer.Offer_Status === 'Accepted' && (
                    <button 
                      className="btn btn-info btn-sm"
                      onClick={() => setActiveTab('applications')}
                    >
                      View Withdrawn Applications
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OfferManagement;