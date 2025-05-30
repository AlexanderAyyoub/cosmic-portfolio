'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Trash2,
  Moon,
  Sun
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { saveStars, Star } from 'app/server_actions/saveStars'
import { removeStar } from 'app/server_actions/removeStars'
import getAllStars from 'app/server_actions/getAllStars'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTheme } from 'next-themes'

type FormData = Star & {
  open: boolean;
}

export default function AdminLayout() {
  const [forms, setForms] = useState<FormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [starToDelete, setStarToDelete] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    loadStars()
  }, [])

  async function loadStars() {
    try {
      setIsLoading(true)
      const stars = await getAllStars()
      
      if (stars && stars.length > 0) {
        setForms(stars.map((star) => ({
          ...star,
          imageURL: star.imageURL || [],
          open: false 
        })))
      } else {
        setForms([createEmptyForm(1)])
      }
    } catch (error) {
      console.error('Failed to load stars:', error)
      toast.error('Failed to load existing stars')
      setForms([createEmptyForm(1)])
    } finally {
      setIsLoading(false)
    }
  }

  const createEmptyForm = (id: number): FormData => ({
    starID: id,
    name: '',
    description: '',
    xPosition: null,
    yPosition: null, 
    zPosition: null,
    modleName: '',
    size: null,
    imageURL: [''],
    color1: '',
    color2: '',
    color3: '',
    color4: '',
    solarFlareGIF: '',
    open: true,
  })

  const handleChange = (index: number, field: keyof Omit<FormData, 'imageURL' | 'open'>, value: string) => {
    const updatedForms = [...forms];
    
    if (['xPosition', 'yPosition', 'zPosition', 'size'].includes(field)) {
      updatedForms[index] = {
        ...updatedForms[index],
        [field]: value ? parseFloat(value) : null,
      };
    } else {
      updatedForms[index] = {
        ...updatedForms[index],
        [field]: value,
      };
    }
    
    setForms(updatedForms);
  };

  const handleImageURLChange = (index: number, value: string) => {
    const updatedForms = [...forms];
    updatedForms[index].imageURL = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (updatedForms[index].imageURL.length === 0) {
      updatedForms[index].imageURL = [''];
    }
    setForms(updatedForms);
  };

  const handleAdd = () => {
    const highestId = forms.length > 0 
      ? Math.max(...forms.map(form => form.starID)) 
      : 0;
    
    setForms([
      ...forms,
      createEmptyForm(highestId + 1)
    ]);
  }

  // Open dialog for permanently deleting from database
  const handleDeleteStar = (starID: number) => {
    setStarToDelete(starID)
    setShowDeleteDialog(true)
  }

  // Confirm and execute database deletion
  const confirmDeleteStar = async () => {
    if (starToDelete === null) return
    
    try {
      setIsDeleting(true)
      const result = await removeStar(starToDelete)
      
      if (result.success) {
        toast.success(`Star #${starToDelete} has been permanently deleted`)
        // Reload stars or remove from state
        await loadStars()
      } else {
        toast.error(`Failed to delete star: ${result.message}`)
      }
    } catch (error) {
      console.error('Error deleting star:', error)
      toast.error('An unexpected error occurred while deleting')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setStarToDelete(null)
    }
  }

  const toggleOpen = (index: number, isOpen: boolean) => {
    const updatedForms = [...forms]
    updatedForms[index].open = isOpen
    setForms(updatedForms)
  }
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      const payload: Star[] = forms.map((form) => ({
        starID: form.starID,
        name: form.name || null,
        description: form.description || null,
        xPosition: form.xPosition,
        yPosition: form.yPosition,
        zPosition: form.zPosition,
        modleName: form.modleName || null,
        size: form.size,
        imageURL: form.imageURL.filter(url => url.trim().length > 0),
        color1: form.color1 || null,
        color2: form.color2 || null,
        color3: form.color3 || null,
        color4: form.color4 || null,
        solarFlareGIF: form.solarFlareGIF || null,
      }));

      const result = await saveStars(payload);

      if (result.success) {
        toast.success('Stars saved successfully!');
        await loadStars(); 
      } else {
        toast.error('Failed to save stars');
      }
    } catch (error) {
      console.error('Error saving stars:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false)
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading existing stars...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto mt-10">
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete star?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the star with ID #{starToDelete} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStar}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Star Administration</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} className="text-blue-700" />
            )}
          </Button>
          <div className="text-sm text-gray-500">{forms.length} stars</div>
        </div>
      </div>
      
      {forms.map((form, idx) => (
        <Card key={`star-${form.starID}-${idx}`} className="p-2">
          <Collapsible open={form.open} onOpenChange={(isOpen) => toggleOpen(idx, isOpen)}>
            <div className="flex items-center justify-between px-2 py-1">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-left"
                >
                  {form.open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span className="truncate max-w-[200px]">
                    {form.name ? form.name : `Star #${form.starID}`}
                  </span>
                </Button>
              </CollapsibleTrigger>

              <div className="flex gap-1">
                {/* Delete from database button */}
                {form.starID > 0 && ( // Only show delete button for stars that exist in DB
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteStar(form.starID)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete from database"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>

            <CollapsibleContent className="grid grid-cols-2 gap-4 px-2 pb-2">
              <div className="col-span-2 text-xs text-gray-500">
                ID: {form.starID}
              </div>
              
              <Input
                placeholder="Name"
                value={form.name || ''}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
              />
              <Input
                placeholder="Model Name"
                value={form.modleName || ''}
                onChange={(e) => handleChange(idx, 'modleName', e.target.value)}
              />
              <Input
                placeholder="X Position"
                value={form.xPosition?.toString() || ''}
                onChange={(e) => handleChange(idx, 'xPosition', e.target.value)}
                type="number"
                step="0.01"
              />
              <Input
                placeholder="Y Position"
                value={form.yPosition?.toString() || ''}
                onChange={(e) => handleChange(idx, 'yPosition', e.target.value)}
                type="number"
                step="0.01"
              />
              <Input
                placeholder="Z Position"
                value={form.zPosition?.toString() || ''}
                onChange={(e) => handleChange(idx, 'zPosition', e.target.value)}
                type="number"
                step="0.01"
              />
              <Input
                placeholder="Size"
                value={form.size?.toString() || ''}
                onChange={(e) => handleChange(idx, 'size', e.target.value)}
                type="number"
                step="0.01"
              />
              <Input
                placeholder="Image URLs (comma-separated)"
                value={form.imageURL.join(', ')}
                onChange={(e) => handleImageURLChange(idx, e.target.value)}
              />
              <Input
                placeholder="Solar Flare GIF URL"
                value={form.solarFlareGIF || ''}
                onChange={(e) => handleChange(idx, 'solarFlareGIF', e.target.value)}
              />
              <Input
                placeholder="Color 1"
                value={form.color1 || ''}
                onChange={(e) => handleChange(idx, 'color1', e.target.value)}
              />
              <Input
                placeholder="Color 2"
                value={form.color2 || ''}
                onChange={(e) => handleChange(idx, 'color2', e.target.value)}
              />
              <Input
                placeholder="Color 3"
                value={form.color3 || ''}
                onChange={(e) => handleChange(idx, 'color3', e.target.value)}
              />
              <Input
                placeholder="Color 4"
                value={form.color4 || ''}
                onChange={(e) => handleChange(idx, 'color4', e.target.value)}
              />

              <div className="col-span-2">
                <Textarea
                  placeholder="Description"
                  value={form.description || ''}
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
          <Plus size={16} /> Add New Star
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="secondary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : 'Save All Stars'}
        </Button>
      </div>
    </div>
  )
}