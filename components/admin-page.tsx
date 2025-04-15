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
  import { Textarea } from '@/components/ui/textarea'
  import { toast } from 'sonner'
  import {saveStars} from 'app/server_actions/saveStars';

  type FormData = {
    name: string
    description: string
    xPosition: string
    yPosition: string
    zPosition: string
    modleName: string
    size: string
    imageURL: string[]
    color1: string
    color2: string
    color3: string
    color4: string
    solarFlareGIF: string
    open: boolean
  }


  export default function AdminLayout() {
    const [forms, setForms] = useState<FormData[]>([
      {
        name: '',
        description: '',
        xPosition: '',
        yPosition: '',
        zPosition: '',
        modleName: '',
        size: '',
        imageURL: [''],
        color1: '',
        color2: '',
        color3: '',
        color4: '',
        solarFlareGIF: '',
        open: true,
      },
    ])

    const handleChange = (index: number, field: keyof Star, value: string) => {
      const updatedForms = [...forms];
      updatedForms[index][field] = value;
      setForms(updatedForms);
    };
    

    const handleAdd = () => {
      setForms([
        ...forms,
        {
          name: '',
          description: '',
          xPosition: '',
          yPosition: '',
          zPosition: '',
          modleName: '',
          size: '',
          imageURL: [''],
          color1: '',
          color2: '',
          color3: '',
          color4: '',
          solarFlareGIF: '',
          open: true,
        },
      ])
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
      const payload = forms.map((form) => ({
        ...form,
        imageURL: form.imageURL.map((s) => s.trim()), 
      }));
    
      const result = await saveStars(payload);
    
      if (result.success) {
        toast.success('Items submitted successfully!');
        setForms([/* reset data*/]);
      } else {
        toast.error(result.message || 'Submission failed.');
      }
    };

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

              <CollapsibleContent className="grid grid-cols-2 gap-4 px-2 pb-2">
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => handleChange(idx, 'name', e.target.value)}
                />
                <Input
                  placeholder="Model Name"
                  value={form.modleName}
                  onChange={(e) => handleChange(idx, 'modleName', e.target.value)}
                />
                <Input
                  placeholder="X Position"
                  value={form.xPosition}
                  onChange={(e) => handleChange(idx, 'xPosition', e.target.value)}
                />
                <Input
                  placeholder="Y Position"
                  value={form.yPosition}
                  onChange={(e) => handleChange(idx, 'yPosition', e.target.value)}
                />
                <Input
                  placeholder="Z Position"
                  value={form.zPosition}
                  onChange={(e) => handleChange(idx, 'zPosition', e.target.value)}
                />
                <Input
                  placeholder="Size"
                  value={form.size}
                  onChange={(e) => handleChange(idx, 'size', e.target.value)}
                />
                <Input
                  placeholder="Image URLs (comma-separated)"
                  value={form.imageURL.join(', ')}
                  onChange={(e) => handleChange(idx, 'imageURL', e.target.value)}
                />
                <Input
                  placeholder="Solar Flare GIF URL"
                  value={form.solarFlareGIF}
                  onChange={(e) => handleChange(idx, 'solarFlareGIF', e.target.value)}
                />
                <Input
                  placeholder="Color 1"
                  value={form.color1}
                  onChange={(e) => handleChange(idx, 'color1', e.target.value)}
                />
                <Input
                  placeholder="Color 2"
                  value={form.color2}
                  onChange={(e) => handleChange(idx, 'color2', e.target.value)}
                />
                <Input
                  placeholder="Color 3"
                  value={form.color3}
                  onChange={(e) => handleChange(idx, 'color3', e.target.value)}
                />
                <Input
                  placeholder="Color 4"
                  value={form.color4}
                  onChange={(e) => handleChange(idx, 'color4', e.target.value)}
                />

                <div className="col-span-2">
                  <Textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => handleChange(idx, 'description', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
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
