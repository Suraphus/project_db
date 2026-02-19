import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'

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

  const Navigate=useNavigate()
  const [isPopup,setIsPopup] = useState(false)

  return (
    

      <div className={`${!isPopup ? "bg-[#cfd2d4] py-20 mx-auto w-fit" : "py-20 mx-auto"}`}>
        <div className='flex justify-center gap-10'>

          {mockField.map((item, index) => (
            <button onClick={()=>{
              setIsPopup(!isPopup)
              }} className='hover:cursor-pointer hover:scale-102 transition-all'>
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-md w-80 pb-1"
            >
              <div >
                <img className="w-80 h-70 mb-2 rounded-t-2xl" src="https://cdn.prod.website-files.com/65724dca4c6e2916c2b00c25/65e9a454bcdf8bb397b81543_Howe_Final_4.jpg" alt="Basketball field" />
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
            {isPopup && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-10 rounded-2xl shadow-xl">
      <button
        onClick={() => setIsPopup(false)}
        className="block mt-4 text-red-500"
      > 
        Close
      </button>
    </div>
  </div>
)}

    </div>
    
  )

}

