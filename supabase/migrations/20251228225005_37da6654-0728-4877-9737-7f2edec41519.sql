-- Create character_favorites table for storing user favorites
CREATE TABLE public.character_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  character_id TEXT NOT NULL,
  character_type TEXT NOT NULL CHECK (character_type IN ('gan', 'zhi')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_id, character_type)
);

-- Enable Row Level Security
ALTER TABLE public.character_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorites" 
ON public.character_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" 
ON public.character_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites" 
ON public.character_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_character_favorites_user_id ON public.character_favorites(user_id);
CREATE INDEX idx_character_favorites_character ON public.character_favorites(character_id, character_type);