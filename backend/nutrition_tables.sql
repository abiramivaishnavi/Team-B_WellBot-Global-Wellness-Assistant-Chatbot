-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create nutrition_goals table
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weight_kg NUMERIC(5, 2),
    height_cm NUMERIC(5, 2),
    bmi NUMERIC(4, 1),
    diet_preference TEXT DEFAULT 'Vegetarian',
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fats INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id)
);

-- Note: Because user_id is UNIQUE, each user only has ONE active nutrition_goals record that gets updated.

-- 2. Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    diet_type TEXT NOT NULL,
    calories INTEGER NOT NULL,
    plan_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, date)
);

-- Note: UNIQUE(user_id, date) ensures users only generate one meal plan per day unless they force an overwrite.

-- Enable Row Level Security (RLS)
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Create Policies for nutrition_goals
CREATE POLICY "Users can view their own nutrition goals"
ON public.nutrition_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition goals"
ON public.nutrition_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition goals"
ON public.nutrition_goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create Policies for meal_plans
CREATE POLICY "Users can view their own meal plans"
ON public.meal_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans"
ON public.meal_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
ON public.meal_plans FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
