import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <nav style={{padding:12}}>
      <Link href="/">Home</Link>
      {' | '}
      <Link href="/checkout">Checkout</Link>
    </nav>
  )
}
