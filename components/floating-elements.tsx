"use client"

import { useEffect, useState } from "react"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  color: string
}

export default function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Create random elements
    const colors = ["#d8b4fe", "#f472b6", "#818cf8"]
    const newElements: FloatingElement[] = []

    for (let i = 0; i < 15; i++) {
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    setElements(newElements)

    // Animation loop
    let animationFrameId: number
    let time = 0

    const animate = () => {
      time += 0.01

      setElements((prevElements) =>
        prevElements.map((element) => ({
          ...element,
          y: (element.y + element.speed) % 100,
          x: element.x + Math.sin(time * element.speed) * 0.2,
        })),
      )

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 size-full pointer-events-none -z-5">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute rounded-full"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            backgroundColor: element.color,
            opacity: element.opacity,
            transition: "transform 0.3s ease-out",
            transform: `translateY(${Math.sin(element.id) * 10}px)`,
          }}
        />
      ))}
    </div>
  )
}

