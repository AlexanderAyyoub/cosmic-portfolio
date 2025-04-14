'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLayout() {
  const [forms, setForms] = useState([
    { name: '', quantity: '', price: '', open: true },
  ])

//   const handleChange = (index: number, field: string, value: string) => {
//     const updatedForms = [...forms]
//     updatedForms[index][field] = value
//     setForms(updatedForms)
//   }

  const handleAdd = () => {
    setForms([...forms, { name: '', quantity: '', price: '', open: true }])
  }

  const handleRemove = (index: number) => {
    const updatedForms = [...forms]
    updatedForms.splice(index, 1)
    setForms(updatedForms)
  }

  const toggleOpen = (index: number) => {
    const updatedForms = [...forms]
    updatedForms[index].open = !updatedForms[index].open
    setForms(updatedForms)
  }

  const handleSubmit = async () => {
    const payload = forms.map(({ name, quantity, price }) => ({
      name,
      quantity,
      price,
    }))

    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      toast.success('Items submitted successfully!')
      setForms([{ name: '', quantity: '', price: '', open: true }])
    } else {
      toast.error('Submission failed.')
    }
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto mt-10">
      {forms.map((form, idx) => (
        <Card key={idx} className="p-2">
          <Collapsible open={form.open} onOpenChange={() => toggleOpen(idx)}>
            <div className="flex items-center justify-between px-2 py-1">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1"
                  onClick={() => toggleOpen(idx)}
                >
                  {form.open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Item #{idx + 1}
                </Button>
              </CollapsibleTrigger>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(idx)}
                disabled={forms.length === 1}
              >
                <Minus className="text-red-500" size={16} />
              </Button>
            </div>

            <CollapsibleContent className="space-y-2 p-2">
              <Input
                placeholder="Item name"
                value={form.name}
                // onChange={(e) => handleChange(idx, 'name', e.target.value)}
              />
              <Input
                placeholder="Quantity"
                type="number"
                value={form.quantity}
                // onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
              />
              <Input
                placeholder="Price"
                type="number"
                value={form.price}
                // onChange={(e) => handleChange(idx, 'price', e.target.value)}
              />
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      <div className="flex gap-2 justify-center">
        <Button onClick={handleAdd} className="flex items-center gap-1">
          <Plus size={16} /> Add Another
        </Button>
        <Button onClick={handleSubmit} variant="secondary">
          Submit All
        </Button>
      </div>
    </div>
  )
}
