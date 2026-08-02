-- Drop the recursive policy
DROP POLICY IF EXISTS "household_members_access" ON "HouseholdMember";

-- Create the security definer function to fetch household IDs for the caller
CREATE OR REPLACE FUNCTION public.get_user_households()
RETURNS TABLE (household_id text) AS $$
BEGIN
    RETURN QUERY
    SELECT "householdId"
    FROM public."HouseholdMember"
    WHERE "userId" = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the new non-recursive policy
CREATE POLICY "household_members_access" ON "HouseholdMember"
FOR ALL
TO authenticated
USING (
    "userId" = auth.uid()::text
    OR
    "householdId" IN (SELECT public.get_user_households())
);
