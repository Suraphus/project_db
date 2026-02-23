import { memo, useCallback, useMemo, useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { CalendarDays, Clock3, Timer, Check } from "lucide-react"

const WORKDAY_START_MIN = 6 * 60
const WORKDAY_END_MIN = 22 * 60

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1h 30m", value: 90 },
  { label: "2 hours", value: 120 }
]

const DatePickerPanel = memo(function DatePickerPanel({ selectedDate, onDateChange, duration, onDurationChange, minDate }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-700">
        <CalendarDays size={18} />
        <p className="text-sm font-semibold">Pick a date</p>
      </div>
      <Calendar
        value={selectedDate}
        onChange={onDateChange}
        minDate={minDate}
        className="!w-full border-0"
      />

      <div className="mt-4 rounded-xl bg-slate-100 p-3">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Timer size={16} />
          Duration
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onDurationChange(option.value)}
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                duration === option.value
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

const TimeSlotButton = memo(function TimeSlotButton({ slot, label, disabled, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(slot)}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-slate-900"
      }`}
    >
      {label}
    </button>
  )
})

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(mins).padStart(2, "0")} ${suffix}`
}

const buildTimeSlots = () => {
  const slots = []
  for (let minute = WORKDAY_START_MIN; minute < WORKDAY_END_MIN; minute += 30) {
    slots.push(minute)
  }
  return slots
}

const hasRangeConflict = (start, end, bookedRanges) => {
  return bookedRanges.some((range) => start < range.end && end > range.start)
}

const getMockBookedRanges = (selectedDate) => {
  const day = selectedDate.getDay()
  const key = formatDateKey(selectedDate)

  const baseRangesByDay = {
    1: [{ start: 12 * 60, end: 13 * 60 + 30 }],
    2: [{ start: 17 * 60, end: 18 * 60 + 30 }],
    3: [{ start: 9 * 60, end: 10 * 60 }, { start: 15 * 60, end: 16 * 60 + 30 }],
    4: [{ start: 19 * 60, end: 20 * 60 }],
    5: [{ start: 11 * 60 + 30, end: 13 * 60 }],
    6: [{ start: 8 * 60, end: 9 * 60 + 30 }, { start: 18 * 60, end: 19 * 60 + 30 }],
    0: [{ start: 16 * 60, end: 17 * 60 }]
  }

  const specificOverride = {
    "2026-02-14": [{ start: 9 * 60, end: 12 * 60 }],
    "2026-03-01": [{ start: 14 * 60, end: 16 * 60 + 30 }]
  }

  return specificOverride[key] || baseRangesByDay[day] || []
}

export default function BookingCalendar({ fieldName, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState(null)
  const [duration, setDuration] = useState(60)
  const today = useMemo(() => new Date(), [])

  const slots = useMemo(() => buildTimeSlots(), [])
  const slotsWithLabels = useMemo(() => slots.map((slot) => ({ slot, label: formatTime(slot) })), [slots])
  const bookedRanges = useMemo(() => getMockBookedRanges(selectedDate), [selectedDate])

  const startSlotStatus = useMemo(() => {
    return slotsWithLabels.map(({ slot, label }) => {
      const bookingEnd = slot + duration
      const outOfBounds = bookingEnd > WORKDAY_END_MIN
      const conflict = hasRangeConflict(slot, bookingEnd, bookedRanges)
      return {
        slot,
        label,
        disabled: outOfBounds || conflict
      }
    })
  }, [bookedRanges, duration, slotsWithLabels])

  const selectedEnd = selectedStart !== null ? selectedStart + duration : null
  const canConfirm =
    selectedStart !== null &&
    selectedEnd <= WORKDAY_END_MIN &&
    !hasRangeConflict(selectedStart, selectedEnd, bookedRanges)

  const handleDateChange = useCallback((value) => {
    const nextDate = Array.isArray(value) ? value[0] : value
    setSelectedDate(nextDate)
    setSelectedStart(null)
  }, [])

  const handleDurationChange = useCallback((value) => {
    setDuration(value)
  }, [])

  const handleStartSelect = useCallback((slot) => {
    setSelectedStart(slot)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!canConfirm || !onConfirm) return

    onConfirm({
      fieldName,
      date: formatDateKey(selectedDate),
      startTime: formatTime(selectedStart),
      endTime: formatTime(selectedEnd),
      duration
    })
  }, [canConfirm, duration, fieldName, onConfirm, selectedDate, selectedEnd, selectedStart])

  return (
    <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">BOOKING STUDIO</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">{fieldName}</h2>
        </div>
        <div className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Select day, start time, and duration
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <DatePickerPanel
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          duration={duration}
          onDurationChange={handleDurationChange}
          minDate={today}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <Clock3 size={18} />
            <p className="text-sm font-semibold">Available start times</p>
          </div>

          <div className="max-h-[320px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {startSlotStatus.map(({ slot, label, disabled }) => (
                <TimeSlotButton
                  key={slot}
                  slot={slot}
                  label={label}
                  disabled={disabled}
                  selected={selectedStart === slot}
                  onSelect={handleStartSelect}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-semibold text-emerald-900">Your booking</p>
            {selectedStart === null ? (
              <p className="mt-1 text-sm text-emerald-700">Choose a start time to preview your booking range.</p>
            ) : (
              <div className="mt-2 space-y-1 text-sm text-emerald-900">
                <p>Date: {selectedDate.toLocaleDateString()}</p>
                <p>Time: {formatTime(selectedStart)} - {formatTime(selectedEnd)}</p>
                <p>Duration: {duration} min</p>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
              canConfirm
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
          >
            <Check size={16} />
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}
