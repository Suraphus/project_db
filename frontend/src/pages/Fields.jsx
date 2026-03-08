import React, { useCallback, useEffect, useState } from "react";
import { MapPin, X, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import BookingCalendar from "../components/BookingCalendar";
import { useAllField } from "../Context/getAllField";
import { useCurrentUser } from "../Context/useCurrentUser";
import { toast } from "react-toastify"
export const Fields = () => {
  const { user } = useCurrentUser();
  const { fields, loading } = useAllField();
  const [selectedField, setSelectedField] = useState(null);
  const { sportName } = useParams();
  const navigate = useNavigate();
  const decodedSportName = decodeURIComponent(sportName || "");
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const isAdmin = user?.role == "admin";
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchReviews = useCallback(async (courtId) => {
    if (!courtId) {
      setReviews([]);
      return;
    }

    setLoadingReviews(true);
    try {
      const res = await fetch(`${apiUrl}/api/courts/${courtId}/reviews`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || "Failed to load reviews");
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!selectedField) {
      setReviews([]);
      return;
    }
    fetchReviews(selectedField.court_id);
  }, [selectedField, fetchReviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!fields) return null;

  const fieldsList = fields.filter(
    (item) => item.type?.toLowerCase() === decodedSportName.toLowerCase()
  );

  const handleBookingConfirm = () => {
    toast.success("Booking created successfully", { pauseOnHover: false, autoClose: 1500 });
    setSelectedField(null);
  };

  const handleDeleteField = async () => {
    if (!fieldToDelete) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/fields/${fieldToDelete.court_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }
      alert("ลบสำเร็จ");

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("ลบไม่สำเร็จ");
    } finally {
      setFieldToDelete(null);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedField) return;

    const comment = reviewForm.comment.trim();
    if (!comment) {
      alert("Please write a review comment.");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/courts/${selectedField.court_id}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            rating: Number(reviewForm.rating),
            comment,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setReviewForm({ rating: 5, comment: "" });
      fetchReviews(selectedField.court_id);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-bold text-gray-700 shadow-sm backdrop-blur transition hover:-translate-x-1 hover:bg-white/90 hover:text-emerald-700"
        >
          <ArrowLeft size={20} />
          Return
        </button>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {fieldsList.length === 0 && (
            <div className="col-span-full text-center text-xl font-semibold text-gray-600">
              ไม่พบสนามสำหรับกีฬา "{decodedSportName}"
            </div>
          )}
          {fieldsList.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedField(item)}
              className="hover:cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white pb-1 shadow-md">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFieldToDelete(item);
                      console.log(fieldToDelete);
                    }}
                    className="absolute right-3 top-3 z-10 rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
                  >
                    ลบสนาม
                  </button>
                )}
                <div>
                  <img
                    className="mb-2 h-70 w-full rounded-t-2xl object-cover"
                    src={item.img_url}
                    alt={item.name}
                  />
                </div>
                <div className="mb-6">
                  <p className="text-xl font-bold mx-2 mb-1">{item.name}</p>
                  <div className="flex gap-1 justify-center">
                    <p>
                      <MapPin size={20} />
                    </p>
                    <p className="text-gray-500 -translate-y-0.5">
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="gap-3 flex justify-between mb-4 mx-4">
                  <div className="p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl">
                    <p className="text-sm text-gray-400">Surface</p>
                    <p>{item.surface}</p>
                  </div>
                  <div className="p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl">
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p>{item.max_pp}</p>
                  </div>

                  <div className="p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl">
                    <p className="text-sm text-gray-400">Status</p>
                    <p>{item.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="relative max-h-[95vh] w-full max-w-6xl overflow-y-auto">
            <button
              onClick={() => setSelectedField(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-2 text-white transition hover:bg-slate-900"
              aria-label="Close booking dialog"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <BookingCalendar
                courtId={selectedField.court_id}
                fieldName={selectedField.name}
                onConfirm={handleBookingConfirm}
              />

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900">
                  Reviews for {selectedField.name}
                </h3>

                <form
                  onSubmit={handleReviewSubmit}
                  className="mt-4 grid gap-3 md:grid-cols-[140px_1fr_auto]"
                >
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: Number(e.target.value),
                      }))
                    }
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>

                  <input
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Write your review for this field..."
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {reviewSubmitting ? "Submitting..." : "Post Review"}
                  </button>
                </form>

                <div className="mt-5 space-y-3">
                  {loadingReviews && (
                    <p className="text-sm text-slate-500">Loading reviews...</p>
                  )}

                  {!loadingReviews && reviews.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No reviews yet. Be the first to review this field.
                    </p>
                  )}

                  {!loadingReviews &&
                    reviews.map((review, index) => (
                      <div
                        key={`${review.user_id || "user"}-${review.created_at || index}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-800">
                            {review.firstname || "User"} {review.lastname || ""}
                          </p>
                          <p className="text-sm font-semibold text-amber-600">
                            {"★".repeat(Number(review.rating || 0))}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {review.created_at
                            ? new Date(review.created_at).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {fieldToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              ยืนยันการลบสนาม
            </h2>
            <p className="mb-6 text-gray-600">
              คุณต้องการลบสนาม "{fieldToDelete.name}" ใช่หรือไม่?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFieldToDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition hover:bg-gray-100"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleDeleteField}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
