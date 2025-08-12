import BreadCrumb from '@/components/BreadCrumb/BreadCrumb'
import React from 'react'

export default function page() {
  return (
    <div className='min-h-screen'>
      <BreadCrumb title={"Videos"} child={"All Videos"} parent={"Home"}/>
    </div>
  )
}
