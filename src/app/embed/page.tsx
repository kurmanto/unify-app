"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface SessionTypeOption {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  description: string | null;
}

function BookingWidget() {
  const searchParams = useSearchParams();
  const practitionerId = searchParams.get("practitioner");

  const [step, setStep] = useState<"type" | "date" | "info" | "confirm">("type");
  const [sessionTypes, setSessionTypes] = useState<SessionTypeOption[]>([]);
  const [selectedType, setSelectedType] = useState<SessionTypeOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (practitionerId) {
      loadSessionTypes();
    }
  }, [practitionerId]);

  async function loadSessionTypes() {
    const baseUrl = window.location.origin;
    const res = await fetch(
      `${baseUrl}/api/widget/availability?practitioner_id=${practitionerId}&action=session_types`
    );
    // Fallback: fetch from Supabase directly or use embedded data
    // For now, we use static defaults
    setSessionTypes([
      {
        id: "initial",
        name: "Initial Session",
        duration_minutes: 105,
        price_cents: 18000,
        description: "First visit — 105 minutes",
      },
      {
        id: "subsequent",
        name: "Subsequent Session",
        duration_minutes: 90,
        price_cents: 18000,
        description: "Follow-up — 90 minutes",
      },
      {
        id: "consultation",
        name: "Free Consultation",
        duration_minutes: 15,
        price_cents: 0,
        description: "15-minute complimentary consultation",
      },
    ]);
  }

  async function loadAvailability(date: string) {
    if (!selectedType || !practitionerId) return;
    setLoading(true);
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(
        `${baseUrl}/api/widget/availability?practitioner_id=${practitionerId}&date=${date}&session_type_id=${selectedType.id}`
      );
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch {
      setAvailableSlots([]);
    }
    setLoading(false);
  }

  async function handleBook() {
    setLoading(true);
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/widget/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitioner_id: practitionerId,
          session_type_id: selectedType?.id,
          date: selectedDate,
          time: selectedTime,
          client_first_name: formData.first_name,
          client_last_name: formData.last_name,
          client_email: formData.email,
          client_phone: formData.phone,
        }),
      });
      if (res.ok) {
        setBooked(true);
      }
    } catch {
      // Error handling
    }
    setLoading(false);
  }

  if (!practitionerId) {
    return (
      <div className="p-6 text-center text-gray-500">
        Missing practitioner parameter.
      </div>
    );
  }

  if (booked) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-bold mb-2">Booking Requested!</h2>
        <p className="text-gray-600">
          You&apos;ll receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 font-sans">
      <h2 className="text-lg font-bold mb-4">Book a Session</h2>

      {step === "type" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">Select a session type:</p>
          {sessionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type);
                setStep("date");
              }}
              className="w-full text-left border rounded-lg p-4 hover:border-black transition-colors"
            >
              <p className="font-medium">{type.name}</p>
              <p className="text-sm text-gray-500">{type.description}</p>
              <p className="text-sm font-medium mt-1">
                {type.price_cents === 0
                  ? "Free"
                  : `$${(type.price_cents / 100).toFixed(2)} + HST`}
              </p>
            </button>
          ))}
        </div>
      )}

      {step === "date" && (
        <div className="space-y-4">
          <button
            onClick={() => setStep("type")}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back
          </button>
          <p className="text-sm text-gray-600">
            Selected: <strong>{selectedType?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select a date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                loadAvailability(e.target.value);
              }}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border rounded-lg p-2"
            />
          </div>
          {selectedDate && (
            <div>
              <p className="text-sm font-medium mb-2">Available times:</p>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No available slots for this date.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedTime(slot);
                        setStep("info");
                      }}
                      className={`border rounded-lg p-2 text-sm hover:border-black transition-colors ${
                        selectedTime === slot
                          ? "border-black bg-black text-white"
                          : ""
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === "info" && (
        <div className="space-y-4">
          <button
            onClick={() => setStep("date")}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back
          </button>
          <p className="text-sm text-gray-600">
            {selectedType?.name} — {selectedDate} at {selectedTime}
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, first_name: e.target.value }))
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, last_name: e.target.value }))
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full border rounded-lg p-2"
              />
            </div>
            <button
              onClick={() => setStep("confirm")}
              disabled={!formData.first_name || !formData.last_name || !formData.email}
              className="w-full bg-black text-white rounded-lg p-3 font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <button
            onClick={() => setStep("info")}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back
          </button>
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Booking Summary</h3>
            <p className="text-sm">
              <span className="text-gray-500">Session:</span>{" "}
              {selectedType?.name}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Date:</span> {selectedDate}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Time:</span> {selectedTime}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Duration:</span>{" "}
              {selectedType?.duration_minutes} min
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Name:</span>{" "}
              {formData.first_name} {formData.last_name}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Email:</span> {formData.email}
            </p>
            {selectedType && selectedType.price_cents > 0 && (
              <p className="text-sm font-medium mt-2">
                Total: ${(selectedType.price_cents / 100).toFixed(2)} + HST
              </p>
            )}
          </div>
          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full bg-black text-white rounded-lg p-3 font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <BookingWidget />
    </Suspense>
  );
}
