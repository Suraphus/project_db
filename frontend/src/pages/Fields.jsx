import React, { useState } from 'react'
import { MapPin, X } from 'lucide-react'
import BookingCalendar from '../components/BookingCalendar'


const mockField = [
  {
    name: "Basketball 1",
    location: "หน้าตึกคอม",
    detail: [{
      surface: "Concrete",
      capacity: "10 people",
      rate: "free"
    }]
  },
  {
    name: "Basketball 2",
    location: "หน้าตึกคอม",
    detail: [{
      surface: "Concrete",
      capacity: "10 people",
      rate: "free"
    }]
  },
  {
    name: "Basketball 3",
    location: "หน้าตึกคอม",
    detail: [{
      surface: "Concrete",
      capacity: "10 people",
      rate: "free"
    }]
  }
]

export const Fields = () => {

  const [selectedField, setSelectedField] = useState(null)

  const handleBookingConfirm = (bookingData) => {
    console.log("Booking confirmed:", bookingData)
    setSelectedField(null)
  }

  return (
    

      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 py-20">
        <div className='mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 xl:grid-cols-3'>

          {mockField.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedField(item)}
              className='hover:cursor-pointer transition-all hover:-translate-y-1'
            >
            <div 
              className="overflow-hidden rounded-2xl border border-white/60 bg-white pb-1 shadow-md"
            >
              <div >
                <img className="mb-2 h-70 w-full rounded-t-2xl object-cover" src="https://cdn.prod.website-files.com/65724dca4c6e2916c2b00c25/65e9a454bcdf8bb397b81543_Howe_Final_4.jpg" alt="Basketball field" />
              </div>
              <div className="mb-6">
                <p className="text-xl font-bold mx-2 mb-1">{item.name}</p>
                <div className='flex gap-1 justify-center'>
                  <p><MapPin size={20}/></p>
                  <p className="text-gray-500 -translate-y-0.5">{item.location}</p>
                </div>
              </div>

              {item.detail.map((detailItem, i) => (
                <div key={i} className='gap-3 flex justify-between mb-4 mx-4'>
                  <div className='p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl'>
                    <p className="text-sm text-gray-400">Surface</p>
                    <p>{detailItem.surface}</p>
                  </div>

                  <div className='p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl'>
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p>{detailItem.capacity}</p>
                  </div>

                  <div className='p-1 flex-1 border border-gray-300 px-2 bg-gray-300 rounded-xl'>
                    <p className="text-sm text-gray-400">Rate</p>
                    <p>{detailItem.rate}</p>
                  </div>
                </div>
              ))}
            </div>
            </button>
          ))}

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

      <BookingCalendar
        fieldName={selectedField.name}
        onConfirm={handleBookingConfirm}
      />
    </div>
  </div>
)}

    </div>
    
  )

}
