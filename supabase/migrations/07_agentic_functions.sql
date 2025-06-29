-- ==========================================
-- TARGET FUNCTIONS
-- ==========================================

-- Function to get all targets
CREATE OR REPLACE FUNCTION get_all_targets()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(to_jsonb(t.*) ORDER BY t.name)
    INTO result
    FROM targets t;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;