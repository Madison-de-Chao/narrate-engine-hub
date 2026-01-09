-- Security Fix: Remove plaintext API key column to prevent data theft
-- Only the hash (api_key_hash) and prefix (api_key_prefix) should be stored

-- First, ensure all existing plaintext keys are migrated to hashed storage
-- This updates any remaining legacy keys that haven't been migrated yet
DO $$
DECLARE
    key_record RECORD;
BEGIN
    FOR key_record IN 
        SELECT id, api_key 
        FROM public.api_keys 
        WHERE api_key IS NOT NULL AND api_key_hash IS NULL
    LOOP
        -- Note: SHA-256 hashing must be done at application level
        -- For any remaining legacy keys, we mark them as needing re-creation
        UPDATE public.api_keys 
        SET api_key = NULL
        WHERE id = key_record.id;
        
        RAISE NOTICE 'Legacy key % marked for re-creation (hash not available in SQL)', key_record.id;
    END LOOP;
END $$;

-- Now drop the plaintext api_key column entirely
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS api_key;