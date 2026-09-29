import React from 'react'

type Props = { title: string; price: number }

export default function ProductCard({ title, price }: Props) {
  return (
    <article style={{border:'1px solid #ddd',padding:12,borderRadius:6}}>
      <h3>{title}</h3>
      <p>${price.toFixed(2)}</p>
    </article>
  )
}
