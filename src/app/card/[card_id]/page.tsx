'use client'

import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import rawData from '../../../../data.json'
import Image from 'next/image'
import Link from 'next/link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface Card {
  id: string
  name: string
  img: string
  link: string
  description: string
}
interface Section {
  title: string
  cards: Card[]
}

const sections = rawData as Section[]

const CardDetail = () => {
  const params = useParams()
  const router = useRouter()
  const card_id = params.card_id as string

  let category = ''
  let cardData: Card | undefined
  for (const s of sections) {
    const found = s.cards.find((c) => c.id === card_id)
    if (found) {
      cardData = found
      category = s.title
      break
    }
  }

  if (!cardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">未找到该工具</p>
        <Link href="/" className="text-indigo-600 hover:underline">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-6"
        >
          <ArrowBackIcon fontSize="small" /> 返回
        </button>

        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-5">
            <Image
              src={`/img/${cardData.img}`}
              alt={cardData.name}
              width={80}
              height={80}
              className="rounded-2xl ring-1 ring-slate-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-600 font-medium">{category}</p>
              <h1 className="text-2xl font-bold text-slate-800 mt-1">{cardData.name}</h1>
            </div>
            <Link
              href={cardData.link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm px-4 py-2 rounded-xl shadow-sm transition-colors"
            >
              <OpenInNewIcon fontSize="small" /> 访问官网
            </Link>
          </div>

          <p className="mt-6 text-slate-600 leading-relaxed">{cardData.description}</p>
        </div>
      </div>
    </div>
  )
}

export default CardDetail
